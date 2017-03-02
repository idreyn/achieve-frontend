let React = require('react');
let {} = require('react-mdl');

let {AppFrame} = require("./../../base/views.jsx");

const Dashboard = React.createClass({
	renderHeader() {
		return "Hello there!";
	},

	render() {
		return <AppFrame headerContent={this.renderHeader()}/>
	},
});

module.exports = {Dashboard};