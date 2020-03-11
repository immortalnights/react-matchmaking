import React, { useContext } from 'react';
import { withLoader } from '../../utilities/withloader';
import Context from './context';
import Provider from './provider';

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
			default:
			{

				break;
			}
		}

		return (
			<div>
				{content}
			</div>);
	}
};

const LobbyX = (props) => {
	return (<Lobby {...props} />);
}

const Wrapper = (props) => {
	return (<Context.Consumer><LobbyX {...props} /></Context.Consumer>);
}

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
	return (<Provider><LobbyWithLoader {...props} /></Provider>);
};
