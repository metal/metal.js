'use strict';

import core from '../core';
import dom from '../dom/dom';
import object from '../object/object';
import Component from '../component/Component';
import ComponentRegistry from '../component/ComponentRegistry';
import ComponentRenderer from '../component/ComponentRenderer';
import SoyAop from '../soy/SoyAop';

// The injected data that will be passed to soy templates.
var ijData = {};

/**
 * A `ComponentRenderer` that enables components to be rendered via soy templates. It
 * automatically creates surfaces named after each template and uses template params
 * as render attributes. That means that when an attribute value changes, the templates
 * that have a parameter with the same name will be automatically rendered again.
 * @extends {ComponentRenderer}
 */
class SoyRenderer extends ComponentRenderer {
	/**
	 * Adds surfaces from the soy templates.
	 * @param {!Component} component
	 * @protected
	 */
	static addSurfacesFromTemplates_(component) {
		var name = component.getName();
		var templates = ComponentRegistry.Templates[name] || {};
		var templateNames = Object.keys(templates);
		for (var i = 0; i < templateNames.length; i++) {
			var templateName = templateNames[i];
			var templateFn = SoyAop.getOriginalFn(templates[templateName]);
			if (SoyRenderer.isSurfaceTemplate_(templateName, templateFn)) {
				var surfaceId = templateName === 'content' ? component.id : templateName;
				component.addSurface(surfaceId, {
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
	 * @param {!Component} component
	 * @return {!Object}
	 * @protected
	 */
	static buildTemplateData_(component) {
		var names = component.getAttrNames().filter(function(name) {
			// Get all attribute values except for "element", since it helps performance and this
			// attribute shouldn't be referenced inside a soy template anyway.
			return name !== 'element';
		});
		var surface = component.getSurface(component.id);
		var data = (surface && surface.componentData) ? surface.componentData : {};
		return object.mixin(data, component.getAttrs(names));
	}

	/**
	 * Creates and instantiates a component that has the given soy template function as its
	 * main content template. All keys present in the config object, if one is given, will be
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
		ComponentRegistry.Templates[name] = {
			content: function(opt_attrs, opt_ignored, opt_ijData) {
				return SoyAop.getOriginalFn(templateFn)(data, opt_ignored, opt_ijData);
			}
		};
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
	 * @static
	 */
	static decorateFromTemplate(templateFn, opt_element, opt_data) {
		return SoyRenderer.createComponentFromTemplate(templateFn, opt_element, opt_data).decorate();
	}

	/**
	 * Generates the id for a surface that was found by a soy template call.
	 * @param {!Component} component
	 * @param {string} parentSurfaceId The id of the parent surface, or undefined
	 *   if there is none.
	 * @param {!Object} data The placeholder data registered for this surface.
	 * @return {string} The generated id.
	 * @override
	 */
	static generateSurfaceElementId(component, parentSurfaceId, data) {
		if (data.templateName &&
			parentSurfaceId === component.id &&
			!SoyRenderer.firstSurfaceFound_[data.templateName]) {
			SoyRenderer.firstSurfaceFound_[data.templateName] = true;
			return component.prefixSurfaceId(data.templateName);
		} else {
			return component.generateSurfaceElementId(parentSurfaceId);
		}
	}

	/**
	 * Renders the appropriate soy template for the specified surface.
	 * @param {!Object} surface The surface configuration.
	 * @param {!Component} component The component instance.
	 * @param {string=} opt_skipContents True if only the element's tag needs to be rendered.
	 * @return {string}
	 * @override
	 */
	static getSurfaceContent(surface, component, opt_skipContents) {
		if (surface.surfaceElementId === component.id) {
			if (!surface.renderAttrs) {
				this.addSurfacesFromTemplates_(component);
			}
			SoyRenderer.firstSurfaceFound_ = {};
		}

		SoyRenderer.surfaceBeingRendered_ = surface.surfaceElementId;
		SoyRenderer.skipInnerCalls_ = SoyRenderer.skipInnerCalls_ || opt_skipContents;

		var data = surface.templateData;
		surface.templateData = null;
		var content = SoyRenderer.renderTemplateByName_(
			component,
			surface.templateComponentName,
			surface.templateName,
			data
		);

		SoyRenderer.surfaceBeingRendered_ = null;
		SoyRenderer.skipInnerCalls_ = false;
		return content;
	}

	/**
	 * Handles a call to the SoyRenderer component template.
	 * @param {!Component} component The component that the call was made for.
	 * @param {string} componentName The component's name.
	 * @param {Object} data The data the template was called with.
	 * @return {string} A placeholder to be rendered instead of the content the template
	 *   function would have returned.
	 * @protected
	 */
	static handleComponentCall_(component, componentName, data) {
		var surfaceData = {
			componentName: componentName
		};
		var id = (data || {}).id;
		if (!id) {
			id = SoyRenderer.generateSurfaceElementId(component, SoyRenderer.surfaceBeingRendered_, surfaceData);
		}
		surfaceData.componentData = SoyRenderer.buildComponentConfigData_(id, data);
		return component.buildPlaceholder(id, surfaceData);
	}

	/**
	 * Handles a call to a soy template.
	 * @param {!Component} component The component that the call was made for.
	 * @param {string} templateComponentName The name of the component that this template was belongs to.
	 * @param {string} templateName The name of this template.
	 * @param {!function()} originalFn The original template function that was intercepted.
	 * @param {!Object} data The data the template was called with.
	 * @param {*} opt_ignored
	 * @param {Object} opt_ijData Template injected data object.
	 * @return {string}
	 * @protected
	 */
	static handleInterceptedCall_(component, templateComponentName, templateName, originalFn, data, opt_ignored, opt_ijData) {
		if (SoyRenderer.skipInnerCalls_) {
			return '';
		} else if (templateName === 'content') {
			return this.handleComponentCall_.call(this, component, templateComponentName, data);
		} else {
			return this.handleSurfaceCall_.call(this, component, templateComponentName, templateName, originalFn, data, opt_ignored, opt_ijData);
		}
	}

	/**
	 * Handles a call to the SoyRenderer surface template.
	 * @param {!Component} component
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
	static handleSurfaceCall_(component, templateComponentName, templateName, originalFn, data, opt_ignored, opt_ijData) {
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
			surfaceElementId = component.getSurfaceElementId(data.surfaceId.toString());
		} else {
			if (originalFn.private) {
				return originalFn.call(null, data, opt_ignored, opt_ijData);
			}
			surfaceElementId = SoyRenderer.generateSurfaceElementId(component, SoyRenderer.surfaceBeingRendered_, surfaceData);
		}
		return component.buildPlaceholder(surfaceElementId, surfaceData);
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
	 * @static
	 */
	static renderFromTemplate(templateFn, opt_element, opt_data) {
		return SoyRenderer.createComponentFromTemplate(templateFn, opt_element, opt_data).render();
	}

	/**
	 * Renders the specified template.
	 * @param {!Component} component
	 * @param {!function()} templateFn
	 * @param {Object=} opt_data
	 * @return {string} The template's result content.
	 * @protected
	 */
	static renderTemplate_(component, templateFn, opt_data) {
		SoyAop.startInterception(SoyRenderer.handleInterceptedCall_.bind(SoyRenderer, component));
		templateFn = SoyAop.getOriginalFn(templateFn);
		var content = templateFn(opt_data || SoyRenderer.buildTemplateData_(component), null, ijData).content;
		SoyAop.stopInterception();
		return content;
	}

	/**
	 * Renders the template with the specified name.
	 * @param {!Component} component
	 * @param {string} templateComponentName
	 * @param {string} templateName
	 * @param {Object=} opt_data
	 * @return {string} The template's result content.
	 * @protected
	 */
	static renderTemplateByName_(component, templateComponentName, templateName, opt_data) {
		var elementTemplate;
		var componentTemplates = ComponentRegistry.Templates[templateComponentName];
		if (componentTemplates) {
			elementTemplate = componentTemplates[templateName];
		}

		if (core.isFunction(elementTemplate)) {
			return SoyRenderer.renderTemplate_(component, elementTemplate, opt_data);
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
