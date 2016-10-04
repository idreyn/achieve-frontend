let {Question, QuestionState} = require('./quiz.js');
let {HTTPBackend, FakeBackend} = require('../backend.js');

class Backend extends HTTPBackend {
	constructor(key) {
		super('quiz/' + key);
	}

	retrieveQuiz() {
		return this.issueRequest('retrieve');
	}

	submitResponse(question,response) {
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