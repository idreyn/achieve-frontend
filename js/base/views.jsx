let React = require('react');
let FontAwesome = require('react-fontawesome');
let classNames = require("classnames");

let AppFrame = React.createClass({
	render() {
		return <div id="app-frame-outer" className={this.props.className}>
			<div id="app-frame-bkg"/>
			<h3>{this.props.headerContent}</h3>
			<div id="app-frame" className="mdl-shadow--3dp">
				{this.props.children}
			</div>
		</div>
	},

	componentDidMount() {
		componentHandler.upgradeDom();
	},

	componentDidUpdate(prevProps, prevState) {
		componentHandler.upgradeDom();	
	},
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
		>
			{this.props.children}
		</div>;
	}
});

module.exports = {AppFrame, DragHandle};