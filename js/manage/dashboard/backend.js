let {HTTPBackend} = require('../../backend.js');

class Backend extends HTTPBackend {
	constructor() {
		super('manage/');
	}
}

module.exports = {Backend};