let {retrieveCSRFToken} = require('./csrf.js');
let xhr = require('xhr');

class HTTPBackend {
	constructor(root) {
		this.root = root;
		this.csrf = retrieveCSRFToken();
	}

	issueRequest(type, data) {
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

module.exports = {HTTPBackend};