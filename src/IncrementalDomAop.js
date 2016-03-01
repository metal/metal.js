'use strict';

class IncrementalDomAop {
	/**
	 * Starts intercepting calls to the `elementOpen` function from incremental
	 * dom with the given function.
	 * @param {!function()} fn Function to be called instead of the original one.
	 */
	static startInterception(fn) {
		var fnOpen = fn.bind(null, fnStack[0].elementOpen);
		fnStack.push({
			elementOpen: fnOpen,
			elementOpenEnd: fn.bind(null, fnStack[0].elementOpenEnd),
			elementVoid: function(tag) {
				var node = fnOpen.apply(null, arguments);
				IncrementalDOM.elementClose(tag);
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

var fnStack = [{
	elementOpen: IncrementalDOM.elementOpen,
	elementOpenEnd: IncrementalDOM.elementOpenEnd,
	elementVoid: IncrementalDOM.elementVoid
}];

function replace(fns) {
	IncrementalDOM.elementOpen = fns.elementOpen;
	IncrementalDOM.elementOpenEnd = fns.elementOpenEnd;
	IncrementalDOM.elementVoid = fns.elementVoid;
}

export default IncrementalDomAop;
