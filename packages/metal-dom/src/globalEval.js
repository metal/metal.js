'use strict';

import {async} from 'metal';
import {exitDocument, once} from './dom';

/**
 * Utility functions for running javascript code in the global scope.
 */
class globalEval {
	/**
	 * Evaluates the given string in the global scope.
	 * @param {string} text
	 * @param {function()=} appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} script
	 */
	static run(text, appendFn) {
		const script = document.createElement('script');
		script.text = text;
		if (appendFn) {
			appendFn(script);
		} else {
			document.head.appendChild(script);
		}
		exitDocument(script);
		return script;
	}

	/**
	 * Evaluates the given javascript file in the global scope.
	 * @param {string} src The file's path.
	 * @param {function()=} defaultFn Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} script
	 */
	static runFile(src, defaultFn, appendFn) {
		const script = document.createElement('script');
		script.src = src;

		const callback = function() {
			exitDocument(script);
			defaultFn && defaultFn();
		};
		once(script, 'load', callback);
		once(script, 'error', callback);

		if (appendFn) {
			appendFn(script);
		} else {
			document.head.appendChild(script);
		}

		return script;
	}

	/**
	 * Evaluates the code referenced by the given script element.
	 * @param {!Element} script
	 * @param {function()=} defaultFn Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} script
	 */
	static runScript(script, defaultFn, appendFn) {
		const callback = function() {
			defaultFn && defaultFn();
		};
		if (script.type && script.type !== 'text/javascript') {
			async.nextTick(callback);
			return;
		}
		exitDocument(script);
		if (script.src) {
			return globalEval.runFile(script.src, defaultFn, appendFn);
		} else {
			async.nextTick(callback);
			return globalEval.run(script.text, appendFn);
		}
	}

	/**
	 * Evaluates any script tags present in the given element.
	 * @param {!Element} element
	 * @param {function()=} defaultFn Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} appendFn Optional function to append the node
	 *   into document.
	 */
	static runScriptsInElement(element, defaultFn, appendFn) {
		const scripts = element.querySelectorAll('script');
		if (scripts.length) {
			globalEval.runScriptsInOrder(scripts, 0, defaultFn, appendFn);
		} else if (defaultFn) {
			async.nextTick(defaultFn);
		}
	}

	/**
	 * Runs the given scripts elements in the order that they appear.
	 * @param {!NodeList} scripts
	 * @param {number} index
	 * @param {function()=} defaultFn Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} appendFn Optional function to append the node
	 *   into document.
	 */
	static runScriptsInOrder(scripts, index, defaultFn, appendFn) {
		globalEval.runScript(
			scripts.item(index),
			function() {
				if (index < scripts.length - 1) {
					globalEval.runScriptsInOrder(
						scripts,
						index + 1,
						defaultFn,
						appendFn
					); // eslint-disable-line
				} else if (defaultFn) {
					async.nextTick(defaultFn);
				}
			},
			appendFn
		);
	}
}

export default globalEval;
