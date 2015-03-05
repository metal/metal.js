'use strict';

import {async} from '../../src/promise/Promise';
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
  }, 30);
};

function emitAsync(emitter, eventName, data) {
  async.nextTick(function() {
    emitter.emit(eventName, data);
  });
}

export default FakeTransport;
