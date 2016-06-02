'use strict';

import './incremental-dom';
import { array, object } from 'metal';

/**
 * Class responsible for intercepting incremental dom functions through AOP.
 */
class IncrementalDomAop {
	/**
	 * Gets the original functions that are intercepted by `IncrementalDomAop`.
	 * @return {!Object}
	 */
	static getOriginalFns() {
		return fnStack[0];
	}

	/**
	 * Starts intercepting calls to incremental dom, replacing them with the given
	 * functions. Note that `elementVoid`, `elementOpenStart`, `elementOpenEnd`
	 * and `attr` are the only ones that can't be intercepted, since they'll
	 * automatically be converted into equivalent calls to `elementOpen` and
	 * `elementClose`.
	 * @param {!Object} fns Functions to be called instead of the original ones
	 *     from incremental DOM. Should be given as a map from the function name
	 *     to the function that should intercept it. All interceptors will receive
	 *     the original function as the first argument, the actual arguments from
	 *     from the original call following it.
	 */
	static startInterception(fns) {
		var originals = IncrementalDomAop.getOriginalFns();
		fns = object.map(fns, (name, value) => value.bind(null, originals[name]));
		fnStack.push(object.mixin({}, originals, fns, {
			attr: fnAttr,
			elementOpenEnd: fnOpenEnd,
			elementOpenStart: fnOpenStart,
			elementVoid: fnVoid
		}));
	}

	/**
	 * Restores the original `elementOpen` function from incremental dom to the
	 * implementation it used before the last call to `startInterception`.
	 */
	static stopInterception() {
		if (fnStack.length > 1) {
			fnStack.pop();
		}
	}
}

var fnStack = [{
	attr: IncrementalDOM.attr,
	attributes: IncrementalDOM.attributes[IncrementalDOM.symbols.default],
	elementClose: IncrementalDOM.elementClose,
	elementOpen: IncrementalDOM.elementOpen,
	elementOpenEnd: IncrementalDOM.elementOpenEnd,
	elementOpenStart: IncrementalDOM.elementOpenStart,
	elementVoid: IncrementalDOM.elementVoid,
	text: IncrementalDOM.text
}];

var collectedArgs = [];

function fnAttr(name, value) {
	collectedArgs.push(name, value);
}

function fnOpenStart(tag, key, statics) {
	collectedArgs = [tag, key, statics];
}

function fnOpenEnd() {
	return getFn('elementOpen').apply(null, collectedArgs);
}

function fnVoid(tag) {
	getFn('elementOpen').apply(null, arguments);
	return getFn('elementClose')(tag);
}

function getFn(name) {
	return fnStack[fnStack.length - 1][name];
}

function handleCall(name) {
	return getFn(name).apply(null, array.slice(arguments, 1));
}

IncrementalDOM.attr = handleCall.bind(null, 'attr');
IncrementalDOM.elementClose = handleCall.bind(null, 'elementClose');
IncrementalDOM.elementOpen = handleCall.bind(null, 'elementOpen');
IncrementalDOM.elementOpenEnd = handleCall.bind(null, 'elementOpenEnd');
IncrementalDOM.elementOpenStart = handleCall.bind(null, 'elementOpenStart');
IncrementalDOM.elementVoid = handleCall.bind(null, 'elementVoid');
IncrementalDOM.text = handleCall.bind(null, 'text');

IncrementalDOM.attributes[IncrementalDOM.symbols.default] = handleCall.bind(
	null,
	'attributes'
);

export default IncrementalDomAop;
