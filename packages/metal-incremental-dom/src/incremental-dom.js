import * as IncrementalDOM from 'incremental-dom';
import * as IncrementalDOMString from 'incremental-dom-string';
import {isServerSide} from 'metal';

if (isServerSide()) {
	// Overrides global.IncrementalDOM virtual elements with incremental dom
	// string implementation for server side rendering. At the moment it does not
	// override for Node.js tests since tests are using jsdom to simulate the
	// browser.
	global.IncrementalDOM = IncrementalDOMString;
} else {
	let scope =
		typeof exports !== 'undefined' && typeof global !== 'undefined'
			? global
			: window;

	if (!scope.IncrementalDOM) {
		scope.IncrementalDOM = IncrementalDOM;
	}
}
