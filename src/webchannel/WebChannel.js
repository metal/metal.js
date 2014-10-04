(function() {
  'use strict';

  /**
   * API for WebChannel messaging. Supports HTTP verbs for point-to-point
   * socket-like communication between a browser client and a remote origin.
   * @constructor
   * @param {!lfr.WebChannelTransport} webChannelTransport Optional underlying
   *   web channel transport. If not specified defaults to
   *    <code>lfr.WebChannelTransport</code>.
   * @extends {lfr.EventEmitter}
   */
  lfr.WebChannel = function(opt_webChannelTransport) {
    lfr.WebChannel.base(this, 'constructor');

    if (!opt_webChannelTransport) {
      opt_webChannelTransport = new lfr.WebChannelTransport();
    }

    this.webChannelTransport_ = opt_webChannelTransport;
  };
  lfr.inherits(lfr.WebChannel, lfr.EventEmitter);

  /**
   * Holds http verbs.
   * @type {Object}
   * @const
   * @static
   */
  lfr.WebChannel.HttpVerbs = {
    DELETE: 'DELETE',
    GET: 'GET',
    HEAD: 'HEAD',
    PATCH: 'PATCH',
    POST: 'POST',
    PUT: 'PUT'
  };

  /**
   * Holds status of a request message.
   * @type {Object}
   * @const
   * @static
   */
  lfr.WebChannel.MessageStatus = {
    PENDING: 0,
    SENT: 1
  };

  /**
   * The web channel transport used for storing, retrieving, updating and
   * removing data from database.
   * @type {lfr.WebChannelTransport}
   * @default null
   * @protected
   */
  lfr.WebChannel.prototype.webChannelTransport_ = null;

  /**
   * Timeout for performed database action in milliseconds.
   * @type {number}
   * @default 30000
   * @protected
   */
  lfr.WebChannel.prototype.timeoutMs_ = 30000;

  /**
   * Sends message with GET http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.get = function(message, opt_config) {
    return this.dispatchDeferredTransportAction_(this.webChannelTransport_.get, message, opt_config);
  };

  /**
   * Sends message with HEAD http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.head = function(message, opt_config) {
    return this.dispatchDeferredTransportAction_(this.webChannelTransport_.head, message, opt_config);
  };

  /**
   * Sends message with DELETE http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.delete = function(message, opt_config) {
    return this.dispatchDeferredTransportAction_(this.webChannelTransport_.delete, message, opt_config);
  };

  /**
   * Dispatches web channel transport action with timeout support.
   * @param {!Function} handler
   * @param {!*} data Message object to the message.
   * @param {Object=} opt_config Optional configuration object with metadata
   *   about delete operation.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.dispatchDeferredTransportAction_ = function(handler, data, opt_config) {
    var def = handler.call(this.webChannelTransport_, data, opt_config);

    var timer = setTimeout(function() {
      def.cancel(new lfr.Promise.CancellationError('Timeout'));
    }, this.getTimeoutMs());

    def.thenAlways(function() {
      clearTimeout(timer);
    });

    return def;
  };

  /**
   * Gets timeout in milliseconds.
   * @return {number}
   */
  lfr.WebChannel.prototype.getTimeoutMs = function() {
    return this.timeoutMs_;
  };

  /**
   * Gets the web channel transport used to send messages to the server.
   * @return {lfr.WebChannelTransport} The transport used to send messages to
   *   the server.
   */
  lfr.WebChannel.prototype.getWebChannelTransport = function() {
    return this.webChannelTransport_;
  };

  /**
   * Sends message with PATCH http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.patch = function(message, opt_config) {
    return this.dispatchDeferredTransportAction_(this.webChannelTransport_.patch, message, opt_config);
  };

  /**
   * Sends message with POST http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.post = function(message, opt_config) {
    return this.dispatchDeferredTransportAction_(this.webChannelTransport_.post, message, opt_config);
  };

  /**
   * Sends message with PUT http verb.
   * @param {*=} message The value which will be used to send as request data.
   * @param {Object=} opt_config Optional message payload.
   * @return {Promise}
   */
  lfr.WebChannel.prototype.put = function(message, opt_config) {
    return this.dispatchDeferredTransportAction_(this.webChannelTransport_.put, message, opt_config);
  };

  /**
   * Sets timeout in milliseconds.
   * @param {number} timeoutMs
   */
  lfr.WebChannel.prototype.setTimeoutMs = function(timeoutMs) {
    this.timeoutMs_ = timeoutMs;
  };

  /**
   * Sets the web channel transport used to send messages to the server.
   * @param {lfr.WebChannelTransport} webChannelTransport The transport used
   *   to send messages to the server.
   */
  lfr.WebChannel.prototype.setWebChannelTransport = function(webChannelTransport) {
    this.webChannelTransport_ = webChannelTransport;
  };

}());
