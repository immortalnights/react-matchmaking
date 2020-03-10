import React, { useState, useEffect } from 'react';
import Context from './context.js';
import io from 'socket.io-client';
// import { initSockets } from '../../utilities/socketio';

const initSockets = ({ socket, setValue }) => {
	socket.on('message', () => {
		console.log("received message");
	});
};

const SocketProvider = (props) => {
	// const params = new URLSearchParams(window.location.search);

	const socket = io(':3001/lobby', {
		autoConnect: false,
		transports: ['websocket']
	});

	const [value, setValue] = useState({
		// defaults
	});

	useEffect(() => initSockets({ socket, setValue }), [initSockets]);

	socket.open();

	return(
		<Context.Provider value={ value }>
			{ props.children }
		</Context.Provider>
	)
};

export default SocketProvider;
