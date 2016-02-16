'use strict';

import { core, object } from 'metal';
import dom from 'metal-dom';
import { Component, ComponentRegistry, SurfaceRenderer } from 'metal-component';
import SoyAop from './SoyAop';
import SoyTemplates from './SoyTemplates';

// The injected data that will be passed to soy templates.
var ijData = {};

/**
 * A `SurfaceRenderer` that enables components to be rendered via soy templates. It
 * automatically creates surfaces named after each template and uses template params
 * as render attributes. That means that when an attribute value changes, the templates
 * that have a parameter with the same name will be automatically rendered again.
 * @extends {SurfaceRenderer}
 */
class SoyRenderer extends SurfaceRenderer {
	/**
	 * Adds surfaces from the soy templates.
	 * @protected
	 */
	addSurfacesFromTemplates_() {
		var name = this.component_.getName();
		var templates = SoyTemplates.get(name);
		var templateNames = Object.keys(templates);
		for (var i = 0; i < templateNames.length; i++) {
			var templateName = templateNames[i];
			var templateFn = SoyAop.getOriginalFn(templates[templateName]);
			if (SoyRenderer.isSurfaceTemplate_(templateName, templateFn)) {
				var surfaceId = templateName === 'render' ? this.component_.id : templateName;
				this.addSurface(surfaceId, {
					renderAttrs: templateFn.params,
					templateComponentName: name,
					templateName: templateName
				});
			}
		}
	}

	/**
	 * Builds the config data for a component from the data that was passed to its
	 * soy template function.
	 * @param {string} id The id of the component.
	 * @param {!Object} templateData
	 * @return {!Object} The component's config data.
	 * @protected
	 */
	static buildComponentConfigData_(id, templateData) {
		var config = {
			id: id
		};
		for (var key in templateData) {
			config[key] = templateData[key];
		}
		return config;
	}

	/**
	 * Builds the data object that should be passed to a template from the given component.
	 * @return {!Object}
	 * @protected
	 */
	buildTemplateData_() {
		var component = this.component_;
		var names = component.getAttrNames().filter(function(name) {
			// Get all attribute values except for "element", since it helps performance and this
			// attribute shouldn't be referenced inside a soy template anyway.
			return name !== 'element';
		});
		var surface = this.getSurface(component.id);
		var data = (surface && surface.componentData) ? surface.componentData : {};
		var attrs = object.map(component.getAttrs(names), function(key, value) {
			if (component.getAttrConfig(key).isHtml && core.isString(value)) {
				return SoyRenderer.sanitizeHtml(value);
			} else {
				return value;
			}
		});
		return object.mixin(data, attrs);
	}

	/**
	 * Creates and instantiates a component that has the given soy template function as its
	 * main render template. All keys present in the config object, if one is given, will be
	 * attributes of this component, and the object itself will be passed to the constructor.
	 * @param {!function()} templateFn
	 * @param {(Element|string)=} opt_element The element that should be decorated. If none is given,
	 *   one will be created and appended to the document body.
	 * @param {Object=} opt_data Data to be passed to the soy template when it's called.
	 * @return {!Component}
	 */
	static createComponentFromTemplate(templateFn, opt_element, opt_data) {
		var element = opt_element ? dom.toElement(opt_element) : null;
		var data = object.mixin(
			{
				id: element ? element.id : null
			},
			opt_data,
			{
				element: element
			}
		);

		var name = 'TemplateComponent' + core.getUid();
		class TemplateComponent extends Component {
		}
		TemplateComponent.RENDERER = SoyRenderer;
		ComponentRegistry.register(TemplateComponent, name);
		SoyTemplates.set(name, {
			render: function(opt_attrs, opt_ignored, opt_ijData) {
				return SoyAop.getOriginalFn(templateFn)(data, opt_ignored, opt_ijData);
			}
		});
		SoyAop.registerTemplates(name);
		return new TemplateComponent(data);
	}

