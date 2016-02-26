'use strict';

class IncrementalDomAop {
	/**
	 * Starts intercepting calls to the `elementOpen`, `elementVoid` and
	 * `elementOpenEnd` functions from incremental dom with the given function.
	 * @param {!function()} fn Function to be called instead of the original ones.
	 */
	static startInterception(fn) {
		fnStack.push({
			elementOpen: fn.bind(null, fnStack[0].elementOpen),
			elementOpenEnd: fn.bind(null, fnStack[0].elementOpenEnd),
			elementVoid: fn.bind(null, fnStack[0].elementVoid)
		});
		replace(fnStack[fnStack.length - 1]);
	}

	/**
	 * Restores the original `elementOpen`, `elementVoid` and `elementOpenEnd`
	 * functions from incremental dom to the implementation they had before the
	 * last call to `startInterception`.
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
