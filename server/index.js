const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Lobby = require('./lobby');
const uuid = require('uuid').v1;

const PRETTIFY_JSON_RESPONSES = true;

io.set('transports', ['websocket']);

const lobbies = [];

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
	}

	serialize()
	{
		return { id: this.id };
	}
};

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

	const lobby = new Lobby({ io });

	lobbies.push(lobby);

	res.send(JSON.stringify(lobby.serialize()));
});

io.use((socket, next) => {
	// console.log(socket.handshake.query);

	const lobby = lobbies.find(l => l.id === socket.handshake.query.lobby);
	if (lobby)
	{
		console.log("Lobby exists");
		next();
	}
	else
	{
		console.log("Lobby does not exist");
		next(new Error("Lobby does not exist"));
	}
});

io.of('/lobby').on('connection', (client) => {
	console.log(`client ${client.id} connected`);

	const lobby = lobbies.find(l => l.id === client.handshake.query.lobby);

	if (lobby)
	{
		const player = new Player(client);
		lobby.handleJoin(player);

		player.io.on('disconnect', () => {
			const lobby = lobbies.find(l => !!l.players.find(p => p.id === player.id));
			if (lobby)
			{
				lobby.handleLeave(player);
			}

			console.log(`client '${client.id}' disconnected`);
		});
	}
	else
	{
		throw new Error("Cannot connect to lobby");
	}
});


const port = process.env.port || 3001;
server.listen(port, () => { console.log(`Server running on localhost:${port}`); });
