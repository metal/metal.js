'use strict';

import './iDOMHelpers';
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';

class JSXComponent extends Component {
	/**
	 * Overrides the original method to create a JSX renderer.
	 * @return {!JSX}
	 */
	createRenderer() {
		return new JSXRenderer(this);
	}

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
			var rendered = this.component_.render();
			if (rendered && IncrementalDomRenderer.isIncDomNode(rendered)) {
				IncrementalDomRenderer.renderChild(rendered);
			}
		} else {
			super.renderIncDom();
		}
	}
}

export default JSXComponent;
