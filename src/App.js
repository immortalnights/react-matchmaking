import React from 'react';
import logo from './logo.svg';
import './App.css';
import { A, useRoutes } from 'hookrouter';

const withLoader = (WrapperComponent, makeRequest) => {
	return class Loader extends React.Component {
		state = {
			status: 'LOADING',
			error: null,
			data: null
		};

		request = null;

		componentDidMount()
		{
			this.request = makeRequest(this.props.id).then(({ status, error, data }) => {
				this.request = null;
				this.setState({ status, error, data });
			});
		}

		componentWillUnmount()
		{
			if (this.request)
			{
				this.request.cancel();
			}
		}

		render()
		{
			let content;

			switch (this.state.status)
			{
				case 'LOADING':
				{
					content = (<h1>Connecting...</h1>);
					break;
				}
				case 'ERROR':
				{
					content = (<>
						<h1>{this.state.error}</h1>
						<A href="/">Return</A>
					</>);
					break;
				}
				default:
				{
					content = (<WrapperComponent {...this.props} data={this.state.data} />);
					break;
				}
			}

			return content;
		}
	}
}

class Lobby extends React.Component {
	render()
	{
		return (<h1>In lobby</h1>);
	}
}

const LobbyWithLoader = withLoader(Lobby, (id) => {
	return fetch('/api/lobby/' + id).then((response) => {
		const data = { status: 'ERROR', error: '', data: null };

		if (response.ok)
		{
			data.status = 'IN_LOBBY';
			data.data = response.responseJSON;
		}
		else
		{
			data.error = "Failed to load game lobby.";
		}

		return data;
	});
});

class Game extends React.Component {
	render()
	{
		return (<h1>In game</h1>);
	}
}

const GameWithLoader = withLoader(Game, (id) => {
	return fetch('/api/game/' + id).then((response) => {
		const data = { status: 'ERROR', error: '', data: null };

		if (response.ok)
		{
			data.status = 'IN_GAME';
			data.data = response.responseJSON;
		}
		else
		{
			data.error = "Failed to load game lobby.";
		}

		return data;
	});
});


const routes = {
	'/': () => (<h1>Home</h1>),
	'/Lobby/:id': ({id}) => (<LobbyWithLoader id={id} />),
	'/Game/:id': ({id}) => (<GameWithLoader id={id} />)
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
