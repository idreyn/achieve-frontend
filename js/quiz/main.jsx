require('../../css/base.css');
require('../../css/quiz.css');

window.Promise = require('bluebird');

let React = require('react');
let {render} = require('react-dom');
let $ = require('jquery');
let {Question, Quiz, Progress} = require('./models.js');
let {QuizView, QuestionView} = require('./views/views.jsx');
let {Backend} = require('./backend.js');

class QuizController {
	constructor(backend) {
		this.backend = backend;
		this.showQuiz();
		this.showProgress();
	}

	showQuiz() {
		return this.backend.retrieveQuiz().then((resp) => {
			document.title = resp.title;
			this.quiz = Quiz.fromResponse(resp);
			this.update();
		});
	}

	showProgress() {
		return this.backend.retrieveProgress().then((resp) => {
			this.progress = Progress.fromResponse(resp);
			this.update();
		});
	}

	update() {
		render(
			<QuizView
				controller={this}
				onSubmit={this.handleSubmit.bind(this)}
				onClaimMilestone={this.handleClaimMilestone.bind(this)}
				progress={this.progress}
				quiz={this.quiz}
			/>,
			document.getElementById('container')
		);
	}

	handleSubmit(q, r) {
		return this.backend
			.submitResponse(q,r)
			.then(this.update.bind(this))
			.then(this.showProgress.bind(this));
		this.update();
	}

	handleClaimMilestone() {
		return this.backend
			.claimMilestone()
			.then(this.showProgress.bind(this));
		this.update();
	}
}

$(function() {
	let key = window.location.pathname.split('/')[2];
	let backend = new Backend(key);
	let qc = new QuizController(backend);
});