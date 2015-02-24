'use strict';

import core from '../core';
import dom from '../dom/dom';
import EventHandler from '../events/EventHandler';
import object from '../object/object';
import Component from '../component/Component';

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
 * Attaches a list of events to component's element.
 * @param {Array} events List of events which should be attached.
 * @protected
 */
SoyComponent.prototype.attachComponentListeners_ = function(events) {
  if (events && events.length) {
    this.componentListeners_ = this.attachListeners_(events);
  }
};

/**
 * Attaches a list of events to a surface.
 * @param {String} surfaceId The id of the surface to which the events should be attached.
 * @param {Array} events List of events which have to be attached.
 */
SoyComponent.prototype.attachSurfaceListeners_ = function(surfaceId, events) {
  if (events && events.length) {
    this.surfaceListeners_ = this.surfaceListeners_ || {};

    this.surfaceListeners_[surfaceId] = this.attachListeners_(events);
  }
};

/**
 * Attaches a list of events to an element.
 * @param {Array} events List of events which should be attached.
 * @return {EventHandler} Instance of {@link EventHandler} which contains the attached events.
 */
SoyComponent.prototype.attachListeners_ = function(events) {
  var eventHandler = new EventHandler();

  for (var i = 0; i < events.length; i++) {
    var event = events[i];

    eventHandler.add(
      this.delegate(event.name, event.element, core.bind(this[event.value], this))
    );
  }

  return eventHandler;
};

/**
 * Detaches any attached event listeners to the component and the surfaces.
 * @override
 * @chainable
 */
SoyComponent.prototype.detach = function() {
  SoyComponent.base(this, 'detach');

  this.detachComponentListeners_();
  this.detachAllSurfacesListeners_();
  return this;
};

/**
 * Removes all previously attached event listeners to the component.
 * @protected
 */
SoyComponent.prototype.detachComponentListeners_ = function() {
  if (this.componentListeners_) {
    this.componentListeners_.removeAllListeners();

    this.componentListeners_ = null;
  }
};

/**
 * Removes all previously attached event listeners to all surfaces.
 * @protected
 */
SoyComponent.prototype.detachAllSurfacesListeners_ = function() {
  for (var surface in this.surfaceListeners_) {
    if (Object.prototype.hasOwnProperty.call(this.surfaceListeners_, surface)) {
      this.detachSurfaceListeners_(surface);
    }
  }

  this.surfaceListeners_ = null;
};

/**
 * Removes all previously attached event listeners to a surface.
 * @param {string} surfaceId The id of the surface which listeners should be removed.
 * @protected
 */
SoyComponent.prototype.detachSurfaceListeners_ = function(surfaceId) {
  if (this.surfaceListeners_ && this.surfaceListeners_[surfaceId]) {
    this.surfaceListeners_[surfaceId].removeAllListeners();
  }
};

/**
 * Extracts and collects all events from a document element and its children.
 * @param {Element} element The element from which the events should be extracted.
 * @return {Array} The collected list of events.
 */
SoyComponent.prototype.extractEvents_ = function(element) {
  var events = [];

  for (var i = 0; i < element.childNodes.length; i++) {
    events = events.concat(this.extractEvents_(element.childNodes[i]));
  }

  events = events.concat(this.retrieveEvents_(element));

  return events;
};

/**
 * Checks if an attribute is an event attribute and if so,
 * stores its name, value and the element to which it belongs to an object,
 * then removes the attribute from the element.
 * @param {Element} element The element to which the attribute belongs.
 * @param {Attribute} attribute The attribute which have to be processed.
 * @return {Object} The event data.
 */
SoyComponent.prototype.getEventAttributeData_ = function(element, attribute) {
  var eventData;

  if (attribute.name.indexOf('on') === 0) {
    var eventName = attribute.name.substring(2);

    if (dom.supportsEvent(element, eventName)) {
      eventData = {
        element: element,
        name: eventName,
        value: attribute.value
      };

      element.removeAttribute(attribute.name);
    }
  }

  return eventData;
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
  } else {
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
    var domFragment = dom.buildFragment(elementTemplate(this).content);
    var events = this.extractEvents_(domFragment);

    this.attachComponentListeners_(events);

    dom.append(this.element, domFragment);

    this.wasRendered_ = true;
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
  var el = this.getSurfaceElement(surfaceId);

  var domFragment = dom.buildFragment(content);
  var events = this.extractEvents_(domFragment);

  this.detachSurfaceListeners_(surfaceId);
  this.attachSurfaceListeners_(surfaceId, events);

  dom.removeChildren(el);
  dom.append(el, domFragment);
};

/**
 * Processes the attributes of an element and stores the found attribute events to an array.
 * @param {Element} element The element which should be processed.
 * @return {Array} Array of events.
 * @protected
 */
SoyComponent.prototype.retrieveEvents_ = function(element) {
  var events = [];

  if (!element.attributes) {
    return events;
  }

  for (var i = element.attributes.length - 1; i >= 0; i--) {
    var data = this.getEventAttributeData_(element, element.attributes[i]);

    if (data) {
      events.push(data);
    }
  }

  return events;
};

export default SoyComponent;