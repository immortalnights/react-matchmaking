const uuid = require('uuid').v1;

module.exports = class Lobby {
	constructor({ io })
	{
		// super();
		this.io = io.of('/lobby');
		this.io.on('connection', (client) => {
			console.log(`client ${client.id} connected`);

			client.on('disconnect', () => {
				console.log(`client ${client.id} disconnected`);
			});
		});

		this.id = uuid();
		this.name = 'unnamed';
		this.players = 0;
		this.maxPlayers = null;
	}

	serialize()
	{
		return {
			id: this.id,
			name: this.name,
			players: this.players,
			maxPlayers: this.maxPlayers
		};
	}
}