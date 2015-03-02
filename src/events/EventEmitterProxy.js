'use strict';

import core from '../core';
import dom from '../dom/dom';
import Disposable from '../disposable/Disposable';

/**
 * EventEmitterProxy utility. It's responsible for linking two EventEmitter
 * instances together, emitting events from the first emitter through the
 * second one. That means that listening to a supported event on the target
 * emitter will mean listening to it on the origin emitter as well.
 * @param {EventEmitter | Element} originEmitter Events originated on this emitter
 *   will be fired for the target emitter's listeners as well. Can be either a real
 *   EventEmitter instance or a DOM element.
 * @param {EventEmitter} targetEmitter Event listeners attached to this emitter
 *   will also be triggered when the event is fired by the origin emitter.
 * @param {Object} opt_blacklist Optional blacklist of events that should not be
 *   proxied.
 * @constructor
 * @extends {Disposable}
 */
class EventEmitterProxy extends Disposable {
  constructor(originEmitter, targetEmitter, opt_blacklist) {
    super(originEmitter, targetEmitter, opt_blacklist);

    this.originEmitter_ = originEmitter;
    this.targetEmitter_ = targetEmitter;
    this.blacklist_ = opt_blacklist || {};
    this.proxiedEvents_ = {};

    this.startProxy_();
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    var removeFnName = core.isElement(this.originEmitter_) ? 'removeEventListener' : 'removeListener';
    for (var event in this.proxiedEvents_) {
      this.originEmitter_[removeFnName](event, this.proxiedEvents_[event]);
    }

    this.proxiedEvents_ = null;
    this.originEmitter_ = null;
    this.targetEmitter_ = null;
  }

  /**
   * Proxies the given event from the origin to the target emitter.
   * @param {string} event
   */
  proxyEvent_(event) {
    if (!this.shouldProxyEvent_(event)) {
      return;
    }

    var self = this;
    this.proxiedEvents_[event] = function() {
      var args = [event].concat(Array.prototype.slice.call(arguments, 0));
      self.targetEmitter_.emit.apply(self.targetEmitter_, args);
    };

    var addFnName = core.isElement(this.originEmitter_) ? 'addEventListener' : 'on';
    this.originEmitter_[addFnName](event, this.proxiedEvents_[event]);
  }

  /**
   * Checks if the given event should be proxied.
   * @param {string} event
   * @return {boolean}
   * @protected
   */
  shouldProxyEvent_(event) {
    return !this.proxiedEvents_[event] && !this.blacklist_[event] &&
      (!core.isElement(this.originEmitter_) || dom.supportsEvent(this.originEmitter_, event));
  }

  /**
   * Starts proxying all events from the origin to the target emitter.
   * @protected
   */
  startProxy_() {
    this.targetEmitter_.on('newListener', core.bind(this.proxyEvent_, this));
  }
}

/**
 * Map of events that should not be proxied.
 * @type {Object}
 * @default null
 * @protected
 */
EventEmitterProxy.prototype.blacklist_ = null;

/**
 * The origin emitter. This emitter's events will be proxied through the
 * target emitter.
 * @type {EventEmitter}
 * @default null
 * @protected
 */
EventEmitterProxy.prototype.originEmitter_ = null;

/**
 * Holds a map of events from the origin emitter that are already being proxied.
 * @type {Object}
 * @default null
 * @protected
 */
EventEmitterProxy.prototype.proxiedEvents_ = null;

/**
 * The target emitter. This emitter will emit all events that come from
 * the origin emitter.
 * @type {EventEmitter}
 * @default null
 * @protected
 */
EventEmitterProxy.prototype.targetEmitter_ = null;

export default EventEmitterProxy;
