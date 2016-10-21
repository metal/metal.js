'use strict';

import 'metal-soy-bundle';
import { isFunction, isObject, isString, object } from 'metal';
import { ComponentRegistry } from 'metal-component';
import HTML2IncDom from 'html2incdom';
import IncrementalDomRenderer from 'metal-incremental-dom';
import SoyAop from './SoyAop';

// The injected data that will be passed to soy templates.
var ijData = {};

class Soy extends IncrementalDomRenderer {
	/**
	 * Adds the template params to the component's state, if they don't exist yet.
	 * @protected
	 */
	getExtraDataConfig() {
		var elementTemplate = this.component_.constructor.TEMPLATE;
		if (!isFunction(elementTemplate)) {
			return;
		}

		elementTemplate = SoyAop.getOriginalFn(elementTemplate);
		this.soyParamTypes_ = elementTemplate.types || {};

		var keys = elementTemplate.params || [];
		var component = this.component_;
		var configs = {};
		for (var i = 0; i < keys.length; i++) {
			if (!component[keys[i]]) {
				configs[keys[i]] = {};
			}
		}
		return configs;
	}

	/**
	 * Copies the component's state to an object so it can be passed as it's
	 * template call's data. The copying needs to be done because, if the component
	 * itself is passed directly, some problems occur when soy tries to merge it
	 * with other data, due to property getters and setters. This is safer.
	 * @param {!Array<string>} params The params used by this template.
	 * @return {!Object}
	 * @protected
	 */
	buildTemplateData_(params) {
		var component = this.component_;
		var data = object.mixin({}, this.config_);
		component.getStateKeys().forEach(key => {
			var value = component[key];
			if (this.isHtmlParam_(key)) {
				value = Soy.toIncDom(value);
			}
			data[key] = value;
		});
		for (var i = 0; i < params.length; i++) {
			if (!data[params[i]] && isFunction(component[params[i]])) {
				data[params[i]] = component[params[i]].bind(component);
			}
		}
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
	static handleInterceptedCall_(originalFn, opt_data = {}) {
		var args = [originalFn.componentCtor, null, []];
		for (var key in opt_data) {
			args.push(key, opt_data[key]);
		}
		IncrementalDOM.elementVoid.apply(null, args);
	}

	/**
	 * Checks if the given param type is html.
	 * @param {string} name
	 * @protected
	 */
	isHtmlParam_(name) {
		var state = this.component_.getDataManager().getStateInstance();
		if (state.getStateKeyConfig(name).isHtml) {
			return true;
		}
		var type = this.soyParamTypes_[name] || '';
		return type.split('|').indexOf('html') !== -1;
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
		ComponentRegistry.register(componentCtor);
	}

	/**
	 * Overrides the default method from `IncrementalDomRenderer` so the component's
	 * soy template can be used for rendering.
	 * @param {!Object} data Data passed to the component when rendering it.
	 * @override
	 */
	renderIncDom() {
		var elementTemplate = this.component_.constructor.TEMPLATE;
		if (isFunction(elementTemplate) && !this.component_.render) {
			elementTemplate = SoyAop.getOriginalFn(elementTemplate);
			SoyAop.startInterception(Soy.handleInterceptedCall_);
			elementTemplate(this.buildTemplateData_(elementTemplate.params || []), null, ijData);
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

	/**
	 * Overrides the original `IncrementalDomRenderer` method so that only
	 * state keys used by the main template can cause updates.
	 * @return {boolean}
	 */
	shouldUpdate() {
		var should = super.shouldUpdate();
		if (!should || this.component_.shouldUpdate) {
			return should;
		}

		var fn = this.component_.constructor.TEMPLATE;
		var params = fn ? SoyAop.getOriginalFn(fn).params : [];
		for (var i = 0; i < params.length; i++) {
			if (this.changes_[params[i]]) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Converts the given incremental dom function into an html string.
	 * @param {!function()} incDomFn
	 * @return {string}
	 */
	static toHtmlString(incDomFn) {
		var element = document.createElement('div');
		IncrementalDOM.patch(element, incDomFn);
		return element.innerHTML;
	}

	/**
	 * Converts the given html string into an incremental dom function.
	 * @param {string|{contentKind: string, content: string}} value
	 * @return {!function()}
	 */
	static toIncDom(value) {
		if (isObject(value) && isString(value.content) && (value.contentKind === 'HTML')) {
			value = value.content;
		}
		if (isString(value)) {
			value = HTML2IncDom.buildFn(value);
		}
		return value;
	}
}

Soy.RENDERER_NAME = 'soy';

export default Soy;
export { Soy, SoyAop };
