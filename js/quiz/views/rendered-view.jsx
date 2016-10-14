let React = require('react');
let marked = require('marked');
let katex = require('katex');

let RenderedView = React.createClass({
	componentWillMount() {
	    let text = this.props.text;  
	    let regex = /\$\{(.*)\}/g;
	    let rendered = marked(this.katexify(text));
	    this.setState({rendered});
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

module.exports = RenderedView;