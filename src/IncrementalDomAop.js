'use strict';

class IncrementalDomAop {
	/**
	 * Starts intercepting calls to the `elementOpen`, `elementVoid` and
	 * `elementOpenEnd` functions from incremental dom.
	 * @param {!function()} fn Function to be called instead of the original ones.
	 */
	static startInterception(fn) {
		IncrementalDOM.elementOpen = fn.bind(null, originals.elementOpen);
		IncrementalDOM.elementOpenEnd = fn.bind(null, originals.elementOpenEnd);
		IncrementalDOM.elementVoid = fn.bind(null, originals.elementVoid);
	}

	/**
	 * Restores the original `elementOpen`, `elementVoid` and `elementOpenEnd`
	 * functions from incremental dom.
	 */
	static stopInterception() {
		IncrementalDOM.elementOpen = originals.elementOpen;
		IncrementalDOM.elementOpenEnd = originals.elementOpenEnd;
		IncrementalDOM.elementVoid = originals.elementVoid;
	}
}

var originals = {
	elementOpen: IncrementalDOM.elementOpen,
	elementOpenEnd: IncrementalDOM.elementOpenEnd,
	elementVoid: IncrementalDOM.elementVoid
};

export default IncrementalDomAop;
