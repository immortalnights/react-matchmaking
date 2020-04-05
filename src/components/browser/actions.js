import React from 'react';

const Actions = (props) => {

	let handleJoinClick;
	const lobby = props.selection;

	if (lobby)
	{
		if (lobby.maxPlayers === null || lobby.players.length < lobby.maxPlayers)
		{
			handleJoinClick = props.handleJoinClick.bind(null, props.selection.id);
		}
	}

	return (<div className="action-bar">
		<button onClick={props.handleCreateClick}>Create</button>
		<button disabled={!handleJoinClick} onClick={handleJoinClick}>Join</button>
	</div>);
};

export default Actions;
