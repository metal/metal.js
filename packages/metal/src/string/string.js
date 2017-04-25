'use strict';

class string {
	/**
	 * Checks if a string contains a given string.
	 * @param {string} str1 String to compare with.
	 * @param {string} str2 String that should be inside str1.
	 * @return {boolean} True if it contains false if it does not.
	 */
	static contains(str1, str2) {
		return str1.indexOf(str2) >= 0;
	}

	/**
	 * Compares the given strings without taking the case into account.
	 * @param {string|number} str1
	 * @param {string|number} str2
	 * @return {number} Either -1, 0 or 1, according to if the first string is
	 *     "smaller", equal or "bigger" than the second given string.
	 */
	static caseInsensitiveCompare(str1, str2) {
		const test1 = String(str1).toLowerCase();
		const test2 = String(str2).toLowerCase();

		if (test1 < test2) {
			return -1;
		} else if (test1 === test2) {
			return 0;
		} else {
			return 1;
		}
	}

	/**
	 * Removes the breaking spaces from the left and right of the string and
	 * collapses the sequences of breaking spaces in the middle into single spaces.
	 * The original and the result strings render the same way in HTML.
	 * @param {string} str A string in which to collapse spaces.
	 * @return {string} Copy of the string with normalized breaking spaces.
	 */
	static collapseBreakingSpaces(str) {
		return str.replace(/[\t\r\n ]+/g, ' ').replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, '');
	}

	/**
	* Escapes characters in the string that are not safe to use in a RegExp.
	* @param {*} str The string to escape. If not a string, it will be casted
	*     to one.
	* @return {string} A RegExp safe, escaped copy of {@code s}.
	*/
	static escapeRegex(str) {
		return String(str)
			.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1')
			.replace(/\x08/g, '\\x08');
	}

	/**
	 * Unescapes an HTML string.
	 *
	 * @param {string} str The string to unescape.
	 * @return {string} An unescaped copy of {@code str}.
	 */
	static unescapeEntities(str) {
		return string.unescapePureXmlEntities(str);
	}

	/**
	 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
	 * entities. This function is XSS-safe and whitespace-preserving.
	 * @private
	 * @param {string} str The string to unescape.
	 * @return {string} The unescaped {@code str} string.
	 */
	static unescapeEntitiesUsingDom(str) {
		if (!string.contains(str, '&')) {
			return str;
		}

		let seen = {
			'&amp;': '&',
			'&lt;': '<',
			'&gt;': '>',
			'&quot;': '"'
		};
		let div = document.createElement('div');

		return str.replace(string.HTML_ENTITY_PATTERN_, function(s, entity) {
			let value = seen[s];
			if (value) {
				return value;
			}
			value = string.unescapeHexFormat_(entity);
			if (!value) {
				// Append a non-entity character to avoid a bug in Webkit that parses
				// an invalid entity at the end of innerHTML text as the empty string.
				div.innerHTML = s + ' ';
				// Then remove the trailing character from the result.
				value = div.firstChild.nodeValue.slice(0, -1);
			}

			return seen[s] = value;
		});
	};

	/**
	 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
	 * entities. This function is XSS-safe and whitespace-preserving.
	 * @private
	 * @param {string} str The string to unescape.
	 * @return {string} The unescaped {@code str} string.
	 */
	static unescapeHexFormat_(entity) {
		if (entity.charAt(0) === '#') {
			// Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
			let n = Number('0' + entity.substr(1));
			if (!isNaN(n)) {
				return String.fromCharCode(n);
			}
		}
	}

	/**
	 * Unescapes XML entities.
	 * @private
	 * @param {string} str The string to unescape.
	 * @return {string} An unescaped copy of {@code str}.
	 */
	static unescapePureXmlEntities(str) {
		if (!string.contains(str, '&')) {
			return str;
		}
		return str.replace(/&([^;]+);/g, function(s, entity) {
			switch (entity) {
				case 'amp':
					return '&';
				case 'lt':
					return '<';
				case 'gt':
					return '>';
				case 'quot':
					return '"';
				default:
					return string.unescapeHexFormat_(entity) || s;
			}
		});
	}

	/**
	* Returns a string with at least 64-bits of randomness.
	* @return {string} A random string, e.g. sn1s7vb4gcic.
	*/
	static getRandomString() {
		const x = 2147483648;
		return Math.floor(Math.random() * x).toString(36) +
			Math.abs(Math.floor(Math.random() * x) ^ Date.now()).toString(36);
	}

	/**
	 * Calculates the hashcode for a string. The hashcode value is computed by
	 * the sum algorithm: s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]. A nice
	 * property of using 31 prime is that the multiplication can be replaced by
	 * a shift and a subtraction for better performance: 31*i == (i<<5)-i.
	 * Modern VMs do this sort of optimization automatically.
	 * @param {String} val Target string.
	 * @return {Number} Returns the string hashcode.
	 */
	static hashCode(val) {
		let hash = 0;
		for (let i = 0, len = val.length; i < len; i++) {
			hash = 31 * hash + val.charCodeAt(i);
			hash %= 0x100000000;
		}
		return hash;
	}

	/**
	 * Replaces interval into the string with specified value, e.g.
	 * `replaceInterval("abcde", 1, 4, "")` returns "ae".
	 * @param {string} str The input string.
	 * @param {Number} start Start interval position to be replaced.
	 * @param {Number} end End interval position to be replaced.
	 * @param {string} value The value that replaces the specified interval.
	 * @return {string}
	 */
	static replaceInterval(str, start, end, value) {
		return str.substring(0, start) + value + str.substring(end);
	}
}

/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;

export default string;
