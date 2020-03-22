const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Lobby = require('./lobby');
const uuid = require('uuid').v1;

const PRETTIFY_JSON_RESPONSES = true;

io.set('transports', ['websocket']);

const lobbies = [];
const games = [];

// class LobbyManager {
// 	constructor()
// 	{
// 		this.io = io.of('/lobby');
// 		this.io.on('connection', (client) => {
// 			console.log(`client '${client.id}' has connected`);

// 	}
// }


class Player {
	constructor(client)
	{
		this.id = uuid();
		this.io = client;
		this.ready = false;
	}

	serialize()
	{
		return { id: this.id, ready: this.ready };
	}
};

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

	const lobby = new Lobby({ io, createGame: createGame });

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
		if (lobby.status === 'PENDING')
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
		const player = new Player(client);
		lobby.handleJoin(player);

		player.io.on('lobby:toggleReady', () => {
			lobby.toggleReady(player.id);
		});

		player.io.on('disconnect', () => {
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
