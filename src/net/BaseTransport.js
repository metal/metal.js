(function() {
  'use strict';

  /**
   * BaseTransport utility.
   * @constructor
   * @extends {lfr.EventEmitter}
   */
  lfr.BaseTransport = function(uri) {
    lfr.BaseTransport.base(this, 'constructor');

    if (!lfr.isDef(uri)) {
      throw new Error('Transport uri not specified');
    }

    this.on('close', lfr.bind(this.onCloseHandler_, this));
    this.on('data', lfr.bind(this.onDataHandler_, this));
    this.on('open', lfr.bind(this.onOpenHandler_, this));
  };
  lfr.inherits(lfr.BaseTransport, lfr.Transport);

  /**
   * Returns lfr.BaseTransport singleton.
   * @param {string} uri
   * @return {lfr.BaseTransport} Single instance of lfr.BaseTransport.
   * @static
   */
  lfr.BaseTransport.getSingleton = function(uri) {
    if (lfr.BaseTransport.instance_) {
      return lfr.BaseTransport.instance_;
    }
    return (lfr.BaseTransport.instance_ = new lfr.BaseTransport(uri));
  };

  /**
   * Holds the transport state, it supports the available states: '',
   * 'opening', 'open' and 'closed'.
   * @type {string}
   * @default ''
   */
  lfr.BaseTransport.prototype.state = '';

  /**
   * Holds the transport uri.
   * @type {string}
   * @default ''
   */
  lfr.BaseTransport.prototype.uri = '';

  /**
   * Gets the transport state value.
   * @return {string}
   */
  lfr.BaseTransport.prototype.getState = function() {
    return this.state;
  };

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
   * Defaults handler for data event.
   * @protected
   */
  lfr.BaseTransport.prototype.onDataHandler_ = function(event) {
    this.emit('data', {
      data: this.decodeData(event.data)
    });
  };

  /**
   * Defaults handler for open event.
   * @protected
   */
  lfr.BaseTransport.prototype.onOpenHandler_ = function() {
    this.state = 'open';
  };

  /**
   * @inheritDoc
   */
  lfr.BaseTransport.prototype.send = function(packet) {
    if (this.state === 'open') {
      this.write(packet);
    } else {
      throw new Error('BaseTransport not open');
    }
  };

  /**
   * Sets the transport state value.
   * @param {string} state
   */
  lfr.BaseTransport.prototype.setState = function(state) {
    this.state = state;
  };

  /**
   * Sets the transport uri.
   * @return {string}
   */
  lfr.BaseTransport.prototype.setUri = function(uri) {
    this.uri = uri;
  };

}());
