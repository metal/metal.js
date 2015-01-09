(function() {
  'use strict';

  /**
   * EventEmitterProxy utility. It's responsible for linking two EventEmitter
   * instances together, emitting all events from the first emitter through
   * the second one.
   * @param {lfr.EventEmitter} originEmitter
   * @param {lfr.EventEmitter} targetEmitter
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
    for (var event in this.proxiedEvents_) {
      this.originEmitter_.removeListener(event, this.proxiedEvents_[event]);
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
    if (this.proxiedEvents_[event] || this.blacklist_[event]) {
      return;
    }

    var self = this;
    this.proxiedEvents_[event] = function() {
      var args = [event].concat(Array.prototype.slice.call(arguments, 0));
      self.targetEmitter_.emit.apply(self.targetEmitter_, args);
    };
    this.originEmitter_.on(event, this.proxiedEvents_[event]);
  };

  /**
   * Starts proxying all events from the origin to the target emitter.
   * @protected
   */
  lfr.EventEmitterProxy.prototype.startProxy_ = function() {
    this.targetEmitter_.on('newListener', lfr.bind(this.proxyEvent_, this));
  };
}());
