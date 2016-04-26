'use strict';

/**
 * These helpers are all from "babel-plugin-incremental-dom". See its README
 * file for more details:
 * https://github.com/jridgewell/babel-plugin-incremental-dom#runtime
 */

window.iDOMHelpers = window.iDOMHelpers || {};

window.iDOMHelpers.attr = function(value, attrName) {
  IncrementalDOM.attr(attrName, value);
};

window.iDOMHelpers.forOwn = function(object, iterator) {
  var hasOwn = Object.prototype.hasOwnProperty;
  for (var prop in object) {
    if (hasOwn.call(object, prop)) {
      iterator(object[prop], prop);
    }
  }
};

window.iDOMHelpers.jsxWrapper = function(elementClosure, args) {
  var wrapper = args ? function() {
    return elementClosure.apply(this, args);
  } : elementClosure;
  wrapper.__jsxDOMWrapper = true;
  return wrapper;
};

window.iDOMHelpers.renderArbitrary = function(child) {
  var type = typeof child;
  if (type === 'number' || (type === 'string' || child && child instanceof String)) {
    IncrementalDOM.text(child);
  } else if (type === 'function' && child.__jsxDOMWrapper) {
    child();
  } else if (Array.isArray(child)) {
    child.forEach(window.iDOMHelpers.renderArbitrary);
  } else if (String(child) === '[object Object]') {
    window.iDOMHelpers.forOwn(child, window.iDOMHelpers.renderArbitrary);
  }
};

export default window.iDOMHelpers;
