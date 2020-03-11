const uuid = require('uuid').v1;

class Player {
	constructor(client)
	{
		this.id = uuid();
		this.io = client;
	}

	serialize()
	{
		return { id: this.id };
	}
};

module.exports = class Lobby {
	constructor({ io })
	{
		// super();
		this.io = io.of('/lobby');
		this.io.on('connection', (client) => {
			console.log(`client '${client.id}' connected`);

			const player = new Player(client);

			client.broadcast.emit('player_joined', player.serialize());
			this.players.push(player);

			console.log("emitting lobby", this.serialize());
			client.emit('lobby', this.serialize());

			client.on('disconnect', () => {
				console.log(`client '${client.id}' disconnected`);
			});
		});

		this.id = uuid();
		this.name = 'unnamed';
		this.players = [];
		this.maxPlayers = null;
	}

	serialize()
	{
		return {
			id: this.id,
			name: this.name,
			players: this.players.map((p) => p.serialize()),
			maxPlayers: this.maxPlayers
		};
	}
}