import React from 'react';
import { withLoader } from '../../utilities';

export class Lobby extends React.Component {
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

export default LobbyWithLoader;
