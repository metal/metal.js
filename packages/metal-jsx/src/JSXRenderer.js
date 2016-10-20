'use strict';

import { isDefAndNotNull } from 'metal';
import IncrementalDomRenderer from 'metal-incremental-dom';

const childrenCount = [];

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
	 * @inheritDoc
	 */
	handleDataPropChanged_(data) {
		if (data.type === 'state') {
			super.handleDataPropChanged_(data);
		} else {
			this.propChanges_[data.key] = data;
		}
	}

	/**
	 * Called when an element is opened during render via incremental dom. Adds
	 * keys to elements that don't have one yet, according to their position in
	 * the parent. This helps use cases that use conditionally rendered elements,
	 * which is very common in JSX.
	 * @protected
	 */
	handleRegularCall_(...args) {
		let count = 0;
		if (childrenCount.length > 0) {
			count = ++childrenCount[childrenCount.length - 1];
		}

		if (!isDefAndNotNull(args[1])) {
			if (count) {
				args[1] = JSXRenderer.KEY_PREFIX + count;
			} else {
				// If this is the first node being patched, just repeat the key it
				// used before (if it has been used before).
				const node = IncrementalDOM.currentPointer();
				if (node && node.__incrementalDOMData) {
					args[1] = node.__incrementalDOMData.key;
				}
			}
		}
		childrenCount.push(0);
		return super.handleRegularCall_(...args);
	}

	/**
	 * Called when an element is closed during render via incremental dom.
	 * @param {!function()} originalFn The original function before interception.
	 * @param {string} tag
	 * @protected
	 */
	handleInterceptedCloseCall_(tag) {
		childrenCount.pop();
		return super.handleInterceptedCloseCall_(tag);
	}

	/**
	 * @inheritDoc
	 */
	hasDataChanged_() {
		return super.hasDataChanged_() || Object.keys(this.propChanges_).length > 0;
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
	 * Skips the current child in the count (used when a conditional render
	 * decided not to render anything).
	 */
	static skipChild() {
		if (childrenCount.length > 0) {
			childrenCount[childrenCount.length - 1]++;
		}
	}
}

JSXRenderer.KEY_PREFIX = '_metal_jsx_';
JSXRenderer.RENDERER_NAME = 'jsx';

export default JSXRenderer;
