(function() {
  'use strict';

  /**
   * Transport utility.
   * @interface
   * @constructor
   * @extends {lfr.EventEmitter}
   */
  lfr.Transport = function() {
    lfr.Transport.base(this, 'constructor');
  };
  lfr.inherits(lfr.Transport, lfr.EventEmitter);

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
   * Opens the transport.
   * @chainable
   */
  lfr.Transport.prototype.open = lfr.abstractMethod;

  /**
   * Sends packet.
   * @param {*} packet
   */
  lfr.Transport.prototype.send = lfr.abstractMethod;

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
