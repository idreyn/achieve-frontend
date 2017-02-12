let React = require('react');
let ReactDOM = require('react-dom');
let Reorder = require('react-reorder');
let FontAwesome = require('react-fontawesome');
let classNames = require("classnames");

let CodeMirror = require("react-codemirror");
require('codemirror/mode/markdown/markdown');
require("codemirror/lib/codemirror.css");

let {AppFrame, DragHandle} = require("./../base/views.jsx");
let ContentEditor = require("./../base/content-editor.jsx");

let {SaveState} = require('./backend.js');
let {Quiz, Question} = require('./quiz.js');
let RenderedView = require('../quiz/views/rendered.jsx');

let {
	Button,
	Card, CardTitle, CardText, CardActions,
	Dialog, DialogTitle, DialogContent, DialogActions,
	Icon, IconButton,
	Radio, RadioGroup,
	Tabs, Tab,
	Textfield,
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
		this.getQuizID();
		setTimeout(() => {
			this.wantsToExpandQuestion = true;
		}, 100);
	},

	getQuizID() {
		return window.location.pathname.split("/")[2];
	},

	getMarkdown() {
		let {quiz} = this.props;
		if (this.isEditingBody()) {
			return quiz.text;
		} else {
			return "";
		}
	},

	setMarkdown(text) {
		let {quiz} = this.props;
		if (this.isEditingBody()) {
			quiz.text = text;
		}
		this.props.onUpdate();
	},

	componentDidUpdate(prevProps, prevState) {
		const {quiz} = this.props;
		if (this.isEditingMarkdown() && !this.isEditingMarkdown(prevState)) {
			const height = this.refs.builder.getBoundingClientRect().height;
			const cm = this.refs.editor.getCodeMirror();
			cm.setSize("100%", height);
		}
		if (prevProps.quiz !== quiz) {
			if (this.state.expandedQuestion) {
				this.setState({
					expandedQuestion: quiz.questions.filter(
						(q) => q.index === this.state.expandedQuestion.index
					)[0],
				});
			}
		}
	},

	isEditingQuestions(state) {
		return (state || this.state).activeTab === 2;
	},

	isEditingBody(state) {
		return (state || this.state).activeTab === 1;
	},

	isEditingEmail(state) {
		return (state || this.state).activeTab === 0;
	},

	isEditingMarkdown(state) {
		return !this.isEditingQuestions(state);
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
			// this.expandQuestion(qs, el);
		}
	},

	handleDeleteQuestion(qs) {
		this.props.quiz.deleteQuestion(qs);
		if (this.state.expandedQuestion === qs) {
			this.setState({expandedQuestion: null});
		}
		this.props.onUpdate();
		this.forceUpdate();
	},

	handleAddQuestion() {
		var qs = this.props.quiz.addQuestion();
		this.props.onUpdate();
	},

	togglePreview: function() {
		if (!this.state.inPreview) {
			this.props.onSave().then(
				() => this.setState({inPreview: true})
			); 
		} else {
			this.setState({inPreview: false});
		}
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
						this.props.onUpdate();
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
						this.props.onUpdate();
					}}
				/>
			</div>
		</div>
	},

	renderCurrentEditor() {
		let {quiz, saveState, onUpdate} = this.props;
		let {activeTab, expandedQuestion} = this.state;
		if (this.isEditingQuestions()) {
			return <QuestionList
				quiz={quiz}
				expandedQuestion={expandedQuestion}
				onExpandQuestion={this.expandQuestion}
				onCloseQuestion={this.closeAllQuestions}
				onCreateQuestion={this.handleCreateQuestion}
				onDeleteQuestion={this.handleDeleteQuestion}
				onUpdate={onUpdate}
			/>;
		} else {
			return <CodeMirror 
				ref="editor"
				value={this.getMarkdown()}
				onChange={this.setMarkdown}
				options={{
					lineNumbers: true,
					lineWrapping: true,
					mode: "markdown"
				}}
			/>
		}
	},

	renderMain() {
		let {quiz, onSave, saveState} = this.props;
		let {inPreview} = this.state;
		let savingText = {
			[SaveState.SAVED]: "Saved",
			[SaveState.SAVING]: "Saving...",
			[SaveState.DIRTY]: "Save",
		}[saveState];
		return <AppFrame
			className={inPreview && "builder-preview"}
			headerContent={this.renderHeader()}
		>
			<div id="builder-header">
				<Tabs
					ripple
					style={{width: "50%"}}
					activeTab={this.state.activeTab}
					onChange={(i) => {
						this.setState({activeTab: i});
						this.forceUpdate();
					}}
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
								className="icon-button"
								onClick={this.handleAddQuestion}
								name="add"
							/> 
						</Tooltip>:
						<Button
							className="icon-button"
							ripple 
							onClick={this.handleAddQuestion}
						>
							<Icon name="add"/>
							Add
						</Button>
					)}
					{inPreview ?
						<Tooltip label="Hide preview">
							<IconButton
								ripple
								className="icon-button"
								onClick={this.togglePreview}
								name="visibility_off"
							/> 
						</Tooltip>:
						<Button
							className="icon-button"
							ripple
							onClick={this.togglePreview}
						>
							<Icon name="remove_red_eye"/>
							Preview
						</Button>
					}
					{inPreview ?
						<Tooltip label={savingText}>
							<IconButton
								disabled={saveState !== SaveState.DIRTY}
								className="icon-button"
								ripple
								onClick={onSave}
								name="save"
							/>
						</Tooltip> :
						<Button
							disabled={saveState !== SaveState.DIRTY}
							className="icon-button"
							ripple
							onClick={onSave}
						>
							<Icon name="save"/>
							{savingText}
						</Button>
					}
					<Button ripple raised colored className="icon-button">
						<Icon name="send"/>
						Send
					</Button>
				</div>
			</div>
			<section id="builder" ref="builder" className="app-frame-content">
				{this.renderCurrentEditor()}
			</section>
			<DeployManager open={false} quiz={quiz}/>
		</AppFrame>;
	},

	render() {
		let {quiz, saveState} = this.props;
		let {inPreview} = this.state;
		if(!quiz) {
			return <div>
				Hold on a damn second...
			</div>;
		}
		if (inPreview) {
			return <div id="preview-container">
				{this.renderMain()}
				<QuizPreview id={this.getQuizID()} saveState={saveState} />
			</div>
		} else {
			return this.renderMain();
		}
	},

});

