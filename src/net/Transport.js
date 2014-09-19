(function() {
  'use strict';

  /**
   * Provides a convenient API for data transport.
   * @constructor
   * @extends {lfr.EventEmitter}
   */
  lfr.Transport = function() {
    lfr.Transport.base(this, 'constructor');
  };
  lfr.inherits(lfr.Transport, lfr.EventEmitter);

  /**
   * Holds the transport state, it supports the available states: '',
   * 'opening', 'open' and 'closed'.
   * @type {string}
   * @default ''
   */
  lfr.Transport.prototype.state = '';

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
    return this.state;
  };

  /**
   * Opens the transport.
   * @chainable
   */
  lfr.Transport.prototype.open = lfr.abstractMethod;

  /**
   * Sends packet.
   * @param {*} packet
   */
  lfr.Transport.prototype.send = function(packet) {
    if (this.state === 'open') {
      this.write(packet);
    } else {
      throw new Error('Transport not open');
    }
  };

  /**
   * Sets the transport state value.
   * @param {string} state
   */
  lfr.Transport.prototype.setState = function(state) {
    this.state = state;
  };

  /**
   * Writes data to the transport.
   * @param {*} packet
   * @chainable
   */
  lfr.Transport.prototype.write = lfr.abstractMethod;

  /**
   * Emits when close is called.
   * @event close
   */

  /**
   * Emits when data is called.
   * @event data
   */

  /**
   * Emits when error is called.
   * @event error
   */

  /**
   * Emits when a message is received. Relevant when data event handles
   * multiple chunks of data.
   * @event message
   */

  /**
   * Emits when open is called.
   * @event open
   */

}());
