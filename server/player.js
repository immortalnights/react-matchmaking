const uuid = require('uuid').v1;

module.exports = class Player {
	constructor({ id, client })
	{
		console.log(id, !!client);
		this.id = id;
		this.io = client;
		this.ready = false;
	}

	on(name, callback)
	{
		return this.io.on(name, callback);
	}

	send(name, data)
	{
		return this.io.emit(name, data);
	}

	serialize()
	{
		return {
			id: this.id,
			ready: this.ready
		};
	}
};