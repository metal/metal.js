'use strict';

var templates = {};

/**
 * Stores soy templates from components that use `SoyRenderer`. Soy files
 * compiled with gulp-metal automatically add their templates here when
 * imported.
 */
class SoyTemplates {
	/**
	 * Gets the requested templates.
	 * @param {string=} opt_componentName The name of the component to get
	 *   templates from. If not given, all templates will be returned.
	 * @param {string=} opt_templateName The name of the template. If not given
	 *   all templates for the specified component will be returned.
	 * @return {!Object|function()} Either an object with multiple templates or
	 *   a single template function.
	 */
	static get(opt_componentName, opt_templateName) {
		if (!opt_componentName) {
			return templates;
		} else if (!opt_templateName) {
			return templates[opt_componentName] || {};
		} else {
			return SoyTemplates.get(opt_componentName)[opt_templateName];
		}
	}

	/**
	 * Sets the templates for the component with the specified name.
	 * @param {string} componentName
	 * @param {!Object<string, !function()>} componentTemplates
	 */
	static set(componentName, componentTemplates) {
		templates[componentName] = componentTemplates;
	}
}

export default SoyTemplates;
