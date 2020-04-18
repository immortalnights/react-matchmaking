import React from 'react';
import { withLoader } from '../../utilities/withloader';
import './styles.css';

const LobbyRow = (props) => {
	const playerCount = props.maxPlayers === null ? props.players.length : props.players.length + '/' + props.maxPlayers;

	return (<tr className={props.active ? 'active' : ''} onClick={props.onClick.bind(null, props.id)} onDoubleClick={props.onDblClick.bind(null, props.id)} >
		<td>{props.name}</td>
		<td>{playerCount}</td>
		<td>{props.status}</td>
	</tr>);
}

class Browser extends React.Component {
	state = {
		lobbies: []
	};

	componentDidMount()
	{
		this.fetchLobbies();

		this.poll = window.setInterval(() => {
			this.fetchLobbies();
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

	onLobbyClick(id, event)
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
			this.props.onSelect(lobby);
		}
		else
		{
			this.props.onSelect(null);
		}
		this.setState({ lobbies });
	}

	render()
	{
		const selection = this.state.lobbies.find(l => l.active === true);

		return (<div className="lobby-list">
			<table className="">
				<thead>
					<tr>
						<th style={{textAlign: 'left'}}>Name</th>
						<th>Players</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>{this.state.lobbies.map((lobby) => <LobbyRow key={lobby.id} {...lobby} onClick={this.onLobbyClick.bind(this)} onDblClick={this.props.handleJoin} />)}</tbody>
				<tfoot></tfoot>
			</table>
		</div>);
	}

	register()
	{
		return fetch('/api/lobby/', { method: 'POST', });
	}

	fetchLobbies()
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

export default Browser;