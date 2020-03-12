import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useRoutes } from 'hookrouter';
import LobbyBrowser from './components/browser/';
import LobbyWithLoader from './components/lobby/';
import GameWithLoader from './components/game/';
import io from 'socket.io-client';

const routes = {
	'/': () => (<LobbyBrowser />),
	'/Lobby/:id': ({id}) => (<LobbyWithLoader id={id} />),
	'/Game/:id': ({id}) => (<GameWithLoader id={id} />)
}

function App() {
	const content = useRoutes(routes) || (<h1>404</h1>);

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
			</header>
			<main>{content}</main>
			<footer></footer>
		</div>
	);
}

export default App;
