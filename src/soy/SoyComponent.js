'use strict';

import array from '../array/array';
import core from '../core';
import dom from '../dom/dom';
import object from '../object/object';
import Component from '../component/Component';
import ComponentCollector from '../component/ComponentCollector';
import ComponentRegistry from '../component/ComponentRegistry';
import EventsCollector from '../component/EventsCollector';

import './SoyComponent.soy';

/**
 * We need to listen to calls to the SoyComponent template so we can use them to
 * properly instantiate and update child components defined through soy.
 * TODO: Switch to using proper AOP.
 */
var originalTemplate = ComponentRegistry.Templates.SoyComponent.component;

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
    core.mergeSuperClassesProperty(this.constructor, 'TEMPLATES', this.mergeTemplates_);
    super(opt_config);

    /**
     * Gets all nested components.
     * @type {!Array<!Component>}
     */
    this.components = {};

    /**
     * Helper responsible for extracting components from strings and config data.
     * @type {!ComponentCollector}
     * @protected
     */
    this.componentsCollector_ = new ComponentCollector();

    /**
     * Holds events that were listened through the element.
     * @type {!EventHandler}
     * @protected
     */
    this.eventsCollector_ = new EventsCollector(this);

    /**
     * The component that should receive extracted component references when a
     * soy template is called. Starts with this component instance, but can change
     * as nested templates are called.
     * @type {!Component}
     * @protected
     */
    this.parentComponent_ = this;

    /**
     * Holds the ids of the components that were most recently added via
     * `addComponentRef`. This object is cleared after the `attach` and
     * `renderSurfacesContent` methods are run.
     * @type {!Array<string>}
     * @protected
     */
    this.recentlyAddedComponents_ = [];

    this.addSurfacesFromTemplates_();
  }

  /**
   * Adds a component reference to the `components` variable.
   * @param {string} ref Key that should be used to reference the give component.
   * @param {!Component} component Component instance to be referenced.
   */
  addComponentRef(ref, component) {
    this.components[ref] = component;
    this.recentlyAddedComponents_.push(ref);
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
      if (templateName !== 'content' &&
        templateName.substr(0, 13) !== '__deltemplate') {

        var surface = this.getSurface(templateName);
        if (!surface) {
          this.addSurface(templateName, {
            renderAttrs: templates[templateName].params
          });
        }
      }
    }
  }

  /**
   * @inheritDoc
   * @override
   */
  attach(opt_parentElement, opt_siblingElement) {
    if (this.decorating_) {
      // We need to call the element soy template function when the component
      // is being decorated, even though we won't use its results. This call is
      // only needed in order for us to intercept the call data for nested components
      // that are outside surfaces.
      this.renderElementTemplate({skipSurfaceContents: true});
    }

    super.attach(opt_parentElement, opt_siblingElement);

    if (!this.wasRendered) {
      this.attachNestedComponents_();
    }

    this.attachInlineListeners_();

    return this;
  }

  /**
   * Attaches inline listeners to the main element.
   * @protected
   */
  attachInlineListeners_() {
    this.eventsCollector_.attachListeners(this.element.outerHTML);
  }

  /**
   * Attaches the given component at the position of the given placeholder.
   * @param {!Component} component
   * @param {!Element} placeholder
   * @protected
   */
  attachNestedComponent_(component, placeholder) {
    var replacedPlaceholder = false;
    if (placeholder !== component.element) {
      // If the component's element is not the placeholder, we need to replace
      // the placeholder with the real element.
      placeholder.parentNode.insertBefore(component.element, placeholder);
      placeholder.parentNode.removeChild(placeholder);
      replacedPlaceholder = true;
    }

    if (!component.wasRendered) {
      // If this component hasn't been rendered yet, we should do it now.
      if (replacedPlaceholder) {
        // If we had to replace the placeholder with the component's element,
        // we'll need to copy the html over so we don't have to run soy again
        // to render it.
        dom.append(component.element, placeholder.innerHTML);
      }
      component.decorateAsSubComponent();
    }
  }

  /**
   * Attaches recently added components to the dom.
   * @protected
   */
  attachNestedComponents_() {
    var element = this.element;
    var componentIds = this.recentlyAddedComponents_;
    for (var i = 0; i < componentIds.length; i++) {
      var id = componentIds[i];
      var placeholder = document.getElementById(id) || element.querySelector('#' + id);
      if (placeholder) {
        this.attachNestedComponent_(this.components[id], placeholder);
      }
    }
    this.recentlyAddedComponents_ = [];
  }

  /**
   * Builds the config data for a component from the data that was passed to its
   * soy template function.
   * @param {!Object} templateData
   * @return {!Object} The component's config data.
   * @protected
   */
  buildComponentConfigData_(templateData) {
    var config = {};
    for (var key in templateData) {
      var value = templateData[key];
      if (this.hasSubcomponents_(value)) {
        config[key] = this.componentsCollector_.extractComponentsFromString(value);
      } else {
        config[key] = templateData[key];
      }
    }
    return config;
  }

  /**
   * Builds the data object that should be passed to the real soy template function
   * for a component.
   * @param {!Object} data The original data passed to the template function.
   * @param {!Object} config The config data that was passed to the component's constructor.
   * @param {!Component} component The component that was extracted from the original
   *   template data.
   * @return {!Object}
   * @protected
   */
  buildTemplateData_(data, config, component) {
    var newData = {};
    for (var key in data) {
      if (key === 'id' || key === 'componentName' || config[key] !== data[key]) {
        // Pass down the original string value of attributes that are converted
        // into subcomponents, so the template can render it.
        newData[key] = data[key];
      } else {
        newData[key] = component[key];
      }
    }
    return newData;
  }

  /**
   * Decorates this component as a subcomponent, meaning that no rendering is
   * needed since it was already rendered by the parent component.
   */
  decorateAsSubComponent() {
    this.decoratingAsSubcomponent_ = true;

    this.syncAttrs_();
    this.attach();

    this.wasRendered = true;
    this.decoratingAsSubcomponent_ = false;
  }

  /**
   * @inheritDoc
   * @override
   */
  detach() {
    this.eventsCollector_.detachAllListeners();
    super.detach();
    return this;
  }

  /**
   * Overrides the default behavior so that this can automatically render
   * the appropriate soy template when one exists.
   * @param {string} surfaceId The surface id.
   * @return {Object|string} The content to be rendered.
   * @protected
   * @override
   */
  getSurfaceContent_(surfaceId) {
    var surfaceTemplate = this.constructor.TEMPLATES_MERGED[surfaceId];
    if (core.isFunction(surfaceTemplate)) {
      return this.renderTemplate_(surfaceTemplate);
    } else {
      return super.getSurfaceContent_(surfaceId);
    }
  }

  /**
   * Handles a call to the SoyComponent template.
   * @param {!Object} data The data the template was called with.
   * @param {(null|undefined)=} ignored Second argument for soy templates.
   * @param {Object.<string, *>=} ijData Optional injected data.
   * @return {string} The original return value of the template.
   * @protected
   */
  handleTemplateCall_(data, ignored, ijData) {
    var config  = this.buildComponentConfigData_(data);
    var component = this.componentsCollector_.createOrUpdateComponent(data.componentName, config);
    this.parentComponent_.addComponentRef(data.id, component);

    var prevParentComponent = this.parentComponent_;
    this.parentComponent_ = component;

    var newData = this.buildTemplateData_(data, config, component);
    var renderedTemplate = originalTemplate(newData, ignored, ijData);

    this.parentComponent_ = prevParentComponent;
    return renderedTemplate;
  }

  /**
   * Checks if the given value has subcomponents to be extracted.
   * @param {*} value
   * @return {boolean}
   * @protected
   */
  hasSubcomponents_(value) {
    return value instanceof soydata.SanitizedHtml && value.content.indexOf('data-component') !== -1;
  }

  /**
   * Merges an array of values for the `TEMPLATES` property into a single object.
   * @param {!Array} values The values to be merged.
   * @return {!Object} The merged value.
   * @protected
   */
  mergeTemplates_(values) {
    return object.mixin.apply(null, [{}].concat(values.reverse()));
  }

  /**
   * Renders this component's child components, if their placeholder is found.
   * @param {!Array<!Component>} children
   * @protected
   * TODO(edu): Re-think this part.
   */
  renderChildrenComponents_(children) {
    var placeholder = this.element.querySelector('#' + this.makeSurfaceId_('children-placeholder'));
    if (placeholder && children.length) {
      dom.removeChildren(placeholder);
      children.forEach(function(child) {
        if (child.wasRendered) {
          dom.append(placeholder, child.element);
        } else {
          child.render(placeholder);
        }
      });
    }
  }

  /**
   * Renders the main element's template.
   * @param {Object=} opt_injectedData
   * @return {?string} The template's result content, or undefined if the
   *   template doesn't exist.
   */
  renderElementTemplate(opt_injectedData) {
    var elementTemplate = this.constructor.TEMPLATES_MERGED.content;
    if (core.isFunction(elementTemplate)) {
      return this.renderTemplate_(elementTemplate, opt_injectedData);
    }
  }

  /**
   * Overrides the behavior of this method to automatically render the element
   * template if it's defined and to automatically attach listeners to all
   * specified events by the user in the template. Also handles any calls to
   * component templates.
   * @override
   */
  renderInternal() {
    var templateContent = this.renderElementTemplate();
    if (templateContent) {
      dom.append(this.element, templateContent);
    }
  }

  /**
   * @inheritDoc
   */
  renderSurfacesContent_(surfaces) {
    // If this component is still being rendered we shouldn't render
    // surfaces content or attach inline listeners, since these will
    // already be done for the entire content.
    if (this.inDocument || this.decorating_) {
      super.renderSurfacesContent_(surfaces);
    }
    if (this.inDocument) {
      this.attachNestedComponents_();
      this.attachInlineListeners_();
    }
  }

  /**
   * Renders the specified template.
   * @param {!function()} templateFn
   * @param {Object=} opt_injectedData
   * @return {string} The template's result content.
   */
  renderTemplate_(templateFn, opt_injectedData) {
    ComponentRegistry.Templates.SoyComponent.component = this.handleTemplateCall_.bind(this);
    var content = templateFn(this, null, opt_injectedData || {}).content;
    ComponentRegistry.Templates.SoyComponent.component = originalTemplate;
    return content;
  }

  /**
   * Syncs the component according to the new value of the `children` attribute.
   */
  syncChildren(newVal, prevVal) {
    if (!this.decoratingAsSubcomponent_ && !array.equal(newVal, prevVal || [])) {
      this.renderChildrenComponents_(newVal);
    }
  }

  /**
   * Provides the default value for element attribute.
   * @return {Element} The element.
   * @protected
   */
  valueElementFn_() {
    var templateFn = soy.$$getDelegateFn(this.constructor.NAME, 'element', true);
    var attrs = this.getAttrs();
    attrs.elementContent = '';
    attrs.id = attrs.id || this.makeId_();
    var rendered = templateFn(attrs, null, {}).content;
    if (!rendered) {
      return super.valueElementFn_();
    }

    var frag = dom.buildFragment(rendered);
    var element = frag.childNodes[0];

    // Remove element from fragment, so it won't have a parent. Otherwise,
    // the `attach` method will think that the element has already been
    // attached.
    frag.removeChild(element);

    return element;
  }

  /**
   * Overrides the default value function for the `id` attribute, so it will
   * handle the case where `element` is in the middle of its creation, which
   * means the id should be generated.
   * @return {string} The id.
   * @protected
   * @override
   */
  valueIdFn_() {
    if (!this.element) {
      return this.makeId_();
    }
    return super.valueIdFn_();
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
