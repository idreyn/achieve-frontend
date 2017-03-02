require('../../../css/base.css');
require('../../../css/builder.css');

let React = require('react');
let {render} = require('react-dom');
let debounce = require('lodash.debounce');

let {Quiz, Question} = require('./quiz.js');
let {Deploy, DeployStatus} = require('./deploy.js');
let {QuizBuilder} = require('./views.jsx');
let {Backend, SaveState} = require('./backend.js');

class Controller {

	constructor(backend) {
		this.update();
		this.saveState = SaveState.SAVED;
		backend.retrieveQuiz().then((resp) => {
			this.quiz = new Quiz(resp);
			this.monitorDeployStatus();
			this.update();
		});
		this.debouncedSave = debounce(this.saveQuiz.bind(this), 1000);
		this.deploy = new Deploy();
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
		this.savePromise = backend.updateQuiz(this.quiz.serialize());
		this.savePromise.then((resp) => {
			this.saveState = SaveState.SAVED;
			this.quiz = new Quiz(resp);
			this.savePromise = null;
			this.update();
		}).catch((resp) => {
			this.saveState = SaveState.DIRTY;
			this.savePromise = null;
			this.update();
		});
		this.saveState = SaveState.SAVING;
		this.update();
	}

	deferSave() {
		this.debouncedSave && this.debouncedSave.cancel();
		this.savePromise && this.savePromise.cancel();
	}

	deployQuiz(testEmail, abandon) {
		var promise = backend.deployQuiz(testEmail, abandon).then((resp) => {
			this.deploy.extend(resp);
			this.monitorDeployPromise && this.monitorDeployPromise.cancel();
			this.update();
		}).catch((err) => {
			this.update();
		});
		if(!abandon) this.deploy.status = DeployStatus.STARTED;
		this.monitorDeployStatus();
		this.update();
		return promise;
	}

	monitorDeployStatus() {
		const check = () => {
			this.monitorDeployPromise = backend.deployStatus().then((resp) => {
				this.deploy.extend(resp);
				this.update();
				if (resp.status === DeployStatus.STARTED) {
					setTimeout(check, 300);
				}
				if (resp.status === DeployStatus.SUCCESS) {
					this.saveState = SaveState.DIRTY;
					this.saveQuiz();
				}
			})
		}
		setTimeout(check, 300);
	}

	update() {
		render(
			<QuizBuilder
				controller={this}
				saveState={this.saveState}
				deploy={this.deploy}
				onSave={this.saveQuiz.bind(this)}
				onDeploy={this.deployQuiz.bind(this)}
				onDeferSave={this.deferSave.bind(this)}
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