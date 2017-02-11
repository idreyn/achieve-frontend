let React = require('react');
let ReactDOM = require('react-dom');
let classNames = require("classnames");
let {css, StyleSheet} = require("aphrodite");

let RenderedView = require('../quiz/views/rendered.jsx');

let ContentEditor = React.createClass({
	propTypes: {
		content: React.PropTypes.string,
		inputStyle: React.PropTypes.object,
		inline: React.PropTypes.bool,
		multiline: React.PropTypes.bool.isRequired,
		onContentUpdate: React.PropTypes.func.isRequired,
		placeholder: React.PropTypes.string,
		simple: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			inline: false,
			multiline: true,
		};
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
		if (this.props.onContentUpdate(this.state.editingValue)) {
			this.setState({editingValue: null});
		}
	},

	handleChange(e) {
		this.setState({
			editingValue: e.target.value,
		});
	},

	componentDidUpdate() {
		if(this.refs.input) {
			let input = ReactDOM.findDOMNode(this.refs.input);
			input.focus();
			input.setSelectionRange(input.value.length, input.value.length);
		}
	},

	componentWillReceiveProps(props) {
		if (!this.state.editing) {
			this.setState({
				editingValue: props.content
			});
		}
	},

	renderOverrideStyles() {
		let {inline, monospace} = this.props;
		return {
			...(inline ?
				{display: "inline-block", maxHeight: "1em"} :
			 	{
			 		display: "flex",
			 		alignItems: "center",
			 		width: "100%",
			 		maxWidth: "100%",
			 		padding: 4,
			 	}
			 )
		};
	},

	renderInside() {
		let {content, inputStyle, multiline, placeholder, simple} = this.props;
		if (this.state.editing) {
			return multiline? <textarea
				className={css(styles.input, styles.textArea)}
				ref='input'
				onBlur={this.handleBlur}
				onChange={this.handleChange}
				style={inputStyle}
				value={(this.state.editingValue || "").trimLeft()}
			/> : <input
				className={css(styles.input)}
				type='text'
				ref='input'
				onBlur={this.handleBlur}
				onChange={this.handleChange}
				onKeyDown={
					(e) => {
						if (e.keyCode === 13) {
							this.handleBlur();
						}
					}
				}
				style={inputStyle}
				value={this.state.editingValue}
			/>
		} else {
			return <span className={css(styles.static)}>
				{content && content.length ?
					(simple ? content : <RenderedView text={content} />) :
					<i>{placeholder}</i>}
			</span>;
		}
	},

	render() {
		return <div
			className={css(styles.contentEditor)}
			onClick={this.handleClick}
			style={this.renderOverrideStyles()}
		>
			{this.renderInside()}
		</div>;
	}
});

const styles = StyleSheet.create({
	contentEditor: {
		flex: 1,
	},
	input: {
		background: "rgba(0,0,0,0.1)",
		border: "none",
		boxSizing: "border-box",
		fontSize: "0.8em",
		fontFamily: "monospace",
		width: "100%",
		outline: "none",
	},
	static: {
		transition: "background 0.1s",
		":hover": {
			background: "rgba(0,0,0,0.1)",
		},
	},
	textArea: {
		minHeight: 100,
	},
});

module.exports = ContentEditor;
