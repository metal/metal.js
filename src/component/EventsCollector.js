'use strict';

import core from '../core';
import dom from '../dom/dom';
import Disposable from '../disposable/Disposable';
import EventHandler from '../events/EventHandler';

/**
 * Collects inline events from an passed element into a group. For each found
 * surface element a new group element will be created.
 * @param {Component} component
 * @constructor
 * @extends {Disposable}
 */
var EventsCollector = function(component) {
  if (!component) {
    throw new Error('The component instance is mandatory');
  }
  EventsCollector.base(this, 'constructor');
  this.component_ = component;
  this.eventHandler_ = {};
};
core.inherits(EventsCollector, Disposable);

/**
 * Holds the component intance.
 * @type {Component}
 */
EventsCollector.prototype.component_ = null;

/**
 * Holds events that were listened through the element.
 * @type {EventHandler}
 */
EventsCollector.prototype.eventHandler_ = null;

/**
 * Attaches a list of collected events to an element.
 * @param {!Array} events List of collected events which should be attached.
 */
EventsCollector.prototype.attachListeners_ = function(collectedEvents) {
  for (var i = 0; i < collectedEvents.length; i++) {
    var event = collectedEvents[i];
    if (!this.eventHandler_[event.group]) {
      this.eventHandler_[event.group] = new EventHandler();
    }
    this.eventHandler_[event.group].add(
      this.component_.delegate(event.name, event.element, core.bind(this.component_[event.value], this.component_))
    );
  }
};

/**
 * Visits all `rootElement` children and collects inline events into
 * `groupName`. For each found surface element a new group element will be
 * created.
 * @param {String} groupName
 * @param {Element} rootElement
 * @chainable
 */
EventsCollector.prototype.collect = function(groupName, rootElement) {
  var collectedEvents = [];
  this.collectInlineEvents_(groupName, rootElement, collectedEvents);
  this.attachListeners_(collectedEvents);
  return this;
};

/**
 * Collects all events from a document element and its children.
 * TODO(*): Analyzes performance.
 * @param {Element} element The element from which the events should be
 *   extracted.
 * @param {!Array} collectedEvents List of collected events.
 * @return {Array} The collected list of events.
 */
EventsCollector.prototype.collectInlineEvents_ = function(groupName, rootElement, collectedEvents) {
  for (var i = 0; i < rootElement.childNodes.length; i++) {
    this.collectInlineEvents_(groupName, rootElement.childNodes[i], collectedEvents);
  }
  this.collectInlineEventsFromAttributes_(groupName, rootElement, collectedEvents);
};

/**
 * Processes the attribute of an element and stores the found attribute
 * events to an array.
 * TODO(*): Analyzes performance.
 * @param {Element} element The element which should be processed.
 * @protected
 */
EventsCollector.prototype.collectInlineEventsFromAttribute_ = function(groupName, element, attribute, collectedEvents) {
  var event = attribute.name.substring(2);
  if ((attribute.name.indexOf('on') === 0) && dom.supportsEvent(element, event)) {
    var surfaceId = this.component_.extractSurfaceId_(element.id);
    if (surfaceId) {
      groupName = element.id;
    }
    collectedEvents.push({
      group: groupName,
      element: element,
      name: event,
      value: attribute.value
    });
    element.removeAttribute(attribute.name);
  }
};

/**
 * Processes the attributes of an element and stores the found attribute
 * events to an array.
 * TODO(*): Analyzes performance.
 * @param {Element} element The element which should be processed.
 * @protected
 */
EventsCollector.prototype.collectInlineEventsFromAttributes_ = function(groupName, element, collectedEvents) {
  if (element.attributes) {
    for (var i = element.attributes.length - 1; i >= 0; i--) {
      this.collectInlineEventsFromAttribute_(groupName, element, element.attributes[i], collectedEvents);
    }
  }
};

/**
 * Removes all previously attached event listeners to the component.
 * @chainable
 */
EventsCollector.prototype.detachAllListeners = function() {
  for (var groupName in this.eventHandler_) {
    this.detachListeners(groupName);
  }
  this.eventHandler_ = {};
  return this;
};

/**
 * Removes all previously attached event listeners to the group.
 * @chainable
 */
EventsCollector.prototype.detachListeners = function(groupName) {
  if (this.eventHandler_[groupName]) {
    this.eventHandler_[groupName].removeAllListeners();
    this.eventHandler_[groupName] = null;
  }
  return this;
};

/**
 * @inheritDoc
 */
EventsCollector.prototype.disposeInternal = function() {
  this.detachAllListeners();
  this.component_ = null;
  this.eventHandler_ = null;
};

export default EventsCollector;
