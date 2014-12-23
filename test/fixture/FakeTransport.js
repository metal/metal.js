'use strict';

function FakeTransport(uri) {
  FakeTransport.base(this, 'constructor', uri);
}
lfr.inherits(FakeTransport, lfr.Transport);

FakeTransport.prototype.close = function() {
  emitAsync(this, 'close');
  return this;
};

FakeTransport.prototype.open = function() {
  this.emit('opening');
  emitAsync(this, 'open');
  return this;
};

FakeTransport.prototype.write = function(message) {
  emitAsync(this, 'data', message, 10);
};

function emitAsync(emitter, eventName, data, delay) {
  if (!delay) {
    delay = 0;
  }

  setTimeout(function() {
    emitter.emit(eventName, data);
  }, delay);
}

module.exports = FakeTransport;
