'use strict';

import {async} from 'metal';
import {once} from './dom';

/**
 * Utility functions for running styles.
 */
class globalEvalStyles {
	/**
	 * Evaluates the given style.
	 * @param {string} text
	 * @param {function()=} appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} style
	 */
	static run(text, appendFn) {
		const style = document.createElement('style');
		style.innerHTML = text;
		if (appendFn) {
			appendFn(style);
		} else {
			document.head.appendChild(style);
		}
		return style;
	}

	/**
	 * Evaluates the given style file.
	 * @param {string} href The file's path.
	 * @param {function()=} defaultFn Optional function to be called
	 *   when the styles has been run.
	 * @param {function()=} appendFn Optional function to append the node
	 *   into document.
	 * @return {Element} style
	 */
	static runFile(href, defaultFn, appendFn) {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		globalEvalStyles.runStyle(link, defaultFn, appendFn);
		return link;
	}

	/**
	 * Evaluates the code referenced by the given style/link element.
	 * @param {!Element} style
	 * @param {function()=} defaultFn Optional function to be called
	 *   when the script has been run.
	 * @param {function()=} appendFn Optional function to append the node
	 *   into document.
	 *  @return {Element} style
	 */
	static runStyle(style, defaultFn, appendFn) {
		const callback = function() {
			defaultFn && defaultFn();
		};
		if (
			style.rel &&
			style.rel !== 'stylesheet' &&
			style.rel !== 'canonical' &&
			style.rel !== 'alternate'
		) {
			async.nextTick(callback);
			return;
		}

		if (
			style.tagName === 'STYLE' ||
			style.rel === 'canonical' ||
			style.rel === 'alternate'
		) {
			async.nextTick(callback);
		} else {
			once(style, 'load', callback);
			once(style, 'error', callback);
		}

		if (appendFn) {
			appendFn(style);
		} else {
			document.head.appendChild(style);
		}

		return style;
	}

	/**
	 * Evaluates any style present in the given element.
	 * @param {!Element} element
	 * @param {function()=} defaultFn Optional function to be called when the
	 *   style has been run.
	 * @param {function()=} appendFn Optional function to append the node
	 *   into document.
	 */
	static runStylesInElement(element, defaultFn, appendFn) {
		const styles = element.querySelectorAll('style,link');
		if (styles.length === 0 && defaultFn) {
			async.nextTick(defaultFn);
			return;
		}

		let loadCount = 0;
		const callback = function() {
			if (defaultFn && ++loadCount === styles.length) {
				async.nextTick(defaultFn);
			}
		};
		for (let i = 0; i < styles.length; i++) {
			globalEvalStyles.runStyle(styles[i], callback, appendFn);
		}
	}
}

export default globalEvalStyles;
