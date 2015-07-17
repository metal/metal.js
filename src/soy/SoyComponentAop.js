'use strict';

import ComponentRegistry from '../component/ComponentRegistry';

var SoyComponentAop = {
	/**
	 * The function that should be called instead of a template call. If null, the original function
	 * will be called instead.
	 * @type {function()}
	 * @protected
	 */
	interceptFn_: null,

	/**
	 * Flag indicating if soy templates have already been registered for interception or not.
	 * @type {boolean}
	 * @protected
	 */
	registeredTemplates_: false,

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
	 * Handles a template call, calling the current interception function if one is set, or otherwise
	 * just calling the original function instead.
	 * @param {string} compName The name of the component this template function belongs to.
	 * @param {string} templateName The name of the template this call was made for.
	 * @param {!function()} originalFn The original template function that was intercepted.
	 * @param {Object} opt_data Template data object.
	 * @param {*} opt_ignored
	 * @param {Object} opt_ijData Template injected data object.
	 * @return {*} The return value of the function that is called to handle this interception.
	 */
	handleTemplateCall_: function(compName, templateName, originalFn, opt_data, opt_ignored, opt_ijData) {
		if (SoyComponentAop.interceptFn_) {
			return SoyComponentAop.interceptFn_.call(null, compName, templateName, originalFn, opt_data, opt_ignored, opt_ijData);
		} else {
			return originalFn.call(null, opt_data, opt_ignored, opt_ijData);
		}
	},

	/**
	 * Registers all templates so they can be intercepted, unless they've already
	 * been registered before.
	 */
	registerAll: function() {
		if (!SoyComponentAop.registeredTemplates_) {
			Object.keys(ComponentRegistry.Templates).forEach(function(compName) {
				SoyComponentAop.registerTemplates(compName);
			});
			SoyComponentAop.registeredTemplates_ = true;
		}
	},

	/**
	 * Registers the templates for the requested component so they can be intercepted.
	 * @param {string} compName
	 */
	registerTemplates: function(compName) {
		var compTemplates = ComponentRegistry.Templates[compName];
		Object.keys(compTemplates).forEach(function(templateName) {
			var originalFn = compTemplates[templateName];
			if (!originalFn.originalFn) {
				compTemplates[templateName] = SoyComponentAop.handleTemplateCall_.bind(null, compName, templateName, originalFn);
				compTemplates[templateName].originalFn = originalFn;
			}
		});
	},

	/**
	 * Starts intercepting all template calls, replacing them with a call
	 * to the given function instead.
	 * @param {!function()} fn
	 */
	startInterception: function(fn) {
		this.registerAll();
		SoyComponentAop.interceptFn_ = fn;
	},

	/**
	 * Stops intercepting template calls.
	 */
	stopInterception: function() {
		SoyComponentAop.interceptFn_ = null;
	}
};

export default SoyComponentAop;
