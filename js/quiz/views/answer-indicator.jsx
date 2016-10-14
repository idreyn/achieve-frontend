let React = require("react");
let {Icon} = require("react-mdl");

let AnswerIndicator = React.createClass({
	render() {
		let {correct, incorrect} = this.props;
		// Eek
		return <span style={{verticalAlign: "-webkit-baseline-middle"}}>
			{correct && <Icon className="correct" name="checked"/>}
			{incorrect && <Icon className="incorrect" name="close"/>}
		</span>
	}
});

module.exports = AnswerIndicator;