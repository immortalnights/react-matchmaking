const express = require('express');

const app = express();

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ greeting: `Hello ${name}!` }));
});

const port = process.env.port || 3001;
app.listen(port, () => {
		console.log(`Express server is running on localhost:${port}`);
	}
);
