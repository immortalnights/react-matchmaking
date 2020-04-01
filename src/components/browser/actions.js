import React from 'react';

const Actions = (props) => {

	let onJoinClick;
	const lobby = props.selection;

	if (lobby)
	{
		if (lobby.maxPlayers === null || lobby.players.length < lobby.maxPlayers)
		{
			onJoinClick = props.onJoinClick.bind(null, props.selection.id);
		}
	}

	return (<div>
		<button onClick={props.onRefreshClick}>Refresh</button>
		<button disabled={!onJoinClick} onClick={onJoinClick}>Join</button>
		<button onClick={props.onCreateClick}>Create</button>
	</div>);
};

export default Actions;
