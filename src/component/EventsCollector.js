'use strict';

import Disposable from '../disposable/Disposable';

/**
 * Collects inline events from a passed element, detaching previously
 * attached events that are not being used anymore.
 * @param {Component} component
 * @constructor
 * @extends {Disposable}
 */
class EventsCollector extends Disposable {
  constructor(component) {
    super();

    if (!component) {
      throw new Error('The component instance is mandatory');
    }

    /**
     * Holds the component intance.
     * @type {!Component}
     * @protected
     */
    this.component_ = component;

    /**
     * Holds the attached delegate event handles, indexed by the css selector.
     * @type {!Object<string, !DomEventHandle>}
     * @protected
     */
    this.eventHandles_ = {};

    /**
     * Holds the number of extracted listeners, indexed by the listener's css selector.
     * @type {!Object<string, number>}
     * @protected
     */
    this.listenerCounts_ = {};
  }

  /**
   * Attaches the listener described by the given params, unless it has already
   * been attached.
   * @param {string} eventType
   * @param {string} fnName
   * @protected
   */
  attachListener_(eventType, fnName) {
    var selector = '[data-on' + eventType + '="' + fnName + '"]';
    this.listenerCounts_[selector] = (this.listenerCounts_[selector] || 0) + 1;
    if (!this.eventHandles_[selector]) {
      var fn = this.component_[fnName].bind(this.component_);
      this.eventHandles_[selector] = this.component_.delegate(eventType, selector, fn);
    }
  }

  /**
   * Attaches all listeners declared as attributes on the given element and
   * its children.
   * @param {string} content
   */
  attachListeners(content) {
    this.listenerCounts_ = {};
    this.attachListenersFromHtml_(content);
    this.detachUnusedListeners_();
  }

  /**
   * Attaches listeners found in the given html content.
   * @param {string} content
   * @protected
   */
  attachListenersFromHtml_(content) {
    if (content.indexOf('data-on') === -1) {
      return;
    }
    var regex = /data-on([a-z]+)=['|"](\w+)['|"]/g;
    var match = regex.exec(content);
    while(match) {
      this.attachListener_(match[1], match[2]);
      match = regex.exec(content);
    }
  }

  /**
   * Removes all previously attached event listeners to the component.
   */
  detachAllListeners() {
    for (var selector in this.eventHandles_) {
      if (this.eventHandles_[selector]) {
        this.eventHandles_[selector].removeListener();
      }
    }
    this.eventHandles_ = {};
    this.listenerCounts_ = {};
  }

  /**
   * Detaches all existing listeners that are not being used anymore.
   * @protected
   */
  detachUnusedListeners_() {
    for (var selector in this.eventHandles_) {
      if (!this.listenerCounts_[selector]) {
        this.eventHandles_[selector].removeListener();
        this.eventHandles_[selector] = null;
      }
    }
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    this.detachAllListeners();
    this.component_ = null;
  }
}

export default EventsCollector;
