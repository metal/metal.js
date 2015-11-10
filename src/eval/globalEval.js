'use strict';

import dom from '../dom/dom';

/**
 * Utility functions for running javascript code in the global scope.
 */
class globalEval {
	/**
	 * Evaluates the given string in the global scope.
	 * @param {string} text
	 */
	static run(text) {
		var script = document.createElement('script');
		script.text = text;
		document.head.appendChild(script).parentNode.removeChild(script);
	}

	/**
	 * Evaluates the given javascript file in the global scope.
	 * @param {string} src The file's path.
	 */
	static runFile(src) {
		var script = document.createElement('script');
		script.src = src;
		dom.on(script, 'load', function() {
			script.parentNode.removeChild(script);
		});
		dom.on(script, 'error', function() {
			script.parentNode.removeChild(script);
		});
		document.head.appendChild(script);
	}

	/**
	 * Evaluates the code referenced by the given script element.
	 * @param {!Element} script
	 */
	static runScript(script) {
		if (script.parentNode) {
			script.parentNode.removeChild(script);
		}
		if (script.src) {
			globalEval.runFile(script.src);
		} else {
			globalEval.run(script.text);
		}
	}
}

export default globalEval;
