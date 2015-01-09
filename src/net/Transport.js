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
    this.uri_ = uri;
    this.on('close', lfr.bind(this.onCloseHandler_, this));
    this.on('open', lfr.bind(this.onOpenHandler_, this));
    this.on('opening', lfr.bind(this.onOpeningHandler_, this));
  };
  lfr.inherits(lfr.Transport, lfr.EventEmitter);

  /**
   * Holds the transport state values.
   * @type {Object}
   * @const
   * @static
   */
  lfr.Transport.State = {
    CLOSED: 'closed',
    OPEN: 'open',
    OPENING: 'opening'
  };

  /**
   * Map of all the main transport events.
   * @type {!Object}
   * @const
   * @static
   */
  lfr.Transport.TRANSPORT_EVENTS = {
    /**
     * Emits when the transport has closed.
     * @event close
     */
    close: true,

    /**
     * Emits when data is received from the connection.
     * @event data
     */
    data: true,

    /**
     * Emits when an error is received from the connection.
     * @event error
     */
    error: true,

    /**
     * Emits when the message event is sent.
     * @event message
     */
    message: true,

    /**
     * Emits when the transport has opened.
     * @event open
     */
    open: true,

    /**
     * Emits when the transport has started opening (when `open` is called).
     * @event opening
     */
    opening: true
  };

  /**
   * Holds the transport uri.
   * @type {string}
   * @default ''
   * @protected
   */
  lfr.Transport.prototype.uri_ = '';

  /**
   * Holds the transport state, it supports the available states: '',
   * 'opening', 'open' and 'closed'.
   * @type {string}
   * @default ''
   * @protected
   */
  lfr.Transport.prototype.state_ = '';

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
   * @inheritDoc
   * @override
   */
  lfr.Transport.prototype.disposeInternal = function() {
    this.once('close', function() {
      lfr.Transport.base(this, 'disposeInternal');
    });
    this.close();
  };

  /**
   * Gets the transport uri.
   * @return {string}
   */
  lfr.Transport.prototype.getUri = function() {
    return this.uri_;
  };

  /**
   * Gets the transport state value.
   * @return {string}
   */
  lfr.Transport.prototype.getState = function() {
    return this.state_;
  };

  /**
   * Returns true if the transport is open.
   * @return {boolean}
   */
  lfr.Transport.prototype.isOpen = function() {
    switch (this.state_) {
      case lfr.Transport.State.OPENING:
      case lfr.Transport.State.OPEN:
        return true;
    }
    return false;
  };

  /**
   * Defaults handler for close event.
   * @protected
   */
  lfr.Transport.prototype.onCloseHandler_ = function() {
    this.state_ = lfr.Transport.State.CLOSED;
  };

  /**
   * Defaults handler for open event.
   * @protected
   */
  lfr.Transport.prototype.onOpenHandler_ = function() {
    this.state_ = lfr.Transport.State.OPEN;
  };

  /**
   * Defaults handler for opening event.
   * @protected
   */
  lfr.Transport.prototype.onOpeningHandler_ = function() {
    this.state_ = lfr.Transport.State.OPENING;
  };

  /**
   * Opens the transport.
   * @chainable
   */
  lfr.Transport.prototype.open = lfr.abstractMethod;

  /**
   * Sends message.
   * @param {*} message
   * @param {*} opt_config Relevant if the transport needs information such as
   *     HTTP method, headers and parameters.
   * @param {*} opt_success Function to be called when the request receives a
   *   success response.
   * @param {*} opt_error Function to be called when the request receives an error
   *   response.
   */
  lfr.Transport.prototype.send = function(message, opt_config, opt_success, opt_error) {
    if (this.isOpen()) {
      this.write(message, opt_config, opt_success, opt_error);
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
   * Writes data to the transport.
   * @param {*} message The data that will be sent through the transport.
   * @param {*} opt_config Relevant if the transport needs information such as
   *     HTTP method, headers and parameters.
   * @param {*} opt_success Function to be called when the request receives a
   *   success response.
   * @param {*} opt_error Function to be called when the request receives an error
   *   response.
   * @chainable
   */
  lfr.Transport.prototype.write = lfr.abstractMethod;
}());
