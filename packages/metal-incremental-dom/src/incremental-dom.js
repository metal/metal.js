import * as IncrementalDOM from 'incremental-dom';
import * as IncrementalDOMString from 'incremental-dom-string';

// Sets to true if running inside Node.js environment with extra check for
// `process.browser` to skip Karma runner environment. Karma environment has
// `process` defined even though it runs on the browser.
var isNode = (typeof process !== 'undefined') && !process.browser;

if (isNode && process.env.NODE_ENV !== 'test') {
	// Overrides global.IncrementalDOM virtual elements with incremental dom
	// string implementation for server side rendering. At the moment it does not
	// override for Node.js tests since tests are using jsdom to simulate the
	// browser.
	global.IncrementalDOM = IncrementalDOMString;
} else {
	var scope = (typeof exports !== 'undefined' && typeof global !== 'undefined') ? global : window;

	scope.IncrementalDOM = IncrementalDOM;
}
