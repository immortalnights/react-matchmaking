import React, { useContext } from 'react';
import { A } from 'hookrouter';
import { withLoader } from '../../utilities/withloader';
import Context from './context';
import Provider from './provider';
import io from 'socket.io-client';

const PlayerListItem = (props) => {
	return (<div>props.id</div>);
}

const PlayerList = (props) => {
	const ctx = useContext(Context);
	return ctx.players.map((player) => (<PlayerListItem key={player.id} />));
}

export class Lobby extends React.Component {
	static contextType = Context

	render()
	{
		const state = this.context.state;
		console.log("state", state);

		let content = null;
		switch (state)
		{
			case 'CONNECTING':
			{
				content = (<h2>Connecting...</h2>);
				break;
			}
			case 'ERROR':
			{
				content = (<>
					<h2>{this.context.error}</h2>
					<A href="/">Return</A>
				</>);
				break;
			}
			default:
			{
				content = (<h2>Players {this.context.lobby.players.length}</h2>);
				break;
			}
		}

		return (
			<div>
				{content}
			</div>);
	}
};

const LobbyWithLoader = withLoader(Lobby, (id) => {
	return fetch('/api/lobby/' + id).then((response) => {
		let r;
		if (response.ok)
		{
			r = response.json();
		}
		else
		{
			const contentType = response.headers.get('content-type');
			console.log("contentType", contentType);
			if (contentType.includes('application/json'))
			{
				r = response.json().then(json => { return new Promise((resolve, reject) => { reject(json) }) });
			}
			else
			{
				r = new Promise((resolve, reject) => { reject({ error: "Failed to load game lobby." });});
			}
		}

		return r;
	}).then(data => {
		return { status: 'OK', error: null, data: data };
	}).catch(data => {
		return { status: 'ERROR', error: data.error, data: null };
	});
});

export default (props) => {
	return (<Provider {...props} ><LobbyWithLoader {...props} /></Provider>);
};
