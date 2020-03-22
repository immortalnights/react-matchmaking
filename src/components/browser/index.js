import React from 'react';
import { navigate } from 'hookrouter';
import './browser.css';

const LobbyRow = (props) => {
	const playerCount = props.maxPlayers === null ? props.players.length : props.players.length + '/' + props.maxPlayers;

	return (<tr className={props.active ? 'active' : ''} onClick={props.onClick.bind(null, props.id)}>
		<td style={{textAlign: 'left'}}>{props.name}</td>
		<td>{playerCount}</td>
		<td>{props.status}</td>
	</tr>);
}

const LobbyList = (props) => {
	return (<div className="lobby-list">
		<table className="">
			<thead>
				<tr>
					<th style={{textAlign: 'left'}}>Name</th>
					<th>Players</th>
					<th></th>
				</tr>
			</thead>
			<tbody>{props.list.map((lobby) => <LobbyRow key={lobby.id} {...lobby} onClick={props.onClick} />)}</tbody>
			<tfoot></tfoot>
		</table>
	</div>);
}

const Actions = (props) => {
	return (<div>
		<button onClick={props.onRefreshClick}>Refresh</button>
		<button disabled={!props.selection} onClick={props.onJoinClick.bind(null, props.selection)}>Join</button>
		<button onClick={props.onCreateClick}>Create</button>
	</div>);
}

export default class Browser extends React.Component {
	state = {
		lobbies: []
	};

	componentDidMount()
	{
		this.makeRequest();

		this.poll = window.setInterval(() => {
			this.makeRequest();
		}, 1000);
	}

	componentWillUnmount()
	{
		if (window.AbortController)
		{
			const controller = new AbortController();
			const signal = controller.signal;
			controller.abort();
		}

		if (this.poll)
		{
			window.clearInterval(this.poll);
		}
	}

	handleLobbyClick(id, event)
	{
		const lobbies = this.state.lobbies.map(l => {
			const wasActive = l.active;
			return { ...l, active: false, wasActive };
		});
		const index = lobbies.findIndex((l) => l.id === id );

		if (index !== -1)
		{
			const lobby = lobbies[index];
			lobbies[index] = { ...lobby, active: !lobby.wasActive }
		}
		this.setState({ lobbies });
	}

	render()
	{
		const selection = this.state.lobbies.find(l => l.active === true);

		const clickHandlers = {
			onRefreshClick: () => this.makeRequest(),
			onJoinClick: (id) => this.handleJoinClick(),
			onCreateClick: () => this.handleCreateClick(),
		}

		return (<>
			<h1>Lobby Browser</h1>
			<LobbyList list={this.state.lobbies} onClick={this.handleLobbyClick.bind(this)} />
			<Actions selection={selection ? selection.id : null} {...clickHandlers} />
		</>);
	}

	handleJoinClick()
	{
		const lobby = this.state.lobbies.find(l => l.active === true);

		if (lobby)
		{
			navigate('/Lobby/' + encodeURIComponent(lobby.id));
		}
	}

	handleCreateClick()
	{
		return fetch('/api/lobby/', { method: 'post' })
		.then((response) => {
			// this.request = null;

			if (response.ok)
			{
				response.json().then(lobby => {
					const lobbies = [...this.state.lobbies];
					lobbies.push(lobby);
					this.setState({ lobbies: lobbies });

					// move the player into thier lobby
					navigate('/Lobby/' + encodeURIComponent(lobby.id));
				});
			}
		});
	}

	makeRequest()
	{
		return fetch('/api/lobby/')
		.then((response) => {
			this.request = null;

			if (response.ok)
			{
				response.json().then((data) => {
					const lobbies = this.state.lobbies;
					const newLobbies = data.map((lobby) => {
						const existing = lobbies.find((l) => l.id === lobby.id );

						const merged = {...existing};
						Object.keys(lobby).forEach((key) => {
							merged[key] = lobby[key];
						});

						return merged;
					});

					this.setState({ lobbies: newLobbies });
				});
			}
		});
	}
}
