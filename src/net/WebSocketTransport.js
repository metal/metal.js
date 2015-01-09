(function() {
  'use strict';

  /**
   * Provides implementation of transport-based cross-browser/cross-device
   * bi-directional communication layer for Socket.IO.
   * @constructor
   * @extends {lfr.Transport}
   */
  lfr.WebSocketTransport = function(uri) {
    lfr.WebSocketTransport.base(this, 'constructor', uri);
    this.socketEvents_ = [];
  };
  lfr.inherits(lfr.WebSocketTransport, lfr.Transport);

  /**
   * EventEmitterProxy instance that proxies events from the socket to this
   * transport.
   * @type {EventEmitterProxy}
   * @default null
   * @protected
   */
  lfr.WebSocketTransport.prototype.proxy_ = null;

  /**
   * If the requests should be RESTful or not. RESTful requests are always sent as
   * JSON data, with the method as one of the params, and the original data to be
   * sent accessible through the `data` key.
   * @type {boolean}
   * @default false
   * @protected
   */
  lfr.WebSocketTransport.prototype.restful_ = false;

  /**
   * Holds the underlying socket mechanism. Default mechanism uses Socket.IO.
   * @type {Socket.IO}
   * @default null
   */
  lfr.WebSocketTransport.prototype.socket = null;

  /**
   * Holds information about the events that are being listened in the socket.
   * This is necessary for removing these listeners when the transport is
   * disposed.
   * @type {Array<Object>}
   * @default null
   */
  lfr.WebSocketTransport.prototype.socketEvents_ = null;

  /**
   * Listens to the specified event on the socket. This action should always be done
   * through this method, since it will appropriately hold the necessary information
   * so the listener can be removed when the transport is disposed.
   * @param {!Socket.IO} socket
   * @param {string} event
   * @param {!function} listener
   * @protected
   */
  lfr.WebSocketTransport.prototype.addSocketListener_ = function(socket, event, listener) {
    this.socketEvents_.push({
      event: event,
      listener: listener
    });
    socket.on(event, listener);
  };

  /**
   * @inheritDoc
   */
  lfr.WebSocketTransport.prototype.close = function() {
    if (this.socket) {
      this.socket.close();
    }
    return this;
  };

  /**
   * Makes a Socket.IO instance.
   * @return {Socket.IO}
   * @protected
   */
  lfr.WebSocketTransport.prototype.createSocket_ = function() {
    this.verifySocketIOExists_();

    var socket = io(this.getUri());
    this.addSocketListener_(socket, 'connect', lfr.bind(this.onSocketConnect_, this));
    this.addSocketListener_(socket, 'disconnect', lfr.bind(this.onSocketDisconnect_, this));
    this.addSocketListener_(socket, 'error', lfr.bind(this.onSocketError_, this));
    this.addSocketListener_(socket, 'data', lfr.bind(this.onSocketData_, this));
    this.addSocketListener_(socket, 'message', lfr.bind(this.onSocketMessage_, this));
    return socket;
  };

  /**
   * @inheritDoc
   */
  lfr.WebSocketTransport.prototype.disposeInternal = function() {
    this.once('close', function() {
      this.proxy_.dispose();
      this.proxy_ = null;

      this.removeSocketListeners_();
      this.socket = null;
    });
    lfr.WebSocketTransport.base(this, 'disposeInternal');
  };

  /**
   * Event handle for socket connect event. Fires transport open event.
   * @param {?Object} event
   * @protected
   */
  lfr.WebSocketTransport.prototype.onSocketConnect_ = function() {
    this.emit('open');
  };

  /**
   * Event handle for socket data event. Fires transport data event.
   * @param {*} data
   * @protected
   */
  lfr.WebSocketTransport.prototype.onSocketData_ = function(data) {
    this.emit('data', this.decodeData(data));
  };

  /**
   * Event handle for socket disconnect event. Fires transport close event.
   * @protected
   */
  lfr.WebSocketTransport.prototype.onSocketDisconnect_ = function() {
    this.emit('close');
  };

  /**
   * Event handle for socket error event. Fires transport error event.
   * @param {Object} event
   * @protected
   */
  lfr.WebSocketTransport.prototype.onSocketError_ = function(event) {
    var error = new Error('Transport request error');
    error.socket = this.socket;
    error.message = event;
    this.emit('error', {
      error: error
    });
  };

  /**
   * Event handle for socket message event. Fires transport message event.
   * @protected
   */
  lfr.WebSocketTransport.prototype.onSocketMessage_ = function(message) {
    this.emit('message', message);
  };

  /**
   * @inheritDoc
   */
  lfr.WebSocketTransport.prototype.open = function() {
    if (this.isOpen()) {
      console.warn('Transport is already open');
      return;
    }

    this.emit('opening');

    if (!this.socket) {
      this.socket = this.createSocket_();
      this.proxy_ = new lfr.EventEmitterProxy(this.socket, this, lfr.Transport.TRANSPORT_EVENTS);
    }

    this.socket.open();

    return this;
  };

  /**
   * Removes all listeners that were attached to the socket by this transport.
   * @protected
   */
  lfr.WebSocketTransport.prototype.removeSocketListeners_ = function() {
    for (var i = 0; i < this.socketEvents_.length; i++) {
      this.socket.removeListener(
        this.socketEvents_[i].event,
        this.socketEvents_[i].listener
      );
    }
  };

  /**
   * Sets this transport to be RESTful or not.
   * @param {boolean} restful
   */
  lfr.WebSocketTransport.prototype.setRestful = function(restful) {
    this.restful_ = restful;
  };

  /**
   * Verifies that the `io` global function exists, throwing an error otherwise.
   * @throws {Error}
   * @protected
   */
  lfr.WebSocketTransport.prototype.verifySocketIOExists_ = function() {
    /*global io*/
    if (!io) {
      throw new Error('Socket.IO client not found');
    }
  };

  /**
   * @inheritDoc
   */
  lfr.WebSocketTransport.prototype.write = function(message, opt_config, opt_success) {
    if (this.restful_) {
      message = {
        data: message,
        method: opt_config ? opt_config.method : 'POST'
      };
    }

    var self = this;
    this.socket.send(message, function(response) {
      if (opt_success) {
        opt_success(self.decodeData(response));
      }
    });
  };

}());
