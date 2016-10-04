let React = require('react');
let ReactDOM = require('react-dom');
let marked = require('marked');
let katex = require('katex');
let classNames = require("classnames");
let {QuestionState} = require('./quiz.js');

let {
	Button,
	Card, CardTitle, CardActions, CardText, 
	RadioGroup, Radio,
} = require("react-mdl");

let RenderedView = React.createClass({
	componentWillMount() {
	    let text = this.props.text;  
	    let regex = /\$\{(.*)\}/g;
	    let rendered = marked(this.katexify(text));
	    this.setState({rendered:rendered});
	},

	katexify: function(text) {
		let braceCount = 0;
		let has = false;
		let dollarIndex = -1;
		for (let i=0; i<text.length; i++) {
			let c = text[i];
			if(c == '$') {
				dollarIndex = i;
				has = true;
			} else if(c == '{' && has) {
				braceCount++;
			} else if(c == '}' && has) {
				braceCount--;
				if(braceCount == 0) {
					return text.slice(0,dollarIndex) + katex.renderToString(
						text.slice(dollarIndex + 2, i)
					) + this.katexify(text.slice(i + 1));
				}
			}
		}
		return text;
	},

	componentWillReceiveProps(nextProps) {
		if (nextProps.text !== this.props.text) {
			console.log(nextProps);
			this.setState({
				rendered: marked(this.katexify(nextProps.text)),
			});
		}
	},

    render() {
        return <span
        	className='rendered-view'
        	dangerouslySetInnerHTML={{__html:this.state.rendered}}
        />;
    }
});

let ProgressView = React.createClass({
	render() {
		let prog = Math.round((this.props.progress || 0) * 100);
		return (
			<div id='progress-top'>
				<div className='progress' style={{borderRadius:0}}>
					<div
						className={prog == 100 ? 
							'progress-bar progress-bar-success':
							'progress-bar'
						}
						role='progressbar'
						aria-valuenow={prog.toString()} 
						aria-valuemin='0'
						aria-valuemax='100'
						style={{width:(prog.toString() + '%')}}
				    > {prog && (prog.toString() + '%' + (
				    		prog == 100 ? 
				    			" ... Great work! You've completed the OTA." : 
				    			(prog >= 50 ? " ... Keep it up!" : "")
				    	)
				   	)} </div>
				</div>
			</div>
		)
	}
})

let QuizView = React.createClass({
	render() {
		let sp_url = '../progress/view/';
		return (
			<div id='wrapper'>
				<ProgressView progress={this.getProgress()}/>
				<div id='main'>
					<a href={sp_url}>
						<button
							id='semester-progress-button'
							className='btn btn-default'
						>
							Semester progress
						</button>
					</a>
					<div id='header'>
						<h2>{this.props.quiz.title}</h2>
						<h4>{this.props.quiz.subtitle}</h4>
					</div>
					<div id='quiz-text'>
						<RenderedView text={this.props.quiz.text}/>
					</div>
					<div id='questions'> {
						this.props.quiz.questions.map(
							(q,i) => <QuestionView
								key={i}
								question={q}
								onSubmit={this.props.onSubmit}
							/>
						)
					} </div>
				</div>
			</div>
		);
	},

	getProgress() {
		let questions = this.props.quiz.questions;
		return questions.filter(q => q.state >= 2).length / questions.length;
	}
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
		let buttonGlyph = "";
		return (
			<Card shadow={2} className='quiz-question'>
				<CardTitle style={{paddingBottom: 0}}>
					<div>
						<b>{question.index.toString() + ": "}</b>
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
									text={key.toString() + ": "  + question.choices[key]}
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

module.exports = {RenderedView, QuizView, QuestionView};