require('../style.css');

let React = require('react');
let {render} = require('react-dom');
let $ = require('jquery');
let {Question} = require('./question.js');
let {QuizView, QuestionView} = require('./views.jsx');
let {Backend} = require('./backend');

class QuizController {
	constructor(backend) {
		this.backend = backend;
		this.questions = [];
		this.update = this._update.bind(this);
		this.backend.retrieveQuiz().then((resp) => {
			this.title = [resp.title,resp.subtitle];
			this.text = resp.text;
			this.achiever = resp.achiever;
			this.questions = resp.questions.map((q,i) => new Question(
				q.id,
				q.text,
				q.choices,
				i + 1,
				q.state,
				q.response,
				q.correct
			));
			this.update();
		});
	}

	_update() {
		render(
			<QuizView
				title={this.title}
				achieverName={this.achieverName}
				questions={this.questions}
				onSubmit={this.handleSubmit.bind(this)}
			/>,
			document.getElementById('container')
		);
	}

	handleSubmit(q,r) {
		this.backend.submitResponse(q,r).then(this.update);
		this.update();
	}
}

let backend = new Backend();
let qc = new QuizController(backend);
window.update = qc.update;