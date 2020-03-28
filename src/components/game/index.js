import React from 'react';
import { withLoader } from '../../utilities/withloader';
import Context from './context';
import Provider from './provider';
import io from 'socket.io-client';

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
			data.error = "Failed to load game.";
		}

		return data;
	});
});

export default (props) => {
	return (<Provider {...props} ><GameWithLoader {...props} /></Provider>);
};