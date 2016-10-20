'use strict';

import { isDef } from 'metal';
import IncrementalDomAop from '../IncrementalDomAop';
import IncrementalDomUtils from '../utils/IncrementalDomUtils';

/**
 * Provides helpers for capturing children elements from incremental dom calls,
 * as well as actually rendering those captured children via incremental dom
 * later.
 */
class IncrementalDomChildren {
	/**
	 * Captures all child elements from incremental dom calls.
	 * @param {!IncrementalDomRenderer} renderer The renderer that is capturing
	 *   children.
	 * @param {!function()} callback Function to be called when children have all
	 *     been captured.
 	 */
	static capture(renderer, callback) {
		renderer_ = renderer;
		callback_ = callback;
		tree_ = {
			props: {
				children: []
			}
		};
		tree_.config = tree_.props;
		currentParent_ = tree_;
		isCapturing_ = true;
		IncrementalDomAop.startInterception({
			elementClose: handleInterceptedCloseCall_,
			elementOpen: handleInterceptedOpenCall_,
			text: handleInterceptedTextCall_
		});
	}

	/**
	 * Returns the owner of the current child node being rendered (or nothing
	 * if there's no child being rendered).
	 * @return {ComponentRenderer}
	 */
	static getCurrentOwner() {
		return currNodeOwner_;
	}

	/**
	 * Gets the node's original owner's renderer.
	 * @param {!Object} node
	 * @return {ComponentRenderer}
	 */
	static getOwner(node) {
		return node[IncrementalDomChildren.CHILD_OWNER];
	}

	/**
	 * Renders a children tree through incremental dom.
	 * @param {!{args: Array, children: !Array, isText: ?boolean}}
	 * @param {function()=} opt_skipNode Optional function that is called for
	 *     each node to be rendered. If it returns true, the node will be skipped.
	 * @protected
	 */
	static render(tree, opt_skipNode) {
		if (isCapturing_) {
			// If capturing, just add the node directly to the captured tree.
			addChildToTree(tree);
			return;
		}

		currNodeOwner_ = IncrementalDomChildren.getOwner(tree);
		if (opt_skipNode && opt_skipNode(tree)) {
			currNodeOwner_ = null;
			return;
		}

		if (isDef(tree.text)) {
			let args = tree.args ? tree.args : [];
			args[0] = tree.text;
			IncrementalDOM.text.apply(null, args);
		} else {
			let args = IncrementalDomUtils.buildCallFromConfig(tree.tag, tree.props);
			IncrementalDOM.elementOpen.apply(null, args);
			if (tree.props.children) {
				for (var i = 0; i < tree.props.children.length; i++) {
					IncrementalDomChildren.render(tree.props.children[i], opt_skipNode);
				}
			}
			IncrementalDOM.elementClose(tree.tag);
		}
		currNodeOwner_ = null;
	}
}

var callback_;
var currNodeOwner_;
var currentParent_;
var isCapturing_ = false;
var renderer_;
var tree_;

/**
 * Adds a child element to the tree.
 * @param {!Array} args The arguments passed to the incremental dom call.
 * @param {boolean=} opt_isText Optional flag indicating if the child is a
 *     text element.
 * @protected
 */
function addChildCallToTree_(args, opt_isText) {
	var child = {
		parent: currentParent_,
		[IncrementalDomChildren.CHILD_OWNER]: renderer_
	};

	if (opt_isText) {
		child.text = args[0];
		if (args.length > 1) {
			child.args = args;
		}
	} else {
		child.tag = args[0];
		child.props = IncrementalDomUtils.buildConfigFromCall(args);
		child.props.children = [];
		child.config = child.props;
	}

	addChildToTree(child);
	return child;
}

function addChildToTree(child) {
	currentParent_.props.children.push(child);
}

/**
 * Handles an intercepted call to the `elementClose` function from incremental
 * dom.
 * @protected
 */
function handleInterceptedCloseCall_() {
	if (currentParent_ === tree_) {
		IncrementalDomAop.stopInterception();
		isCapturing_ = false;
		callback_(tree_);
		callback_ = null;
		currentParent_ = null;
		renderer_ = null;
		tree_ = null;
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
function handleInterceptedOpenCall_(...args) {
	currentParent_ = addChildCallToTree_(args);
}

/**
 * Handles an intercepted call to the `text` function from incremental dom.
 * @param {!function()} originalFn The original function before interception.
 * @protected
 */
function handleInterceptedTextCall_(...args) {
	addChildCallToTree_(args, true);
}


/**
 * Property identifying a specific object as a Metal.js child node, and
 * pointing to the renderer instance that created it.
 * @type {string}
 * @static
 */
IncrementalDomChildren.CHILD_OWNER = '__metalChildOwner';

export default IncrementalDomChildren;
