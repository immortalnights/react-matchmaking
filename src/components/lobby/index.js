import React, { useContext } from 'react';
import { A } from 'hookrouter';
import { withLoader } from '../../utilities/withloader';
import Context from './context';
import Provider from './provider';
import PlayerTable from './playertable';
import './styles.css';

class Lobby extends React.Component {
	static contextType = Context

	render()
	{
		const state = this.context.state;
		console.log("context", this.context);
		console.log("props", this.props);
		console.log("state", state);

		let content = null;
		switch (state)
		{
			case 'CONNECTING':
			{
				content = (<div className="status-message information"><h2>Connecting...</h2><A href="/">Cancel</A></div>);
				break;
			}
			case 'ERROR':
			{
				content = (<div className="status-message error"><h2>{this.context.error}</h2></div>);
				break;
			}
			default:
			{
				const lobby = this.context.lobby;

				let status;
				if (lobby.status === 'STARTING')
				{
					const seconds = (Math.ceil(lobby.countdown / 1000)).toFixed(0);
					status = `Starting in ${seconds}...`;
				}
				else
				{
					status = "Waiting for players...";
				}

				const host = this.context.lobby.host === this.props.userId;

				const playerListProps = {
					player: this.props.userId,
					players: lobby.players,
					host: this.context.lobby.host,
					isHost: host,
					onCick: this.onClickKick.bind(this)
				};

				const PlayerDisplay = this.props.playerDisplay || PlayerTable;

				content = (<div className="lobby">
						<div className="players-container"><PlayerDisplay {...playerListProps} onSelectSlot={this.handleSelectSlot.bind(this)}/></div>
						<div className="lobby-status">
							<label>Status</label>
							<div>{status}</div>
						</div>
						<div className="action-bar">
							<A className="lobby-leave-button btn" href="/">Leave</A>
							{(host) ? (<button className="lobby-add-ai-control" name="ready" onClick={this.onClickAddAI.bind(this)}>Add AI</button>) : ''}
							<button className="lobby-ready-toggle primary" name="ready" onClick={this.onReadyClick.bind(this)}>Ready</button>
						</div>
					</div>
				);
				break;
			}
		}

		return content;
	}

	onReadyClick()
	{
		this.context.emit('lobby:toggleReady');
	}

	onClickAddAI()
	{
		this.context.emit('lobby:addAIOpponent');
	}

	handleSelectSlot(slot)
	{
		console.log("Slot selection not implemented");
		this.context.emit('lobby:selectSlot', slot);
	}

	onClickKick(playerId)
	{
		console.log("Kick not implemented");
		this.context.emit('lobby:kickPlayer');
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
