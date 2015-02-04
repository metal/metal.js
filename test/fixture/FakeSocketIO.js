'use strict';

window.createFakeSocketIO = function() {
  var FakeSocketIO = function() {
    FakeSocketIO.base(this, 'constructor');
  };
  lfr.inherits(FakeSocketIO, lfr.EventEmitter);

  FakeSocketIO.prototype.close = function() {
    var self = this;
    clearTimeout(self.timer);
    self.timer = setTimeout(function() {
      self.emit('disconnect');
    }, 0);
  };
  FakeSocketIO.prototype.open = function() {
    var self = this;
    self.timer = setTimeout(function() {
      self.emit('connect');
    }, 0);
  };
  FakeSocketIO.prototype.send = function(message, callback) {
    var self = this;
    self.timer = setTimeout(function() {
      self.emit('message', message);
      self.timer = setTimeout(function() {
        if (callback) {
          callback(message);
        }
      }, 10);
    }, 0);
  };
  return FakeSocketIO;
};
