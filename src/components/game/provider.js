import React, { useState, useEffect } from 'react';
import Context from './context';
import io from 'socket.io-client';

class SocketProvider extends React.Component
{
	constructor(props)
	{
		super(props);

		this.socket = io(':3001/game', {
			autoConnect: false,
			transports: ['websocket'],
			query: 'user=' + props.userId + '&game=' + props.id
		});

		this.socket.on('error', (error) => {
			console.log("received error", error);
			this.socket.close();
			this.setState(state => { return { ...state, game: null, error: error, state: 'ERROR' }; });
		});

		this.socket.on('game:registered', player => {
			console.info("self", player.id);
			this.setState(state => {
				return { ...state, self: player };
			});
		});

		this.socket.on('game:update', game => {
			console.log("got game", game);
			this.setState(state => { return { ...state, game: game, state: 'IN_GAME' }; });
		});

		this.socket.on('game:player:joined', player => {
			console.log("player joined");
			this.setState(state => {
				state = { ...state };
				state.game = { ...state.game };
				state.game.players = [ ...state.game.players, player ];
				return state;
			});
		});

		this.socket.on('game:player:update', player => {
			console.log("player updated", player);
			this.setState(state => {
				state = { ...state };
				state.game = { ...state.game };

				const index = state.game.players.findIndex(p => p.id === player.id);
				if (index !== -1)
				{
					state.game.players[index] = { ...state.game.players[index], ...player };
				}

				return state;
			});
		});

		this.socket.on('game:player:left', player => {
			console.log("player left", player.id);
			this.setState(state => {
				state = { ...state };
				state.game = { ...state.game };

				const index = state.game.players.findIndex(p => p.id === player.id);
				if (index !== -1)
				{
					state.game.players.splice(index, 1);
				}

				return state;
			});
		});

		this.socket.on('message', ({ id }) => {
			console.log("received message", Date(), id);
		});

		this.state = {
			state: 'CONNECTING',
			game: null,
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
		console.log("Render Game provider!");

		return (
			<Context.Provider value={ this.state }>
				{ this.props.children }
			</Context.Provider>
		);
	}
};

export default SocketProvider;
