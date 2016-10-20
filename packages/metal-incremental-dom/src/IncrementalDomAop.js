'use strict';

import './incremental-dom';

/**
 * Class responsible for intercepting incremental dom functions through AOP.
 */
class IncrementalDomAop {
	/**
	 * Gets the original functions that are intercepted by `IncrementalDomAop`.
	 * @return {!Object}
	 */
	static getOriginalFns() {
		return originalFns;
	}

	/**
	 * Gets the original functions that are intercepted by `IncrementalDomAop`.
	 * @return {!Object}
	 */
	static getOriginalFn(name) {
		return originalFns[name];
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
		fns.attr = fnAttr;
		fns.elementOpenEnd = fnOpenEnd;
		fns.elementOpenStart = fnOpenStart;
		fns.elementVoid = fnVoid;
		fnStack.push(fns);
	}

	/**
	 * Restores the original `elementOpen` function from incremental dom to the
	 * implementation it used before the last call to `startInterception`.
	 */
	static stopInterception() {
		fnStack.pop();
	}
}

var originalFns = {
	attr: IncrementalDOM.attr,
	attributes: IncrementalDOM.attributes[IncrementalDOM.symbols.default],
	elementClose: IncrementalDOM.elementClose,
	elementOpen: IncrementalDOM.elementOpen,
	elementOpenEnd: IncrementalDOM.elementOpenEnd,
	elementOpenStart: IncrementalDOM.elementOpenStart,
	elementVoid: IncrementalDOM.elementVoid,
	text: IncrementalDOM.text
};

var fnStack = [];

var collectedArgs = [];

function fnAttr(name, value) {
	collectedArgs.push(name, value);
}

function fnOpenStart(tag, key, statics) {
	collectedArgs = [tag, key, statics];
}

function fnOpenEnd() {
	return IncrementalDOM.elementOpen(...collectedArgs);
}

function fnVoid() {
	IncrementalDOM.elementOpen.apply(null, arguments);
	return IncrementalDOM.elementClose.apply(null, arguments);
}

function getFn(name) {
	return fnStack.length > 0 && fnStack[fnStack.length - 1][name];
}

function buildHandleCall(name) {
	var data = {name};
	var fn = handleCall.bind(data);
	return fn;
}

function handleCall() {
	const name = this.name; // jshint ignore:line
	var fn = getFn(name) || originalFns[name];
	return fn.apply(null, arguments);
}

IncrementalDOM.attr = buildHandleCall('attr');
IncrementalDOM.elementClose = buildHandleCall('elementClose');
IncrementalDOM.elementOpen = buildHandleCall('elementOpen');
IncrementalDOM.elementOpenEnd = buildHandleCall('elementOpenEnd');
IncrementalDOM.elementOpenStart = buildHandleCall('elementOpenStart');
IncrementalDOM.elementVoid = buildHandleCall('elementVoid');
IncrementalDOM.text = buildHandleCall('text');

IncrementalDOM.attributes[IncrementalDOM.symbols.default] = buildHandleCall(
	'attributes'
);

export default IncrementalDomAop;
