const express = require('express');

const app = express();

const lobbys = [{
	id: '123456',
	name: 'my game',
	players: 0,
	maxPlayers: 2
}, {
	id: '1234',
	name: 'my other game',
	players: 0,
	maxPlayers: undefined
}];

app.get('/api/lobby', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(lobbys));
});

const port = process.env.port || 3001;
app.listen(port, () => {
		console.log(`Express server is running on localhost:${port}`);
	}
);
