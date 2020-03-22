const uuid = require('uuid').v1;

module.exports = class Lobby {
	constructor({ io, createGame, closeLobby })
	{
		// super();
		this.io = io.of('/lobby');
		this.id = uuid();
		this.name = 'unnamed';
		this.players = [];
		this.maxPlayers = 2;
		this.status = 'PENDING';
		this.countdown = 0;
		this.timeout = null;
		this.gameId = undefined;
		this.callbacks = {
			createGame: createGame,
			closeLobby: closeLobby
		};
	}

	isFull()
	{
		return this.maxPlayers !== null && (this.players.length === this.maxPlayers);
	}

	close()
	{
		this.players.forEach(p => {
			p.io.leave(this.id);
		});
		this.players = [];
		this.status = 'CLOSED';
		this.maxPlayers = 0;
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
			player.io.join(this.id);

			this.players.splice(index, 1);
			this.broadcast('lobby:player:left', player.serialize());
			console.log(`Player ${player.id} left lobby ${this.id}`);
		}

		if (this.players.length === 0)
		{
			this.status = 'CLOSING';
			this.callbacks.closeLobby();
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
			this.beginCountdown().then(() => {
				this.status = 'READY';
				const game = this.callbacks.createGame();
				this.broadcast('lobby:game', { id: game.id });
			}).then(() => {
				this.callbacks.closeLobby();
			});
		}
		else
		{
			this.status = 'PENDING';
			this.countdown = 0;
			if (this.timeout)
			{
				clearTimeout(this.timeout);
			}

			this.broadcast('lobby:update', this.serialize());
		}
	}

	beginCountdown()
	{
		let time = Date.now();

		this.countdown = 5000;
		const promise = new Promise((resolve, reject) => {
			const tick = () => {
				this.countdown = (5000 - (Date.now() - time));

				if (this.countdown < 0)
				{
					this.countdown = 0;
					resolve();
				}
				else
				{
					setTimeout(tick, 250);
				}

				console.log("tick");
				this.broadcast('lobby:update', this.serialize());
			}

			tick();
		});

		return promise;
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
			countdown: this.countdown,
			gameId: this.gameId
		};
	}
}
