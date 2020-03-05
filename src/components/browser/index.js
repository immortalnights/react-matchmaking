import React from 'react';
import './browser.css';

const LobbyRow = (props) => {
	const playerCount = props.maxPlayers ? props.players + '/' + props.maxPlayers : props.players;

	return (<tr className={props.active ? 'active' : ''} onClick={props.onClick.bind(null, props.id)}>
		<td style={{textAlign: 'left'}}>{props.name}</td>
		<td>{playerCount}</td>
		<td></td>
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
		lobbys: []
	};

	request = null;

	componentDidMount()
	{
		this.makeRequest();
	}

	componentWillUnmount()
	{
		if (this.request)
		{
			this.request.cancel();
		}
	}

	handleLobbyClick(id, event)
	{
		const lobbys = this.state.lobbys.map(l => {
			const wasActive = l.active;
			return { ...l, active: false, wasActive };
		});
		const index = lobbys.findIndex((l) => l.id === id );

		if (index !== -1)
		{
			const lobby = lobbys[index];
			lobbys[index] = { ...lobby, active: !lobby.wasActive }
		}
		this.setState({ lobbys });
	}

	render()
	{
		const selection = this.state.lobbys.find(l => l.active === true);

		const clickHandlers = {
			onRefreshClick: () => { this.makeRequest(); },
			onJoinClick: (id) => { console.log("onJoinClick", id); },
			onCreateClick: () => { console.log("onCreateClick"); },
		}

		return (<>
			<h1>Lobby Browser</h1>
			<LobbyList list={this.state.lobbys} onClick={this.handleLobbyClick.bind(this)} />
			<Actions selection={selection ? selection.id : null} {...clickHandlers} />
		</>);
	}

	makeRequest()
	{
		this.request = fetch('/api/lobby/').then((response) => {
			this.request = null;

			response.json().then((data) => {
				this.setState({ lobbys: data });
			});
		});
	}
}
