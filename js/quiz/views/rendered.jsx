let React = require('react');
let Remarkable = require('remarkable');
let katex = require('katex');

let RenderedView = React.createClass({
	componentWillMount() {
	    let text = this.props.text;  
	    let regex = /\$\{(.*)\}/g;
	    let rendered = this.renderText(text);
	    this.setState({rendered});
	},

	renderText: function(text) {
		try {
			return this.markdown(this.katexify(text));
		} catch(e) {
			return "<b>Render error: invalid markup</b>";
		}
	},

	markdown: function(text) {
		return new Remarkable('full', {html: true}).render(text);
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
			this.setState({
				rendered: this.renderText(nextProps.text),
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