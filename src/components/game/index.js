import React from 'react';
import { withLoader } from '../../utilities/withloader';
import Context from './context';
import Provider from './provider';
import './styles.css';

class Game extends React.Component {
	static contextType = Context

	render()
	{
		let content;
		if (this.context.game)
		{
			content = (<div className="game-wrapper">{this.props.children(this.context.game, this.context.emit)}</div>);
		}
		else
		{
			content = (<div className="status-message">Loading game...</div>);
		}

		return content;
	}
}

const GameWithLoader = withLoader(Game, (id) => {
	return fetch('/api/game/' + id).then((response) => {
		const data = { status: 'ERROR', error: '', data: null };

		if (response.ok)
		{
			data.status = 'OK';
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