'use strict';

import 'metal-soy-bundle';
import { ComponentRegistry } from 'metal-component';
import { isFunction, isObject, isString, object } from 'metal';
import { validators, Config } from 'metal-state';
import HTML2IncDom from 'html2incdom';
import IncrementalDomRenderer from 'metal-incremental-dom';
import SoyAop from './SoyAop';

// The injected data that will be passed to soy templates.
let ijData = {};

class Soy extends IncrementalDomRenderer.constructor {
	/**
	 * Adds the template params to the component's state, if they don't exist yet.
	 * @param {!Component} component
	 * @return {Object}
	 */
	getExtraDataConfig(component) {
		let elementTemplate = component.constructor.TEMPLATE;
		if (!isFunction(elementTemplate)) {
			return;
		}

		elementTemplate = SoyAop.getOriginalFn(elementTemplate);
		this.soyParamTypes_ = elementTemplate.types || {};

		const keys = elementTemplate.params || [];
		const configs = {};
		for (let i = 0; i < keys.length; i++) {
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
	 * Also calls the component's "prepareStateForRender" to let it change the
	 * data passed to the template.
	 * @param {!Component} component
	 * @param {!Array<string>} params The params used by this template.
	 * @return {!Object}
	 * @protected
	 */
	buildTemplateData_(component, params) {
		const data = object.mixin({}, this.getConfig(component));
		component.getStateKeys().forEach(key => {
			let value = component[key];
			if (this.isHtmlParam_(component, key)) {
				value = soyRenderer_.toIncDom(value);
			}
			data[key] = value;
		});

		for (let i = 0; i < params.length; i++) {
			if (!data[params[i]] && isFunction(component[params[i]])) {
				data[params[i]] = component[params[i]].bind(component);
			}
		}

		if (isFunction(component.prepareStateForRender)) {
			return component.prepareStateForRender(data) || data;
		} else {
			return data;
		}
	}

	/**
	 * Returns the requested template function. This function will be wrapped in
	 * another though, just to defer the requirement of the template's module
	 * being ready until the function is actually called.
	 * @param {string} namespace The soy template's namespace.
	 * @param {string} templateName The name of the template function.
	 * @return {!function()}
	 */
	getTemplate(namespace, templateName) {
		return function(opt_data, opt_ignored, opt_ijData) {
			if (!goog.loadedModules_[namespace]) {
				throw new Error(
					`No template with namespace "${namespace}" has been loaded yet.`
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
	handleInterceptedCall_(originalFn, opt_data = {}) {
		const args = [originalFn.componentCtor, null, []];
		for (let key in opt_data) {
			args.push(key, opt_data[key]);
		}
		IncrementalDOM.elementVoid.apply(null, args);
	}

	/**
	 * Checks if the given param type is html.
	 * @param {!Component} component
	 * @param {string} name
	 * @protected
	 */
	isHtmlParam_(component, name) {
		const state = component.getDataManager().getStateInstance(component);
		if (state.getStateKeyConfig(name).isHtml) {
			return true;
		}

		const elementTemplate = SoyAop.getOriginalFn(component.constructor.TEMPLATE);
		const type = (elementTemplate.types || {})[name] || '';
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
	register(componentCtor, templates, mainTemplate = 'render') {
		componentCtor.RENDERER = soyRenderer_;
		componentCtor.TEMPLATE = SoyAop.getOriginalFn(templates[mainTemplate]);
		componentCtor.TEMPLATE.componentCtor = componentCtor;
		SoyAop.registerForInterception(templates, mainTemplate);
		ComponentRegistry.register(componentCtor);
	}

	/**
	 * Overrides the default method from `IncrementalDomRenderer` so the component's
	 * soy template can be used for rendering.
	 * @param {!Component} component
	 * @param {!Object} data Data passed to the component when rendering it.
	 * @override
	 */
	renderIncDom(component) {
		let elementTemplate = component.constructor.TEMPLATE;
		if (isFunction(elementTemplate) && !component.render) {
			elementTemplate = SoyAop.getOriginalFn(elementTemplate);
			SoyAop.startInterception(this.handleInterceptedCall_);
			const data = this.buildTemplateData_(component, elementTemplate.params || []);
			elementTemplate(data, null, ijData);
			SoyAop.stopInterception();
		} else {
			super.renderIncDom(component);
		}
	}

	/**
	 * Sets the injected data object that should be passed to templates.
	 * @param {Object} data
	 */
	setInjectedData(data) {
		ijData = data || {};
	}

	/**
	 * Overrides the original `IncrementalDomRenderer` method so that only
	 * state keys used by the main template can cause updates.
	 * @param {!Component} component
	 * @param {Object} changes
	 * @return {boolean}
	 */
	shouldUpdate(component, changes) {
		const should = super.shouldUpdate(component, changes);
		if (!should || component.shouldUpdate) {
			return should;
		}

		const fn = component.constructor.TEMPLATE;
		const params = fn ? SoyAop.getOriginalFn(fn).params : [];
		for (let i = 0; i < params.length; i++) {
			if (changes.props[params[i]]) {
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
	toHtmlString(incDomFn) {
		const element = document.createElement('div');
		IncrementalDOM.patch(element, incDomFn);
		return element.innerHTML;
	}

	/**
	 * Converts the given html string into an incremental dom function.
	 * @param {string|{contentKind: string, content: string}} value
	 * @return {!function()}
	 */
	toIncDom(value) {
		if (isObject(value) && isString(value.content) && (value.contentKind === 'HTML')) {
			value = value.content;
		}
		if (isString(value)) {
			value = HTML2IncDom.buildFn(value);
		}
		return value;
	}
}

const soyRenderer_ = new Soy();
soyRenderer_.RENDERER_NAME = 'soy';

export default soyRenderer_;
export {
	Config,
	soyRenderer_ as Soy,
	SoyAop,
	validators
};
