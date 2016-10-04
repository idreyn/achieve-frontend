let {retrieveCSRFToken} = require('./csrf.js');
let xhr = require('xhr');

class HTTPBackend {
	constructor(root) {
		this.root = root;
		this.csrf = retrieveCSRFToken();
	}

	issueRequest(type,data) {
		return new Promise(resolve => {
			xhr({
				uri: '/' + this.root + '/' + type + '/',
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

class FakeBackend {
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
					title: "OTA #0: The Testening",
					subtitle: "An OTA about testing",
					text: "This is the text of the OTA",
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

module.exports = {HTTPBackend: HTTPBackend, FakeBackend: FakeBackend};