	/**
	 * Decorates html rendered by the given soy template function, instantiating any referenced
	 * components in it.
	 * @param {!function()} templateFn
	 * @param {(Element|string)=} opt_element The element that should be decorated. If none is given,
	 *   one will be created and appended to the document body.
	 * @param {Object=} opt_data Data to be passed to the soy template when it's called.
	 * @return {!Component} The component that was created for this action. Contains
	 *   references to components that were rendered by the given template function.
	 */
	static decorateFromTemplate(templateFn, opt_element, opt_data) {
		return SoyRenderer.createComponentFromTemplate(templateFn, opt_element, opt_data).decorate();
	}

	/**
	 * Generates the id for a surface that was found by a soy template call.
	 * @param {string} parentSurfaceId The id of the parent surface, or undefined
	 *   if there is none.
	 * @param {!Object} data The placeholder data registered for this surface.
	 * @return {string} The generated id.
	 * @override
	 */
	generateSurfaceElementId(parentSurfaceId, data) {
		if (data.templateName &&
			parentSurfaceId === this.component_.id &&
			!this.firstSurfaceFound_[data.templateName]) {
			this.firstSurfaceFound_[data.templateName] = true;
			return this.prefixSurfaceId(data.templateName);
		} else {
			return super.generateSurfaceElementId(parentSurfaceId);
		}
	}

	/**
	 * Renders the appropriate soy template for the specified surface.
	 * @param {!Object} surface The surface configuration.
	 * @param {string=} opt_skipContents True if only the element's tag needs to be rendered.
	 * @return {string}
	 * @override
	 */
	getSurfaceContent(surface, opt_skipContents) {
		if (surface.surfaceElementId === this.component_.id) {
			if (!surface.renderAttrs) {
				this.addSurfacesFromTemplates_();
			}
			this.firstSurfaceFound_ = {};
		}

		this.surfaceBeingRendered_ = surface.surfaceElementId;
		this.skipInnerCalls_ = this.skipInnerCalls_ || opt_skipContents;

		var data = surface.templateData;
		surface.templateData = null;
		var content = this.renderTemplateByName_(
			surface.templateComponentName,
			surface.templateName,
			data
		);

		this.surfaceBeingRendered_ = null;
		this.skipInnerCalls_ = false;
		return content;
	}

	/**
	 * Handles a call to the SoyRenderer component template.
	 * @param {string} componentName The component's name.
	 * @param {Object} data The data the template was called with.
	 * @return {string} A placeholder to be rendered instead of the content the template
	 *   function would have returned.
	 * @protected
	 */
	handleComponentCall_(componentName, data) {
		var surfaceData = {
			componentName: componentName
		};
		var id = (data || {}).id;
		if (!id) {
			id = this.generateSurfaceElementId(this.surfaceBeingRendered_, surfaceData);
		}
		surfaceData.componentData = SoyRenderer.buildComponentConfigData_(id, data);
		return this.buildPlaceholder(id, surfaceData);
	}

	/**
	 * Handles a call to a soy template.
	 * @param {string} templateComponentName The name of the component that this template was belongs to.
	 * @param {string} templateName The name of this template.
	 * @param {!function()} originalFn The original template function that was intercepted.
	 * @param {!Object} data The data the template was called with.
	 * @param {*} opt_ignored
	 * @param {Object} opt_ijData Template injected data object.
	 * @return {string}
	 * @protected
	 */
	handleInterceptedCall_(templateComponentName, templateName, originalFn, data, opt_ignored, opt_ijData) {
		if (this.skipInnerCalls_) {
			return '';
		} else if (templateName === 'render') {
			return this.handleComponentCall_.call(this, templateComponentName, data);
		} else {
			return this.handleSurfaceCall_.call(this, templateComponentName, templateName, originalFn, data, opt_ignored, opt_ijData);
		}
	}

