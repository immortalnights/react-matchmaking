import React, { useState, useEffect } from 'react';
import Context from './context';
import io from 'socket.io-client';

class SocketProvider extends React.Component {
	constructor(props)
	{
		super(props);

		this.socket = io(':3001/lobby', {
			autoConnect: false,
			transports: ['websocket'],
			query: 'user=' + props.userId + '&lobby=' + props.id
		});

		this.socket.on('error', (error) => {
			console.log("received error", error);
			this.socket.close();
			this.setState(state => { return { ...state, lobby: null, error: error, state: 'ERROR' }; });
		});

		this.socket.on('lobby:registered', player => {
			console.info("self", player.id);
			this.setState(state => {
				return { ...state, self: player };
			});
		});

		this.socket.on('lobby:update', lobby => {
			console.log("got lobby", lobby);
			this.setState(state => { return { ...state, lobby: lobby, state: 'IN_LOBBY' }; });
		});

		this.socket.on('lobby:player:joined', player => {
			console.log("player joined");
			this.setState(state => {
				state = { ...state };
				state.lobby = { ...state.lobby };
				state.lobby.players = [ ...state.lobby.players, player ];
				return state;
			});
		});

		this.socket.on('lobby:player:update', player => {
			console.log("player updated", player);
			this.setState(state => {
				state = { ...state };
				state.lobby = { ...state.lobby };

				const index = state.lobby.players.findIndex(p => p.id === player.id);
				if (index !== -1)
				{
					state.lobby.players[index] = { ...state.lobby.players[index], ...player };
				}

				return state;
			});
		});

		this.socket.on('lobby:game', game => {
			props.onGameReady(game.id);
		});

		this.socket.on('lobby:player:left', player => {
			console.log("player left", player.id);
			this.setState(state => {
				state = { ...state };
				state.lobby = { ...state.lobby };

				const index = state.lobby.players.findIndex(p => p.id === player.id);
				if (index !== -1)
				{
					state.lobby.players.splice(index, 1);
				}

				return state;
			});
		});

		this.socket.on('message', ({ id }) => {
			console.log("received message", Date(), id);
		});

		this.state = {
			state: 'CONNECTING',
			lobby: null,
			emit: this.handleEmit.bind(this)
		};
	}

	handleEmit(name, data)
	{
		this.socket.emit(name, data);
	}

	componentDidMount()
	{
		this.socket.open();
	}

	componentWillUnmount()
	{
		this.socket.close();
	}

	render()
	{
		return (
			<Context.Provider value={ this.state }>
				{ this.props.children }
			</Context.Provider>
		);
	}
};

export default SocketProvider;
