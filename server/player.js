const uuid = require('uuid').v1;

module.exports = class Player {
	constructor({ id, client })
	{
		this.id = id;
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