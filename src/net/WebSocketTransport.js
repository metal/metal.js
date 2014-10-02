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
  };
  lfr.inherits(lfr.WebSocketTransport, lfr.Transport);

  /**
   * Holds the underlying socket mechanism. Default mechanism uses Socket.IO.
   * @type {Socket.IO}
   * @default null
   */
  lfr.WebSocketTransport.prototype.socket = null;

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
    /*global io*/
    if (!io) {
      throw new Error('Socket.IO client not found');
    }
    var socket = io(this.getUri());
    socket.on('connect', lfr.bind(this.onSocketConnect_, this));
    socket.on('disconnect', lfr.bind(this.onSocketDisconnect_, this));
    socket.on('error', lfr.bind(this.onSocketError_, this));
    socket.on('data', lfr.bind(this.onSocketData_, this));
    socket.on('message', lfr.bind(this.onSocketMessage_, this));
    return socket;
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
    }

    this.socket.open();

    return this;
  };

  /**
   * @inheritDoc
   */
  lfr.WebSocketTransport.prototype.write = function(message) {
    this.socket.send(message);
  };

}());
