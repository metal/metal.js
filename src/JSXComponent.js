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

export default JSXComponent;
