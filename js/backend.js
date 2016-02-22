let {Question, QuestionState} = require('./question.js');
let xhr = require('./xhr');

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
		console.log('submitting response...');
		question.response = response;
		question.state = QuestionState.WAITING;
		return this.issueRequest('respond',{
			id: question.id,
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

class HTTPBackend {
	constructor(key) {
		this.key = key;
	}

	issueRequest(type,data) {
		return new Promise(resolve => {
			xhr({
				uri: '/quiz/' + this.key + '/' + type + '/',
				body: data,
				headers: {
					'content-type': 'application/json'
				}
			},function(err,resp,body) {
				console.log(err,resp,body);
				resolve(resp);
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
	Backend: FakeBackend
};