'use strict';

import {isDefAndNotNull} from 'metal';
import IncrementalDomRenderer from 'metal-incremental-dom';

const COUNT_PROP = '__metalJsxCount';
const INC_DOM_DATA = '__incrementalDOMData';
const KEY_PREFIX = '_metal_jsx_';

/**
 * Renderer that handles JSX.
 */
class JSXRenderer extends IncrementalDomRenderer.constructor {
	/**
	 * @inheritDoc
	 */
	buildShouldUpdateArgs(changes) {
		return [changes.state, changes.props];
	}

	/**
	 * Called when generating a key for the next dom element to be created via
	 * incremental dom. Adds keys to elements that don't have one yet, according
	 * to their position in the parent. This helps use cases that use
	 * conditionally rendered elements, which is very common in JSX.
	 * @param {!Component} component
	 * @param {string} key
	 * @return {?string}
	 */
	generateKey(component, key) {
		key = super.generateKey(component, key);
		const comp = this.getPatchingComponent();
		const data = comp.getRenderer().getData(comp);
		if (!isDefAndNotNull(key)) {
			if (data.rootElementRendered) {
				key = KEY_PREFIX + jsxRenderer_.incElementCount();
			} else if (comp.element && comp.element[INC_DOM_DATA]) {
				key = comp.element[INC_DOM_DATA].key;
			}
		}
		if (!data.rootElementRendered) {
			data.rootElementRendered = true;
		}
		return key;
	}

	/**
	 * @inheritDoc
	 */
	handleNodeRendered(node) {
		node[COUNT_PROP] = 0;
	}

	/**
	 * Increments the number of children in the current element.
	 * @return {number}
	 */
	incElementCount() {
		const node = IncrementalDOM.currentElement();
		node[COUNT_PROP] = (node[COUNT_PROP] || 0) + 1;
		return node[COUNT_PROP];
	}

	/**
	 * Overrides the original method from `IncrementalDomRenderer` so we can
	 * keep track of if the root element of the patched component has already
	 * been rendered or not.
	 * @param {!Component} component
	 * @override
	 */
	patch(component) {
		this.getData(component).rootElementRendered = false;
		super.patch(component);
	}

	/**
	 * Overrides the original method from `IncrementalDomRenderer` to handle the
	 * case where developers return a child node directly from the "render"
	 * function.
	 * @param {!Component} component
	 * @override
	 */
	renderIncDom(component) {
		if (component.render) {
			iDOMHelpers.renderArbitrary(component.render());
		} else {
			super.renderIncDom(component);
		}
	}

	/**
	 * Skips the current child in the count (used when a conditional render
	 * decided not to render anything).
	 */
	skipChild() {
		IncrementalDOM.elementVoid(jsxRenderer_.incElementCount);
	}

	/**
	 * @inheritDoc
	 */
	skipRender() {
		jsxRenderer_.skipChild();
		super.skipRender();
	}
}

const jsxRenderer_ = new JSXRenderer();
jsxRenderer_.RENDERER_NAME = 'jsx';

export default jsxRenderer_;
