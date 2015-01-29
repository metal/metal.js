(function() {
  'use strict';

  /**
   * EventEmitterProxy utility. It's responsible for linking two EventEmitter
   * instances together, emitting events from the first emitter through the
   * second one. That means that listening to a supported event on the target
   * emitter will mean listening to it on the origin emitter as well.
   * @param {lfr.EventEmitter | Element} originEmitter Events originated on this emitter
   *   will be fired for the target emitter's listeners as well. Can be either a real
   *   EventEmitter instance or a DOM element.
   * @param {lfr.EventEmitter} targetEmitter Event listeners attached to this emitter
   *   will also be triggered when the event is fired by the origin emitter.
   * @param {Object} opt_blacklist Optional blacklist of events that should not be
   *   proxied.
   * @constructor
   */
  lfr.EventEmitterProxy = function(originEmitter, targetEmitter, opt_blacklist) {
    this.originEmitter_ = originEmitter;
    this.targetEmitter_ = targetEmitter;
    this.blacklist_ = opt_blacklist || {};
    this.proxiedEvents_ = {};

    this.startProxy_();
  };
  lfr.inherits(lfr.EventEmitterProxy, lfr.Disposable);

  /**
   * Map of events that should not be proxied.
   * @type {Object}
   * @default null
   * @protected
   */
  lfr.EventEmitterProxy.prototype.blacklist_ = null;

  /**
   * The origin emitter. This emitter's events will be proxied through the
   * target emitter.
   * @type {lfr.EventEmitter}
   * @default null
   * @protected
   */
  lfr.EventEmitterProxy.prototype.originEmitter_ = null;

  /**
   * Holds a map of events from the origin emitter that are already being proxied.
   * @type {Object}
   * @default null
   * @protected
   */
  lfr.EventEmitterProxy.prototype.proxiedEvents_ = null;

  /**
   * The target emitter. This emitter will emit all events that come from
   * the origin emitter.
   * @type {lfr.EventEmitter}
   * @default null
   * @protected
   */
  lfr.EventEmitterProxy.prototype.targetEmitter_ = null;

  /**
   * @inheritDoc
   */
  lfr.EventEmitterProxy.prototype.disposeInternal = function() {
    var removeFnName = lfr.isElement(this.originEmitter_) ? 'removeEventListener' : 'removeListener';
    for (var event in this.proxiedEvents_) {
      this.originEmitter_[removeFnName](event, this.proxiedEvents_[event]);
    }

    this.proxiedEvents_ = null;
    this.originEmitter_ = null;
    this.targetEmitter_ = null;
  };

  /**
   * Proxies the given event from the origin to the target emitter.
   * @param {string} event
   */
  lfr.EventEmitterProxy.prototype.proxyEvent_ = function(event) {
    if (!this.shouldProxyEvent_(event)) {
      return;
    }

    var self = this;
    this.proxiedEvents_[event] = function() {
      var args = [event].concat(Array.prototype.slice.call(arguments, 0));
      self.targetEmitter_.emit.apply(self.targetEmitter_, args);
    };

    var addFnName = lfr.isElement(this.originEmitter_) ? 'addEventListener' : 'on';
    this.originEmitter_[addFnName](event, this.proxiedEvents_[event]);
  };

  /**
   * Checks if the given event should be proxied.
   * @param {string} event
   * @return {boolean}
   * @protected
   */
  lfr.EventEmitterProxy.prototype.shouldProxyEvent_ = function(event) {
    return !this.proxiedEvents_[event] && !this.blacklist_[event] &&
      (!lfr.isElement(this.originEmitter_) || lfr.dom.supportsEvent(this.originEmitter_, event));
  };

  /**
   * Starts proxying all events from the origin to the target emitter.
   * @protected
   */
  lfr.EventEmitterProxy.prototype.startProxy_ = function() {
    this.targetEmitter_.on('newListener', lfr.bind(this.proxyEvent_, this));
  };
}());
