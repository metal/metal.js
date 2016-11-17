'use strict';

import { isDefAndNotNull } from 'metal';
import IncrementalDomRenderer from 'metal-incremental-dom';

/**
 * Renderer that handles JSX.
 */
class JSXRenderer extends IncrementalDomRenderer {
	/**
	 * @inheritDoc
	 */
	buildShouldUpdateArgs_() {
		return [this.changes_, this.propChanges_];
	}

	/**
	 * @inheritDoc
	 */
	clearChanges_() {
		super.clearChanges_();
		this.propChanges_ = {};
	}

	/**
	 * Called when generating a key for the next dom element to be created via
	 * incremental dom. Adds keys to elements that don't have one yet, according
	 * to their position in the parent. This helps use cases that use
	 * conditionally rendered elements, which is very common in JSX.
	 * @protected
	 */
	generateKey_(key) {
		if (!isDefAndNotNull(key)) {
			const comp = IncrementalDomRenderer.getPatchingComponent();
			if (comp.getRenderer().rootElementRendered_) {
				key = JSXRenderer.KEY_PREFIX + JSXRenderer.incElementCount();
			} else {
				comp.getRenderer().rootElementRendered_ = true;
				if (comp.element && comp.element.__incrementalDOMData) {
					key = comp.element.__incrementalDOMData.key;
				}
			}
		}
		return key;
	}

	/**
	 * @inheritDoc
	 */
	handleStateKeyChanged_(data) {
		if (data.type === 'state') {
			super.handleStateKeyChanged_(data);
		} else {
			this.propChanges_[data.key] = data;
		}
	}

	/**
	 * @inheritDoc
	 */
	hasDataChanged_() {
		return super.hasDataChanged_() || Object.keys(this.propChanges_).length > 0;
	}

	/**
	 * Increments the number of children in the current element.
	 */
	static incElementCount() {
		const node = IncrementalDOM.currentElement();
		node.__metalJsxCount = (node.__metalJsxCount || 0) + 1;
		return node.__metalJsxCount;
	}

	/**
	 * Overrides the original method from `IncrementalDomRenderer` so we can
	 * keep track of if the root element of the patched component has already
	 * been rendered or not.
	 * @override
	 */
	patch() {
		this.rootElementRendered_ = false;
		super.patch();
	}

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

	/**
	 * @inheritDoc
	 */
	resetNodeData_(node) {
		super.resetNodeData_(node);
		node.__metalJsxCount = 0;
	}

	/**
	 * Skips the current child in the count (used when a conditional render
	 * decided not to render anything).
	 */
	static skipChild() {
		JSXRenderer.incElementCount();
	}
}

JSXRenderer.KEY_PREFIX = '_metal_jsx_';
JSXRenderer.RENDERER_NAME = 'jsx';

export default JSXRenderer;
