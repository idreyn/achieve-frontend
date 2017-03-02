require('../../../css/base.css');

let React = require('react');
let {render} = require('react-dom');

let {Dashboard} = require('./views.jsx');
let {Backend} = require('./backend.js');

class Controller {
	constructor(backend) {
		this.backend = backend;
		this.update();
	}

	update() {
		render(
			<Dashboard/>,
			document.getElementById('container')
		);
	}
}

let backend = new Backend();
let controller = new Controller(backend);