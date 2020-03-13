import React, { useContext } from 'react';
import { A } from 'hookrouter';
import { withLoader } from '../../utilities/withloader';
import Context from './context';
import Provider from './provider';
import io from 'socket.io-client';

const PlayerListItem = (props) => {
	const readyState = props.ready ? "Ready" : "Not Ready";
	return (<div>Player {props.index} - {readyState}</div>);
}

const PlayerList = (props) => {
	return props.players.map((player, index) => (<PlayerListItem key={player.id} {...player} index={index+1} />));
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
				content = (
					<>
						<h2>Lobby {this.context.lobby.name}</h2>
						<PlayerList players={this.context.lobby.players} />
						<div>
							<A href="/">Leave</A>
							<button name="ready" onClick={this.onReadyClick.bind(this)}>Ready</button>
						</div>
					</>
				);
				break;
			}
		}

		return (
			<div>
				{content}
			</div>
		);
	}

	onReadyClick()
	{
		this.context.emit('lobby:toggleReady');
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
