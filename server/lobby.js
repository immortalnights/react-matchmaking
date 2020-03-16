const uuid = require('uuid').v1;

module.exports = class Lobby {
	constructor({ io, createGame })
	{
		// super();
		this.io = io.of('/lobby');
		this.id = uuid();
		this.name = 'unnamed';
		this.players = [];
		this.maxPlayers = null;
		this.status = 'PENDING';
		this.timer = 0;
		this.timeout = null;
		this.gameId = undefined;
		this.callbacks = {
			createGame: createGame
		};
	}

	handleJoin(player)
	{
		this.broadcast('lobby:player:joined', player.serialize());

		player.io.join(this.id);
		this.players.push(player);

		player.io.emit('lobby:update', this.serialize());
		console.log(`Player ${player.id} joined lobby ${this.id}`);
	}

	handleLeave(playerId)
	{
		const index = this.players.findIndex(p => p.id === playerId);
		if (index !== -1)
		{
			const player = this.players[index];

			this.players.splice(index, 1);
			this.broadcast('lobby:player:left', player.serialize());
			console.log(`Player ${player.id} left lobby ${this.id}`);
		}
	}

	toggleReady(playerId)
	{
		const index = this.players.findIndex(p => p.id === playerId);
		if (index !== -1)
		{
			const player = this.players[index];

			player.ready = !player.ready;
			this.broadcast('lobby:player:update', player.serialize());
		}

		if (this.players.every(p => p.ready))
		{
			console.log("all players are ready");
			this.status = 'STARTING';
			this.countdown();
		}
		else
		{
			this.status = 'PENDING';
			if (this.timeout)
			{
				clearTimeout(this.timeout);
			}
		}
	}

	countdown()
	{
		let time = Date.now();

		const tick = () => {
			this.timer = (5000 - (Date.now() - time));

			if (this.timer < 0)
			{
				this.timer = 0;
				this.status = 'READY';
				this.timeout = null;
			}
			else
			{
				this.timeout = setTimeout(tick, 500);
			}

			this.broadcast('lobby:update', this.serialize());

			if (this.status === 'READY')
			{
				const game = this.callbacks.createGame();
				this.broadcast('lobby:game', { id: game.id });
			}
		}

		tick();
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
			status: this.status,
			timer: this.timer,
			gameId: this.gameId
		};
	}
}
