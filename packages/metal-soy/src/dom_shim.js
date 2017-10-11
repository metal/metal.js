'use strict';

const emptyObj = {};

/**
 * Sets global `window` and `document` variables when they are not defined for
 * the purpose of server side rendering.
 *
 * Must be imported before `html2incdom` package.
 */
(function domShim() {
	if (typeof window === 'undefined') {
		global.window = emptyObj;
	}

	if (typeof document === 'undefined') {
		global.document = emptyObj;
	}
})();
