'use strict';

import core from '../core';
import dom from '../dom/dom';
import object from '../object/object';
import Component from '../component/Component';
import ComponentRegistry from '../component/ComponentRegistry';
import SoyComponentAop from '../soy/SoyComponentAop';

// The injected data that will be passed to soy templates.
var ijData = {};

/**
 * Special Component class that handles a better integration between soy templates
 * and the components. It allows for automatic rendering of surfaces that have soy
 * templates defined with their names, skipping the call to `getSurfaceContent`.
 * @param {Object} opt_config An object with the initial values for this component's
 *   attributes.
 * @constructor
 * @extends {Component}
 */
class SoyComponent extends Component {
	constructor(opt_config) {
		super(opt_config);

		/**
		 * Flags indicating which surface names have already been found on this component's content.
		 * @type {!Object<string, boolean>}
		 * @protected
		 */
		this.firstSurfaceFound_ = {};

		/**
		 * Indicates which surface is currently being rendered, or null if none is.
		 * @type {boolean}
		 * @protected
		 */
		this.surfaceBeingRendered_ = null;

		/**
		 * Flag indicating if inner calls to templates should be skipped.
		 * @type {boolean}
		 * @protected
		 */
		this.skipInnerCalls_ = false;
	}

	/**
	 * Adds surfaces for each registered template that is not named `element`.
	 * @protected
	 */
	addSurfacesFromTemplates_() {
		var templates = ComponentRegistry.Templates[this.constructor.NAME] || {};
		var templateNames = Object.keys(templates);
		for (var i = 0; i < templateNames.length; i++) {
			var templateName = templateNames[i];
			var templateFn = SoyComponentAop.getOriginalFn(templates[templateName]);
			if (this.isSurfaceTemplate_(templateName, templateFn)) {
				var surface = this.getSurface(templateName);
				if (!surface) {
					this.addSurface(templateName, {
						renderAttrs: templateFn.params,
						templateComponentName: this.constructor.NAME,
						templateName: templateName
					});
				}
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
	buildComponentConfigData_(id, templateData) {
		var config = {
			id: id
		};
		for (var key in templateData) {
			config[key] = templateData[key];
		}
		return config;
	}

	/**
	 * Overrides the original method from `Component` to include renderAttrs extracted
	 * from the sou template.
	 * @return {!Object}
	 */
	buildElementSurfaceData_() {
		var data = super.buildElementSurfaceData_();
		var templates = ComponentRegistry.Templates[this.constructor.NAME] || {};
		if (templates.content) {
			data.renderAttrs = SoyComponentAop.getOriginalFn(templates.content).params;
		}
		return data;
	}

	/**
	 * Builds the data object that should be passed to a template from this component.
	 * @return {!Object}
	 * @protected
	 */
	buildTemplateData_() {
		var names = this.getAttrNames().filter(function(name) {
			// Get all attribute values except for "element", since it helps performance and this
			// attribute shouldn't be referenced inside a soy template anyway.
			return name !== 'element';
		});
		var surface = this.getSurface(this.id);
		var data = (surface && surface.componentData) ? surface.componentData : {};
		return object.mixin(data, this.getAttrs(names));
	}

	/**
	 * Creates and instantiates a component that has the given soy template function as its
	 * main content template. All keys present in the config object, if one is given, will be
	 * attributes of this component, and the object itself will be passed to the constructor.
	 * @param {!function()} templateFn
	 * @param {(Element|string)=} opt_element The element that should be decorated. If none is given,
	 *   one will be created and appended to the document body.
	 * @param {Object=} opt_data Data to be passed to the soy template when it's called.
	 * @return {!SoyComponent}
	 * @static
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
		class TemplateComponent extends SoyComponent {
		}
		ComponentRegistry.register(name, TemplateComponent);
		ComponentRegistry.Templates[name] = {
			content: function(opt_attrs, opt_ignored, opt_ijData) {
				return SoyComponentAop.getOriginalFn(templateFn)(data, opt_ignored, opt_ijData);
			}
		};
		SoyComponentAop.registerTemplates(name);
		return new TemplateComponent(data);
	}

	/**
	 * Overrides the original method from `Component` to add more behavior that should
	 * happen before the creation lifecycle of the component.
	 * @protected
	 * @override
	 */
	created_() {
		this.addSurfacesFromTemplates_();
		super.created_();
	}

	/**
	 * Decorates html rendered by the given soy template function, instantiating any referenced
	 * components in it.
	 * @param {!function()} templateFn
	 * @param {(Element|string)=} opt_element The element that should be decorated. If none is given,
	 *   one will be created and appended to the document body.
	 * @param {Object=} opt_data Data to be passed to the soy template when it's called.
	 * @return {!SoyComponent} The component that was created for this action. Contains
	 *   references to components that were rendered by the given template function.
	 * @static
	 */
	static decorateFromTemplate(templateFn, opt_element, opt_data) {
		return SoyComponent.createComponentFromTemplate(templateFn, opt_element, opt_data).decorate();
	}

	/**
	 * Generates the id for a surface that was found by a soy template call.
	 * @param {string?} parentSurfaceId The id of the parent surface, or undefined
	 *   if there is none.
	 * @param {!Object} data The placeholder data registered for this surface.
	 * @return {string} The generated id.
	 * @override
	 */
	generateSurfaceElementId_(parentSurfaceId, data) {
		if (data.templateName &&
			!parentSurfaceId &&
			!this.firstSurfaceFound_[data.templateName]) {
			this.firstSurfaceFound_[data.templateName] = true;
			return this.prefixSurfaceId_(data.templateName);
		} else {
			return super.generateSurfaceElementId_(parentSurfaceId);
		}
	}

	/**
	 * Gets the content that should be rendered in the component's main element by
	 * rendering the `content` soy template.
	 * @return {?string} The template's result content, or undefined if the
	 *   template doesn't exist.
	 */
	getElementContent() {
		this.firstSurfaceFound_ = {};
		this.surfaceBeingRendered_ = null;
		return this.renderTemplateByName_(this.constructor.NAME, 'content');
	}

	/**
	 * Makes the default behavior of rendering surfaces automatically render the
	 * appropriate soy template when one exists.
	 * @param {string} surfaceId The surface id.
	 * @param {string} surfaceElementId The surface element id.
	 * @return {Object|string} The content to be rendered.
	 * @override
	 */
	getSurfaceContent(surfaceId, surfaceElementId) {
		var surface = this.getSurface(surfaceId);
		var data = surface.templateData;
		surface.templateData = null;
		this.surfaceBeingRendered_ = surfaceElementId;
		return this.renderTemplateByName_(surface.templateComponentName, surface.templateName, data);
	}

	/**
	 * Handles a call to the SoyComponent component template.
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
		var id = (data || {}).id || this.generateSurfaceElementId_(this.surfaceBeingRendered_, surfaceData);
		surfaceData.componentData = this.buildComponentConfigData_(id, data);
		return this.buildPlaceholder(id, surfaceData);
	}

	/**
	 * Handles a call to the soy function for getting delegate functions.
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
		} else if (templateName === 'content') {
			return this.handleComponentCall_.call(this, templateComponentName, data);
		} else {
			return this.handleSurfaceCall_.call(this, templateComponentName, templateName, originalFn, data, opt_ignored, opt_ijData);
		}
	}

	/**
	 * Handles a call to the SoyComponent surface template.
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
		if (core.isDefAndNotNull(data.surfaceId)) {
			surfaceElementId = this.getSurfaceElementId_(data.surfaceId.toString());
		} else {
			if (originalFn.private) {
				return originalFn.call(null, data, opt_ignored, opt_ijData);
			}
			surfaceElementId = this.generateSurfaceElementId_(this.surfaceBeingRendered_, surfaceData);
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
	isSurfaceTemplate_(templateName, templateFn) {
		return templateName !== 'content' && templateName.substr(0, 13) !== '__deltemplate' && !templateFn.private;
	}

	/**
	 * Renders the given soy template function, instantiating any referenced components in it.
	 * @param {!function()} templateFn
	 * @param {(Element|string)=} opt_element The element that should be decorated. If none is given,
	 *   one will be created and appended to the document body.
	 * @param {Object=} opt_data Data to be passed to the soy template when it's called.
	 * @return {!SoyComponent} The component that was created for this action. Contains
	 *   references to components that were rendered by the given template function.
	 * @static
	 */
	static renderFromTemplate(templateFn, opt_element, opt_data) {
		return SoyComponent.createComponentFromTemplate(templateFn, opt_element, opt_data).render();
	}

	/**
	 * Renders the specified template.
	 * @param {!function()} templateFn
	 * @param {Object=} opt_data
	 * @return {string} The template's result content.
	 */
	renderTemplate_(templateFn, opt_data) {
		SoyComponentAop.startInterception(this.handleInterceptedCall_.bind(this));
		templateFn = SoyComponentAop.getOriginalFn(templateFn);
		var content = templateFn(opt_data || this.buildTemplateData_(), null, ijData).content;
		SoyComponentAop.stopInterception();
		return content;
	}

	/**
	 * Renders the template with the specified name.
	 * @param {string} templateComponentName
	 * @param {string} templateName
	 * @param {Object=} opt_data
	 * @return {string} The template's result content.
	 */
	renderTemplateByName_(templateComponentName, templateName, opt_data) {
		var elementTemplate;
		var componentTemplates = ComponentRegistry.Templates[templateComponentName];
		if (componentTemplates) {
			elementTemplate = componentTemplates[templateName];
		}

		if (core.isFunction(elementTemplate)) {
			return this.renderTemplate_(elementTemplate, opt_data);
		}
	}

	/**
	 * Sanitizes the given html string, so it can skip escaping when passed to a
	 * soy template.
	 * @param {string} html
	 * @return {soydata.SanitizedHtml}
	 * @static
	 */
	static sanitizeHtml(html) {
		return soydata.VERY_UNSAFE.ordainSanitizedHtml(html);
	}

	/**
	 * Sets the injected data object that should be passed to templates.
	 * @param {Object} data
	 * @static
	 */
	static setInjectedData(data) {
		ijData = data || {};
	}

	/**
	 * Overrides the original method from `Component` so only the outer soy
	 * template returns content, as we only need to render the parent tag here.
	 * @return {!Element}
	 * @protected
	 * @override
	 */
	valueElementFn_() {
		this.skipInnerCalls_ = true;
		var element = super.valueElementFn_();
		this.skipInnerCalls_ = false;
		return element;
	}
}

var originalSanitizedHtmlFromFn = soydata.SanitizedHtml.from;
soydata.SanitizedHtml.from = function(value) {
	if (value && value.contentKind === 'HTML') {
		value = SoyComponent.sanitizeHtml(value.content);
	}
	return originalSanitizedHtmlFromFn(value);
};


export default SoyComponent;
