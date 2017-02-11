let React = require('react');
let ReactDOM = require('react-dom');
let Reorder = require('react-reorder');
let FontAwesome = require('react-fontawesome');
let classNames = require("classnames");

let {AppFrame, DragHandle} = require("./../base/views.jsx");
let ContentEditor = require("./../base/content-editor.jsx");

let {Quiz, Question} = require('./quiz.js');
let RenderedView = require('../quiz/views/rendered.jsx');

let {
	Button,
	Card, CardTitle, CardText, CardActions,
	Dialog, DialogTitle, DialogContent, DialogActions,
	Icon, IconButton,
	Tabs, Tab,
	Tooltip
} = require("react-mdl");

let QuizBuilder = React.createClass({
	getInitialState() {
		return {
			activeTab: 2,
			expandedQuestion: null,
			inPreview: false,
		};
	},

	componentWillMount() {
		this.wantsToExpandQuestion = false;
	},

	componentDidMount() {
		// Ugh
		setTimeout(() => {
			this.wantsToExpandQuestion = true;
		}, 100);
	},

	componentDidUpdate(prevProps, prevState) {
		this.wantsToExpandQuestion = this.isEditingQuestions();
	},

	isEditingQuestions() {
		return this.state.activeTab === 2;
	},

	expandQuestion(qs, el) {
		this.setState({expandedQuestion: qs});
		el.scrollIntoViewIfNeeded(true);
	},

	closeAllQuestions() {
		this.setState({expandedQuestion: null});
	},

	handleCreateQuestion(qs, el) {
		if (this.wantsToExpandQuestion) {
			this.expandQuestion(qs, el);
		}
	},

	handleDeleteQuestion(qs) {
		this.props.quiz.deleteQuestion(qs);
		if (this.state.expandedQuestion === qs) {
			this.setState({expandedQuestion: null});
		}
		this.forceUpdate();
	},

	handleAddQuestion() {
		var qs = this.props.quiz.addQuestion();
		this.forceUpdate();
	},

	togglePreview: function() {
		this.setState({
			inPreview: !this.state.inPreview,
		});
	},

	renderHeader() {
		let {quiz} = this.props;
		return <div>
			<div>
				<ContentEditor 
					simple
					multiline={false} 
					content={quiz.title}
					placeholder={"Click to name OTA"}
					inputStyle={{color: "#FFF", fontFamily: "inherit"}}
					onContentUpdate={(c) => {
						quiz.title = c;
						this.forceUpdate();
					}}
				/>
			</div>
			<div style={{fontSize: "0.5em"}}>
				<ContentEditor 
					simple
					multiline={false} 
					content={quiz.subtitle}
					placeholder={"Click to add subtitle"}
					inputStyle={{color: "#FFF", fontFamily: "inherit"}}
					onContentUpdate={(c) => {
						quiz.subtitle = c;
						this.forceUpdate();
					}}
				/>
			</div>
		</div>
	},

	renderCurrentEditor() {
		let {quiz} = this.props;
		let {activeTab, expandedQuestion} = this.state;
		if (this.isEditingQuestions()) {
			return <QuestionList
				quiz={quiz}
				expandedQuestion={expandedQuestion}
				onExpandQuestion={this.expandQuestion}
				onCloseQuestion={this.closeAllQuestions}
				onCreateQuestion={this.handleCreateQuestion}
				onDeleteQuestion={this.handleDeleteQuestion}
			/>;
		}
	},

	render() {
		let {quiz} = this.props;
		let {inPreview} = this.state;
		if(!quiz) {
			return <div>
				Hold on a damn second...
			</div>;
		}
		return <AppFrame
			className={inPreview && "builder-preview"}
			headerContent={this.renderHeader()}
		>
			<div id="builder-header">
				<Tabs
					style={{width: "50%"}}
					activeTab={this.state.activeTab}
					onChange={(i) => this.setState({activeTab: i})}
					ripple
				>
					<Tab href="javascript:void(0)">Email</Tab>
					<Tab href="javascript:void(0)">Body text</Tab>
					<Tab href="javascript:void(0)">Questions</Tab>
				</Tabs>
				<div id="builder-header-buttons">
					{this.isEditingQuestions() && (inPreview ?
						<Tooltip label="Add question">
							<IconButton
								ripple
								onClick={this.handleAddQuestion}
								name="add"
							/> 
						</Tooltip>:
						<Button ripple onClick={this.handleAddQuestion}>
							<Icon name="add"/>
							Add
						</Button>
					)}
					{inPreview ?
						<Tooltip label="Hide preview">
							<IconButton
								ripple
								onClick={this.togglePreview}
								name="visibility_off"
							/> 
						</Tooltip>:
						<Button ripple onClick={this.togglePreview}>
							<Icon name="remove_red_eye"/>
							Preview
						</Button>
					}
					{inPreview ?
						<Tooltip label="Save changes">
							<IconButton
								ripple
								name="save"
							/>
						</Tooltip> :
						<Button ripple>
							<Icon name="save"/>
							Save
						</Button>
					}
					<Button ripple raised colored>
						<Icon name="send"/>
						Send
					</Button>
				</div>
			</div>
			<section id="builder" className="app-frame-content">
				{this.renderCurrentEditor()}
			</section>
		</AppFrame>;
	}
});

