const uuid = require('uuid').v1;
const Player = require('./player');
const AI = require('./ai');

module.exports = class Game {
	constructor({ io, name, players, host, closeGame })
	{
		// super();
		this.io = io.of('/game');
		this.id = uuid();
		this.name = name;
		this.authorizedPlayers = players.map(p => p.id);
		this.players = [];
		this.maxPlayers = players.length;
		this.host = host;
		this.status = 'PENDING';
		this.callbacks = {
			closeGame: closeGame
		};

		console.log(`Game ${this.id} initialized (${this.players.length})`);
	}

	initializeAIPlayers(players)
	{
		console.log(`AI players are joining the game`);
		players.forEach(p => {
			let ok = false;
			if (p.artifical)
			{
				if (this.isAuthorized(p.id))
				{
					const ai = this.handleAIJoin(p);
					console.log(`AI Player ${ai.id} has joined the game`);
					ok = true;
				}
				else
				{
					console.error(`AI Player ${p.id} is not authorized`);
				}
			}
			else
			{
				console.debug(`Waiting for player ${p.id} to join`);
			}

			return ok;
		});
		console.log(`${this.players.length} AI players have joined`);
	}

	isEmpty()
	{
		return this.players.length === 0;
	}

	isAuthorized(playerId)
	{
		console.log(`${playerId}, ${this.players.length} / ${this.maxPlayers} [${this.authorizedPlayers}]`);
		return (this.players.length < this.maxPlayers) && !!this.authorizedPlayers.find(id => id === playerId);
	}

	isReady()
	{
		let ready = false;
		if (this.authorizedPlayers.length === this.players.length)
		{
			console.log(`All players have joined the game`);
			ready = true;
		}
		else
		{
			console.log(`Waiting for ${this.authorizedPlayers.length - this.players.length} more player(s)`);
		}

		return ready;
	}

	// override to create game specialized player
	handleHumanJoin(details)
	{
		const player = new Player(details);
		this.handleJoin(player);
		return player;
	}

	// override to create game specialized AI
	handleAIJoin(details)
	{
		const player = new AI({ id: details.id });
		this.handleJoin(player);
		return player;
	}

	handleJoin(player)
	{
		console.assert(player instanceof Player, "Invalid player class");

		player.status = 'READY';
		this.broadcast('game:player:joined', player.serialize());

		// join the socket room
		player.io.join(this.id);
		this.players.push(player);

		player.send('game:update', this.serialize());

		console.log(`Player ${player.id} joined game ${this.id}`);
	}

	begin()
	{
		this.status = 'PLAYING';
		this.broadcast('game:update', this.serialize());
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
		// Sends to all human players (shoud AI have a socket too?)
		this.io.to(this.id).emit(name, data);

		// AI players do not receive broadcast messages :(
		this.players.forEach(p => {
			if (p.artifical)
			{
				p.send(name, data);
			}
		})
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