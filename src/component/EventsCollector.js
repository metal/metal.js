'use strict';

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
class EventsCollector extends Disposable {
  constructor(component) {
    super();

    /**
     * Holds the component intance.
     * @type {Component}
     * @protected
     */
    this.component_ = null;

    /**
     * Holds events that were listened through the element.
     * @type {EventHandler}
     * @protected
     */
    this.eventHandler_ = null;

    if (!component) {
      throw new Error('The component instance is mandatory');
    }
    this.component_ = component;
    this.eventHandler_ = {};
  }

  /**
   * Attaches all listeners declared in the collected events array.
   * @param {!Array<!Object>} collectedEvents
   * @param {string} groupName
   * @protected
   */
  attachCollectedListeners_(collectedEvents, groupName) {
    for (var i = 0; i < collectedEvents.length; i++) {
      var event = collectedEvents[i];
      if (!this.eventHandler_[groupName]) {
        this.eventHandler_[groupName] = new EventHandler();
      }
      this.eventHandler_[groupName].add(
        this.component_.delegate(event.name, event.element, this.component_[event.value].bind(this.component_))
      );
    }
  }

  /**
   * Attaches all listeners declared as attributes on the given element.
   * @param {Element} element
   * @param {String=} opt_groupName
   */
  attachListeners(element, opt_groupName) {
    opt_groupName = opt_groupName || element.id || this.component_.id;
    var collectedEvents = this.collectInlineEventsFromAttributes_(element);
    this.attachCollectedListeners_(collectedEvents, opt_groupName);
    if (element.id && this.component_.extractSurfaceId(element.id)) {
      opt_groupName = element.id;
    }
    return opt_groupName;
  }

  /**
   * Processes the attribute of an element and stores the found attribute
   * events to an array.
   * TODO(*): Analyze performance.
   * @param {Element} element The element which should be processed.
   * @param {!Object} attribute
   * @return {Object} An objects that represents an event that should be
   *   attached to this element.
   * @protected
   */
  collectInlineEventFromAttribute_(element, attribute) {
    var event = attribute.name.substring(2);
    if ((attribute.name.indexOf('on') === 0) && dom.supportsEvent(element, event)) {
      var eventData = {
        element: element,
        name: event,
        value: attribute.value
      };
      element.removeAttribute(attribute.name);
      element[attribute.name] = null;
      return eventData;
    }
  }

  /**
   * Processes the attributes of an element and stores the found attribute
   * events to an array.
   * TODO(*): Analyze performance.
   * @param {Element} element The element which should be processed.
   * @return {!Array<!Object>} An array with objects that represent each an
   *   event that should be attached to this element.
   * @protected
   */
  collectInlineEventsFromAttributes_(element) {
    var collectedEvents = [];
    if (element.attributes) {
      for (var i = element.attributes.length - 1; i >= 0; i--) {
        var eventObj = this.collectInlineEventFromAttribute_(element, element.attributes[i]);
        if (eventObj) {
          collectedEvents.push(eventObj);
        }
      }
    }
    return collectedEvents;
  }

  /**
   * Removes all previously attached event listeners to the component.
   * @chainable
   */
  detachAllListeners() {
    for (var groupName in this.eventHandler_) {
      this.detachListeners(groupName);
    }
    this.eventHandler_ = {};
    return this;
  }

  /**
   * Removes all previously attached event listeners to the group.
   * @chainable
   */
  detachListeners(groupName) {
    if (this.eventHandler_[groupName]) {
      this.eventHandler_[groupName].removeAllListeners();
      this.eventHandler_[groupName] = null;
    }
    return this;
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    this.detachAllListeners();
    this.component_ = null;
    this.eventHandler_ = null;
  }
}

export default EventsCollector;
