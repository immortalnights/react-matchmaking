const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Lobby = require('./lobby');
const uuid = require('uuid').v1;

const PRETTIFY_JSON_RESPONSES = true;

io.set('transports', ['websocket']);

const lobbies = [];
const games = [];

class Player {
	constructor({ client })
	{
		this.id = uuid();
		this.io = client;
		this.ready = false;
	}

	on(name, callback)
	{
		let r;
		if (this.io)
		{
			r = this.io.on(name, callback);
		}
		return r;
	}

	send(name, data)
	{
		let r;
		if (this.io)
		{
			r = this.io.emit(name, data);
		}
		return r;
	}

	serialize()
	{
		return {
			id: this.id,
			ready: this.ready
		};
	}
};

class AI extends Player
{
	constructor()
	{
		super({ client: null })
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

class Game {
	constructor({ io })
	{
		this.id = uuid();
		this.io = io.of('/game');
		this.status = 'PENDING';
	}

	serialize()
	{
		return {
			id: this.id,
			status: this.status
		};
	}
}

const createGame = () => {
	const game = new Game({ io });
	games.push(game);
	return game;
}

const sendJSONReply = function(res, json, status = 200) {
	if (PRETTIFY_JSON_RESPONSES)
	{
		res.setHeader('Content-Type', 'application/json');
		res.status(status).send(JSON.stringify(json, null, 4));
	}
	else
	{
		res.status(status).json(json);
	}
}

app.get('/api/lobby/:id?', (req, res) => {
	const lobbyId = req.params.id;
	if (lobbyId)
	{
		const lobby = lobbies.find((l) => l.id === lobbyId);
		if (lobby)
		{
			sendJSONReply(res, lobby.serialize());
		}
		else
		{
			sendJSONReply(res, { error: `Lobby '${lobbyId}' not found`}, 404);
		}
	}
	else
	{
		sendJSONReply(res, lobbies.map(lobby => lobby.serialize()));
	}
});

app.post('/api/lobby', (req, res) => {
	res.setHeader('Content-Type', 'application/json');

	const close = () => {
		const index = lobbies.findIndex(l => { return l.isEmpty(); });
		if (index !== -1)
		{
			let removed = lobbies.splice(index, 1);
			removed.forEach(l => { l.close(); });
		}
	};

	const lobby = new Lobby({ io, createGame: createGame, closeLobby: close });

	lobbies.push(lobby);

	res.send(JSON.stringify(lobby.serialize()));
});

app.get('/api/Game/:id?', (req, res) => {
	const gameID = req.params.id;
	if (gameID)
	{
		const game = games.find((l) => l.id === gameID);
		if (game)
		{
			sendJSONReply(res, game.serialize());
		}
		else
		{
			sendJSONReply(res, { error: `Game '${gameID}' not found`}, 404);
		}
	}
	else
	{
		sendJSONReply(res, { error: "Invalid request" }, 400);
	}
});

io.of('/lobby').use((socket, next) => {
	const lobbyID = socket.handshake.query.lobby;
	const lobby = lobbies.find(l => l.id === lobbyID);

	if (lobby)
	{
		console.log("join", lobby.status, lobby.isFull())
		if (lobby.status === 'PENDING' && lobby.isFull() === false)
		{
			console.log(`Lobby ${lobby.id} exists`);
			next();
		}
		else
		{
			console.error(`Cannot join lobby, incorrect state`, lobby.status);
			next(new Error(`Lobby ${lobbyID} is locked`));
		}
	}
	else
	{
		console.error(`Lobby ${lobbyID} does not exist`);
		next(new Error(`Lobby ${lobbyID} does not exist`));
	}
});

io.of('/lobby').on('connection', (client) => {
	console.log(`client ${client.id} connected`);

	const lobbyID = client.handshake.query.lobby;
	const lobby = lobbies.find(l => l.id === lobbyID);

	if (lobby)
	{
		const player = new Player({client});
		// inform the player who they are
		player.send('lobby:registered', player.serialize());

		lobby.handleJoin(player);

		player.on('lobby:addAIOpponent', () => {
			if (lobby.host !== player.id)
			{
				console.error(`Player ${player.id} tried to add an AI player, but is not the host`);
			}
			else if (lobby.isFull())
			{
				console.error(`Cannot add AI player, lobby is full`);
			}
			else
			{
				const ai = new AI();
				lobby.handleJoin(ai);
			}
		});

		player.on('lobby:removeAIOpponent', () => {
			// if (lobby.host !== player.id)
			// {
			// 	console.error(`Player ${player.id} tried to add an AI player, but is not the host`);
			// }
			// else if (lobby.isFull())
			// {
			// 	console.error(`Cannot add AI player, lobby is full`);
			// }
			// else
			// {
			// 	const ai = new AI();
			// 	lobby.handleJoin(ai);
			// }
		});

		player.on('lobby:toggleReady', () => {
			lobby.toggleReady(player.id);
		});

		player.on('disconnect', () => {
			lobby.handleLeave(player.id);

			console.log(`client '${client.id}' disconnected`);
		});
	}
	else
	{
		throw new Error("Cannot connect to lobby");
	}
});

io.of('/game').use((socket, next) => {
	const gameID = socket.handshake.query.game;
	const game = games.find(g => g.id === gameID);

	if (game)
	{
		console.log(`Game ${game.id} exists`);
		next();
	}
	else
	{
		console.log(`Game ${gameID} does not exist`);
		next(new Error(`Game ${gameID} does not exist`));
	}
});

io.of('/game').on('connection', (client) => {

});

const port = process.env.port || 3001;
server.listen(port, () => { console.log(`Server running on localhost:${port}`); });
