import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useRoutes } from 'hookrouter';

const routes = {
	'/': () => (<h1>Home</h1>),
	'/Lobby': () => (<h1>Invalid lobby ID</h1>),
	'/Lobby/:id': ({id}) => (<h1>Lobby for {id}</h1>),
	'/Game': () => (<h1>Invalid game ID</h1>),
	'/Game/:id': ({id}) => (<h1>Lobby for {id}</h1>),
}

function App() {
	const content = useRoutes(routes) || (<h1>404</h1>);

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				{content}
			</header>
		</div>
	);
}

export default App;
