'use strict';

import Component from 'metal-component';
import JSX from './JSX';

class JSXComponent extends Component {
	/**
	 * Overrides the original method to create a JSX renderer.
	 * @return {!JSX}
	 */
	createRenderer() {
		return new JSX(this);
	}
}

/**
 * State configuration.
 */
JSXComponent.STATE = {
	/**
	 * Children elements to be rendered inside the component.
	 * @type {!Array}
	 */
	children: {
		validator: Array.isArray,
		valueFn: () => []
	}
};

export default JSXComponent;
export { JSX };
