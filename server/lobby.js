const uuid = require('uuid').v1;

module.exports = class Lobby {
	constructor({ io })
	{
		// super();
		this.io = io.of('/lobby');
		this.id = uuid();
		this.name = 'unnamed';
		this.players = [];
		this.maxPlayers = null;
	}

	handleJoin(player)
	{
		this.broadcast('lobby:player:joined', player.serialize());

		player.io.join(this.id);
		this.players.push(player);

		player.io.emit('lobby:update', this.serialize());
		console.log(`Player ${player.id} joined lobby ${this.id}`);
	}

	handleLeave(player)
	{
		const index = this.players.findIndex(p => p.id === player.id);
		if (index !== -1)
		{
			this.players.splice(index, 1);
			this.broadcast('lobby:player:left', player.serialize());
			console.log(`Player ${player.id} left lobby ${this.id}`);
		}
	}

	broadcast(name, data)
	{
		this.io.to(this.id).emit(name, data);
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
