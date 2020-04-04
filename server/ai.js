const uuid = require('uuid').v1;
const Player = require('./player');

class AIEventIO
{
	on()
	{
		// Handle game event
		console.debug("Lobby:AISocket:on");
	}

	emit()
	{
		// Send game event
		console.debug("Lobby:AISocket:emit");
	}

	join()
	{
		// No-op for AI players
		console.debug("Lobby:AISocket:join");
	}

	leave()
	{
		// No-op for AI players
		console.debug("Lobby:AISocket:leave");
	}
};


module.exports = class AI extends Player {
	constructor()
	{
		super({ id: uuid(), client: null });
		this.io = new AIEventIO();
		this.artifical = true
		this.ready = true;
	}

	serialize()
	{
		return {
			id: this.id,
			ready: this.ready,
			artifical: this.artifical
		};
	}
}