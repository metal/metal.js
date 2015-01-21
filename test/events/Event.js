'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('Event', function() {
  it('should update stopped property when stopPropagation is called', function() {
    var event = new Event();
    assert.ok(!event.stopped);

    event.stopPropagation();
    assert.ok(event.stopped);
  });

  it('should update stopped property when stopImmediatePropagation is called', function() {
    var event = new Event();
    assert.ok(!event.stopped);

    event.stopImmediatePropagation();
    assert.ok(event.stopped);
  });
});
