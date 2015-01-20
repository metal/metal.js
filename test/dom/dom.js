'use strict';

var assert = require('assert');
var sinon = require('sinon');
require('../fixture/sandbox.js');

describe('dom', function() {
  beforeEach(function() {
    global.document = {};
    global.Element = function() {};
  });

  after(function() {
    delete global.document;
    delete global.Element;
  });

  describe('on', function() {
    beforeEach(function() {
      Element.prototype.addEventListener = sinon.stub();
      Element.prototype.removeEventListener = sinon.stub();
    });

    it('should listen to event on requested element', function() {
      var listener = sinon.stub();
      var element = new Element();

      lfr.dom.on(element, 'myEvent', listener);
      assert.strictEqual(1, element.addEventListener.callCount);
      assert.strictEqual('myEvent', element.addEventListener.args[0][0]);
      assert.strictEqual(0, listener.callCount);

      element.addEventListener.args[0][1]({});
      assert.strictEqual(1, listener.callCount);
    });

    it('should be able to remove listener from return value of "on"', function() {
      var listener = sinon.stub();
      var element = new Element();

      var handle = lfr.dom.on(element, 'myEvent', listener);
      assert.ok(handle instanceof lfr.DomEventHandle);

      handle.removeListener();
      assert.strictEqual(1, element.removeEventListener.callCount);
      assert.strictEqual('myEvent', element.removeEventListener.args[0][0]);
      assert.strictEqual(element.addEventListener.args[0][1], element.removeEventListener.args[0][1]);
    });
  });
});
