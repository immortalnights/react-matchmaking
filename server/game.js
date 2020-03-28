const uuid = require('uuid').v1;

module.exports = class Game {
	constructor({ io, name, players, host, closeGame })
	{
		// super();
		this.io = io.of('/game');
		this.id = uuid();
		this.name = name;
		this.authorizedPlayers = players;
		this.players = [];
		this.maxPlayers = players.length;
		this.host = host;
		this.status = 'PENDING';
		this.callbacks = {
			closeGame: closeGame
		};

		console.log(`Game ${this.id} [${this.authorizedPlayers.join(',')}]`);
	}

	isEmpty()
	{
		return this.players.length === 0;
	}

	isAuthorized(playerId)
	{
		return !!this.authorizedPlayers.find(id => id === playerId);
	}

	handleJoin(player)
	{
		if (this.isAuthorized(player.id))
		{
			this.broadcast('game:player:joined', player.serialize());

			// join the socket room
			player.io.join(this.id);

			if (!this.host && !player.artifical)
			{
				this.host = player.id;
			}

			this.players.push(player);

			player.send('game:update', this.serialize());
			console.log(`Player ${player.id} joined game ${this.id}`);
		}
		else
		{
			console.error(`Player ${player.id} is not authorized to join this game ${this.id}`);
		}
	}

	handleLeave(playerId)
	{
		const index = this.players.findIndex(p => p.id === playerId);
		if (index !== -1)
		{
			const player = this.players[index];
			player.io.leave(this.id);

			this.players.splice(index, 1);
			this.broadcast('game:player:left', player.serialize());
			console.log(`Player ${player.id} left game ${this.id}`);

			if (this.players.length <= 1)
			{
				this.players.forEach(p => {
					p.ready = false;
					this.broadcast('game:player:update', p.serialize());
				});
			}
		}

		if (this.isEmpty())
		{
			this.status = 'CLOSING';
			this.callbacks.closeGame();
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
			maxPlayers: this.maxPlayers,
			host: this.host,
			status: this.status
		};
	}
}