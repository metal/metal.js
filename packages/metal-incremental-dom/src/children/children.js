'use strict';

import { buildCallFromConfig, buildConfigFromCall } from '../callArgs';
import { isDef } from 'metal';
import { startInterception, stopInterception } from '../intercept';

/**
 * Property identifying a specific object as a Metal.js child node, and
 * pointing to the component instance that created it.
 * @type {string}
 */
export const CHILD_OWNER = '__metalChildOwner';

/**
 * Captures all child elements from incremental dom calls.
 * @param {!Component} component The component that is capturing children.
 * @param {!function()} callback Function to be called when children have all
 *     been captured.
 * @param {Object} data Data to pass to the callback function when calling it.
 */
export function captureChildren(component, callback, data) {
	owner_ = component;
	callback_ = callback;
	callbackData_ = data;
	tree_ = {
		props: {
			children: []
		}
	};
	tree_.config = tree_.props;
	currentParent_ = tree_;
	isCapturing_ = true;
	startInterception({
		elementClose: handleInterceptedCloseCall_,
		elementOpen: handleInterceptedOpenCall_,
		text: handleInterceptedTextCall_
	});
}

/**
 * Checks if the given tag was built from a component's children.
 * @param {*} tag
 * @return {boolean}
 */
export function isChildTag(tag) {
	return isDef(tag.tag);
}

/**
 * Gets the node's original owner.
 * @param {!Object} node
 * @return {Component}
 */
export function getOwner(node) {
	return node[CHILD_OWNER];
}

/**
 * Renders a children tree through incremental dom.
 * @param {!{args: Array, children: !Array, isText: ?boolean}}
 * @param {function()=} opt_skipNode Optional function that is called for
 *     each node to be rendered. If it returns true, the node will be skipped.
 * @protected
 */
export function renderChildTree(tree, opt_skipNode) {
	if (isCapturing_) {
		// If capturing, just add the node directly to the captured tree.
		addChildToTree(tree);
		return;
	}

	if (opt_skipNode && opt_skipNode.call(null, tree)) {
		return;
	}

	if (isDef(tree.text)) {
		let args = tree.args ? tree.args : [];
		args[0] = tree.text;
		IncrementalDOM.text.apply(null, args);
	} else {
		let args = buildCallFromConfig(tree.tag, tree.props);
		args[0] = {
			tag: args[0],
			owner: getOwner(tree)
		};
		IncrementalDOM.elementOpen.apply(null, args);
		if (tree.props.children) {
			for (let i = 0; i < tree.props.children.length; i++) {
				renderChildTree(tree.props.children[i], opt_skipNode);
			}
		}
		IncrementalDOM.elementClose(tree.tag);
	}
}

let callbackData_;
let callback_;
let currentParent_;
let isCapturing_ = false;
let owner_;
let tree_;

/**
 * Adds a child element to the tree.
 * @param {!Array} args The arguments passed to the incremental dom call.
 * @param {boolean=} opt_isText Optional flag indicating if the child is a
 *     text element.
 * @protected
 */
function addChildCallToTree_(args, opt_isText) {
	const child = {
		parent: currentParent_,
		[CHILD_OWNER]: owner_
	};

	if (opt_isText) {
		child.text = args[0];
		if (args.length > 1) {
			child.args = args;
		}
	} else {
		child.tag = args[0];
		child.props = buildConfigFromCall(args);
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
		stopInterception();
		isCapturing_ = false;
		const node = callback_.call(owner_, tree_, callbackData_);
		callback_ = null;
		callbackData_ = null;
		currentParent_ = null;
		owner_ = null;
		tree_ = null;
		return node;
	} else {
		currentParent_ = currentParent_.parent;
		return true;
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
