'use strict';

import array from '../array/array';
import core from '../core';
import object from '../object/object';
import EventEmitter from '../events/EventEmitter';

/**
 * Provides a convenient API for data transport.
 * @param {string} uri
 * @constructor
 * @extends {EventEmitter}
 */
class Transport extends EventEmitter {
  constructor(uri) {
    super();

    if (!core.isDef(uri)) {
      throw new Error('Transport uri not specified');
    }
    this.uri_ = uri;
    this.defaultConfig_ = core.mergeSuperClassesProperty(
      this.constructor,
      'INITIAL_DEFAULT_CONFIG',
      array.firstDefinedValue
    );

    this.on('close', core.bind(this.onCloseHandler_, this));
    this.on('open', core.bind(this.onOpenHandler_, this));
    this.on('opening', core.bind(this.onOpeningHandler_, this));
  }

  /**
   * Gets this transport's default configuration.
   * @return {Object}
   */
  getDefaultConfig() {
    return this.defaultConfig_;
  }

  /**
   * @inheritDoc
   * @override
   */
  disposeInternal() {
    this.once('close', function() {
      super.disposeInternal();
    });
    this.close();
  }

  /**
   * Gets the transport uri.
   * @return {string}
   */
  getUri() {
    return this.uri_;
  }

  /**
   * Gets the transport state value.
   * @return {string}
   */
  getState() {
    return this.state_;
  }

  /**
   * Returns true if the transport is open.
   * @return {boolean}
   */
  isOpen() {
    switch (this.state_) {
      case Transport.State.OPENING:
      case Transport.State.OPEN:
        return true;
    }
    return false;
  }

  /**
   * Defaults handler for close event.
   * @protected
   */
  onCloseHandler_() {
    this.state_ = Transport.State.CLOSED;
  }

  /**
   * Defaults handler for open event.
   * @protected
   */
  onOpenHandler_() {
    this.state_ = Transport.State.OPEN;
  }

  /**
   * Defaults handler for opening event.
   * @protected
   */
  onOpeningHandler_() {
    this.state_ = Transport.State.OPENING;
  }

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
  send(message, opt_config, opt_success, opt_error) {
    if (this.isOpen()) {
      this.write(message, object.mixin({}, this.defaultConfig_, opt_config), opt_success, opt_error);
    } else {
      throw new Error('Transport not open');
    }
  }

  /**
   * Sets this transport's default configuration.
   * @param {Object} defaultConfig
   */
  setDefaultConfig(defaultConfig) {
    this.defaultConfig_ = defaultConfig;
  }

  /**
   * Sets the transport state value.
   * @param {string} state
   */
  setState(state) {
    this.state_ = state;
  }
}

/**
 * Holds the initial default config that should be used for this transport.
 * @type null
 * @const
 * @static
 */
Transport.INITIAL_DEFAULT_CONFIG = null;

/**
 * Holds the transport state values.
 * @type {Object}
 * @const
 * @static
 */
Transport.State = {
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
Transport.TRANSPORT_EVENTS = {
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
 * Closes the transport.
 * @chainable
 */
Transport.prototype.close = core.abstractMethod;

/**
 * Holds the default configuration for this transport. Configuration options
 * passed for a request override these defaults.
 * @type {Object}
 * @default null
 * @protected
 */
Transport.prototype.defaultConfig_ = null;

/**
 * Decodes a data chunk received.
 * @param {*=} data
 * @return {?}
 */
Transport.prototype.decodeData = core.identityFunction;

/**
 * Encodes a data chunk to be sent.
 * @param {*=} data
 * @return {?}
 */
Transport.prototype.encodeData = core.identityFunction;

/**
 * Opens the transport.
 * @chainable
 */
Transport.prototype.open = core.abstractMethod;

/**
 * Holds the transport state, it supports the available states: '',
 * 'opening', 'open' and 'closed'.
 * @type {string}
 * @default ''
 * @protected
 */
Transport.prototype.state_ = '';

/**
 * Holds the transport uri.
 * @type {string}
 * @default ''
 * @protected
 */
Transport.prototype.uri_ = '';

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
Transport.prototype.write = core.abstractMethod;

export default Transport;
