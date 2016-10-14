let React = require("react");
let classNames = require("classnames");
let {StyleSheet, css} = require("aphrodite");
let {
	Button,
	Dialog, DialogTitle, DialogContent, DialogActions,
	Icon,
	Menu, MenuItem,
	ProgressBar
} = require("react-mdl");

let {Progress, Quiz} = require("../models.js");
let AnswerIndicator = require("./answer-indicator.jsx");

let ProgressView = React.createClass({
	propTypes: {
		// Callback when Milestone is claimed, should return a promise
		onClaimMilestone: React.PropTypes.func.isRequired,
		// The quizzes that have been sent to this user
		progress: React.PropTypes.instanceOf(Progress).isRequired,
		// The current quiz
		quiz: React.PropTypes.instanceOf(Quiz).isRequired,
	},

	getInitialState() {
		return {
			// Whether we are currently claiming a Milestone
			claimingMilestone: false,
			// Whether to show the Milestone claim dialog
			showMilestoneDialog: false,
		};
	},

	handleClaimMilestone() {
		this.setState({claimingMilestone: true})
		this.props.onClaimMilestone()
			.then(() => this.setState({
				showMilestoneDialog: false,
				claimingMilestone: false,
			}));
	},

	renderMilestoneDialog() {
		let {progress} = this.props;
		let {claimingMilestone, showMilestoneDialog} = this.state;
		return showMilestoneDialog && <Dialog
			className={css(styles.fixedDialog)}
			open={showMilestoneDialog}
		>
			<DialogTitle>Nice work!</DialogTitle>
			<DialogContent>
				<Icon className={css(styles.bigIcon)} name="local_play"/>
				<br/>
				Thanks for completing {progress.milestones.needed} OTA questions!
					Click below to claim your reward and we'll send you an email with a voucher!
			</DialogContent>
			<DialogActions>
				<Button 
					colored raised ripple
					onClick={this.handleClaimMilestone}
				>
					{claimingMilestone? "Claiming..." : "Claim!"}
				</Button>
			</DialogActions>
		</Dialog>
	},

	render() {
		let {quiz, progress} = this.props;
		let {quizzes, milestones} = progress;
		let completed = quiz.questions.filter(q => q.hasResponse()).length;
		let total = quiz.questions.length;
		let hasUnclaimed = !!milestones.unclaimed.length;
		return <div className={css(styles.progress)}>
			<div className={css(styles.progressContainer)}>
				<div>
					<Button 
						raised
						colored
						ripple
						id="show-previous-quiz-button"
						className={css(styles.button)}
					>
						<Icon name="history"/>
					</Button>
					<Menu target="show-previous-quiz-button">
						{quizzes.map(
							(quiz, i) => <ProgressRow 
								key={i}
								quiz={quiz}
							/>
						)}
					</Menu>
					<Button
						ripple
						className={classNames(
							!hasUnclaimed && css(styles.disabled)
						)}
						raised={hasUnclaimed}
						accent={hasUnclaimed}
						onClick={() => this.setState({showMilestoneDialog: true})}
					>
						<Icon
							className={css(styles.icon)}
							name="local_play"
						/>
						{hasUnclaimed ?
							"Claim Milestone!" :
							`Milestone: ${milestones.complete}/${milestones.needed}`}
					</Button>
				</div>
				<div className={css(styles.greeting)}>
					Hi, {progress.name}!
				</div>
			</div>
			<ProgressBar
				className={classNames(
					css(styles.progressBar),
					completed == total && "complete"
				)}
				progress={100 * completed / total}
			/>
			{this.renderMilestoneDialog()}
		</div>;
	},
});

let ProgressRow = React.createClass({
	propTypes: {
		// The quiz to display progress for
		quiz: React.PropTypes.shape({
			// An object like {1: true, 3: false}
			completedQuestions: React.PropTypes.number.isRequired,
			// The QuizKey pairing the user to the quiz
			key: React.PropTypes.string.isRequired,
			// The title of the quiz
			title: React.PropTypes.string.isRequired,
			// The total number of questions in the quiz
			totalQuestions: React.PropTypes.number.isRequired,
		}).isRequired,
	},

	render() {
		let {title, completedQuestions, totalQuestions, key} = this.props.quiz;
		let done = completedQuestions == totalQuestions;
		return <MenuItem className={css(styles.menuItem)}>
			<a
				className={css(styles.noHref)}
				href={`/quiz/${key}/view/`}
			>
				{title}
				{` (${completedQuestions}/${totalQuestions} answered)`}
			</a>
		</MenuItem>;
	},
});

let styles = StyleSheet.create({
	button: {
		marginRight: 5,
	},
	bigIcon: {
		fontSize: 50,
		background: "rgba(0,0,0,0.1)",
		padding: 15,
		borderRadius: 100,
		transform: "rotate(30deg)",
		margin: 5,
	},
	disabled: {
		pointerEvents: "none",
	},
	fixedDialog: {
		position: "fixed",
		textAlign: "center",
		background: "white",
		left: 0,
		right: 0,
		margin: "0 auto",
	},
	greeting: {
		marginRight: 5,
	},
	icon: {
		marginRight: 5,
	},
	menuItem: {
		alignItems: "center",
		display: "flex",
	},
	noHref: {
		color: "black",
		textDecoration: "none",
	},
	progress: {
		background: "#FAFAFA",
		boxShadow: "1px 1px 5px rgba(0,0,0,0.2)",
		maxWidth: 820,
		marginLeft: -10,
		position: "fixed",
		top: 0,
		width: "calc(95% + 20px)",
		zIndex: 3,
	},
	progressBar: {
		width: "100%",
	},
	progressContainer: {
		alignItems: "center",
		boxSizing: "border-box",
		display: "flex",
		justifyContent: "space-between",
		position: "relative",
		padding: 6,
		width: "100%",
	},
});

module.exports = ProgressView;

