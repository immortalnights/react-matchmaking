const express = require('express');
const uuid = require('uuid').v1;

const prettify = true;
const app = express();

const lobbies = [];

const sendJSONReply = function(res, json, status = 200) {
	if (prettify)
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
			sendJSONReply(res, lobby);
		}
		else
		{
			sendJSONReply(res, { error: `Lobby '${lobbyId}' not found`}, 404);
		}
	}
	else
	{
		sendJSONReply(res, lobbies);
	}
});

app.post('/api/lobby', (req, res) => {
	res.setHeader('Content-Type', 'application/json');

	const lobby = {
		id: uuid(),
		name: 'unnamed',
		players: 0,
		maxPlayers: null
	};

	lobbies.push(lobby);

	res.send(JSON.stringify(lobby));
});

const port = process.env.port || 3001;
app.listen(port, () => {
		console.log(`Express server is running on localhost:${port}`);
	}
);