	/**
	 * Handles a call to the SoyRenderer surface template.
	 * @param {string} templateComponentName The name of the component that this template was belongs to.
	 * @param {string} templateName The name of this template.
	 * @param {!function()} originalFn The original template function that was intercepted.
	 * @param {!Object} data The data the template was called with.
	 * @param {*} opt_ignored
	 * @param {Object} opt_ijData Template injected data object.
	 * @return {string} A placeholder to be rendered instead of the content the template
	 *   function would have returned.
	 * @protected
	 */
	handleSurfaceCall_(templateComponentName, templateName, originalFn, data, opt_ignored, opt_ijData) {
		var surfaceData = {
			static: originalFn.static,
			templateComponentName: templateComponentName,
			templateData: data,
			templateName: templateName
		};
		var surfaceElementId;
		if (core.isDefAndNotNull(data.surfaceElementId)) {
			surfaceElementId = data.surfaceElementId;
		} else if (core.isDefAndNotNull(data.surfaceId)) {
			surfaceElementId = this.getSurfaceElementId(data.surfaceId.toString());
		} else {
			if (originalFn.private) {
				return originalFn.call(null, data, opt_ignored, opt_ijData);
			}
			surfaceElementId = this.generateSurfaceElementId(this.surfaceBeingRendered_, surfaceData);
		}
		return this.buildPlaceholder(surfaceElementId, surfaceData);
	}

	/**
	 * Checks if a template is a surface template.
	 * @param {string} templateName
	 * @param {!function()} templateFn
	 * @return {boolean}
	 * @protected
	 */
	static isSurfaceTemplate_(templateName, templateFn) {
		return templateName.substr(0, 13) !== '__deltemplate' && !templateFn.private;
	}

	/**
	 * Renders the given soy template function, instantiating any referenced components in it.
	 * @param {!function()} templateFn
	 * @param {(Element|string)=} opt_element The element that should be decorated. If none is given,
	 *   one will be created and appended to the document body.
	 * @param {Object=} opt_data Data to be passed to the soy template when it's called.
	 * @return {!Component} The component that was created for this action. Contains
	 *   references to components that were rendered by the given template function.
	 */
	static renderFromTemplate(templateFn, opt_element, opt_data) {
		return SoyRenderer.createComponentFromTemplate(templateFn, opt_element, opt_data).render();
	}

	/**
	 * Renders the specified template.
	 * @param {!function()} templateFn
	 * @param {Object=} opt_data
	 * @return {string} The template's result content.
	 * @protected
	 */
	renderTemplate_(templateFn, opt_data) {
		SoyAop.startInterception(this.handleInterceptedCall_.bind(this));
		templateFn = SoyAop.getOriginalFn(templateFn);
		var content = templateFn(opt_data || this.buildTemplateData_(), null, ijData).content;
		SoyAop.stopInterception();
		return content;
	}

	/**
	 * Renders the template with the specified name.
	 * @param {string} templateComponentName
	 * @param {string} templateName
	 * @param {Object=} opt_data
	 * @return {string} The template's result content.
	 * @protected
	 */
	renderTemplateByName_(templateComponentName, templateName, opt_data) {
		var elementTemplate = SoyTemplates.get(templateComponentName, templateName);
		if (core.isFunction(elementTemplate)) {
			return this.renderTemplate_(elementTemplate, opt_data);
		}
	}

	/**
	 * Sanitizes the given html string, so it can skip escaping when passed to a
	 * soy template.
	 * @param {string} html
	 * @return {soydata.SanitizedHtml}
	 */
	static sanitizeHtml(html) {
		return soydata.VERY_UNSAFE.ordainSanitizedHtml(html);
	}

	/**
	 * Sets the injected data object that should be passed to templates.
	 * @param {Object} data
	 */
	static setInjectedData(data) {
		ijData = data || {};
	}
}

var originalSanitizedHtmlFromFn = soydata.SanitizedHtml.from;
soydata.SanitizedHtml.from = function(value) {
	if (value && value.contentKind === 'HTML') {
		value = SoyRenderer.sanitizeHtml(value.content);
	}
	return originalSanitizedHtmlFromFn(value);
};


export default SoyRenderer;
