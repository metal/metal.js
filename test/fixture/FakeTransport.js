'use strict';

import Transport from '../../src/net/Transport';

class FakeTransport extends Transport {
  constructor(uri) {
    super(uri);
  }
}

FakeTransport.prototype.close = function() {
  emitAsync(this, 'close');
  return this;
};

FakeTransport.prototype.open = function() {
  this.emit('opening');
  emitAsync(this, 'open');
  return this;
};

FakeTransport.prototype.write = function(message, opt_config, opt_success) {
  setTimeout(function() {
    opt_success(message);
  }, 10);
};

function emitAsync(emitter, eventName, data) {
  setTimeout(function() {
    emitter.emit(eventName, data);
  }, 0);
}

export default FakeTransport;
