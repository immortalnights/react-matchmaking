import React, { useState, useEffect } from 'react';
import Context from './context.js';
import { initSockets } from '../../utilities/socketio';

const SocketProvider = (props) => {
	const params = new URLSearchParams(window.location.search);

	const [value, setValue] = useState({
		
	});

	useEffect(() => initSockets({ setValue }), [initSockets]);

	return(
		<Context.Provider value={ value }>
			{ props.children }
		</Context.Provider>
	)
};

export default SocketProvider;
