(function() {
  'use strict';

  /**
   * The base implementation for all transport APIs.
   * @constructor
   * @extends {lfr.Transport}
   */
  lfr.BaseTransport = function(uri) {
    lfr.BaseTransport.base(this, 'constructor');

    if (!lfr.isDef(uri)) {
      throw new Error('Transport uri not specified');
    }

    this.on('close', lfr.bind(this.onCloseHandler_, this));
    this.on('open', lfr.bind(this.onOpenHandler_, this));
  };
  lfr.inherits(lfr.BaseTransport, lfr.Transport);

  /**
   * Holds the transport uri.
   * @type {string}
   * @default ''
   */
  lfr.BaseTransport.prototype.uri = '';

  /**
   * Gets the transport uri.
   * @return {string}
   */
  lfr.BaseTransport.prototype.getUri = function() {
    return this.uri;
  };

  /**
   * Defaults handler for close event.
   * @protected
   */
  lfr.BaseTransport.prototype.onCloseHandler_ = function() {
    this.state = 'closed';
  };

  /**
   * Defaults handler for open event.
   * @protected
   */
  lfr.BaseTransport.prototype.onOpenHandler_ = function() {
    this.state = 'open';
  };

  /**
   * Sets the transport uri.
   * @return {string}
   */
  lfr.BaseTransport.prototype.setUri = function(uri) {
    this.uri = uri;
  };

}());
