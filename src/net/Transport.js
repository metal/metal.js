(function() {
  'use strict';

  /**
   * Provides a convenient API for data transport.
   * @constructor
   * @param {string} uri
   * @extends {lfr.EventEmitter}
   */
  lfr.Transport = function(uri) {
    lfr.Transport.base(this, 'constructor');

    if (!lfr.isDef(uri)) {
      throw new Error('Transport uri not specified');
    }
    this.on('close', lfr.bind(this.onCloseHandler_, this));
    this.on('open', lfr.bind(this.onOpenHandler_, this));
    this.on('opening', lfr.bind(this.onOpeningHandler_, this));
  };
  lfr.inherits(lfr.Transport, lfr.EventEmitter);

  /**
   * Holds the closed state value.
   * @type {string}
   * @const
   * @static
   */
  lfr.Transport.STATE_CLOSED = 'closed';

  /**
   * Holds the open state value.
   * @type {string}
   * @const
   * @static
   */
  lfr.Transport.STATE_OPEN = 'open';

  /**
   * Holds the opening state value.
   * @type {string}
   * @const
   * @static
   */
  lfr.Transport.STATE_OPENING = 'opening';


  /**
   * Holds the transport state, it supports the available states: '',
   * 'opening', 'open' and 'closed'.
   * @type {string}
   * @default ''
   * @protected
   */
  lfr.Transport.prototype.state_ = '';

  /**
   * Holds the transport uri.
   * @type {string}
   * @default ''
   * @protected
   */
  lfr.Transport.prototype.uri_ = '';

  /**
   * Closes the transport.
   * @chainable
   */
  lfr.Transport.prototype.close = lfr.abstractMethod;

  /**
   * Decodes a data chunk received.
   * @param {*=} data
   * @return {?}
   */
  lfr.Transport.prototype.decodeData = lfr.identityFunction;

  /**
   * Gets the transport state value.
   * @return {string}
   */
  lfr.Transport.prototype.getState = function() {
    return this.state_;
  };

  /**
   * Gets the transport uri.
   * @return {string}
   */
  lfr.Transport.prototype.getUri = function() {
    return this.uri_;
  };

  /**
   * Returns true if the transport is open.
   * @return {boolean}
   */
  lfr.Transport.prototype.isOpen = function() {
    switch (this.state_) {
      case lfr.Transport.STATE_OPENING:
      case lfr.Transport.STATE_OPEN:
        return true;
    }
    return false;
  };

  /**
   * Defaults handler for close event.
   * @protected
   */
  lfr.Transport.prototype.onCloseHandler_ = function() {
    this.state_ = lfr.Transport.STATE_CLOSED;
  };

  /**
   * Defaults handler for open event.
   * @protected
   */
  lfr.Transport.prototype.onOpenHandler_ = function() {
    this.state_ = lfr.Transport.STATE_OPEN;
  };

  /**
   * Defaults handler for opening event.
   * @protected
   */
  lfr.Transport.prototype.onOpeningHandler_ = function() {
    this.state_ = lfr.Transport.STATE_OPENING;
  };

  /**
   * Opens the transport.
   * @chainable
   */
  lfr.Transport.prototype.open = lfr.abstractMethod;

  /**
   * Sends message.
   * @param {*} message
   */
  lfr.Transport.prototype.send = function(message) {
    if (this.isOpen()) {
      this.write(message);
    } else {
      throw new Error('Transport not open');
    }
  };

  /**
   * Sets the transport state value.
   * @param {string} state
   */
  lfr.Transport.prototype.setState = function(state) {
    this.state_ = state;
  };

  /**
   * Sets the transport uri.
   * @return {string}
   */
  lfr.Transport.prototype.setUri = function(uri) {
    this.uri_ = uri;
  };

  /**
   * Writes data to the transport.
   * @param {*} message
   * @chainable
   */
  lfr.Transport.prototype.write = lfr.abstractMethod;

  /**
   * Emits when close is called.
   * @event close
   */

  /**
   * Emits when the data is fully received form the connection.
   * @event data
   */

  /**
   * Emits when error is called.
   * @event error
   */

  /**
   * Emits when the message event is sent.
   * @event message
   */

  /**
   * Emits when open is called.
   * @event open
   */

}());
