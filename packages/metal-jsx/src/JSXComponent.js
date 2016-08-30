'use strict';

import './iDOMHelpers';
import { validators, Config } from 'metal-state';
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';
import JSXDataManager from './JSXDataManager';
import JSXRenderer from './JSXRenderer';

/**
 * A component that has built-in integration with JSX templates. Example:
 *
 * <code>
 * class MyComponent extends JSXComponent {
 *   render() {
 *     return <div>Hello World</div>
 *   }
 * }
 * </code>
 */
class JSXComponent extends Component {
	/**
	 * Creates and renders the given function, which can either be a simple
	 * JSX function or a component constructor.
	 * @param {!function()} fnOrCtor Either be a simple jsx dom function or a
	 *     component constructor.
	 * @param {Object=} opt_data Optional config data for the function.
	 * @param {Element=} opt_element Optional parent for the rendered content.
	 * @return {!Component} The rendered component's instance.
	 * @override
	 */
	static render(...args) {
		return IncrementalDomRenderer.render(...args);
	}
}

JSXComponent.DATA_MANAGER = JSXDataManager;
JSXComponent.RENDERER = JSXRenderer;

export default JSXComponent;
export { validators, Config, JSXComponent };
