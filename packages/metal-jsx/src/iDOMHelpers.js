'use strict';

import { globals } from 'metal';
import IncrementalDomRenderer from 'metal-incremental-dom';
import JSXRenderer from './JSXRenderer';

/**
 * These helpers are all from "babel-plugin-incremental-dom". See its README
 * file for more details:
 * https://github.com/jridgewell/babel-plugin-incremental-dom#runtime
 */

globals.window.iDOMHelpers = globals.window.iDOMHelpers || {};

globals.window.iDOMHelpers.attr = function(value, attrName) {
	IncrementalDOM.attr(attrName, value);
};

globals.window.iDOMHelpers.forOwn = function(object, iterator) {
	const hasOwn = Object.prototype.hasOwnProperty;
	for (let prop in object) {
		if (hasOwn.call(object, prop)) {
			iterator(object[prop], prop);
		}
	}
};

globals.window.iDOMHelpers.jsxWrapper = function(elementClosure, args) {
	const wrapper = args ? function() {
		return elementClosure.apply(this, args);
	} : elementClosure;
	wrapper.__jsxDOMWrapper = true;
	return wrapper;
};

globals.window.iDOMHelpers.renderArbitrary = function(child) {
	const type = typeof child;
	if (type === 'number' || (type === 'string' || child && child instanceof String)) {
		IncrementalDOM.text(child);
	} else if (type === 'function' && child.__jsxDOMWrapper) {
		child();
	} else if (Array.isArray(child)) {
		child.forEach(globals.window.iDOMHelpers.renderArbitrary);
	} else if (String(child) === '[object Object]') {
		// Renders special incremental dom nodes in a special way :)
		if (IncrementalDomRenderer.isIncDomNode(child)) {
			IncrementalDomRenderer.renderChild(child);
		} else {
			globals.window.iDOMHelpers.forOwn(child, globals.window.iDOMHelpers.renderArbitrary);
		}
	} else if (!child) {
		JSXRenderer.skipChild();
	}
};

export default globals.window.iDOMHelpers;
