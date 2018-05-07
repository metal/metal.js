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
	},
};

export default Fragment;
