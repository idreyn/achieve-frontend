require('../css/style.css');

let React = require('react');
let {render} = require('react-dom');
let $ = require('jquery');
let {Question} = require('./question.js');
let {QuizView, QuestionView} = require('./views.jsx');
let {Backend} = require('./backend');
let {retrieveCSRFToken} = require('./csrf.js');

class QuizController {
	constructor(backend) {
		this.backend = backend;
		this.questions = [];
		this.update = this._update.bind(this);
		this.backend.retrieveQuiz().then((resp) => {
			document.title = resp.title;
			this.title = resp.title;
			this.subtitle = resp.subtitle;
			this.text = resp.text;
			this.achiever = resp.achiever;
			this.questions = resp.questions.map((q,i) => new Question(
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

	_update() {
		render(
			<QuizView
				quiz={this}
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

window.jQuery = $;
let key = window.location.pathname.split('/')[2];
let backend = new Backend(key,retrieveCSRFToken());
let qc = new QuizController(backend);