let QuestionList = React.createClass({
	propTypes: {
		expandedQuestion: React.PropTypes.instanceOf(Question),
		onCloseQuestion: React.PropTypes.func.isRequired,
		onExpandQuestion: React.PropTypes.func.isRequired,
		onCreateQuestion: React.PropTypes.func.isRequired,
		onUpdate: React.PropTypes.func.isRequired,
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
		this.props.onUpdate();
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
					onUpdate={this.props.onUpdate}
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
		onUpdate: React.PropTypes.func.isRequired,
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
		this.props.onUpdate();
	},

	handleSetCorrectChoice(qc) {
		this.props.question.setCorrectChoice(qc);
		this.props.onUpdate();
		this.forceUpdate();
	},

	handleAddChoice(text) {
		this.props.question.addChoice(text);
		this.forceUpdate();
	},

	handleDeleteChoice(qc) {
		this.props.question.deleteChoice(qc);
		this.props.onUpdate();
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
		this.props.onUpdate();
	},

	handleUpdateText(c) {
		this.props.question.text = c;
		this.props.onUpdate();
	},

	handleUpdateExplanation(text) {
		this.props.question.setExplanation(text);
		this.props.onUpdate();
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
										this.handleAddChoice(text);
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
									this.handleUpdateExplanation(text);
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
		let {choice, correct, onDelete, 
			onSelectAsCorrect, onContentUpdate} = this.props;
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
				onContentUpdate={(val) => onContentUpdate(choice, val)}
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

let QuizPreview = React.createClass({
	propTypes: {
		id: React.PropTypes.string.isRequired,
		saveState: React.PropTypes.oneOf(Object.values(SaveState)).isRequired,
	},

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.saveState === SaveState.SAVING && 
			this.props.saveState === SaveState.SAVED) {
			this.refs.frame.contentWindow.location.reload();
		}
	},

	render() {
		const {id} = this.props;
		return <iframe ref="frame" src={"/manage/" + id + "/view/"}/>;
	},
});

let DeployManager = React.createClass({
	propTypes: {
		quiz: React.PropTypes.instanceOf(Quiz).isRequired,
		open: React.PropTypes.bool.isRequired,
	},

	render() {
		return <Dialog open={this.props.open} style={{width: 500}}>
			<DialogTitle>Ready to deploy?</DialogTitle>
			<DialogContent>
				<p>You are about to deploy this quiz to all Achievers.</p>
				<p>Once it is sent, you will no longer be able to re-deploy the
				quiz or add/delete questions, so take a moment to make sure
				everything looks okay. When you're ready, you can deploy or 
				perform a dry run here.</p>
				<RadioGroup name="action" value="dry-run" childContainer="div">
					<Radio value="dry-run" ripple>
						Send a test message to
						<Textfield 
							label="Email address"
							floatingLabel
							style={{display: "inline"}}
						/>
					</Radio>
					<Radio value="real-thing">
						Deploy to all Achievers!
					</Radio>
				</RadioGroup>
			</DialogContent>
			<DialogActions>
				<Button raised colored ripple className="icon-button">
					<Icon name="thumb_up"/>
					Let's go
				</Button>
				<Button>Cancel</Button>
			</DialogActions>
		</Dialog>
	}
});

module.exports = {QuizBuilder};