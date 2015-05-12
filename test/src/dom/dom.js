'use strict';

import dom from '../../../src/dom/dom';
import DomEventHandle from '../../../src/events/DomEventHandle';

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
			dom.addClasses(element, 'class1 class2');
			assertClassesAdded();

			element.className = '';
			dom.addClassesWithoutNative_(element, 'class1 class2');
			assertClassesAdded();
		});

		it('should check if an element has the requested css class', function() {
			var element = document.createElement('div');
			dom.addClasses(element, 'class1 class2');

			assert.ok(dom.hasClass(element, 'class1'));
			assert.ok(dom.hasClassWithoutNative_(element, 'class1'));

			assert.ok(dom.hasClass(element, 'class2'));
			assert.ok(dom.hasClassWithoutNative_(element, 'class2'));

			assert.ok(!dom.hasClass(element, 'class3'));
			assert.ok(!dom.hasClassWithoutNative_(element, 'class3'));
		});

		it('should check if css classes are being removed', function() {
			var element = document.createElement('div');
			dom.addClasses(element, 'class1 class2');

			dom.removeClasses(element, 'class1');
			assert.ok(!dom.hasClass(element, 'class1'));
			assert.ok(dom.hasClass(element, 'class2'));

			dom.removeClassesWithoutNative_(element, 'class2');
			assert.ok(!dom.hasClass(element, 'class2'));
		});

		it('should do nothing if element or classes are not object and string', function() {
			var element = document.createElement('div');
			assert.doesNotThrow(function() {
				dom.addClasses(element);
			});
			assert.strictEqual(element.className, '');

			assert.doesNotThrow(function() {
				dom.removeClasses(null, 'class1');
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

		it('should replace an element with a requested element', function() {
			var element1 = document.createElement('div');
			var element2 = document.createElement('div');
			dom.append(document.body, element1);

			dom.replace(element1, element2);
			assert.strictEqual(element2, document.body.childNodes[0]);
			assert.ok(!element1.parentNode);
		});

		it('should not remove element from parent if replacing it with itself', function() {
			var element = document.createElement('div');
			dom.append(document.body, element);

			dom.replace(element, element);
			assert.strictEqual(element, document.body.childNodes[0]);
		});

		it('should not throw error if null as passed as one of the elements for "replace"', function() {
			var element = document.createElement('div');
			dom.append(document.body, element);

			assert.doesNotThrow(function() {
				dom.replace(element, null);
				dom.replace(null, element);
			});
		});

		it('should node enter document', function() {
			var element = document.createElement('div');
			dom.enterDocument(element);
			assert.strictEqual(document.body, element.parentNode);
		});

		it('should node exit document', function() {
			var element = document.createElement('div');
			dom.enterDocument(element);
			dom.exitDocument(element);
			assert.strictEqual(null, element.parentNode);
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
			assert.strictEqual(document, dom.toElement(document));
		});

		it('should return matching element if selector is given', function() {
			var element = document.createElement('div');
			element.className = 'mySelector';
			document.body.appendChild(element);

			assert.strictEqual(element, dom.toElement('.mySelector'));
		});

		it('should return matching element when selector is id', function() {
			var element = document.createElement('div');
			element.id = 'myId';
			document.body.appendChild(element);

			assert.strictEqual(element, dom.toElement('#myId'));
		});

		it('should return matching element when selector is inside id', function() {
			var element = document.createElement('div');
			element.id = 'myId';
			document.body.appendChild(element);
			var element2 = document.createElement('div');
			element2.className = 'myClass';
			dom.append(element, element2);

			assert.strictEqual(element2, dom.toElement('#myId .myClass'));
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

		it('should check if element with the given tag supports event', function() {
			assert.ok(!dom.supportsEvent('div', 'lalala'));
			assert.ok(dom.supportsEvent('div', 'click'));
			assert.ok(dom.supportsEvent('div', 'change'));
		});
	});

	describe('registerCustomEvent', function() {
		before(function() {
			dom.registerCustomEvent('myClick', {
				delegate: true,
				event: true,
				handler: function(listener, event) {
					if (dom.hasClass(event.target, 'mine')) {
						return listener(event);
					}
				},
				originalEvent: 'click'
			});
		});

		it('should handle registered custom events', function() {
			var listener = sinon.stub();
			var element = document.createElement('div');
			dom.append(document.body, element);

			dom.on(element, 'myClick', listener);
			dom.triggerEvent(element, 'click');
			assert.strictEqual(0, listener.callCount);

			dom.addClasses(element, 'mine');
			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should handle delegate for registered custom events', function() {
			var element = document.createElement('div');
			dom.addClasses(element, 'mine');
			dom.append(document.body, element);

			var myElement = document.createElement('div');
			dom.addClasses(myElement, 'mine foo');
			dom.append(element, myElement);

			var fooElement = document.createElement('div');
			dom.addClasses(fooElement, 'foo');
			dom.append(element, fooElement);

			var listener = sinon.stub();
			dom.delegate(element, 'myClick', '.foo', listener);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(0, listener.callCount);

			dom.triggerEvent(fooElement, 'click');
			assert.strictEqual(0, listener.callCount);

			dom.triggerEvent(myElement, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should return true when supportsEvent is called for registered custom event', function() {
			assert.ok(dom.supportsEvent(document.createElement('div'), 'myClick'));
			assert.ok(!dom.supportsEvent(document.createElement('div'), 'yourClick'));
		});
	});

	describe('Custom Events', function() {
		beforeEach(function() {
			var element1 = document.createElement('div');
			dom.append(document.body, element1);
			var element2 = document.createElement('div');
			dom.addClasses(element2, 'inner');
			dom.append(element1, element2);
			var element3 = document.createElement('div');
			dom.append(element2, element3);

			this.element1 = element1;
			this.element2 = element2;
			this.element3 = element3;
		});

		it('should delegate mouseenter event', function() {
			var listener = sinon.stub();
			dom.delegate(this.element1, 'mouseenter', '.inner', listener);

			dom.triggerEvent(this.element1, 'mouseover');
			assert.strictEqual(0, listener.callCount);
			dom.triggerEvent(this.element2, 'mouseover', {relatedTarget: this.element1});
			assert.strictEqual(1, listener.callCount);
			assert.strictEqual('mouseenter', listener.args[0][0].customType);
			dom.triggerEvent(this.element2, 'mouseover', {relatedTarget: this.element3});
			assert.strictEqual(1, listener.callCount);
		});

		it('should delegate mouseleave event', function() {
			var listener = sinon.stub();
			dom.delegate(this.element1, 'mouseleave', '.inner', listener);

			dom.triggerEvent(this.element1, 'mouseout');
			assert.strictEqual(0, listener.callCount);
			dom.triggerEvent(this.element2, 'mouseout', {relatedTarget: this.element1});
			assert.strictEqual(1, listener.callCount);
			assert.strictEqual('mouseleave', listener.args[0][0].customType);
			dom.triggerEvent(this.element2, 'mouseout', {relatedTarget: this.element3});
			assert.strictEqual(1, listener.callCount);
		});

		it('should delegate pointerenter event', function() {
			var listener = sinon.stub();
			dom.delegate(this.element1, 'pointerenter', '.inner', listener);

			dom.triggerEvent(this.element1, 'pointerover');
			assert.strictEqual(0, listener.callCount);
			dom.triggerEvent(this.element2, 'pointerover', {relatedTarget: this.element1});
			assert.strictEqual(1, listener.callCount);
			assert.strictEqual('pointerenter', listener.args[0][0].customType);
			dom.triggerEvent(this.element2, 'pointerover', {relatedTarget: this.element3});
			assert.strictEqual(1, listener.callCount);
		});

		it('should delegate pointerleave event', function() {
			var listener = sinon.stub();
			dom.delegate(this.element1, 'pointerleave', '.inner', listener);

			dom.triggerEvent(this.element1, 'pointerout');
			assert.strictEqual(0, listener.callCount);
			dom.triggerEvent(this.element2, 'pointerout', {relatedTarget: this.element1});
			assert.strictEqual(1, listener.callCount);
			assert.strictEqual('pointerleave', listener.args[0][0].customType);
			dom.triggerEvent(this.element2, 'pointerout', {relatedTarget: this.element3});
			assert.strictEqual(1, listener.callCount);
		});
	});

	describe('Helpers', function() {
		it('should check if element is empty', function() {
			var element = document.createElement('div');
			assert.ok(dom.isEmpty(element));

			element.innerHTML = 'foo';
			assert.ok(!dom.isEmpty(element));
		});
	});

	function getClassNames(element) {
		return element.className.trim().split(' ');
	}

});
