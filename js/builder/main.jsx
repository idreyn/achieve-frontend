require('../../css/base.css');
require('../../css/builder.css');

let React = require('react');
let {render} = require('react-dom');
let $ = require('jquery');
let debounce = require('debounce');

let {Quiz, Question} = require('./quiz.js');
let {QuizBuilder} = require('./views.jsx');
let {Backend, SaveState} = require('./backend.js');

class Controller {

	constructor(backend) {
		this.update();
		this.saveState = SaveState.SAVED;
		backend.retrieveQuiz().then((resp) => {
			this.quiz = new Quiz(resp);
			this.update();
		});
		this.debouncedSave = debounce(this.saveQuiz.bind(this), 1000);
	}

	handleUpdate() {
		this.saveState = SaveState.DIRTY;
		this.update();
		return this.debouncedSave();
	}

	saveQuiz() {
		if (this.saveState === SaveState.SAVED) {
			return Promise.resolve();
		}
		backend.updateQuiz(this.quiz.serialize()).then((resp) => {
			this.saveState = SaveState.SAVED;
			this.quiz = new Quiz(resp);
			this.update();
		}).catch((resp) => {
			this.saveState = SaveState.DIRTY;
			this.update();
		});
		this.saveState = SaveState.SAVING;
		this.update();
	}

	update() {
		render(
			<QuizBuilder
				controller={this}
				saveState={this.saveState}
				onSave={this.saveQuiz.bind(this)}
				onUpdate={this.handleUpdate.bind(this)}
				quiz={this.quiz}
			/>,
			document.getElementById('container')
		);
	}
}

let key = window.location.pathname.split('/')[2];
let backend = new Backend(key);
let controller = new Controller(backend);

module.exports = {SaveState};