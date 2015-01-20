(function() {
  'use strict';

  lfr.dom = lfr.dom || {};

  /**
   * Check if an element matches a given selector.
   * @param {Element} element
   * @param {string} selector
   * @return {boolean}
   */
  lfr.dom.match = function(element, selector) {
    if (!element || element.nodeType !== 1) {
      return false;
    }

    var p = Element.prototype;
    var m = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector;
    if (m) {
      return m.call(element, selector);
    }

    return lfr.dom.matchFallback_(element, selector);
  };

  /**
   * Check if an element matches a given selector, using an internal implementation
   * instead of calling existing javascript functions.
   * @param {Element} element
   * @param {string} selector
   * @return {boolean}
   * @protected
   */
  lfr.dom.matchFallback_ = function(element, selector) {
    var nodes = document.querySelectorAll(selector, element.parentNode);
    for (var i = 0; i < nodes.length; ++i) {
      if (nodes[i] === element) {
        return true;
      }
    }
    return false;
  };

  /**
   * Listens to the specified event on the given DOM element. This function normalizes
   * DOM event payloads and functions so they'll work the same way on all supported
   * browsers.
   * @param {!Element} element The DOM element to listen to the event on.
   * @param {string} eventName The name of the event to listen to.
   * @param {!function(!Object)} callback Function to be called when the event is
   *   triggered. It will receive the normalized event object.
   * @return {!lfr.DomEventHandle} Can be used to remove the listener.
   */
  lfr.dom.on = function(element, eventName, callback) {
    element.addEventListener(eventName, callback);
    return new lfr.DomEventHandle(element, eventName, callback);
  };
}());
