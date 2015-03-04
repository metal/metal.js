'use strict';

import EventEmitterProxy from '../events/EventEmitterProxy';
import Transport from './Transport';

/**
 * Provides implementation of transport-based cross-browser/cross-device
 * bi-directional communication layer for Socket.IO.
 * @param {string} uri
 * @constructor
 * @extends {Transport}
 */
class WebSocketTransport extends Transport {
  constructor(uri) {
    super(uri);

    this.socketEvents_ = [];
  }

  /**
   * Listens to the specified event on the socket. This action should always be done
   * through this method, since it will appropriately hold the necessary information
   * so the listener can be removed when the transport is disposed.
   * @param {!Socket.IO} socket
   * @param {string} event
   * @param {!function} listener
   * @protected
   */
  addSocketListener_(socket, event, listener) {
    this.socketEvents_.push({
      event: event,
      listener: listener
    });
    socket.on(event, listener);
  }

  /**
   * @inheritDoc
   */
  close() {
    if (this.socket) {
      this.socket.close();
    }
    return this;
  }

  /**
   * Makes a Socket.IO instance.
   * @return {Socket.IO}
   * @protected
   */
  createSocket_() {
    this.verifySocketIOExists_();

    var socket = io(this.getUri());
    this.addSocketListener_(socket, 'connect', this.onSocketConnect_.bind(this));
    this.addSocketListener_(socket, 'disconnect', this.onSocketDisconnect_.bind(this));
    this.addSocketListener_(socket, 'error', this.onSocketError_.bind(this));
    this.addSocketListener_(socket, 'data', this.onSocketData_.bind(this));
    this.addSocketListener_(socket, 'message', this.onSocketMessage_.bind(this));
    return socket;
  }

  /**
   * @inheritDoc
   */
  disposeInternal() {
    this.once('close', function() {
      this.eventEmitterProxy_.dispose();
      this.eventEmitterProxy_ = null;

      this.removeSocketListeners_();
      this.socket = null;
    });
    super.disposeInternal();
  }

  /**
   * Event handle for socket connect event. Fires transport open event.
   * @param {?Object} event
   * @protected
   */
  onSocketConnect_() {
    this.emit('open');
  }

  /**
   * Event handle for socket data event. Fires transport data event.
   * @param {*} data
   * @protected
   */
  onSocketData_(data) {
    this.emit('data', this.decodeData(data));
  }

  /**
   * Event handle for socket disconnect event. Fires transport close event.
   * @protected
   */
  onSocketDisconnect_() {
    this.emit('close');
  }

  /**
   * Event handle for socket error event. Fires transport error event.
   * @param {Object} event
   * @protected
   */
  onSocketError_(event) {
    var error = new Error('Transport request error');
    error.socket = this.socket;
    error.message = event;
    this.emit('error', {
      error: error
    });
  }

  /**
   * Event handle for socket message event. Fires transport message event.
   * @protected
   */
  onSocketMessage_(message) {
    this.emit('message', message);
  }

  /**
   * @inheritDoc
   */
  open() {
    if (this.isOpen()) {
      console.warn('Transport is already open');
      return;
    }

    this.emit('opening');

    if (!this.socket) {
      this.socket = this.createSocket_();
      this.eventEmitterProxy_ = new EventEmitterProxy(this.socket, this, Transport.TRANSPORT_EVENTS);
    }

    this.socket.open();

    return this;
  }

  /**
   * Removes all listeners that were attached to the socket by this transport.
   * @protected
   */
  removeSocketListeners_() {
    for (var i = 0; i < this.socketEvents_.length; i++) {
      this.socket.removeListener(
        this.socketEvents_[i].event,
        this.socketEvents_[i].listener
      );
    }
  }

  /**
   * Sets this transport to be RESTful or not.
   * @param {boolean} restful
   */
  setRestful(restful) {
    this.restful_ = restful;
  }

  /**
   * Verifies that the `io` global function exists, throwing an error otherwise.
   * @throws {Error}
   * @protected
   */
  verifySocketIOExists_() {
    /*global io*/
    if (!io) {
      throw new Error('Socket.IO client not found');
    }
  }

  /**
   * @inheritDoc
   */
  write(message, config, opt_success) {
    if (this.restful_) {
      message = {
        data: message,
        method: config.method
      };
    }

    var self = this;
    this.socket.send(message, function(response) {
      if (opt_success) {
        opt_success(self.decodeData(response));
      }
    });
  }
}

/**
 * Holds the initial default config that should be used for this transport.
 * @type {Object}
 * @const
 * @static
 */
WebSocketTransport.INITIAL_DEFAULT_CONFIG = {
  method: 'POST'
};

/**
 * EventEmitterProxy instance that proxies events from the socket to this
 * transport.
 * @type {EventEmitterProxy}
 * @default null
 * @protected
 */
WebSocketTransport.prototype.eventEmitterProxy_ = null;

/**
 * If the requests should be RESTful or not. RESTful requests are always sent as
 * JSON data, with the method as one of the params, and the original data to be
 * sent accessible through the `data` key.
 * @type {boolean}
 * @default false
 * @protected
 */
WebSocketTransport.prototype.restful_ = false;

/**
 * Holds the underlying socket mechanism. Default mechanism uses Socket.IO.
 * @type {Socket.IO}
 * @default null
 */
WebSocketTransport.prototype.socket = null;

/**
 * Holds information about the events that are being listened in the socket.
 * This is necessary for removing these listeners when the transport is
 * disposed.
 * @type {Array<Object>}
 * @default null
 */
WebSocketTransport.prototype.socketEvents_ = null;

export default WebSocketTransport;
