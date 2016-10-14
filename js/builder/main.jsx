require('../../css/base.css');
require('../../css/builder.css');

let React = require('react');
let {render} = require('react-dom');
let $ = require('jquery');

let Paper = require('../../node_modules/material-ui/Paper/Paper.js');

let {Quiz, Question} = require('./quiz.js');
let {QuizBuilder} = require('./views.jsx');
let {Backend} = require('./backend.js');

class Controller {
	constructor(backend) {
		this.update();
		this.backend = backend;
		this.backend.retrieveQuiz().then((resp) => {
			this.quiz = new Quiz();
			this.quiz.extend(resp);
			this.quiz.questions = resp.questions.map((data, i) => {
				const q = new Question();
				q.setup(data);
				return q;
			});
			this.update();
		});
	}

	update() {
		render(
			<QuizBuilder
				controller={this}
				quiz={this.quiz}
			/>,
			document.getElementById('container')
		);
	}
}
let key = window.location.pathname.split('/')[2];
let backend = new Backend(key);
let controller = new Controller(backend);