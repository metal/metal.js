'use strict';

import Disposable from '../disposable/Disposable';

/**
 * `DomVisitor` traverses an element's dom tree, running all
 * registered handlers for each visited node.
 */
class DomVisitor extends Disposable {
  /**
   * Constructor for `DomVisitor`.
   * @param {!Element} element Element that should be traversed.
   * @constructor
   */
  constructor(element) {
    /**
     * The element that should be traversed by this `DomVisitor`.
     * @type {!Element}
     * @protected
     */
    this.element_ = element;

    /**
     * Holds the handler functions that should be run for each traversed
     * element.
     * @type {!Array}
     * @protected
     */
    this.handlers_ = [];

    /**
     * Holds the data that should be passed for the first call of each
     * added handler.
     * @type {!Array}
     * @protected
     */
    this.initialData_ = [];
  }

  /**
   * Creates a new `DomVisitor` instance for the given element
   * and returns it.
   * @param {!Element} element
   * @return {DomVisitor}
   */
  static visit(element) {
    return new DomVisitor(element);
  }

  /**
   * Adds a function that should be run for each visited node.
   * @param {!function(!Element)} handler
   * @param {*} initialData The data to pass for the first time this
   *   handler is called.
   * @chainable
   */
  addHandler(handler, initialData) {
    this.handlers_.push(handler);
    this.initialData_.push(initialData);
    return this;
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    this.element_ = null;
    this.handlers_ = null;
    this.initialData_ = null;
  }

  /**
   * Runs all the handlers for the given element.
   * @param {!Element} element
   * @param {Array<*>=} opt_handlerData
   * @protected
   */
  runHandlers_(element, opt_handlerData) {
    opt_handlerData = opt_handlerData || [];
    var newHandlerData = [];
    for (var i = 0; i < this.handlers_.length; i++) {
      newHandlerData.push(this.handlers_[i](element, opt_handlerData[i]));
    }
    return newHandlerData;
  }

  /**
   * Starts the visit.
   * @chainable
   */
  start() {
    this.visit_(this.element_, this.initialData_);
    return this;
  }

  /**
   * Visits the given element and its children.
   * @param {!Element} element
   * @param {Array<*>} handlerData An array of data objects
   * @protected
   */
  visit_(element, handlerData) {
    var newHandlerData = this.runHandlers_(element, handlerData);
    for (var i = 0; i < element.childNodes.length; i++) {
      this.visit_(element.childNodes[i], newHandlerData);
    }
  }
}

export default DomVisitor;
