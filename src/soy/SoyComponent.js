'use strict';

import core from '../core';
import dom from '../dom/dom';
import Component from '../component/Component';

/**
 * We need to listen to calls to soy deltemplates so we can use them to
 * properly instantiate and update child components defined through soy.
 * TODO: Switch to using proper AOP.
 */
var originalGetDelegateFn = soy.$$getDelegateFn;

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

		core.mergeSuperClassesProperty(this.constructor, 'TEMPLATES', this.mergeObjects_);
		this.addSurfacesFromTemplates_();

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
	 * @protected
	 */
	addSurfacesFromTemplates_() {
		var templates = this.constructor.TEMPLATES_MERGED;
		var templateNames = Object.keys(templates);
		for (var i = 0; i < templateNames.length; i++) {
			var templateName = templateNames[i];
			if (templateName !== 'content' && templateName.substr(0, 13) !== '__deltemplate') {
				var surface = this.getSurface(templateName);
				if (!surface) {
					this.addSurface(templateName, {
						renderAttrs: templates[templateName].params,
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
		var config = {id: id};
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
			data.templateName = extra;
		}
		return data;
	}

	/**
	 * Generates the id for a surface that was found by a soy template call.
	 * @param {string} templateName
	 * @return {string}
	 */
	generateSoySurfaceId_(templateName) {
		if (!this.surfaceBeingRendered_ && !this.firstSurfaceFound_[templateName]) {
			this.firstSurfaceFound_[templateName] = true;
			return templateName;
		} else {
			return this.generateSurfaceId_(Component.SurfaceType.NORMAL, this.surfaceBeingRendered_);
		}
	}

	/**
	 * Overrides Component's original behavior so the component's html may be rendered
	 * by its template.
	 * @param {string} content
	 * @return {string}
	 * @override
	 */
	getComponentHtml(content) {
		return this.renderElementDelTemplate_(content);
	}

	/**
	 * Gets the content that should be rendered in the component's main element by
	 * rendering the `content` soy template.
	 * @return {?string} The template's result content, or undefined if the
	 *   template doesn't exist.
	 */
	getElementContent() {
		this.surfaceBeingRendered_ = null;
		return this.renderTemplateByName_('content', this);
	}

	/**
	 * Overrides Component's original behavior so surface's html may be rendered by
	 * their templates.
	 * @param {string} surfaceId
	 * @param {string} content
	 * @return {string}
	 */
	getNonComponentSurfaceHtml(surfaceId, content) {
		return this.renderElementDelTemplate_(content, surfaceId);
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
		return this.renderTemplateByName_(surface.templateName, data);
	}

	/**
	 * Handles a call to the soy function for getting delegate functions.
	 * @param {string} delTemplateId
	 * @return {!function}
	 * @protected
	 */
	handleGetDelegateFnCall_(delTemplateId) {
		var index = delTemplateId.indexOf('.');
		if (index === -1) {
			return this.handleTemplateCall_.bind(this, delTemplateId);
		} else {
			return this.handleSurfaceCall_.bind(this, delTemplateId.substr(index + 1));
		}
	}

	/**
	 * Handles a call to the SoyComponent surface template.
	 * @param {string} surfaceName The surface's name.
	 * @param {!Object} data The data the template was called with.
	 * @return {string} A placeholder to be rendered instead of the content the template
	 *   function would have returned.
	 * @protected
	 */
	handleSurfaceCall_(surfaceName, data) {
		var surfaceId = data.surfaceId || this.generateSoySurfaceId_(surfaceName);
		this.nextSurfaceCallData_[surfaceId] = data;
		return '%%%%~s-' + surfaceId + ':' + surfaceName + '~%%%%';
	}

	/**
	 * Handles a call to the SoyComponent component template.
	 * @param {string} componentName The component's name.
	 * @param {Object} data The data the template was called with.
	 * @return {string} A placeholder to be rendered instead of the content the template
	 *   function would have returned.
	 * @protected
	 */
	handleTemplateCall_(componentName, data) {
		var id = (data || {}).id || this.generateSurfaceId_(Component.SurfaceType.COMPONENT, this.surfaceBeingRendered_);
		Component.componentsCollector.setNextComponentData(id, this.buildComponentConfigData_(id, data));
		return '%%%%~c-' + id + ':' + componentName + '~%%%%';
	}

	/**
	 * Renders the element deltemplate for this component or for one of its surfaces.
	 * @param {?string} content
	 * @param {string=} opt_surfaceId
	 * @return {string}
	 */
	renderElementDelTemplate_(content, opt_surfaceId) {
		var templateName = this.constructor.NAME;
		if (opt_surfaceId) {
			templateName += '.' + this.getSurface(opt_surfaceId).templateName;
		}
		var templateFn = soy.$$getDelegateFn(templateName, 'element', true);
		var data = {
			elementClasses: this.elementClasses,
			elementContent: SoyComponent.sanitizeHtml(content || ''),
			id: this.id || this.makeId_(),
			surfaceId: opt_surfaceId
		};
		return templateFn(data, null, {}).content;
	}

	/**
	 * Renders the specified template.
	 * @param {!function()} templateFn
	 * @param {Object=} opt_data
	 * @return {string} The template's result content.
	 */
	renderTemplate_(templateFn, opt_data) {
		soy.$$getDelegateFn = this.handleGetDelegateFnCall_.bind(this);
		var content = templateFn(opt_data || this, null, {}).content;
		soy.$$getDelegateFn = originalGetDelegateFn; 
		return content;
	}

	/**
	 * Renders the template with the specified name.
	 * @param {string} templateName
	 * @param {Object=} opt_data
	 * @return {string} The template's result content.
	 */
	renderTemplateByName_(templateName, opt_data) {
		var elementTemplate = this.constructor.TEMPLATES_MERGED[templateName];
		if (core.isFunction(elementTemplate)) {
			return this.renderTemplate_(elementTemplate, opt_data);
		}
	}

	/**
	 * Sanitizes the given html string, so it can skip escaping when passed to a
	 * soy template.
	 * @param {string} html
	 * @return {soydata.SanitizedHtml}
	 * @protected
	 */
	static sanitizeHtml(html) {
		return soydata.VERY_UNSAFE.ordainSanitizedHtml(html);
	}

	/**
	 * Provides the default value for element attribute.
	 * @return {Element} The element.
	 * @protected
	 */
	valueElementFn_() {
		var rendered = this.getComponentHtml();
		if (rendered) {
			var frag = dom.buildFragment(rendered);
			var element = frag.childNodes[0];
			// Remove element from fragment, so it won't have a parent. Otherwise,
			// the `attach` method will think that the element has already been
			// attached.
			frag.removeChild(element);
			return element;
		}

		return super.valueElementFn_();
	}
}
/**
 * The soy templates for this component. Templates that have the same
 * name of a registered surface will be used for automatically rendering
 * it.
 * @type {Object<string, !function(Object):Object>}
 * @protected
 * @static
 */
SoyComponent.TEMPLATES = {};

export default SoyComponent;
