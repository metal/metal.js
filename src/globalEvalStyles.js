'use strict';

import { async } from 'metal';
import dom from './dom';

/**
 * Utility functions for running styles.
 */
class globalEvalStyles {
	/**
	 * Evaluates the given style.
	 * @param {string} text
	 * @return {Element} style
	 */
	static run(text) {
		var style = document.createElement('style');
		style.innerHTML = text;
		document.head.appendChild(style);
		return style;
	}

	/**
	 * Evaluates the given style file.
	 * @param {string} href The file's path.
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the styles has been run.
	 * @return {Element} style
	 */
	static runFile(href, opt_callback) {
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;

		var callback = function() {
			opt_callback && opt_callback();
		};
		dom.on(link, 'load', callback);
		dom.on(link, 'error', callback);
		document.head.appendChild(link);

		return link;
	}

	/**
	 * Evaluates the code referenced by the given style element.
	 * @param {!Element} style
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 *  @return {Element} style
	 */
	static runStyle(style, opt_callback) {
		var callback = function() {
			opt_callback && opt_callback();
		};
		if (style.rel && style.rel !== 'stylesheet') {
			async.nextTick(callback);
			return;
		}
		if (style.href) {
			return globalEvalStyles.runFile(style.href, opt_callback);
		} else {
			async.nextTick(callback);
			return globalEvalStyles.run(style.innerHTML);
		}
	}

	/**
	 * Evaluates any style present in the given element.
	 * TODO: Evaluates running styles in parallel instead of in order.
	 * @params {!Element} element
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the style has been run.
	 */
	static runStylesInElement(element, opt_callback) {
		var styles = element.querySelectorAll('style,link');
		if (styles.length) {
			globalEvalStyles.runStylesInOrder(styles, 0, opt_callback);
		} else if (opt_callback) {
			async.nextTick(opt_callback);
		}
	}

	/**
	 * Runs the given styles elements in the order that they appear.
	 * @param {!NodeList} styles
	 * @param {number} index
	 * @param {function()=} opt_callback Optional function to be called
	 *   when the script has been run.
	 */
	static runStylesInOrder(styles, index, opt_callback) {
		globalEvalStyles.runStyle(styles.item(index), function() {
			if (index < styles.length - 1) {
				globalEvalStyles.runStylesInOrder(styles, index + 1, opt_callback);
			} else if (opt_callback) {
				async.nextTick(opt_callback);
			}
		});
	}
}

export default globalEvalStyles;
