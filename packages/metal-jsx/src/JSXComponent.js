'use strict';

import './iDOMHelpers';
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';
import JSXDataManager from './JSXDataManager';

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

/**
 * Renderer that handles JSX.
 */
class JSXRenderer extends IncrementalDomRenderer {
	/**
	 * Overrides the original method from `IncrementalDomRenderer` to handle the
	 * case where developers return a child node directly from the "render"
	 * function.
	 * @override
	 */
	renderIncDom() {
		if (this.component_.render) {
			iDOMHelpers.renderArbitrary(this.component_.render());
		} else {
			super.renderIncDom();
		}
	}
}

JSXComponent.DATA_MANAGER = JSXDataManager;
JSXComponent.RENDERER = JSXRenderer;

export default JSXComponent;
