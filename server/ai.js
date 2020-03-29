const Player = require('./player');

class AIEventIO
{
	on()
	{
		// Handle game event
	}

	emit()
	{
		// Send game event
	}

	join()
	{
		// No-op for AI players
	}

	leave()
	{
		// No-op for AI players
	}
};


module.exports = class AI extends Player {
	constructor()
	{
		super({ client: null });
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