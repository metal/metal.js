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
		fns = object.mixin({}, originals, fns);
		fnStack.push(object.mixin(fns, {
			attr: fnAttr,
			elementOpenEnd: () => fns.elementOpen.apply(null, collectedArgs),
			elementOpenStart: fnOpenStart,
			elementVoid: function(tag) {
				var node = fns.elementOpen.apply(null, arguments);
				fns.elementClose(tag);
				return node;
			}
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
