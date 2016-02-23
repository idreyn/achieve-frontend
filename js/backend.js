let xhr = require('xhr');
let {Question, QuestionState} = require('./question.js');

class Backend {
	constructor() {

	}

	issueRequest() {
		throw new Error("Don't use Backend directly");
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

class HTTPBackend extends Backend {
	constructor(key,csrf) {
		super();
		this.key = key;
		this.csrf = csrf;
	}

	issueRequest(type,data) {
		return new Promise(resolve => {
			xhr({
				uri: '/quiz/' + this.key + '/' + type + '/',
				body: JSON.stringify(data),
				method: 'POST',
				headers: {
					'Content-type': 'application/json; charset=utf-8',
					'X-CSRFToken': this.csrf
				}
			},function(err,resp,body) {
				resolve(JSON.parse(body));
			});
		});
	}
}

class FakeBackend extends Backend {
	issueRequest(type,data) {
		return new Promise((fulfill) => {
			setTimeout(() => {
				fulfill(this.fakeResponse(type,data));
			},1000);
		});
	}

	fakeResponse(type,data) {
		switch(type) {
			case 'respond': 
				return {
					correct: "A",
					explanation: "You da greatest"	
				}
			case 'retrieve':
				return {
					id: 0,
					name: "OTA #0: The Testening",
					achieverName: "Test Achiever",
					questions: [
						{
							id: 0, 
							text: "What is the biggest penguin?", 
							choices: {"A": "Emperor", "B": "King", "C": "Adelie", "D": "Rockhopper", "E": "Little Blue"},
							response: "B",
							correct: "A"
						},
						{
							id: 0, 
							text: "What is the biggest penguin?", 
							choices: {"A": "Emperor", "B": "King", "C": "Adelie", "D": "Rockhopper", "E": "Little Blue"},
						},

					]
				}
			default:
				return {
					error: "Unknown request type"
				}
		}
	}
}

module.exports = {
	Backend: HTTPBackend
};