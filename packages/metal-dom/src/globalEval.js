'use strict';

import { async } from 'metal';
import { exitDocument, once } from './dom';

/**
 * Utility functions for running javascript code in the global scope.
 */
class globalEval {
	/**
	 * Evaluates the given string in the global scope.
	 * @param {string} text
	 * @param {function()=} opt_appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} script
	 */
	static run(text, opt_appendFn) {
		const script = document.createElement('script');
		script.text = text;
		if (opt_appendFn) {
			opt_appendFn(script);
		} else {
			document.head.appendChild(script);
		}
		exitDocument(script);
		return script;
	}

	/**
	 * Evaluates the given javascript file in the global scope.
	 * @param {string} src The file's path.
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} opt_appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} script
	 */
	static runFile(src, opt_callback, opt_appendFn) {
		const script = document.createElement('script');
		script.src = src;

		const callback = function() {
			exitDocument(script);
			opt_callback && opt_callback();
		};
		once(script, 'load', callback);
		once(script, 'error', callback);

		if (opt_appendFn) {
			opt_appendFn(script);
		} else {
			document.head.appendChild(script);
		}

		return script;
	}

	/**
	 * Evaluates the code referenced by the given script element.
	 * @param {!Element} script
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} opt_appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} script
	 */
	static runScript(script, opt_callback, opt_appendFn) {
		const callback = function() {
			opt_callback && opt_callback();
		};
		if (script.type && script.type !== 'text/javascript') {
			async.nextTick(callback);
			return;
		}
		exitDocument(script);
		if (script.src) {
			return globalEval.runFile(script.src, opt_callback, opt_appendFn);
		} else {
			async.nextTick(callback);
			return globalEval.run(script.text, opt_appendFn);
		}
	}

	/**
	 * Evaluates any script tags present in the given element.
	 * @param {!Element} element
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} opt_appendFn Optional function to append the node
	 *   into document.
	 */
	static runScriptsInElement(element, opt_callback, opt_appendFn) {
		const scripts = element.querySelectorAll('script');
		if (scripts.length) {
			globalEval.runScriptsInOrder(scripts, 0, opt_callback, opt_appendFn);
		} else if (opt_callback) {
			async.nextTick(opt_callback);
		}
	}

	/**
	 * Runs the given scripts elements in the order that they appear.
	 * @param {!NodeList} scripts
	 * @param {number} index
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} opt_appendFn Optional function to append the node
	 *   into document.
	 */
	static runScriptsInOrder(scripts, index, opt_callback, opt_appendFn) {
		globalEval.runScript(scripts.item(index), function() {
			if (index < scripts.length - 1) {
				globalEval.runScriptsInOrder(scripts, index + 1, opt_callback, opt_appendFn);
			} else if (opt_callback) {
				async.nextTick(opt_callback);
			}
		}, opt_appendFn);
	}
}

export default globalEval;
