const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Lobby = require('./lobby');

const PRETTIFY_JSON_RESPONSES = true;

io.set('transports', ['websocket']);

const lobbies = [];

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

const port = process.env.port || 3001;
server.listen(port, () => { console.log("OK"); });
// app.listen(port, () => {
// 		console.log(`Express server is running on localhost:${port}`);
// 	}
// );
