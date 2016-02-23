let React = require('react');
let ReactDOM = require('react-dom');
let marked = require('marked');
let katex = require('katex');
let {QuestionState} = require('./question.js');

let RenderedViewer = React.createClass({
	componentWillMount() {
	    let text = this.props.text;  
	    let regex = /\$\{(.*)\}/g;
	    let rendered = marked(text).replace(regex,function(_,txt) {
	    	var str = katex.renderToString(txt);
	    	return str;
	    });
	    this.setState({rendered:rendered});
	},
    render() {
        return <div dangerouslySetInnerHTML={{__html:this.state.rendered}} />;
    }
});

let ProgressView = React.createClass({
	render() {
		let prog = Math.round((this.props.progress || 0) * 100)
		return (
			<div id='progress-top' className={prog == 0 ? 'hidden' : ''}>
				<div className='progress' style={{borderRadius:0}}>
					<div
					className={prog == 100 ? 'progress-bar progress-bar-success' : 'progress-bar'}
					role='progressbar'
					aria-valuenow={prog.toString()} 
					aria-valuemin='0'
					aria-valuemax='100'
					style={{width:(prog.toString() + '%')}}
				    > {prog > 0 ? (prog.toString() + '%' + (
				    	prog == 100 ? " ... Great work! You've completed the OTA." : (
				    		prog >= 50 ? " ... Keep it up!" : ""
				    	
				    ))) : ''} </div>
				</div>
			</div>
		)
	}
})

let QuizView = React.createClass({
	render() {
		return (
			<div id='wrapper'>
				<ProgressView progress={this.getProgress()}/>
				<div id='main'>
					<h1>{this.props.quiz.title}</h1>
					<h3>{this.props.quiz.subtitle}</h3>
					<div id='quiz-text'>
						<RenderedViewer text={this.props.quiz.text}/>
					</div>
					<div id='questions'> {
						this.props.quiz.questions.map((q,i) => <QuestionView key={i} question={q} onSubmit={this.props.onSubmit}/>)
					} </div>
				</div>
			</div>
		);
	},

	getProgress() {
		return this.props.quiz.questions.filter(q => q.state >= 2).length / this.props.quiz.questions.length;
	}
})

let QuestionView = React.createClass({
	getInitialState() {
	    return {
	    	response: '' 
	    };
	},
	render() {
		let qs = this.props.question;
		let submitted = qs.response != null || qs.state == QuestionState.WAITING;
		let answered = qs.state >= 2;
		let buttonGlyph = '';
		return (
			<div className='panel panel-default quiz-question'>
				<div className='panel-heading'>
					<h2 className='panel-title'>
						<b>{qs.index.toString() + ": "}</b>
						{qs.text}
					</h2>
				</div>
				<form>
					<ul>
						{
							Object.keys(qs.choices).sort().map(key => (
								<li key={key} className={key == qs.correct ? 'correct' : (qs.correct && key == qs.response ? 'incorrect' : '')}>
									<input 
										id={"radio-" + qs.index + "-" + key}
										type="radio" 
										name={"radio-" + qs.index} 
										value={key}
										checked={qs.response? qs.response === key : this.state.response === key}
										disabled={submitted}
										onChange={this.onChoiceChange}
									/>
									<label htmlFor={"radio-" + qs.index + "-" + key} className={submitted? 'submitted' : ''}>
										{qs.choices[key]}
									</label>
								</li>
							))
						}
						{
							answered ? (
								this.state.wantsExplanation? (
									<div className='panel panel-default explanation'>
										{qs.explanation? qs.explanation : 'Sorry, no explanation provided.'}
									</div>
								) : (
									<button type='button' className='btn btn-default' onClick={this.onShowExplanation}>
										Show explanation
									</button>
								)
							) : (
								this.state.response ? 
								<button type='button' className='btn btn-primary' disabled={submitted} onClick={this.onSubmit}>
									{qs.state == QuestionState.WAITING ? 'Submitting...' : 'Submit'}
								</button> : ''
							)
						}
					</ul>
				</form>
			</div>
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

module.exports = {
	QuizView: QuizView,
	QuestionView: QuestionView
};