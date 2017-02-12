let {HTTPBackend} = require('../backend.js');

class Backend extends HTTPBackend {
	constructor(id) {
		super('manage/' + id);
	}

	retrieveQuiz() {
		return this.issueRequest('retrieve');
	}

	updateQuiz(data) {
		return this.issueRequest('update', data);
	}
}

const SaveState = {
	SAVED: 0,
	SAVING: 1,
	DIRTY: 2,
};

module.exports = {Backend, SaveState};