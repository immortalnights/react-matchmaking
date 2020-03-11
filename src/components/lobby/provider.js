import React, { useState, useEffect } from 'react';
import Context from './context.js';
import io from 'socket.io-client';
// import { initSockets } from '../../utilities/socketio';

const initSockets = ({ socket, setValue }) => {
	console.log("binding socket events");
	socket.on('lobby', ({ id, ...msg }) => {
		console.log("got lobby", msg);
		setValue((state) => { return { ...state, lobby: id, state: 'IN_LOBBY' }; });
	});
	socket.on('message', () => {
		console.log("received message");
	});
};

const SocketProvider = (props) => {
	console.log("Render provider!");
	const socket = io(':3001/lobby', {
		autoConnect: false,
		transports: ['websocket']
	});

	const [value, setValue] = useState({
		// defaults
		state: 'CONNECTING',
		lobby: null,
		players: []
	});

	console.log("defaults", value);

	useEffect(() => initSockets({ socket, setValue }), [initSockets]);

	socket.open();

	return(
		<Context.Provider value={ value }>
			{ props.children }
		</Context.Provider>
	)
};

export default SocketProvider;
