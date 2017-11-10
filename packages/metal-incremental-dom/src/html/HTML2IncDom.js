'use strict';

import HTMLParser from './HTMLParser';
import unescape from './unescape';

let parser_;

class HTML2IncDom {
	/**
	 * Should convert the given html string to a function with calls to
	 * incremental dom methods.
	 * @param {string} html
	 * @return {!function()} Function with incremental dom calls for building
	 *     the given html string.
	 */
	static buildFn(html) {
		return () => HTML2IncDom.run(html);
	}

	/**
	 * Gets the html parser being currently used.
	 * @return {!function()}
	 */
	static getParser() {
		return parser_ || HTMLParser;
	}

	/**
	 * Should convert the given html string to calls to incremental dom methods.
	 * @param {string} html
	 */
	static run(html) {
		HTML2IncDom.getParser()(html, {
			start: function(tag, attrs, unary) {
				let fn = unary
					? IncrementalDOM.elementVoid
					: IncrementalDOM.elementOpen;
				let args = [tag, null, []];
				for (let i = 0; i < attrs.length; i++) {
					args.push(attrs[i].name, attrs[i].value);
				}
				fn(...args);
			},

			end: function(tag) {
				IncrementalDOM.elementClose(tag);
			},

			chars: function(text) {
				IncrementalDOM.text(text, unescape);
			},
		});
	}

	/**
	 * Changes the function that will be used to parse html strings. By default
	 * this will use the `HTMLParser` function from
	 * https://github.com/blowsie/Pure-JavaScript-HTML5-Parser. This will accept
	 * any function that follows that same api, basically accepting the html
	 * string and an object with `start`, `end` and `chars` functions to be called
	 * during the parsing.
	 * @param {!function(string, !Object)} newParser
	 */
	static setParser(newParser) {
		parser_ = newParser;
	}
}

export default HTML2IncDom;
