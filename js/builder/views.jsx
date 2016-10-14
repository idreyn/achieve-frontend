let React = require('react');
let ReactDOM = require('react-dom');
let Reorder = require('react-reorder');
let FontAwesome = require('react-fontawesome');

let {Quiz, Question} = require('./quiz.js');
let {RenderedView} = require('../quiz/views.jsx');

let QuizBuilder = React.createClass({
	getInitialState() {
		return {
			expandedQuestion: null,
		};
	},

	setExpanded(question) {
		this.setState({
			expandedQuestion: question,
		});
	},

	render() {
		let quiz = this.props.quiz;
		if(!quiz) {
			return <div>
				Hold on a damn second...
			</div>;
		}
		return <div id='builder'>
			<div id='edit-pane'> 
				{quiz.questions.map((q, i) => 
					<QuestionView 
						key={i}
						question={q}
						quiz={quiz}
						expanded={this.state.expandedQuestion === q}
						onExpand={this.setExpanded}
					/>
				)}
			</div>
		</div>;
	}
});

let DragHandle = React.createClass({
	propTypes: {
		target: React.PropTypes.object.isRequired,
		dragState: React.PropTypes.string.isRequired,
	},

	getDefaultProps() {
		return {
			dragState: 'draggable',
		};
	},

	onMouseOver() {
		this.props.target.setState({
			[this.props.dragState] : true,
			dragOrigin: this.props.target,
		});
	},

	onMouseOut() {
		this.props.target.setState({
			[this.props.dragState] : false,
		});
	},

	render() {
		return <div 
			className='drag-handle'
			onMouseOver={this.onMouseOver}
			onMouseOut={this.onMouseOut}
		/>;
	}
});

let QuestionView = React.createClass({
	propTypes: {
		expanded: React.PropTypes.bool,
		onExpand: React.PropTypes.func,
		quiz: React.PropTypes.instanceOf(Quiz).isRequired,
		question: React.PropTypes.instanceOf(Question).isRequired,
	},

	getInitialState() {
		return {
			draggable: false,
		};
	},

	DraggableChoice(props) {
		return <div className='draggable-item'>
			<DragHandle target={this}/>
			<div className='draggable-item-inner'>
				<QuestionChoice
					onContentUpdate={this.handleAnswerUpdate}
					{...props.item}
				/>
			</div>
		</div>;
	},

	handleAnswerUpdate(k, v) {
		this.props.question.updateAnswer(k, v);
		this.forceUpdate();
	},

	handleClick(e) {
		if (!this.props.expanded) {
			this.props.onExpand(this.props.question);
		}
	},

	handleReorder(...args) {
		const newOrder = args[4];
		this.props.question.buildChoices(newOrder);
		this.forceUpdate();
	},
	
	render() {
		const style = {cursor: this.props.expanded ? 'inherit' : 'pointer'};
		const qs = this.props.question;
		return <div className='question' style={style} onClick={this.handleClick}>
			<RenderedView text={qs.text}/>
			{this.props.expanded && <Reorder
				itemKey='index'
				lock='horizontal'
				holdTime={0}
				list={qs.renderChoices()}
				template={this.DraggableChoice}
				itemClass='question-choice'
				callback={this.handleReorder}
				disableReorder={!this.state.draggable}
			/>}
		</div>
	}
});

let QuestionChoice = React.createClass({
	render() {
		let {index, value} = this.props;
		return <div className='question-choice-content'> 
			<ContentEditor
				content={this.props.value.toString()}
				onContentUpdate={(val) => 
					this.props.onContentUpdate(this.props.index, val)
				}
			/>
			<div className='question-choice-tools'>
				<i className='material-icons'>check</i>
				<i className='material-icons'>delete</i>
			</div>
		</div>;
	}
});

let ContentEditor = React.createClass({
	propTypes: {
		content: React.PropTypes.string.isRequired,
		onContentUpdate: React.PropTypes.func.isRequired,
	},

	getInitialState() {
		return {
			editing: false,
			editingValue: this.props.content,
		};
	},

	handleClick() {
		if (!this.state.editing) {
			this.setState({
				editing: true
			});
		}
	},

	handleBlur() {
		this.setState({
			editing: false
		});
		this.props.onContentUpdate(this.state.editingValue);
	},

	handleChange(e) {
		this.setState({
			editingValue: e.target.value,
		});
	},

	componentDidUpdate() {
		if(this.refs.input) {
			ReactDOM.findDOMNode(this.refs.input).focus();
		}
	},

	componentWillReceiveProps(props) {
		if (!this.state.editing) {
			this.setState({
				editingValue: props.content,
			});
		}
	},

	renderInside() {
		if (this.state.editing) {
			return <textarea
				ref='input'
				onBlur={this.handleBlur}
				onChange={this.handleChange}
				value={this.state.editingValue}
			/>
		} else {
			return <RenderedView text={this.props.content.toString()}/>
		}
	},

	render() {
		return <div className='content-editor' onClick={this.handleClick}>
			{this.renderInside()}
		</div>;
	}
});

module.exports = {QuizBuilder, QuestionView};