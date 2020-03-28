import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { usePath, navigate, useRoutes } from 'hookrouter';
import LobbyBrowser from './components/browser/';
import LobbyWithLoader from './components/lobby/';
import GameWithLoader from './components/game/';
import io from 'socket.io-client';

const routes = {
	'/': () => ({userId}) => (<LobbyBrowser userId={userId} />),
	'/Lobby/:id': ({id}) => ({userId}) => (<LobbyWithLoader userId={userId} id={id} />),
	'/Game/:id': ({id}) => ({userId}) => (<GameWithLoader userId={userId} id={id} />)
}

function RouteContent(props) {
	const route = useRoutes(routes);
	return route ? route({ userId: props.userId }) : (<h1>404</h1>);
}

function App() {
	let path = usePath();
	const [userId, setUserId] = useState(null);
	const [registrationResponse, setRegistrationResponse] = useState(null);

	useEffect(() => {
		if (!userId)
		{
			fetch('/api/register', { method: 'put' }).then((response) => {
				if (response.ok)
				{
					response.json()
					.then((data) => {
						console.log("Registered", data.userId);
						setUserId(data.userId);
					})
					.catch(() => {
						setRegistrationResponse("Failed to parse JSON response. Refresh to try again.");
					});
				}
				else
				{
					setRegistrationResponse("Failed to register user. Refresh to try again.");
				}
			});
		}
	});

	let content;
	if (userId)
	{
		content = (<RouteContent userId={userId} />);
	}
	else
	{
		if (registrationResponse)
		{
			content = (<div>{registrationResponse}</div>);
		}
		else if (path === '/')
		{
			content = (<div>Registering, please wait...</div>);
		}
		else
		{
			navigate('/');
		}
	}

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
