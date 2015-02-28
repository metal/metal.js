'use strict';

import core from '../core';
import dom from '../dom/dom';
import object from '../object/object';
import Component from '../component/Component';
import EventsCollector from '../component/EventsCollector';

/**
 * Special Component class that handles a better integration between soy templates
 * and the components. It allows for automatic rendering of surfaces that have soy
 * templates defined with their names, skipping the call to `getSurfaceContent`.
 * @param {Object} opt_config An object with the initial values for this component's
 *   attributes.
 * @constructor
 * @extends {Component}
 */
var SoyComponent = function(opt_config) {
  SoyComponent.base(this, 'constructor', opt_config);
  core.mergeSuperClassesProperty(this.constructor, 'TEMPLATES', this.mergeTemplates_);
};
core.inherits(SoyComponent, Component);

/**
 * The soy templates for this component. Templates that have the same
 * name of a registered surface will be used for automatically rendering
 * it.
 * @type {Object<string, !function(Object):Object>}
 * @protected
 * @static
 */
SoyComponent.TEMPLATES = {};

/**
 * Holds events that were listened through the element.
 * @type {EventHandler}
 */
SoyComponent.prototype.eventsCollector_ = null;

/**
 * @inheritDoc
 * @override
 */
SoyComponent.prototype.attach = function(opt_parentElement, opt_siblingElement) {
  this.getEventsCollector_().detachAllListeners();
  this.getEventsCollector_().collect(this.element.id, this.element);
  SoyComponent.base(this, 'attach', opt_parentElement, opt_siblingElement);
  return this;
};

/**
 * @inheritDoc
 * @override
 */
SoyComponent.prototype.detach = function() {
  this.getEventsCollector_().detachAllListeners();
  SoyComponent.base(this, 'detach');
  return this;
};

/**
 * Returns the events collector instance.
 * @return {EventCollector}
 */
SoyComponent.prototype.getEventsCollector_ = function() {
  if (!this.eventsCollector_) {
    this.eventsCollector_ = new EventsCollector(this);
  }
  return this.eventsCollector_;
};

/**
 * Overrides the default behavior so that this can automatically render
 * the appropriate soy template when one exists.
 * @param {string} surfaceId The surface id.
 * @return {Object|string} The content to be rendered.
 * @protected
 * @override
 */
SoyComponent.prototype.getSurfaceContent_ = function(surfaceId) {
  var surfaceTemplate = this.constructor.TEMPLATES_MERGED[surfaceId];
  if (core.isFunction(surfaceTemplate)) {
    return surfaceTemplate(this).content;
  }
  else {
    return SoyComponent.base(this, 'getSurfaceContent_', surfaceId);
  }
};

/**
 * Merges an array of values for the `TEMPLATES` property into a single object.
 * @param {!Array} values The values to be merged.
 * @return {!Object} The merged value.
 * @protected
 */
SoyComponent.prototype.mergeTemplates_ = function(values) {
  return object.mixin.apply(null, [{}].concat(values.reverse()));
};

/**
 * Overrides the behavior of this method to automatically render the element
 * template if it's defined and to automatically attach listeners to all
 * specified events by the user in the template.
 * @override
 */
SoyComponent.prototype.renderInternal = function() {
  var elementTemplate = this.constructor.TEMPLATES_MERGED.element;
  if (core.isFunction(elementTemplate)) {
    dom.append(this.element, elementTemplate(this).content);
  }
};

/**
 * Replaces the content of a surface with a new one.
 * @param {string} surfaceId The surface id.
 * @param {Object|string} content The content to be rendered.
 * @protected
 * @override
 */
SoyComponent.prototype.replaceSurfaceContent_ = function(surfaceId, content) {
  var frag = dom.buildFragment(content);
  if (this.inDocument) {
    var elementId = this.makeSurfaceId_(surfaceId);
    this.getEventsCollector_().detachListeners(elementId);
    this.getEventsCollector_().collect(elementId, frag);
  }
  SoyComponent.base(this, 'replaceSurfaceContent_', surfaceId, frag);
};

export default SoyComponent;
