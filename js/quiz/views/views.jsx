let React = require('react');
let ReactDOM = require('react-dom');
let classNames = require("classnames");

let {QuestionState} = require('../models.js');
let AnswerIndicator = require("./answer-indicator.jsx");
let RenderedView = require("./rendered.jsx");
let ProgressView = require("./progress.jsx");

let {
	Button,
	Card, CardTitle, CardActions, CardText,
	RadioGroup, Radio,
} = require("react-mdl");

let QuizView = React.createClass({
	render() {
		let {onSubmit, onClaimMilestone, progress, quiz} = this.props;
		return (
			<div id='wrapper'>
				<div id='main'>
					{progress && 
					<ProgressView progress={progress} quiz={quiz} onClaimMilestone={onClaimMilestone}/>}
					<div id='header'>
						<h2>{quiz.title}</h2>
						<h4>{quiz.subtitle}</h4>
					</div>
					<div id='quiz-text'>
						<RenderedView text={quiz.text}/>
					</div>
					<div id='questions'> {
						quiz.questions.map(
							(q,i) => <QuestionView
								key={i}
								question={q}
								onSubmit={onSubmit}
							/>
						)
					} </div>
				</div>
			</div>
		);
	},
})

let QuestionView = React.createClass({
	getInitialState() {
	    return {
	    	response: "",
	    };
	},
	render() {
		let {question} = this.props;
		let {response, wantsExplanation} = this.state;
		let submitted = question.response != null || 
			question.state == QuestionState.WAITING;
		let answered = question.state >= 2;
		let correctChoice = answered && question.correct;
		let incorrectChoice = answered && 
			(question.response !== question.correct) &&
			question.response;
		return (
			<Card shadow={2} className='quiz-question'>
				<CardTitle style={{paddingBottom: 0}}>
					<div>
						<b>{"Q" + question.index.toString() + ": "}</b>
						<RenderedView text={question.text} />
					</div>
				</CardTitle>
				<CardText>
					<RadioGroup
						name={"radio-" + question.index}
						value={response || question.response || ""} 
						onChange={this.onChoiceChange}
						childContainer="div"
					>
						{Object.keys(question.choices).sort().map(key => (
							<Radio
								key={key}
								value={key}
								ripple
								checked={question.response? 
									question.response === key :
									this.state.response === key
								}
								className={"question-choice"}
								disabled={submitted}
							>
								<RenderedView 
									text={
										key.toString() + ": "  + 
										question.choices[key]
									}
								/>
								<AnswerIndicator
									correct={key === correctChoice}
									incorrect={key === incorrectChoice}
								/>
							</Radio>
						))}
					</RadioGroup>
				</CardText>
				{(answered || response) && <CardActions border>
					{answered ? (
						wantsExplanation? <div className="explanation">
							{question.explanation? 
								<RenderedView text={question.explanation} /> : 
								"Sorry, no explanation provided."
							}
						</div> : <Button onClick={this.onShowExplanation}>
							Show explanation
						</Button>
					) : (
						response && <Button 
							raised colored ripple 
							disabled={submitted} 
							onClick={this.onSubmit}
						>
							{question.state == QuestionState.WAITING ? 
								"Submitting..." : "Submit"}
						</Button> 
					)}
				</CardActions>}
			</Card>
		);
	},
	onChoiceChange: function(evt) {
		this.setState({response: evt.target.value});
	},
	onSubmit: function(evt) {
		this.props.onSubmit(this.props.question,this.state.response);
	},
	onShowExplanation: function(evt) {
		this.setState({wantsExplanation: true});
	}
})

module.exports = {QuizView, QuestionView};