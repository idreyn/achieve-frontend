let {HTTPBackend} = require('../backend.js');

class Backend extends HTTPBackend {
	constructor(id) {
		super('manage/' + id);
	}

	retrieveQuiz() {
		return this.issueRequest('retrieve');
	}
}

module.exports = {Backend};