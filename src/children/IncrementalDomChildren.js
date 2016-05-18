'use strict';

import IncrementalDomAop from '../IncrementalDomAop';

/**
 * Provides helpers for capturing children elements from incremental dom calls,
 * as well as actually rendering those captured children via incremental dom
 * later.
 */
class IncrementalDomChildren {
	/**
	 * Captures all child elements from incremental dom calls.
	 * @param {!function} callback Function to be called when children have all
	 *     been captured.
 	 */
	static capture(callback) {
		callback_ = callback;
		tree_ = {
			children: []
		};
		currentParent_ = tree_;
		IncrementalDomAop.startInterception({
			elementClose: handleInterceptedCloseCall_,
			elementOpen: handleInterceptedOpenCall_,
			text: handleInterceptedTextCall_
		});
	}

	/**
	 * Renders a children tree through incremental dom.
	 * @param {!{args: Array, !children: Array, isText: ?boolean}}
	 * @protected
	 */
	static render(tree) {
		if (tree.isText) {
			IncrementalDOM.text.apply(null, tree.args);
		} else {
			if (tree.args) {
				IncrementalDOM.elementOpen.apply(null, tree.args);
			}
			for (var i = 0; i < tree.children.length; i++) {
				IncrementalDomChildren.render(tree.children[i]);
			}
			if (tree.args) {
				IncrementalDOM.elementClose(tree.args[0]);
			}
		}
	}
}

var callback_;
var currentParent_;
var tree_;

/**
 * Adds a child element to the tree.
 * @param {!Array} args The arguments passed to the incremental dom call.
 * @param {boolean=} opt_isText Optional flag indicating if the child is a
 *     text element.
 * @protected
 */
function addChildToTree_(args, opt_isText) {
	var child = {
		args: args,
		children: [],
		isText: opt_isText,
		parent: currentParent_
	};
	currentParent_.children.push(child);
	return child;
}

/**
 * Handles an intercepted call to the `elementClose` function from incremental
 * dom.
 * @protected
 */
function handleInterceptedCloseCall_() {
	if (currentParent_ === tree_) {
		IncrementalDomAop.stopInterception();
		callback_(tree_);
		tree_ = null;
		callback_ = null;
		currentParent_ = null;
	} else {
		currentParent_ = currentParent_.parent;
	}
}

/**
 * Handles an intercepted call to the `elementOpen` function from incremental
 * dom.
 * @param {!function()} originalFn The original function before interception.
 * @protected
 */
function handleInterceptedOpenCall_(originalFn, ...args) {
	currentParent_ = addChildToTree_(args);
}

/**
 * Handles an intercepted call to the `text` function from incremental dom.
 * @param {!function()} originalFn The original function before interception.
 * @protected
 */
function handleInterceptedTextCall_(originalFn, ...args) {
	addChildToTree_(args, true);
}

export default IncrementalDomChildren;
