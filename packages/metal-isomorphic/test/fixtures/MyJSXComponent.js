import JSXComponent from 'metal-jsx';

class MyJSXComponent extends JSXComponent {
	render() {
		IncrementalDOM.elementOpen('div');
		iDOMHelpers.renderArbitrary(this.props.message);
		return IncrementalDOM.elementClose('div');
	}
}

MyJSXComponent.PROPS = {
	message: {
		value: ''
	}
};

export default MyJSXComponent;