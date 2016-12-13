'use strict';

const SoyAop = {
	/**
	 * The functions that should be called instead of a template call. The last
	 * function in the array is the one that is intercepting at the moment. If the
	 * array is empty, the original function will be called instead.
	 * @type {!Array<function()>}
	 * @protected
	 */
	interceptFns_: [],

	/**
	 * Gets the original function of the given template function. If no original exists,
	 * returns the given function itself.
	 * @param {!function()} fn
	 * @return {!function()}
	 */
	getOriginalFn: function(fn) {
		return fn.originalFn ? fn.originalFn : fn;
	},

	/**
	 * Handles a template call, calling the current interception function if one
	 * is set, or otherwise just calling the original function instead.
	 * @param {!function()} originalFn The original template function that was
	 *     intercepted.
	 * @param {Object} opt_data Template data object.
	 * @param {*} opt_ignored
	 * @param {Object} opt_ijData Template injected data object.
	 * @return {*} The return value of the function that is called to handle this
	 *     interception.
	 */
	handleTemplateCall_: function(originalFn, opt_data, opt_ignored, opt_ijData) {
		const interceptFn = SoyAop.interceptFns_[SoyAop.interceptFns_.length - 1];
		if (interceptFn) {
			return interceptFn.call(null, originalFn, opt_data, opt_ignored, opt_ijData);
		} else {
			return originalFn.call(null, opt_data, opt_ignored, opt_ijData);
		}
	},

	/**
	 * Registers a template function that should be intercepted.
	 * @param {!Object} templates The original templates object containing the
	 *     function to be intercepted.
	 * @param {string} name The name of the template function to intercept.
	 */
	registerForInterception: function(templates, name) {
		const originalFn = templates[name];
		if (!originalFn.originalFn) {
			templates[name] = SoyAop.handleTemplateCall_.bind(null, originalFn);
			templates[name].originalFn = originalFn;
		}
	},

	/**
	 * Starts intercepting all template calls, replacing them with a call to the
	 * given function instead.
	 * @param {!function()} fn
	 */
	startInterception: function(fn) {
		SoyAop.interceptFns_.push(fn);
	},

	/**
	 * Stops intercepting template calls.
	 */
	stopAllInterceptions: function() {
		SoyAop.interceptFns_ = [];
	},

	/**
	 * Stops intercepting template calls with the last registered function.
	 */
	stopInterception: function() {
		SoyAop.interceptFns_.pop();
	}
};

export default SoyAop;
