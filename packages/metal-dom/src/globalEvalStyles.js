'use strict';

import { async } from 'metal';
import { once } from './dom';

/**
 * Utility functions for running styles.
 */
class globalEvalStyles {
	/**
	 * Evaluates the given style.
	 * @param {string} text
	 * @param {function()=} opt_appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} style
	 */
	static run(text, opt_appendFn) {
		const style = document.createElement('style');
		style.innerHTML = text;
		if (opt_appendFn) {
			opt_appendFn(style);
		} else {
			document.head.appendChild(style);
		}
		return style;
	}

	/**
	 * Evaluates the given style file.
	 * @param {string} href The file's path.
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the styles has been run.
	 * @param {function()=} opt_appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} style
	 */
	static runFile(href, opt_callback, opt_appendFn) {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		globalEvalStyles.runStyle(link, opt_callback, opt_appendFn);
		return link;
	}

	/**
	 * Evaluates the code referenced by the given style/link element.
	 * @param {!Element} style
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} opt_appendFn Optional function to append the node
	 *   into document.
	 *  @return {Element} style
	 */
	static runStyle(style, opt_callback, opt_appendFn) {
		const callback = function() {
			opt_callback && opt_callback();
		};
		if (style.rel && style.rel !== 'stylesheet') {
			async.nextTick(callback);
			return;
		}

		if (style.tagName === 'STYLE') {
			async.nextTick(callback);
		} else {
			once(style, 'load', callback);
			once(style, 'error', callback);
		}

		if (opt_appendFn) {
			opt_appendFn(style);
		} else {
			document.head.appendChild(style);
		}

		return style;
	}

	/**
	 * Evaluates any style present in the given element.
	 * @param {!Element} element
	 * @param {function()=} opt_callback Optional function to be called when the
	 *   style has been run.
	 * @param {function()=} opt_appendFn Optional function to append the node
	 *   into document.
	 */
	static runStylesInElement(element, opt_callback, opt_appendFn) {
		const styles = element.querySelectorAll('style,link');
		if (styles.length === 0 && opt_callback) {
			async.nextTick(opt_callback);
			return;
		}

		let loadCount = 0;
		const callback = function() {
			if (opt_callback && ++loadCount === styles.length) {
				async.nextTick(opt_callback);
			}
		};
		for (let i = 0; i < styles.length; i++) {
			globalEvalStyles.runStyle(styles[i], callback, opt_appendFn);
		}
	}
}

export default globalEvalStyles;
