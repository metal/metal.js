'use strict';

class string {
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
	* Returns a string with at least 64-bits of randomness.
	* @return {string} A random string, e.g. sn1s7vb4gcic.
	*/
	static getRandomString() {
		var x = 2147483648;
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
		var hash = 0;
		for (var i = 0, len = val.length; i < len; i++) {
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
