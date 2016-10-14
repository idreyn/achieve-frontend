require('../../css/base.css');
require('../../css/progress.css');

let React = require('react');
let {render} = require('react-dom');
let $ = require('jquery');
let xhr = require('xhr');

let {retrieveCSRFToken} = require('../csrf.js');

class HTTPBackend {
	constructor(key) {
		this.key = key;
		this.csrf = retrieveCSRFToken();
	}

	getProgress() {
		return new Promise(resolve => {
			xhr({
				uri: '/quiz/' + this.key + '/progress/retrieve/',
				method: 'GET',
				headers: {
					'Content-type': 'application/json; charset=utf-8',
					'X-CSRFToken': this.csrf
				}
			},function(err,resp,body) {
				resolve(JSON.parse(body))
			});
		});
	}
}

let ProgressView = React.createClass({
	render() {
		let pr = this.props.progress
		return <div id='main'>
			<div className='panel panel-default'>
				<div className='panel-heading'>
					<h1 className='panel-title'>Semester progress for {pr.name}</h1>
				</div>
				<div>
				{
					pr.quizzes.map((qz,i) => {
						console.log(qz);
						let expired = Date.now() > qz.expires;
						let url = '/quiz/' + qz.key + '/view/';
						return <div className='quiz-result' key={i}>
							<h3>
								{expired? qz.title : <a href={url}> {qz.title} </a>} {
									expired ? <span className="label label-danger">Expired</span> : ''
								} {
									qz.completed_questions == qz.total_questions ? 
										<span className="label label-success">Completed: {Math.round(qz.score * 100)}% correct</span> : 
										<span className="label label-info">Answered {qz.completed_questions.toString()}/{qz.total_questions.toString()}</span>
								}
							</h3>
						</div>;
					})
				}
				</div>
			</div>
		</div>
	}
})

class ProgressController {
	constructor(key) {
		this.http = new HTTPBackend(key);
		this.http.getProgress().then(resp => {
			this.progress = resp;
			console.log(resp);
			this._update();
		})
	}

	_update() {
		render(
			<ProgressView progress={this.progress}/>,
			document.getElementById('container')
		);
	}
}

let key = window.location.pathname.split('/')[2];
let controller = new ProgressController(key);