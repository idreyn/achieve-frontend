let React = require('react');
let ReactDOM = require('react-dom');
let Reorder = require('react-reorder');
let FontAwesome = require('react-fontawesome');
let classNames = require("classnames");

let CodeMirror = require("react-codemirror");
require('codemirror/mode/markdown/markdown');
require("codemirror/lib/codemirror.css");

let {EMAIL_REGEX} = require("./../../base/util.js");
let {AppFrame, DragHandle} = require("./../../base/views.jsx");
let ContentEditor = require("./../../base/content-editor.jsx");

let {SaveState} = require('./backend.js');
let {Quiz, Question} = require('./quiz.js');
let {DeployStatus} = require('./deploy.js');
let RenderedView = require('../../quiz/views/rendered.jsx');

let {
	Button,
	Card, CardTitle, CardText, CardActions,
	Dialog, DialogTitle, DialogContent, DialogActions,
	Icon, IconButton,
	ProgressBar,
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
			deploying: false,
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

	componentWillReceiveProps(nextProps) {
		if(nextProps.deploy 
			&& nextProps.deploy.status === DeployStatus.STARTED) {
			this.setState({deploying: true});
		}
	},

	getQuizID() {
		return window.location.pathname.split("/")[2];
	},

	getMarkdown() {
		let {quiz} = this.props;
		if (this.isEditingBody()) {
			return quiz.text;
		} else if (this.isEditingEmail()) {
			return quiz.email;
		}
	},

	setMarkdown(text) {
		let {quiz} = this.props;
		if (this.isEditingBody()) {
			quiz.text = text;
		} else if (this.isEditingEmail()) {
			quiz.email = text;
		}
		this.props.onUpdate();
	},

	componentDidUpdate(prevProps, prevState) {
		const {quiz} = this.props;
		if (
			((this.isEditingMarkdown() !== this.isEditingMarkdown(prevState)) ||
			(this.state.inPreview !== prevState.inPreview)) &&
			this.refs.editor
		) {
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
		let {quiz, onDeferSave} = this.props;
		return <div>
			<div>
				<ContentEditor 
					simple
					multiline={false} 
					content={quiz.title}
					onFocus={onDeferSave}
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
					onFocus={onDeferSave}
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
		let {quiz, saveState, onUpdate, onDeferSave, deploy} = this.props;
		let {activeTab, expandedQuestion} = this.state;
		if (this.isEditingQuestions()) {
			return <QuestionList
				quiz={quiz}
				expandedQuestion={expandedQuestion}
				onExpandQuestion={this.expandQuestion}
				onCloseQuestion={this.closeAllQuestions}
				onCreateQuestion={this.handleCreateQuestion}
				onDeleteQuestion={this.handleDeleteQuestion}
				canDeleteQuestion={deploy.status !== DeployStatus.SUCCESS}
				onUpdate={onUpdate}
				onDeferSave={onDeferSave}
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
		let {quiz, deploy, onDeploy, onSave, saveState} = this.props;
		let {inPreview} = this.state;
		let savingText = {
			[SaveState.SAVED]: "Saved",
			[SaveState.SAVING]: "Saving",
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
					{(
						this.isEditingQuestions() &&
						deploy.status !== DeployStatus.SUCCESS
					) && (inPreview ?
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
					<Button
						ripple raised colored
						className="icon-button"
						onClick={() => this.setState({deploying: true})}
					>
						<Icon name="send"/>
						Deploy
					</Button>
				</div>
			</div>
			<section id="builder" ref="builder" className="app-frame-content">
				{this.renderCurrentEditor()}
			</section>
			<DeployManager
				open={this.state.deploying}
				quiz={quiz}
				deploy={deploy}
				onDeploy={onDeploy}
				onCancel={() => this.setState({deploying: false})}
			/>
		</AppFrame>;
	},

	render() {
		let {quiz, saveState} = this.props;
		let {inPreview} = this.state;
		if(!quiz) {
			return null;
		}
		if (inPreview) {
			return <div id="preview-container">
				{this.renderMain()}
				<QuizPreview
					id={this.getQuizID()}
					saveState={saveState}
					previewEmail={this.isEditingEmail()}
				/>
			</div>
		} else {
			return this.renderMain();
		}
	},

});

let QuestionList = React.createClass({
	propTypes: {
		canDeleteQuestion: React.PropTypes.bool.isRequired,
		expandedQuestion: React.PropTypes.instanceOf(Question),
		onCloseQuestion: React.PropTypes.func.isRequired,
		onExpandQuestion: React.PropTypes.func.isRequired,
		onCreateQuestion: React.PropTypes.func.isRequired,
		onDeferSave: React.PropTypes.func.isRequired,
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
					onDeferSave={this.props.onDeferSave}
					canDeleteQuestion={this.props.canDeleteQuestion}
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
		onDeferSave: React.PropTypes.func.isRequired,
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
					onDeferSave={this.props.onDeferSave}
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
		const {canDeleteQuestion, expanded,
			question, onDelete, onDeferSave} = this.props;
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
							onFocus={onDeferSave}
							onContentUpdate={this.handleUpdateText}
							content={question.text}
							placeholder={"Click to add question text"}
						/> : 
						<span style={{display: "flex", alignItems: "center"}}>
							<RenderedView text={
								question.text || "Click to edit"
							}/>
								{!question.validate() && <Tooltip
									label={question.validationText()}
								>
								<i
									style={{fontSize: 16, marginLeft: 5}}
									className="material-icons">
									warning
								</i>
							</Tooltip>}
						</span>}
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
								onFocus={onDeferSave}
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
								onFocus={onDeferSave}
								content={question.explanation}
								placeholder={
									"Click to explain the correct answer"
								}
							/>
						</Card>
					</div>
				</div>}
				{expanded && <CardActions border>
					{canDeleteQuestion && <Button
						onClick={this.handleDeleteClick}
					>
						Delete
					</Button>}
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
		onDeferSave: React.PropTypes.func.isRequired,
		choice: React.PropTypes.object.isRequired,
	},

	getInitialState() {
		return {
			deleting: false,
			hover: false,
		};
	},

	render() {
		let {choice, correct, onDelete, onDeferSave,
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
				onFocus={onDeferSave}
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
		previewEmail: React.PropTypes.bool.isRequired,
		saveState: React.PropTypes.oneOf(Object.values(SaveState)).isRequired,
	},

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.saveState === SaveState.SAVING && 
			this.props.saveState === SaveState.SAVED) {
			this.refs.frame.contentWindow.location.reload();
		}
	},

	renderUrl() {
		const {id, previewEmail} = this.props;
		return "/manage/" + id + "/" + (previewEmail ? "email" : "view") + "/";
	},

	render() {
		return <iframe ref="frame" src={this.renderUrl()}/>;
	},
});

let DeployManager = React.createClass({
	propTypes: {
		quiz: React.PropTypes.instanceOf(Quiz).isRequired,
		open: React.PropTypes.bool.isRequired,
		onCancel: React.PropTypes.func.isRequired,
	},

	getInitialState() {
		return {
			action: "dry-run",
			email: window.localStorage.ACHIEVE_DRY_RUN_EMAIL || "",
		};
	},

	canProceed() {
		const {action, email} = this.state;
		return action !== "dry-run" || EMAIL_REGEX.test(email);
	},

	handleChangeAction(e) {
		this.setState({action: e.target.value});
	},

	handleUpdateTestEmail(e) {
		const email = e.target.value;
		window.localStorage.ACHIEVE_DRY_RUN_EMAIL = email;
		this.setState({email});
	},

	renderSharedProps() {
		return {
			open: this.props.open,
			style: {width: 500},
		};
	},

	renderStart() {
		let {open, onDeploy} = this.props;
		let {action} = this.state;
		return <Dialog {...this.renderSharedProps()}>
			<DialogTitle>Ready to deploy?</DialogTitle>
			<DialogContent>
				<p>You are about to deploy this quiz to all Achievers.</p>
				<p>Once it is sent, you will no longer be able to re-deploy the
				quiz or add/delete questions, so take a moment to make sure
				everything looks okay. When you're ready, you can deploy or 
				perform a dry run here.</p>
				<RadioGroup
					name="action"
					value={this.state.action}
					childContainer="div"
					onChange={this.handleChangeAction}
				>
					<Radio value="dry-run" ripple>
						Send me a test email
					</Radio>
					<Radio value="real-thing">
						Deploy to all Achievers!
					</Radio>
				</RadioGroup>
				{action === "dry-run" && <div style={{marginTop: 10}}>
					<Textfield
						floatingLabel
						label="Email address"
						value={this.state.email}
						onChange={this.handleUpdateTestEmail}
						pattern={EMAIL_REGEX.toString().slice(1,-1)}
						error="Please enter a valid email address"
					/>
				</div>}
			</DialogContent>
			<DialogActions>
				<Button
					raised colored ripple 
					className="icon-button"
					disabled={!this.canProceed()}
					onClick={() => onDeploy(
						this.state.action === "dry-run" ?
							this.state.email : null
					)}
				>
					<Icon name="send"/>
					Let's go
				</Button>
				<Button onClick={this.props.onCancel}>Close</Button>
			</DialogActions>
		</Dialog>
	},

	renderProcess() {
		const {deploy} = this.props;
		return <Dialog {...this.renderSharedProps()}>
			<DialogTitle>Deploying quiz...</DialogTitle>
			<DialogContent>
				<p>Don't close this browser window!</p>
				{!!deploy.email_total && deploy.email_total > 0 && <div>
					<ProgressBar 
						progress={100 * (deploy.email_success) / deploy.email_total}
						buffer={100 * (
							deploy.email_success + deploy.email_fail
						) / deploy.email_total}
					/>
					<p>
						<b>{deploy.email_success}{" "}</b> sent and{" "}
						<b>{deploy.email_fail}{" "}</b> failed{" "}
						of{" "}<b>{deploy.email_total}</b>{" "}emails
					</p>
				</div>}
			</DialogContent>
		</Dialog>
	},

	renderPartialNotice() {
		const {deploy, onDeploy, onCancel} = this.props;
		return <Dialog {...this.renderSharedProps()}>
			<DialogTitle>Not all emails were sent.</DialogTitle>
			<DialogContent>
				<p>The system was able to send <b>{deploy.email_success}</b>
				{" of "}<b>{deploy.email_total}</b> emails. This is unusual, and repeated
				failures probably indicate an issue with our Mailgun account.
				You should re-run the deploy.</p>
				<p>Failed to send to the following Achievers: 
					{" "}<b>{deploy.email_pending.join(", ")}</b>
				</p>
			</DialogContent>
			<DialogActions>
				<Button 
					raised colored ripple
					onClick={() => onDeploy(null, true)}
				>
					<Icon name="refresh"/>{" "}
					Retry
				</Button>
				<Button onClick={onCancel}>Close</Button>
			</DialogActions>
		</Dialog>
	},

	renderSuccessTestNotice() {
		const {onDeploy, onCancel} = this.props;
		return <Dialog {...this.renderSharedProps()}>
			<DialogTitle>Nice!</DialogTitle>
			<DialogContent>
				<p>We successfully deployed a test email. Check your inbox!</p>
				<p>When you're ready, you can proceed to the real thing.</p>
			</DialogContent>
			<DialogActions>
				<Button 
					raised colored ripple
					onClick={() => onDeploy(null, true)}
				>
					<Icon name="check"/>{" "}
					Proceed
				</Button>
				<Button onClick={onCancel}>Close</Button>
			</DialogActions>
		</Dialog>
	},

	renderSuccessNotice() {
		const {onDeploy, onCancel} = this.props;
		return <Dialog {...this.renderSharedProps()}>
			<DialogTitle>Deploy successful!</DialogTitle>
			<DialogContent>
				<p>All emails were successfully sent.</p>
				<p>If you want to come back and re-deploy this quiz to future
				Achievers, you can re-deploy for them below.</p>
			</DialogContent>
			<DialogActions>
				<Button 
					raised colored ripple
					onClick={() => onDeploy()}
				>
					<Icon name="refresh"/>{" "}
					Re-deploy
				</Button>
				<Button onClick={onCancel}>Close</Button>
			</DialogActions>
		</Dialog>
	},

	render() {
		const {deploy} = this.props;
		if (deploy.status === DeployStatus.UNDEPLOYED) {
			return this.renderStart();
		} else if (deploy.status === DeployStatus.STARTED) {
			return this.renderProcess();
		} else if (deploy.status === DeployStatus.PARTIAL) {
			return this.renderPartialNotice();
		} else if (deploy.status === DeployStatus.SUCCESS_TEST) {
			return this.renderSuccessTestNotice();
		} else if (deploy.status === DeployStatus.SUCCESS) {
			return this.renderSuccessNotice();
		}
		return null;
	}
});

module.exports = {QuizBuilder};