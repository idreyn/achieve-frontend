let React = require("react");
let {Stylesheet, css} = require("aphrodite");

let {Progress} = require("./quiz.js");

let ProgressView = React.createClass({
	propTypes: {
		// The quizzes that have been sent to this user
		progress: React.PropTypes.instanceOf(Progress).isRequired,
	},

	render() {
		let {quizzes} = this.props.progress;
		return <div>
			{quizzes.map(
				(quiz, i) => <ProgressRow key={i} quiz={quiz}/>
			)}
		</div>;
	},
});

let ProgressRow = React.createClass({
	propTypes: {
		// The quiz to display progress for
		quiz: React.PropTypes.shape({
			// The QuizKey pairing the user to the quiz
			key: React.PropTypes.string.isRequired,
			// An object like {1: true, 3: false}
			responses: React.PropTypes.object.isRequired,
			// The title of the quiz
			title: React.PropTypes.string.isRequired,
			// The total number of questions in the quiz
			totalQuestions: React.PropTypes.number.isRequired,
		}).isRequired,
	},

	render() {
		let {title} = this.props.quiz;
		return <div>{title}</div>;
	},
});

module.exports = ProgressView;

