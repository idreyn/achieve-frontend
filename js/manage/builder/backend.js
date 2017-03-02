let {HTTPBackend} = require('../../backend.js');

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

	// Deploy with an optional test email
	// if email is set, it will only send to that address
	deployQuiz(email, abandon) {
		return this.issueRequest('deploy', {email, abandon});
	}

	deployStatus() {
		return this.issueRequest('deploy-status');
	}
}

const SaveState = {
	SAVED: 0,
	SAVING: 1,
	DIRTY: 2,
};

module.exports = {Backend, SaveState};