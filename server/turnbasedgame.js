const Game = require('./game');

module.exports = class TurnBasedGame extends Game {
	constructor(options)
	{
		super(options);
		this.turn = undefined;

		console.log(`TurnBasedGame ${this.id} initialized`);
	}

	whichPlayer()
	{
		return this.players[this.turn];
	}

	nextTurn()
	{
		let currentTurn = this.turn;

		if (!currentTurn)
		{
			currentTurn = 0;
		}
		else
		{
			// console.debug(currentTurn, this.players.length);

			++currentTurn;
			if (currentTurn >= this.players.length)
			{
				currentTurn = 0;
			}

			// console.debug(currentTurn);
		}

		this.turn = currentTurn;
		console.log(`It is now player ${this.whichPlayer().id} turn`)
		return currentTurn;
	}

	serialize()
	{
		const data = super.serialize();
		if (this.turn !== undefined)
		{
			data.turn = this.whichPlayer().id;
		}
		return data;
	}
}
