'use strict';

import Component from './JSXComponent';

/**
 * JSXComponent that renders children passed in.
 * @class
 */
class Fragment extends Component {
	/**
	 * @return {Component}
	 */
	render() {
		return this.props.children;
	}
}

Fragment.PROPS = {
	elementClasses: {
		setter: () => undefined,
		validator: () => {
			return new Error(
				`Warning: passing 'elementClasses' to 'Fragment' will add class
				 to first child element. This is not recommended.`
			);
		},
	},
};

export default Fragment;
