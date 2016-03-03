'use strict';

class IncrementalDomAop {
	/**
	 * Starts intercepting calls to the `elementOpen` and `elementClose` functions
	 * from incremental dom with the given functions.
	 * @param {!function()} openFn Function to be called instead of the original
	 *     `elementOpen` one.
	 * @param {!function()} closeFn Function to be called instead of the original
	 *     `elementClose` one.
	 */
	static startInterception(openFn, closeFn) {
		openFn = openFn.bind(null, fnStack[0].elementOpen);
		closeFn = closeFn.bind(null, fnStack[0].elementClose);
		fnStack.push({
			attr: fnAttr,
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
		replace(fnStack[fnStack.length - 1]);
	}

	/**
	 * Restores the original `elementOpen` function from incremental dom to the
	 * implementation it used before the last call to `startInterception`.
	 */
	static stopInterception() {
		if (fnStack.length > 1) {
			fnStack.pop();
		}
		replace(fnStack[fnStack.length - 1]);
	}
}

var collectedArgs = [];

function fnAttr(name, value) {
	collectedArgs.push(name, value);
}

function fnOpenStart(tag, key, statics) {
	collectedArgs = [tag, key, statics];
}

var fnStack = [{
	attr: IncrementalDOM.attr,
	elementClose: IncrementalDOM.elementClose,
	elementOpen: IncrementalDOM.elementOpen,
	elementOpenEnd: IncrementalDOM.elementOpenEnd,
	elementOpenStart: IncrementalDOM.elementOpenStart,
	elementVoid: IncrementalDOM.elementVoid
}];

function replace(fns) {
	var names = Object.keys(fns);
	for (var i = 0; i < names.length; i++) {
		IncrementalDOM[names[i]] = fns[names[i]];
	}
}

export default IncrementalDomAop;
