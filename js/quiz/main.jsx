require('../../css/base.css');
require('../../css/quiz.css');

let React = require('react');
let {render} = require('react-dom');
let $ = require('jquery');
let {Question, Quiz} = require('./quiz.js');
let {QuizView, QuestionView} = require('./views.jsx');
let {Backend} = require('./backend.js');

class QuizController {
	constructor(backend) {
		this.backend = backend;
		this.questions = [];
		this.quiz = new Quiz();
		this.backend.retrieveQuiz().then((resp) => {
			document.title = resp.title;
			this.quiz.extend(resp);
			this.quiz.questions = resp.questions.map((q,i) => new Question(
				q.id,
				q.text,
				q.choices,
				i + 1,
				q.state,
				q.response,
				q.correct,
				q.explanation
			));
			this.update();
		});
	}

	update() {
		render(
			<QuizView
				controller={this}
				quiz={this.quiz}
				onSubmit={this.handleSubmit.bind(this)}
			/>,
			document.getElementById('container')
		);
	}

	handleSubmit(q,r) {
		this.backend.submitResponse(q,r).then(this.update.bind(this));
		this.update();
	}
}

let key = window.location.pathname.split('/')[2];
let backend = new Backend(key);
let qc = new QuizController(backend);