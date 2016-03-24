'use strict';

import 'metal-soy-bundle';
import './requireWarning';

import core from 'metal';
import HTML2IncDom from 'html2incdom';
import IncrementalDomRenderer from 'metal-incremental-dom';
import SoyAop from './SoyAop';

// The injected data that will be passed to soy templates.
var ijData = {};

class Soy extends IncrementalDomRenderer {
	/**
	 * Adds the specified state keys to the component, if they don't exist yet.
	 * @param {Array<string>} keys
	 * @protected
	 */
	addMissingStateKeys_(keys) {
		if (this.addedMissingStateKeys_) {
			return;
		}

		this.addedMissingStateKeys_ = true;
		var component = this.component_;
		for (var i = 0; i < keys.length; i++) {
			if (!component.getStateKeyConfig(keys[i])) {
				component.addToState(keys[i], {}, component.getInitialConfig()[keys[i]]);
			}
		}
	}

	/**
	 * Copies the component's state to an object so it can be passed as it's
	 * template call's data. The copying needs to be done because, if the component
	 * itself is passed directly, some problems occur when soy tries to merge it
	 * with other data, due to property getters and setters. This is safer.
	 * @return {!Object}
	 * @protected
	 */
	buildTemplateData_() {
		var component = this.component_;
		var data = {};
		component.getStateKeys().forEach(key => {
			// Get all state values except "element", since it helps performance
			// and the element shouldn't be referenced inside a soy template anyway.
			if (key === 'element') {
				return;
			}

			var value = component[key];
			if (component.getStateKeyConfig(key).isHtml && core.isString(value)) {
				value = Soy.toIncDom(value);
			}
			data[key] = value;
		});
		return data;
	}

	/**
	 * Returns the requested template function. This function will be wrapped in
	 * another though, just to defer the requirement of the template's module
	 * being ready until the function is actually called.
	 * @param {string} namespace The soy template's namespace.
	 * @param {string} templateName The name of the template function.
	 * @return {!function()}
	 */
	static getTemplate(namespace, templateName) {
		return function(opt_data, opt_ignored, opt_ijData) {
			if (!goog.loadedModules_[namespace]) {
				throw new Error(
					'No template with namespace "' + namespace + '" has been loaded yet.'
				);
			}
			return goog.loadedModules_[namespace][templateName](opt_data, opt_ignored, opt_ijData);
		};
	}

	/**
	 * Handles an intercepted soy template call. If the call is for a component's
	 * main template, then it will be replaced with a call that incremental dom
	 * can use for both handling an instance of that component and rendering it.
	 * @param {!function()} originalFn The original template function that was
	 *     intercepted.
	 * @param {Object} data The data the template was called with.
	 * @protected
	 */
	static handleInterceptedCall_(originalFn, opt_data) {
		var ctor = originalFn.componentCtor;
		var data = opt_data;
		IncrementalDOM.elementVoid('Component', null, [], 'ctor', ctor, 'data', data);
	}

	/**
	 * Converts the given html string into an incremental dom function.
	 * @param {string} value
	 * @return {!function()}
	 */
	static toIncDom(value) {
		return HTML2IncDom.buildFn(value);
	}

	/**
	 * Overrides the original `IncrementalDomRenderer` method so that only
	 * state keys used by the main template can cause updates.
	 * @param {!Object} changes
	 * @return {boolean}
	 */
	shouldUpdate(changes) {
		var fn = this.component_.constructor.TEMPLATE;
		var params = fn ? SoyAop.getOriginalFn(fn).params : [];
		for (var i = 0; i < params.length; i++) {
			if (changes[params[i]]) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Registers the given templates to be used by `Soy` for the specified
	 * component constructor.
	 * @param {!Function} componentCtor The constructor of the component that
	 *     should use the given templates.
	 * @param {!Object} templates Object containing soy template functions.
	 * @param {string=} mainTemplate The name of the main template that should be
	 *     used to render the component. Defaults to "render".
	 */
	static register(componentCtor, templates, mainTemplate = 'render') {
		componentCtor.RENDERER = Soy;
		componentCtor.TEMPLATE = SoyAop.getOriginalFn(templates[mainTemplate]);
		componentCtor.TEMPLATE.componentCtor = componentCtor;
		SoyAop.registerForInterception(templates, mainTemplate);
	}

	/**
	 * Overrides the default method from `IncrementalDomRenderer` so the component's
	 * soy template can be used for rendering.
	 * @override
	 */
	renderIncDom() {
		var elementTemplate = this.component_.constructor.TEMPLATE;
		if (core.isFunction(elementTemplate)) {
			elementTemplate = SoyAop.getOriginalFn(elementTemplate);
			this.addMissingStateKeys_(elementTemplate.params);

			SoyAop.startInterception(Soy.handleInterceptedCall_);
			elementTemplate(this.buildTemplateData_(), null, ijData);
			SoyAop.stopInterception();
		} else {
			super.renderIncDom();
		}
	}

	/**
	 * Sets the injected data object that should be passed to templates.
	 * @param {Object} data
	 */
	static setInjectedData(data) {
		ijData = data || {};
	}
}

export default Soy;
export { Soy, SoyAop };
