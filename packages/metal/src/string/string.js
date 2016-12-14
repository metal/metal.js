'use strict';

class string {
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

export default string;
