'use strict';

import dom from '../../src/dom/dom';
import DomEventHandle from '../../src/events/DomEventHandle';

describe('dom', function() {

  afterEach(function() {
    document.body.innerHTML = '';
  });

  describe('css classes', function() {
    it('should add css classes to requested element', function() {
      function assertClassesAdded() {
        assert.strictEqual(2, getClassNames(element).length);
        assert.strictEqual('class1', getClassNames(element)[0]);
        assert.strictEqual('class2', getClassNames(element)[1]);
      }

      var element = document.createElement('div');
      dom.addClasses(element, ['class1', 'class2']);
      assertClassesAdded();

      element.className = '';
      dom.addClassesWithoutNative_(element, ['class1', 'class2']);
      assertClassesAdded();
    });

    it('should check if an element has the requested css class', function() {
      var element = document.createElement('div');
      dom.addClasses(element, ['class1', 'class2']);

      assert.ok(dom.hasClass(element, 'class1'));
      assert.ok(dom.hasClassWithoutNative_(element, 'class1'));

      assert.ok(dom.hasClass(element, 'class2'));
      assert.ok(dom.hasClassWithoutNative_(element, 'class2'));

      assert.ok(!dom.hasClass(element, 'class3'));
      assert.ok(!dom.hasClassWithoutNative_(element, 'class3'));
    });
    });
  });

  describe('manipulation', function() {
    it('should append element to parent element', function() {
      var parent = document.createElement('div');
      var child = document.createElement('div');

      dom.append(parent, child);
      assert.strictEqual(parent, child.parentNode);
    });

    it('should append string as document fragment to parent element', function() {
      var parent = document.createElement('div');
      var fragment = document.createDocumentFragment();
      sinon.stub(dom, 'buildFragment').returns(fragment);
      sinon.spy(parent, 'appendChild');

      dom.append(parent, '<div></div>');
      assert.strictEqual(1, dom.buildFragment.callCount);
      assert.strictEqual('<div></div>', dom.buildFragment.args[0][0]);
      assert.strictEqual(1, parent.appendChild.callCount);
      assert.strictEqual(fragment, parent.appendChild.args[0][0]);
      dom.buildFragment.restore();
    });

    it('should create document fragment from string', function() {
      var html = '<div>Hello World 1</div><div>Hello World 2</div>';
      var fragment = dom.buildFragment(html);

      assert.ok(fragment);
      assert.strictEqual(11, fragment.nodeType);
      assert.strictEqual(2, fragment.childNodes.length);
      assert.strictEqual('Hello World 1', fragment.childNodes[0].innerHTML);
      assert.strictEqual('Hello World 2', fragment.childNodes[1].innerHTML);
    });

    it('should remove children from element', function() {
      var element = document.createElement('div');
      element.innerHTML = '<div>0</div><div>1</div>';

      dom.removeChildren(element);
      assert.strictEqual(0, element.children.length);
    });
  });

  describe('on', function() {
    it('should listen to event on requested element', function() {
      var element = document.createElement('div');
      var listener = sinon.stub();
      dom.on(element, 'myEvent', listener);
      assert.strictEqual(0, listener.callCount);

      dom.triggerEvent(element, 'myEvent');
      assert.strictEqual(1, listener.callCount);
    });

    it('should be able to remove listener from return value of "on"', function() {
      var element = document.createElement('div');
      var listener = sinon.stub();

      var handle = dom.on(element, 'myEvent', listener);
      assert.ok(handle instanceof DomEventHandle);

      handle.removeListener();
      dom.triggerEvent(element, 'myEvent');
      assert.strictEqual(0, listener.callCount);
    });
  });

  describe('triggerEvent', function() {
    it('should trigger dom event', function() {
      var listener = sinon.stub();
      var element = document.createElement('div');
      document.body.appendChild(element);
      element.addEventListener('click', listener);

      dom.triggerEvent(element, 'click');
      assert.strictEqual(1, listener.callCount);
      assert.strictEqual('click', listener.args[0][0].type);
      document.body.removeChild(element);
    });

    it('should add specified payload keys to triggered event', function() {
      var listener = sinon.stub();
      var element = document.createElement('div');
      document.body.appendChild(element);
      element.addEventListener('click', listener);

      dom.triggerEvent(element, 'click', {
        test: 'test'
      });
      assert.strictEqual(1, listener.callCount);
      assert.strictEqual('click', listener.args[0][0].type);
      assert.strictEqual('test', listener.args[0][0].test);
      document.body.removeChild(element);
    });
  });

  describe('delegate', function() {
    it('should trigger delegate listener for matched elements', function() {
      var element = document.createElement('div');
      element.innerHTML = '<div class="nomatch">' +
      '<div class="match">' +
      '<div class="nomatch">' +
      '<div class="match">' +
      '</div></div></div></div>';
      document.body.appendChild(element);
      var matchedElements = element.querySelectorAll('.match');

      var listenerTargets = [];
      var listener = function(event) {
        listenerTargets.push(event.delegateTarget);
      };
      dom.delegate(element, 'click', '.match', listener);

      dom.triggerEvent(matchedElements[1], 'click');
      assert.strictEqual(2, listenerTargets.length);
      assert.strictEqual(matchedElements[1], listenerTargets[0]);
      assert.strictEqual(matchedElements[0], listenerTargets[1]);
    });

    it('should only trigger delegate event starting from initial target', function() {
      var element = document.createElement('div');
      element.innerHTML = '<div class="nomatch">' +
      '<div class="match">' +
      '<div class="nomatch">' +
      '<div class="match">' +
      '</div></div></div></div>';
      document.body.appendChild(element);
      var matchedElements = element.querySelectorAll('.match');

      var listener = sinon.stub();
      dom.delegate(element, 'click', '.match', listener);

      dom.triggerEvent(matchedElements[0], 'click');
      assert.strictEqual(1, listener.callCount);
      assert.strictEqual(matchedElements[0], listener.args[0][0].delegateTarget);
    });

    it('should stop triggering event if stopPropagation is called', function() {
      var element = document.createElement('div');
      element.innerHTML = '<div class="nomatch">' +
      '<div class="match">' +
      '<div class="nomatch">' +
      '<div class="match">' +
      '</div></div></div></div>';
      document.body.appendChild(element);
      var matchedElements = element.querySelectorAll('.match');

      var listenerTargets = [];
      var listener = function(event) {
        listenerTargets.push(event.delegateTarget);
        event.stopPropagation();
      };
      dom.delegate(element, 'click', '.match', listener);

      dom.triggerEvent(matchedElements[1], 'click');
      assert.strictEqual(1, listenerTargets.length);
      assert.strictEqual(matchedElements[1], listenerTargets[0]);
    });

    it('should stop triggering event if stopImmediatePropagation is called', function() {
      var element = document.createElement('div');
      element.innerHTML = '<div class="nomatch">' +
      '<div class="match">' +
      '<div class="nomatch">' +
      '<div class="match">' +
      '</div></div></div></div>';
      document.body.appendChild(element);
      var matchedElements = element.querySelectorAll('.match');

      var listenerTargets = [];
      var listener = function(event) {
        listenerTargets.push(event.delegateTarget);
        event.stopImmediatePropagation();
      };
      dom.delegate(element, 'click', '.match', listener);

      dom.triggerEvent(matchedElements[1], 'click');
      assert.strictEqual(1, listenerTargets.length);
      assert.strictEqual(matchedElements[1], listenerTargets[0]);
    });
  });

  describe('match', function() {
    before(function() {
      this.origMatches_ = Element.prototype.matches;
      this.origWebkitMatchesSelector_ = Element.prototype.webkitMatchesSelector;
      this.origMozMatchesSelector_ = Element.prototype.mozMatchesSelector;
      this.origMsMatchesSelector_ = Element.prototype.msMatchesSelector;
      this.origOMatchesSelector_ = Element.prototype.oMatchesSelector;
    });

    after(function() {
      Element.prototype.matches = this.origMatches_;
      Element.prototype.webkitMatchesSelector = this.origWebkitMatchesSelector_;
      Element.prototype.mozMatchesSelector = this.origMozMatchesSelector_;
      Element.prototype.msMatchesSelector = this.origMsMatchesSelector_;
      Element.prototype.oMatchesSelector = this.origOMatchesSelector_;
    });

    it('should return false if no element is given', function() {
      assert.ok(!dom.match());
    });

    it('should use matches function when available', function() {
      var matchedElement = document.createElement('div');
      Element.prototype.matches = sinon.stub().returns(matchedElement);
      var element = document.createElement('div');

      assert.strictEqual(matchedElement, dom.match(element, '.selector'));
      assert.strictEqual(1, element.matches.callCount);
      assert.strictEqual('.selector', element.matches.args[0][0]);
    });

    it('should use webkitMatchesSelector function when available', function() {
      var matchedElement = document.createElement('div');
      Element.prototype.matches = null;
      Element.prototype.webkitMatchesSelector = sinon.stub().returns(matchedElement);
      var element = document.createElement('div');

      assert.strictEqual(matchedElement, dom.match(element, '.selector'));
      assert.strictEqual(1, element.webkitMatchesSelector.callCount);
      assert.strictEqual('.selector', element.webkitMatchesSelector.args[0][0]);
    });

    it('should use mozMatchesSelector function when available', function() {
      var matchedElement = document.createElement('div');
      Element.prototype.matches = null;
      Element.prototype.webkitMatchesSelector = null;
      Element.prototype.mozMatchesSelector = sinon.stub().returns(matchedElement);
      var element = document.createElement('div');

      assert.strictEqual(matchedElement, dom.match(element, '.selector'));
      assert.strictEqual(1, element.mozMatchesSelector.callCount);
      assert.strictEqual('.selector', element.mozMatchesSelector.args[0][0]);
    });

    it('should use msMatchesSelector function when available', function() {
      var matchedElement = document.createElement('div');
      Element.prototype.matches = null;
      Element.prototype.webkitMatchesSelector = null;
      Element.prototype.mozMatchesSelector = null;
      Element.prototype.msMatchesSelector = sinon.stub().returns(matchedElement);
      var element = document.createElement('div');

      assert.strictEqual(matchedElement, dom.match(element, '.selector'));
      assert.strictEqual(1, element.msMatchesSelector.callCount);
      assert.strictEqual('.selector', element.msMatchesSelector.args[0][0]);
    });

    it('should use oMatchesSelector function when available', function() {
      var matchedElement = document.createElement('div');
      Element.prototype.matches = null;
      Element.prototype.webkitMatchesSelector = null;
      Element.prototype.mozMatchesSelector = null;
      Element.prototype.msMatchesSelector = null;
      Element.prototype.oMatchesSelector = sinon.stub().returns(matchedElement);
      var element = document.createElement('div');

      assert.strictEqual(matchedElement, dom.match(element, '.selector'));
      assert.strictEqual(1, element.oMatchesSelector.callCount);
      assert.strictEqual('.selector', element.oMatchesSelector.args[0][0]);
    });

    it('should return false for invalid node type', function() {
      Element.prototype.matches = sinon.stub();

      var element = document.createDocumentFragment();
      assert.ok(!dom.match(element, 'selector'));
      assert.strictEqual(0, Element.prototype.matches.callCount);
    });

    it('should fall back to using querySelectorAll when no others are available', function() {
      var element = document.createElement('div');
      element.className = 'class1';
      document.body.appendChild(element);
      var element2 = document.createElement('div');
      element2.className = 'class2';
      document.body.appendChild(element2);

      Element.prototype.matches = null;
      Element.prototype.webkitMatchesSelector = null;
      Element.prototype.mozMatchesSelector = null;
      Element.prototype.msMatchesSelector = null;
      Element.prototype.oMatchesSelector = null;

      assert.ok(dom.match(element, '.class1'));
      assert.ok(!dom.match(element, '.class2'));
      assert.ok(dom.match(element2, '.class2'));
    });
  });

  describe('toElement', function() {
    it('should return the element itself if one is given for conversion', function() {
      var element = document.createElement('div');

      assert.strictEqual(element, dom.toElement(element));
    });

    it('should return matching element if selector is given', function() {
      var element = document.createElement('div');
      element.className = 'mySelector';
      document.body.appendChild(element);

      assert.strictEqual(element, dom.toElement('.mySelector'));
    });

    it('should return null if invalid param is given', function() {
      assert.strictEqual(null, dom.toElement({}));
      assert.strictEqual(null, dom.toElement([]));
      assert.strictEqual(null, dom.toElement(1));
      assert.strictEqual(null, dom.toElement(null));
    });
  });

  describe('supportsEvent', function() {
    it('should check if element supports event', function() {
      var element = document.createElement('div');

      assert.ok(!dom.supportsEvent(element, 'lalala'));
      assert.ok(dom.supportsEvent(element, 'click'));
      assert.ok(dom.supportsEvent(element, 'change'));
    });
  });

  function getClassNames(element) {
    return element.className.trim().split(' ');
  }

});
