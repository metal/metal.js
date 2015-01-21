'use strict';

var assert = require('assert');
var sinon = require('sinon');
require('../fixture/sandbox.js');

describe('dom', function() {
  beforeEach(function() {
    global.document = {};
    global.Element = function() {};
    global.Event = function() {};
  });

  after(function() {
    delete global.document;
    delete global.Element;
  });

  describe('manipulation', function() {
    it('should append element to parent element', function() {
      var parent = {
        appendChild: sinon.stub()
      };
      var child = {};

      lfr.dom.append(parent, child);
      assert.strictEqual(1, parent.appendChild.callCount);
      assert.strictEqual(child, parent.appendChild.args[0][0]);
    });

    it('should append string as document fragment to parent element', function() {
      var parent = {
        appendChild: sinon.stub()
      };
      var docFragment = {};
      sinon.stub(lfr.dom, 'buildFragment').returns(docFragment);

      lfr.dom.append(parent, '<div></div>');
      assert.strictEqual(1, lfr.dom.buildFragment.callCount);
      assert.strictEqual('<div></div>', lfr.dom.buildFragment.args[0][0]);
      assert.strictEqual(1, parent.appendChild.callCount);
      assert.strictEqual(docFragment, parent.appendChild.args[0][0]);
      lfr.dom.buildFragment.restore();
    });

    it('should create document fragment from string', function() {
      var element = {
        removeChild: sinon.stub()
      };
      // Stub element.firstChild property to return for the first, second, third
      // and fourth calls <br>, <div></div>, <div></div> and null, respectively.
      var children = ['<br>', '<div></div>', '<div></div>', null];
      var firstChildCallCount = 0;
      Object.defineProperty(element, 'firstChild', {
        get: function() {
          return children[firstChildCallCount++];
        }
      });
      document.createElement = sinon.stub().returns(element);

      var docFragment = {
        appendChild: sinon.stub()
      };
      document.createDocumentFragment = sinon.stub().returns(docFragment);

      var createdDocFragment = lfr.dom.buildFragment('<div></div>');
      assert.strictEqual(docFragment, createdDocFragment);
      // Creates temp element
      assert.strictEqual(1, document.createElement.callCount);
      // Removes firstChild <br> pad from created element
      assert.strictEqual(1, element.removeChild.callCount);
      assert.strictEqual('<br>', element.removeChild.args[0][0]);
      // Creates new fragment to append nodes from the string fragment
      assert.strictEqual(1, document.createDocumentFragment.callCount);
      // Asserts remaining element.firstChild was appended to the new fragment
      assert.strictEqual(4, firstChildCallCount);
      assert.strictEqual('<div></div>', docFragment.appendChild.args[0][0]);
    });

    it('should remove children from element', function() {
      var element = {
        removeChild: sinon.stub()
      };
      // Stub element.firstChild property to return for the first, second, third
      // and fourth calls <div></div>, <div></div>, null and null, respectively.
      var children = ['<div>0</div>', '<div>1</div>', null, null];
      var firstChildCallCount = 0;
      Object.defineProperty(element, 'firstChild', {
        get: function() {
          return children[firstChildCallCount++];
        }
      });

      lfr.dom.removeChildren(element);
      assert.strictEqual('<div>0</div>', element.removeChild.args[0][0]);
      assert.strictEqual('<div>1</div>', element.removeChild.args[1][0]);
      assert.strictEqual(null, element.firstChild);
    });
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

  describe('delegate', function() {
    beforeEach(function() {
      Element.prototype.nodeType = 1;
      Element.prototype.matches = function(selector) {
        return selector === '.' + this.className;
      };

      Event.prototype.stopPropagation = sinon.stub();
      Event.prototype.stopImmediatePropagation = sinon.stub();
    });

    function createElements(classNames) {
      var elements = [];
      for (var i = 0; i < classNames.length; i++) {
        elements.push(new Element());
        elements[i].className = classNames[i];
        elements[i].parentNode = elements[i - 1];
        elements[i].addEventListener = sinon.stub();
      }
      return elements;
    }

    it('should only listen to delegate event on container', function() {
      var elements = createElements(['nomatch', 'match', 'nomatch', 'match']);

      var listener = sinon.stub();
      lfr.dom.delegate(elements[0], 'myEvent', '.match', listener);
      assert.strictEqual(1, elements[0].addEventListener.callCount);
      assert.strictEqual(0, elements[1].addEventListener.callCount);
      assert.strictEqual(0, elements[2].addEventListener.callCount);
      assert.strictEqual(0, elements[3].addEventListener.callCount);
    });

    it('should trigger delegate listener for matched elements', function() {
      var elements = createElements(['nomatch', 'match', 'nomatch', 'match']);

      var listenerTargets = [];
      var listener = function(event) {
        listenerTargets.push(event.delegateTarget);
      };
      lfr.dom.delegate(elements[0], 'myEvent', '.match', listener);

      elements[0].addEventListener.args[0][1]({
        target: elements[3]
      });
      assert.strictEqual(2, listenerTargets.length);
      assert.strictEqual(elements[3], listenerTargets[0]);
      assert.strictEqual(elements[1], listenerTargets[1]);
    });

    it('should only trigger delegate event starting from initial target', function() {
      var elements = createElements(['nomatch', 'match', 'nomatch', 'match']);

      var listenerTargets = [];
      var listener = function(event) {
        listenerTargets.push(event.delegateTarget);
      };
      lfr.dom.delegate(elements[0], 'myEvent', '.match', listener);

      elements[0].addEventListener.args[0][1]({
        target: elements[2]
      });
      assert.strictEqual(1, listenerTargets.length);
      assert.strictEqual(elements[1], listenerTargets[0]);
    });

    it('should stop triggering event if stopPropagation is called', function() {
      var elements = createElements(['nomatch', 'match', 'nomatch', 'match']);

      var listenerTargets = [];
      var listener = function(event) {
        listenerTargets.push(event.delegateTarget);
        event.stopPropagation();
      };
      lfr.dom.delegate(elements[0], 'myEvent', '.match', listener);

      var sentEvent = new Event();
      sentEvent.target = elements[3];
      elements[0].addEventListener.args[0][1](sentEvent);
      assert.strictEqual(1, listenerTargets.length);
      assert.strictEqual(elements[3], listenerTargets[0]);
    });

    it('should stop triggering event if stopImmediatePropagation is called', function() {
      var elements = createElements(['nomatch', 'match', 'nomatch', 'match']);

      var listenerTargets = [];
      var listener = function(event) {
        listenerTargets.push(event.delegateTarget);
        event.stopImmediatePropagation();
      };
      lfr.dom.delegate(elements[0], 'myEvent', '.match', listener);

      var sentEvent = new Event();
      sentEvent.target = elements[3];
      elements[0].addEventListener.args[0][1](sentEvent);
      assert.strictEqual(1, listenerTargets.length);
      assert.strictEqual(elements[3], listenerTargets[0]);
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
