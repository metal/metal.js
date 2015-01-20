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

  describe('match', function() {
    it('should return false if no element is given', function() {
      assert.ok(!lfr.dom.match());
    });

    it('should use matches function when available', function() {
      Element.prototype.matches = sinon.stub().returns('returnValue');

      var element = new Element();
      element.nodeType = 1;
      assert.strictEqual('returnValue', lfr.dom.match(element, 'selector'));
      assert.strictEqual(1, element.matches.callCount);
      assert.strictEqual('selector', element.matches.args[0][0]);
    });

    it('should use webkitMatchesSelector function when available', function() {
      Element.prototype.webkitMatchesSelector = sinon.stub().returns('returnValue');

      var element = new Element();
      element.nodeType = 1;
      assert.strictEqual('returnValue', lfr.dom.match(element, 'selector'));
      assert.strictEqual(1, element.webkitMatchesSelector.callCount);
      assert.strictEqual('selector', element.webkitMatchesSelector.args[0][0]);
    });

    it('should use mozMatchesSelector function when available', function() {
      Element.prototype.mozMatchesSelector = sinon.stub().returns('returnValue');

      var element = new Element();
      element.nodeType = 1;
      assert.strictEqual('returnValue', lfr.dom.match(element, 'selector'));
      assert.strictEqual(1, element.mozMatchesSelector.callCount);
      assert.strictEqual('selector', element.mozMatchesSelector.args[0][0]);
    });

    it('should use msMatchesSelector function when available', function() {
      Element.prototype.msMatchesSelector = sinon.stub().returns('returnValue');

      var element = new Element();
      element.nodeType = 1;
      assert.strictEqual('returnValue', lfr.dom.match(element, 'selector'));
      assert.strictEqual(1, element.msMatchesSelector.callCount);
      assert.strictEqual('selector', element.msMatchesSelector.args[0][0]);
    });

    it('should use oMatchesSelector function when available', function() {
      Element.prototype.oMatchesSelector = sinon.stub().returns('returnValue');

      var element = new Element();
      element.nodeType = 1;
      assert.strictEqual('returnValue', lfr.dom.match(element, 'selector'));
      assert.strictEqual(1, element.oMatchesSelector.callCount);
      assert.strictEqual('selector', element.oMatchesSelector.args[0][0]);
    });

    it('should return false for invalid node type', function() {
      Element.prototype.matches = sinon.stub().returns('returnValue');

      var element = new Element();
      assert.ok(!lfr.dom.match(element, 'selector'));
      assert.strictEqual(0, element.matches.callCount);

      element.nodeType = 2;
      assert.ok(!lfr.dom.match(element, 'selector'));
      assert.strictEqual(0, element.matches.callCount);
    });

    it('should fall back to using querySelectorAll when no others are available', function() {
      var element = new Element();
      element.nodeType = 1;

      document.querySelectorAll = sinon.stub().returns([new Element(), element]);
      assert.ok(lfr.dom.match(element, 'selector'));
      assert.strictEqual(1, document.querySelectorAll.callCount);
      assert.strictEqual('selector', document.querySelectorAll.args[0][0]);

      document.querySelectorAll.returns([new Element(), new Element()]);
      assert.ok(!lfr.dom.match(element, 'selector'));
      assert.strictEqual(2, document.querySelectorAll.callCount);
    });
  });
});
