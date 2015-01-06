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

module.exports = FakeTransport;
