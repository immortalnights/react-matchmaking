import React, { useContext } from 'react';
import { A } from 'hookrouter';
import { withLoader } from '../../utilities/withloader';
import Context from './context';
import Provider from './provider';
import io from 'socket.io-client';

const PlayerListItem = (props) => {
	console.log(props);
	const readyState = props.ready ? "Ready" : "Not Ready";

	let onClickKick;
	if (props.isHost && props.id !== props.host)
	{
		onClickKick = props.onCick.bind(null, props.id);
	}

	return (<div>{props.id} ({props.index}) - {readyState} - {onClickKick ? (<button onClick={onClickKick}>Kick</button>) : ''}</div>);
}

const PlayerList = (props) => {
	return props.players.map((player, index) => (<PlayerListItem key={player.id} {...player} host={props.host} isHost={props.isHost} onCick={props.onCick} index={index+1} />));
}

export class Lobby extends React.Component {
	static contextType = Context

	render()
	{
		const state = this.context.state;
		console.log("props", this.props);
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
				const lobby = this.context.lobby;

				let status;
				if (lobby.status === 'STARTING')
				{
					const seconds = (Math.ceil(lobby.countdown / 1000)).toFixed(0);
					status = (<div>Starting in {seconds}...</div>);
				}
				else
				{
					status = (<div>Waiting for players...</div>);
				}

				const host = this.context.lobby.host === this.props.userId;

				content = (
					<>
						<h2>Lobby {lobby.name}</h2>
						<PlayerList players={lobby.players} host={this.context.lobby.host} isHost={host} onCick={this.onClickKick.bind(this)} />
						{status}
						<div>
							<A href="/">Leave</A>
							{(host) ? (<button name="ready" onClick={this.onClickAddAI.bind(this)}>Add AI</button>) : ''}
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

	onClickAddAI()
	{
		this.context.emit('lobby:addAIOpponent');
	}

	onClickKick(playerId)
	{
		console.log(playerId);
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
	console.log("lb", props);
	return (<Provider {...props} ><LobbyWithLoader {...props} /></Provider>);
};
