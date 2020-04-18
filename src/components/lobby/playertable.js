import React from 'react';

const PlayerListItem = (props) => {
	console.log("player list item", props);
	const readyState = props.ready ? "Ready" : "Not Ready";

	let onClickKick;
	if (props.isHost && props.id !== props.host)
	{
		onClickKick = props.onCick.bind(null, props.id);
	}

	return (<tr className="lobby-player">
		<td className="lobby-player-name" data-id="{props.id}">{props.name || "noname"}</td>
		<td className="lobby-player-status">{readyState}</td>
		<td className="lobby-player-kick">
			{onClickKick ? (<button onClick={onClickKick}>Kick</button>) : ''}
		</td>
	</tr>);
};

const PlayerTable = (props) => {
	const children = props.players.map((player, index) => (<PlayerListItem key={player.id} {...player} host={props.host} isHost={props.isHost} onCick={props.onCick} index={index+1} />));
	return (<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>State</th>
				<th></th>
			</tr>
		</thead>
		<tbody>{children}</tbody>
	</table>);
};

export default PlayerTable;
