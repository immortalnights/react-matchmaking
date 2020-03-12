import io from 'socket.io-client';

export const initSockets = ({ setValue }) => {
	// const socket = io(':3001/lobby', {
	// 	autoConnect: false,
	// 	transports: ['websocket']
	// });

	// console.log("binding socket events");
	// socket.on('lobby', ({ id, ...msg }) => {
	// 	console.log("got lobby", msg);
	// 	setValue((state) => { return { ...state, lobby: id, state: 'IN_LOBBY' }; });
	// });
	// socket.on('message', () => {
	// 	console.log("received message");
	// });

	// socket.open();
	// return () => { socket.close() };
};

// export const closeSocket = ({ setValue }) => {
// 	socket.close();
// 	// setValue(state => { return { ...state, state: 'DISCONNECTED' }; });
// 	console.log("closing socket");
// };
