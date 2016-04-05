'use strict';

import './incremental-dom';
import { array } from 'metal';

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
	 * Starts intercepting calls to the `elementOpen` and `elementClose` functions
	 * from incremental dom with the given functions.
	 * @param {!function()} openFn Function to be called instead of the original
	 *     `elementOpen` one.
	 * @param {!function()} closeFn Function to be called instead of the original
	 *     `elementClose` one.
	 * @param {!function()} attributesFn Function to be called instead of the
	 *     original `attributes` default handler.
	 */
	static startInterception(openFn, closeFn, attributesFn) {
		openFn = openFn.bind(null, fnStack[0].elementOpen);
		closeFn = closeFn.bind(null, fnStack[0].elementClose);
		fnStack.push({
			attr: fnAttr,
			attributes: attributesFn.bind(null, fnStack[0].attributes),
			elementClose: closeFn,
			elementOpen: openFn,
			elementOpenEnd: () => openFn.apply(null, collectedArgs),
			elementOpenStart: fnOpenStart,
			elementVoid: function(tag) {
				var node = openFn.apply(null, arguments);
				closeFn(tag);
				return node;
			}
		});
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
	elementVoid: IncrementalDOM.elementVoid
}];

var collectedArgs = [];

function fnAttr(name, value) {
	collectedArgs.push(name, value);
}

function fnOpenStart(tag, key, statics) {
	collectedArgs = [tag, key, statics];
}

function handleCall(name) {
	var fn = fnStack[fnStack.length - 1][name];
	fn.apply(null, array.slice(arguments, 1));
}

IncrementalDOM.attr = handleCall.bind(null, 'attr');
IncrementalDOM.elementClose = handleCall.bind(null, 'elementClose');
IncrementalDOM.elementOpen = handleCall.bind(null, 'elementOpen');
IncrementalDOM.elementOpenEnd = handleCall.bind(null, 'elementOpenEnd');
IncrementalDOM.elementOpenStart = handleCall.bind(null, 'elementOpenStart');
IncrementalDOM.elementVoid = handleCall.bind(null, 'elementVoid');

IncrementalDOM.attributes[IncrementalDOM.symbols.default] = handleCall.bind(
	null,
	'attributes'
);

export default IncrementalDomAop;
