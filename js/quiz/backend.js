let {Question, QuestionState} = require('./models.js');
let {HTTPBackend, FakeBackend} = require('../backend.js');

class Backend extends HTTPBackend {
	constructor(key, isManager) {
		super((isManager ? 'manage/' : 'quiz/') + key);
	}

	retrieveQuiz() {
		return this.issueRequest('retrieve');
	}

	retrieveProgress() {
		return this.issueRequest('progress');
	}

	claimMilestone() {
		return this.issueRequest('claim');
	}

	submitResponse(question, response) {
		if(!response) return;
		question.response = response;
		question.state = QuestionState.WAITING;
		return this.issueRequest('respond',{
			question: question.id,
			response: question.response
		}).then(function(res) {
			question.correct = res.correct;
			question.explanation = res.explanation;
			if(res.correct == response) {
				question.state = QuestionState.CORRECT;
			} else {
				question.state = QuestionState.INCORRECT;
			}
		});	
	}
}

module.exports = {Backend};