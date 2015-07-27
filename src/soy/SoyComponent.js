'use strict';

import core from '../core';
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

		this.addSurfacesFromTemplates_(opt_config);

		/**
		 * Indicates which surface is currently being rendered, or null if none is.
		 * @type {boolean}
		 * @protected
		 */
		this.surfaceBeingRendered_ = null;

		/**
		 * Flags indicating which surface names have already been found on this component's content.
		 * @type {!Object<string, boolean>}
		 * @protected
		 */
		this.firstSurfaceFound_ = {};

		/**
		 * Holds the data that should be passed to the next template call for a surface,
		 * mapped by surface id.
		 * @type {!Object<string, Object>}
		 * @protected
		 */
		this.nextSurfaceCallData_ = {};
	}

	/**
	 * Adds surfaces for each registered template that is not named `element`.
	 * @param {Object=} opt_config Optional component configuration.
	 * @protected
	 */
	addSurfacesFromTemplates_(opt_config) {
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
					}, opt_config);
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
	 * Adds the template name to the creation data for placeholder surfaces.
	 * @param {string} type The surface type (either "s" or "c").
	 * @param {string} extra String with extra information about the surface.
	 * @return {!Object}
	 * @protected
	 */
	buildPlaceholderSurfaceData_(type, extra) {
		var data = super.buildPlaceholderSurfaceData_(type, extra);
		if (type === Component.SurfaceType.NORMAL) {
			var split = extra.split('.');
			data.templateComponentName = split[0];
			data.templateName = split[1];
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
		return object.mixin(
			Component.componentsCollector.getNextComponentData(this.id),
			this.getAttrs(names)
		);
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
		var name = 'TemplateComponent' + core.getUid();
		class TemplateComponent extends SoyComponent {
		}
		ComponentRegistry.register(name, TemplateComponent);
		ComponentRegistry.Templates[name] = {
			content: function(opt_attrs, opt_ignored, opt_ijData) {
				return SoyComponentAop.getOriginalFn(templateFn)(opt_data || {}, opt_ignored, opt_ijData);
			}
		};
		SoyComponentAop.registerTemplates(name);
		return new TemplateComponent({
			element: opt_element
		});
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
	 * @param {string} templateComponentName
	 * @param {string} templateName
	 * @return {string}
	 */
	generateSoySurfaceId_(templateComponentName, templateName) {
		if (!this.surfaceBeingRendered_ &&
			!this.firstSurfaceFound_[templateName] &&
			templateComponentName === this.constructor.NAME) {
			this.firstSurfaceFound_[templateName] = true;
			return templateName;
		} else {
			return this.generateSurfaceId_(Component.SurfaceType.NORMAL, this.surfaceBeingRendered_);
		}
	}

	/**
	 * Gets the content that should be rendered in the component's main element by
	 * rendering the `content` soy template.
	 * @return {?string} The template's result content, or undefined if the
	 *   template doesn't exist.
	 */
	getElementContent() {
		this.surfaceBeingRendered_ = null;
		return this.renderTemplateByName_(this.constructor.NAME, 'content');
	}

	/**
	 * Makes the default behavior of rendering surfaces automatically render the
	 * appropriate soy template when one exists.
	 * @param {string} surfaceId The surface id.
	 * @return {Object|string} The content to be rendered.
	 * @override
	 */
	getSurfaceContent(surfaceId) {
		var surface = this.getSurface(surfaceId);
		var data = this.nextSurfaceCallData_[surfaceId];
		this.nextSurfaceCallData_[surfaceId] = null;
		this.surfaceBeingRendered_ = surfaceId;
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
		var id = (data || {}).id || this.generateSurfaceId_(Component.SurfaceType.COMPONENT, this.surfaceBeingRendered_);
		Component.componentsCollector.setNextComponentData(id, this.buildComponentConfigData_(id, data));
		return '%%%%~c-' + id + ':' + componentName + '~%%%%';
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
		if (templateName === 'content') {
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
		var surfaceId = data.surfaceId;
		if (!core.isDefAndNotNull(surfaceId)) {
			if (originalFn.private) {
				return originalFn.call(null, data, opt_ignored, opt_ijData);
			}
			surfaceId = this.generateSoySurfaceId_(templateComponentName, templateName);
		}
		this.nextSurfaceCallData_[surfaceId] = data;
		return '%%%%~s-' + surfaceId + ':' + templateComponentName + '.' + templateName + '~%%%%';
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
}

var originalSanitizedHtmlFromFn = soydata.SanitizedHtml.from;
soydata.SanitizedHtml.from = function(value) {
	if (value && value.contentKind === 'HTML') {
		value = SoyComponent.sanitizeHtml(value.content);
	}
	return originalSanitizedHtmlFromFn(value);
};


export default SoyComponent;
