import io from 'socket.io-client';
// import { socketEvents } from './events';

export const socket = io('http://' + window.location.hostname + ':3001', {
	autoConnect: false
});

export const initSockets = ({ setValue }) => {
	// socketEvents({ socket, setValue });
	socket.open();
};