let QuestionList = React.createClass({
	propTypes: {
		expandedQuestion: React.PropTypes.instanceOf(Question),
		onCloseQuestion: React.PropTypes.func.isRequired,
		onExpandQuestion: React.PropTypes.func.isRequired,
		onCreateQuestion: React.PropTypes.func.isRequired,
		quiz: React.PropTypes.instanceOf(Quiz).isRequired,
	},

	getInitialState() {
		return {
			draggable: false,
		};
	},

	setExpanded(question) {
		this.setState({
			expandedQuestion: question,
		});
	},

	handleReorder(...args) {
		const newOrder = args[4];
		this.props.quiz.reorder(newOrder);
	},

	DraggableQuestion(props) {
		let qs = props.item;
		return <div className='draggable-item draggable-question'>
			<DragHandle target={this}/>
			<div className='draggable-item-inner'>
				<QuestionView 
					key={qs.index}
					question={qs}
					quiz={this.props.quiz}
					expanded={this.props.expandedQuestion === qs}
					onExpand={this.props.onExpandQuestion}
					onDelete={() => this.props.onDeleteQuestion(qs)}
					onClose={this.props.onCloseQuestion}
					onCreate={this.props.onCreateQuestion}
				/>
			</div>
		</div>;
	},

	render() {
		let {expandedQuestion, quiz} = this.props;
		return <div 
			id='questions-edit-pane'
			className={classNames(
				!expandedQuestion && 'no-expand'
			)}
		>
			<div className='inner'>
				<Reorder
					itemKey='index'
					lock='horizontal'
					holdTime={0}
					list={quiz.questions}
					template={this.DraggableQuestion}
					itemClass='quiz-question'
					callback={this.handleReorder}
					disableReorder={!this.state.draggable}
				/>
			</div>
		</div>
	},
});

