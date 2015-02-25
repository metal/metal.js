'use strict';

import core from '../core';
import dom from '../dom/dom';
import object from '../object/object';
import Component from '../component/Component';
import ComponentCollector from '../component/ComponentCollector';
import ComponentRegistry from '../component/ComponentRegistry';
import DomVisitor from '../dom/DomVisitor';
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
    super(opt_config);

    /**
     * Holds a `ComponentCollector` that will extract inner components.
     * @type {!ComponentCollector}
     * @protected
     */
    this.componentCollector_ = new ComponentCollector();

    /**
     * Holds the this component's child components.
     * @type {!Object<string, !Component>}
     * @protected
     */
    this.components_ = {};

    /**
     * Holds events that were listened through the element.
     * @type {!EventHandler}
     * @protected
     */
    this.eventsCollector_ = null;

    /**
     * Stores the arguments that were passed to the last call to the SoyComponent
     * template for each component instance (mapped by its ref).
     * @type {!Object}
     * @protected
     */
    this.lastComponentTemplateCall_ = {};

    core.mergeSuperClassesProperty(this.constructor, 'TEMPLATES', this.mergeTemplates_);
  }

  /**
   * @inheritDoc
   * @override
   */
  attach(opt_parentElement, opt_siblingElement) {
    var eventsCollector = this.getEventsCollector_();
    eventsCollector.detachAllListeners();

    var extractComponents = this.componentCollector_.extractComponents.bind(this.componentCollector_);
    DomVisitor.visit(this.element)
      .addHandler(eventsCollector.attachListeners.bind(eventsCollector))
      .addHandler(extractComponents, this.lastComponentTemplateCall_)
      .start();

    this.components_ = this.componentCollector_.getComponents();
    this.lastComponentTemplateCall_ = {};

    super.attach(opt_parentElement, opt_siblingElement);
    return this;
  }

  /**
   * @inheritDoc
   * @override
   */
  detach() {
    this.getEventsCollector_().detachAllListeners();
    super.detach();
    return this;
  }

  /**
   * Returns the events collector instance.
   * @return {EventCollector}
   */
  getEventsCollector_() {
    if (!this.eventsCollector_) {
      this.eventsCollector_ = new EventsCollector(this);
    }
    return this.eventsCollector_;
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
   * @return {string} The original return value of the template.
   */
  handleTemplateCall_(data) {
    this.lastComponentTemplateCall_[data.ref] = data;
    return originalTemplate.apply(originalTemplate, arguments);
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
   * Overrides the behavior of this method to automatically render the element
   * template if it's defined and to automatically attach listeners to all
   * specified events by the user in the template. Also handles any calls to
   * component templates.
   * @override
   */
  renderInternal() {
    var elementTemplate = this.constructor.TEMPLATES_MERGED.element;
    if (core.isFunction(elementTemplate)) {
      dom.append(this.element, this.renderTemplate_(elementTemplate));
    }
  }

  /**
   * Overrides the default behavior of `renderSurfaceContent` to also
   * handle calls to component templates done by the surface's template.
   * @param {string} surfaceId The surface id.
   * @param {Object|string} content The content to be rendered.
   * @override
   */
  renderSurfaceContent(surfaceId, content) {
    super.renderSurfaceContent(surfaceId, content);

    if (this.inDocument) {
      var eventsCollector = this.getEventsCollector_();
      eventsCollector.detachListeners(this.makeSurfaceId_(surfaceId));

      var visitor = DomVisitor.visit(this.getSurfaceElement(surfaceId))
        .addHandler(eventsCollector.attachListeners.bind(eventsCollector));

      if (this.getSurface(surfaceId).cacheMiss) {
        visitor.addHandler(
          this.componentCollector_.extractComponents.bind(this.componentCollector_),
          this.lastComponentTemplateCall_
        );
      } else {
        this.updateComponents_();
      }
      this.lastComponentTemplateCall_ = {};

      visitor.start();
      this.components_ = this.componentCollector_.getComponents();
    }
  }

  /**
   * Renders the specified template.
   * @param {!function()} templateFn [description]
   * @return {string} The template's result content.
   */
  renderTemplate_(templateFn) {
    ComponentRegistry.Templates.SoyComponent.component = this.handleTemplateCall_.bind(this);
    var content = templateFn(this, null, {}).content;
    ComponentRegistry.Templates.SoyComponent.component = originalTemplate;
    return content;
  }

  /**
   * Updates all inner components with their last template call data.
   * @protected
   */
  updateComponents_() {
    for (var ref in this.lastComponentTemplateCall_) {
      var data = this.lastComponentTemplateCall_[ref];
      this.components_[data.ref].setAttrs(data.data);
    }
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
