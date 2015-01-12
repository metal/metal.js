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
    this.defaultConfig_ = this.constructor.INITIAL_DEFAULT_CONFIG;

    this.on('close', lfr.bind(this.onCloseHandler_, this));
    this.on('open', lfr.bind(this.onOpenHandler_, this));
    this.on('opening', lfr.bind(this.onOpeningHandler_, this));
  };
  lfr.inherits(lfr.Transport, lfr.EventEmitter);

  /**
   * Holds the initial default config that should be used for this transport.
   * @type {Object}
   * @const
   * @static
   */
  lfr.Transport.INITIAL_DEFAULT_CONFIG = {};

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
   * Holds the default configuration for this transport. Configuration options
   * passed for a request override these defaults.
   * @type {Object}
   * @default null
   * @protected
   */
  lfr.Transport.prototype.defaultConfig_ = null;

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
   * Gets this transport's default configuration.
   * @return {Object}
   */
  lfr.Transport.prototype.getDefaultConfig = function() {
    return this.defaultConfig_;
  };

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
   * Fills the value of the specified option with its default value when necessary.
   * @param {string} name
   * @param {!Object} options
   * @param {!Object} defaultOptions
   * @return {*}
   */
  lfr.Transport.prototype.fillWithDefault_ = function(name, options, defaultOptions) {
    if (!options.hasOwnProperty(name)) {
      options[name] = defaultOptions[name];
    } else if (lfr.isObject(options[name]) && lfr.isObject(defaultOptions[name])) {
      this.fillWithDefaults_(options[name], defaultOptions[name]);
    }
  };

  /**
   * Fills the given options object with the appropriate default values when
   * necessary.
   * @param {!Object} options The object that should receive default option values.
   * @param {!Object} defaultOptions An object with default option values.
   * @protected
   */
  lfr.Transport.prototype.fillWithDefaults_ = function(options, defaultOptions) {
    for (var key in defaultOptions) {
      this.fillWithDefault_(key, options, defaultOptions);
    }
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
   * Normalizes the given config, using default values when they are missing.
   * @param {Object} config
   * @return {!Object}
   * @protected
   */
  lfr.Transport.prototype.normalizeConfig_ = function(config) {
    if (!config) {
      config = {};
    }
    this.fillWithDefaults_(config, this.defaultConfig_);
    return config;
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
   * @param {Object} opt_config Relevant if the transport needs information such as
   *   HTTP method, headers and parameters.
   * @param {function(*)} opt_success Function to be called when the request receives
   *   a success response.
   * @param {function(*)} opt_error Function to be called when the request receives
   *   an error response.
   */
  lfr.Transport.prototype.send = function(message, opt_config, opt_success, opt_error) {
    if (this.isOpen()) {
      this.write(message, this.normalizeConfig_(opt_config), opt_success, opt_error);
    } else {
      throw new Error('Transport not open');
    }
  };

  /**
   * Sets this transport's default configuration.
   * @param {Object} defaultConfig
   */
  lfr.Transport.prototype.setDefaultConfig = function(defaultConfig) {
    this.defaultConfig_ = defaultConfig;
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
   * @param {!Object} config Relevant if the transport needs information such as
   *   HTTP method, headers and parameters.
   * @param {function(*)} opt_success Function to be called when the request receives
   *   a success response.
   * @param {function(*)} opt_error Function to be called when the request receives
   *   an error response.
   * @chainable
   */
  lfr.Transport.prototype.write = lfr.abstractMethod;
}());
