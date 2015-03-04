'use strict';

import core from '../core';
import dom from '../dom/dom';
import object from '../object/object';
import Component from '../component/Component';
import DomVisitor from '../dom/DomVisitor';
import EventsCollector from '../component/EventsCollector';

import './SoyComponent.soy';

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
     * Holds events that were listened through the element.
     * @type {EventHandler}
     * @protected
     */
    this.eventsCollector_ = null;

    core.mergeSuperClassesProperty(this.constructor, 'TEMPLATES', this.mergeTemplates_);
  }

  /**
   * @inheritDoc
   * @override
   */
  attach(opt_parentElement, opt_siblingElement) {
    var eventsCollector = this.getEventsCollector_();
    eventsCollector.detachAllListeners();
    DomVisitor.visit(this.element)
      .addHandler(eventsCollector.attachListeners.bind(eventsCollector))
      .start();
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
      return surfaceTemplate(this).content;
    }
    else {
      return super.getSurfaceContent_(surfaceId);
    }
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
   * specified events by the user in the template.
   * @override
   */
  renderInternal() {
    var elementTemplate = this.constructor.TEMPLATES_MERGED.element;
    if (core.isFunction(elementTemplate)) {
      dom.append(this.element, elementTemplate(this).content);
    }
  }

  /**
   * Replaces the content of a surface with a new one.
   * @param {string} surfaceId The surface id.
   * @param {Object|string} content The content to be rendered.
   * @protected
   * @override
   */
  replaceSurfaceContent_(surfaceId, content) {
    var frag = dom.buildFragment(content);
    if (this.inDocument) {
      var elementId = this.makeSurfaceId_(surfaceId);
      var eventsCollector = this.getEventsCollector_();
      eventsCollector.detachListeners(elementId);
      DomVisitor.visit(frag)
        .addHandler(eventsCollector.attachListeners.bind(eventsCollector))
        .start();
    }
    super.replaceSurfaceContent_(surfaceId, frag);
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