let QuestionView = React.createClass({
	propTypes: {
		expanded: React.PropTypes.bool,
		onCreate: React.PropTypes.func,
		onExpand: React.PropTypes.func,
		onDelete: React.PropTypes.func.isRequired,
		quiz: React.PropTypes.instanceOf(Quiz).isRequired,
		question: React.PropTypes.instanceOf(Question).isRequired,
	},

	getInitialState() {
		return {
			draggable: false,
			deleting: false,
		};
	},

	componentDidMount() {
		this.props.onCreate(this.props.question, this.refs.main);
	},

	DraggableChoice(props) {
		return <div className='draggable-item'>
			<DragHandle target={this}>
				{Question.CHOICE_ALPHABET[props.item.index]}
			</DragHandle>
			<div className='draggable-item-inner'>
				<QuestionChoice
					onContentUpdate={this.handleUpdateChoice}
					onSelectAsCorrect={this.handleSetCorrectChoice}
					onDelete={this.handleDeleteChoice}
					choice={props.item}
					correct={props.item === this.props.question.correct}
				/>
			</div>
		</div>;
	},

	handleUpdateChoice(qc, value) {
		qc.text = value;
	},

	handleSetCorrectChoice(qc) {
		this.props.question.setCorrectChoice(qc);
		this.forceUpdate();
	},

	handleDeleteChoice(qc) {
		this.props.question.deleteChoice(qc);
		this.forceUpdate();
	},

	handleClick(e) {
		if (!this.props.expanded) {
			this.props.onExpand(
				this.props.question,
				this.refs.main
			);
		}
	},

	handleReorder(...args) {
		const newOrder = args[4];
		this.props.question.reorder(newOrder);
	},

	handleUpdateText(c) {
		this.props.question.text = c;
		this.forceUpdate();
	},

	handleDeleteClick(e) {
		this.setState({deleting: true});
	},
	
	render() {
		const style = {cursor: this.props.expanded ? 'inherit' : 'pointer'};
		const {expanded, question, onDelete} = this.props;
		const {deleting} = this.state;
		return <div
			className={classNames(
				'question',
				this.props.expanded && 'expanded'
			)}
			ref='main'
			style={style}
			onClick={this.handleClick}
		>
			<Card shadow={expanded ? 1 : 0}>
				<CardTitle>
					<h4>{(question.index + 1).toString()}</h4>
					{expanded ?
						<ContentEditor
							multiline={true}
							onContentUpdate={this.handleUpdateText}
							content={question.text}
							placeholder={"Click to add question text"}
						/> : 
						<RenderedView text={question.text}/>}
				</CardTitle>
				{expanded && <div>
					<Reorder
						itemKey='index'
						lock='horizontal'
						holdTime={0}
						list={question.choices}
						template={this.DraggableChoice}
						itemClass='question-choice'
						callback={this.handleReorder}
						disableReorder={!this.state.draggable}
					/>
					<div className='question-choice new-question-choice'>
						<Card shadow={0}>
							<ContentEditor
								multiline={false}
								onContentUpdate={(text) => {
									if (text && text.length) {
										question.addChoice(text);
										this.forceUpdate();
										return true;
									}
								}}
								placeholder="Click to add an answer"
							/>
						</Card>
					</div>
					<div className='question-choice new-question-choice'>
						<Card shadow={0}>
							<ContentEditor
								onContentUpdate={(text) => {
									question.setExplanation(text);
									this.forceUpdate();
									return true;
								}}
								content={question.explanation}
								placeholder={
									"Click to explain the correct answer"
								}
							/>
						</Card>
					</div>
				</div>}
				{expanded && <CardActions border>
					<Button onClick={this.handleDeleteClick}>Delete</Button>
					<Button onClick={this.props.onClose}>Close</Button>
				</CardActions>}
			</Card>
			<Dialog open={deleting}>
				<DialogContent>Delete this question?</DialogContent>
				<DialogActions>
					<Button colored onClick={() => {
						this.setState({deleting: false});
						onDelete();
					}}>
						Delete
					</Button>
					<Button onClick={() => this.setState({deleting: false})}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	}
});

let QuestionChoice = React.createClass({
	propTypes: {
		correct: React.PropTypes.bool.isRequired,
		onDelete: React.PropTypes.func.isRequired,
		choice: React.PropTypes.object.isRequired,
	},

	getInitialState() {
		return {
			deleting: false,
			hover: false,
		};
	},

	render() {
		let {choice, correct, onDelete, onSelectAsCorrect} = this.props;
		let {deleting, hover} = this.state;
		return <Card
			shadow={0}
			className='question-choice-content'
			onMouseOver={() => this.setState({hover: true})}
			onMouseOut={() => this.setState({hover: false})}
		> 
			<ContentEditor
				content={choice.text.toString()}
				multiline={false}
				onContentUpdate={(val) => 
					this.props.onContentUpdate(choice, val)
				}
			/>
			<div className='question-choice-tools'>
				<IconButton
					name="delete"
					onClick={
						() => this.setState({
							deleting: true,
						})
					}
					style={{opacity: hover ? 1 : 0}}
				/>
				{<IconButton
					name="check"
					colored={correct}
					style={{opacity: correct ? 1 : 0.2}}
					onClick={() => onSelectAsCorrect(choice)}
				/>}
			</div>
			<Dialog open={deleting}>
				<DialogContent>Delete this choice?</DialogContent>
				<DialogActions>
					<Button colored onClick={() => {
						this.setState({deleting: false});
						onDelete(choice);
					}}>
						Delete
					</Button>
					<Button onClick={() => this.setState({deleting: false})}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</Card>;
	}
});

module.exports = {QuizBuilder, QuestionView};