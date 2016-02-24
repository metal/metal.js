'use strict';

class IncrementalDomAop {
	/**
	 * Starts intercepting calls to the `elementOpen` and `elementVoid` functions
	 * from incremental dom.
	 * @param {!function()} fn Function to be called instead of the original ones.
	 */
	static startInterception(fn) {
		IncrementalDOM.elementOpen = fn.bind(null, originals.elementOpen);
		IncrementalDOM.elementVoid = fn.bind(null, originals.elementVoid);
	}

	/**
	 * Restores the original `elementOpen` and `elementVoid` functions from
	 * incremental dom.
	 */
	static stopInterception() {
		IncrementalDOM.elementOpen = originals.elementOpen;
		IncrementalDOM.elementVoid = originals.elementVoid;
	}
}

var originals = {
	elementOpen: IncrementalDOM.elementOpen,
	elementVoid: IncrementalDOM.elementVoid
};

export default IncrementalDomAop;
