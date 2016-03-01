'use strict';

class IncrementalDomAop {
	/**
	 * Starts intercepting calls to the `elementOpen` function from incremental
	 * dom with the given function.
	 * @param {!function()} fn Function to be called instead of the original one.
	 */
	static startInterception(fn) {
		fn = fn.bind(null, fnStack[0].elementOpen);
		fnStack.push({
			attr: fnAttr,
			elementOpen: fn,
			elementOpenEnd: () => fn.apply(null, collectedArgs),
			elementOpenStart: fnOpenStart,
			elementVoid: function(tag) {
				var node = fn.apply(null, arguments);
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

var collectedArgs = [];

function fnAttr(name, value) {
	collectedArgs.push(name, value);
}

function fnOpenStart(tag, key, statics) {
	collectedArgs = [tag, key, statics];
}

var fnStack = [{
	attr: IncrementalDOM.attr,
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
