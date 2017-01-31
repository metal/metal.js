'use strict';

import dom from '../src/all/dom';
import { object } from 'metal';
import UA from 'metal-useragent';
import DomEventHandle from '../src/DomEventHandle';

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
		});

		it('should add css classes to requested elements', function() {
			function assertClassesAdded(element) {
				assert.strictEqual(2, getClassNames(element).length);
				assert.strictEqual('class1', getClassNames(element)[0]);
				assert.strictEqual('class2', getClassNames(element)[1]);
			}

			var element1 = document.createElement('div');
			var element2 = document.createElement('div');
			dom.append(document.body, element1);
			dom.append(document.body, element2);
			var elements = document.querySelectorAll('div');

			dom.addClasses(elements, 'class1 class2');

			assertClassesAdded(element1);
			assertClassesAdded(element2);
		});

		it('should not throw error if addClasses is called with empty string', function() {
			var element = document.createElement('div');
			assert.doesNotThrow(() => dom.addClasses(element, ''));
		});

		it('should not add css classes twice to the same element', function() {
			var element = document.createElement('div');
			dom.addClasses(element, 'class1 class2');
			dom.addClasses(element, 'class1 class2');
			assert.strictEqual('class1 class2', element.className.trim());
		});

		it('should check if an element has the requested css class', function() {
			var element = document.createElement('div');
			dom.addClasses(element, 'class1 class2');

			assert.ok(dom.hasClass(element, 'class1'));

			assert.ok(dom.hasClass(element, 'class2'));

			assert.ok(!dom.hasClass(element, 'class3'));
		});

		it('should check if css classes are being removed', function() {
			var element = document.createElement('div');
			dom.addClasses(element, 'class1 class2');

			dom.removeClasses(element, 'class1');
			assert.ok(!dom.hasClass(element, 'class1'));
			assert.ok(dom.hasClass(element, 'class2'));
		});

		it('should check if css classes are being removed from multiple elements', function() {
			function assertClassesRemoved(element) {
				assert.ok(!dom.hasClass(element, 'class1'));
				assert.ok(dom.hasClass(element, 'class2'));
			}

			var element1 = document.createElement('div');
			var element2 = document.createElement('div');
			dom.append(document.body, element1);
			dom.append(document.body, element2);
			var elements = document.querySelectorAll('div');
			dom.addClasses(elements, 'class1 class2');

			dom.removeClasses(elements, 'class1');

			assertClassesRemoved(element1);
			assertClassesRemoved(element2);
		});

		it('should not throw error if removeClasses is called with empty string', function() {
			var element = document.createElement('div');
			assert.doesNotThrow(() => dom.removeClasses(element, ''));
		});

		it('should do nothing if element or classes are not object and string in add/remove classes', function() {
			var element = document.createElement('div');
			assert.doesNotThrow(function() {
				dom.addClasses(element);
			});
			assert.strictEqual(element.className, '');

			assert.doesNotThrow(function() {
				dom.removeClasses(null, 'class1');
			});
		});

		it('should do nothing if element or classes are not object and string in toggle classes', function() {
			var element = document.createElement('div');
			assert.doesNotThrow(function() {
				dom.toggleClasses(element);
			});
			assert.strictEqual(element.className, '');

			assert.doesNotThrow(function() {
				dom.toggleClasses(null, 'class1');
			});
		});

		it('should toggle classes in an element', function() {
			var element = document.createElement('div');

			element.className = 'lorem';
			dom.toggleClasses(element, 'lorem');
			assert.strictEqual('', element.className);

			element.className = '';
			dom.toggleClasses(element, 'lorem');
			assert.strictEqual('lorem', element.className);

			element.className = 'lorem ipsum';
			dom.toggleClasses(element, 'lorem ipsum');
			assert.strictEqual('', element.className);

			element.className = '';
			dom.toggleClasses(element, 'lorem ipsum');
			assert.strictEqual('lorem ipsum', element.className);

			element.className = 'lorem ipsum dolor sit amet';
			dom.toggleClasses(element, 'lorem sit consectetur adipiscing elit');
			assert.strictEqual('ipsum dolor amet consectetur adipiscing elit', element.className);

			element.className = 'lorem ipsum dolor sit amet';
			dom.toggleClasses(element, 'adipiscing elit lorem sit consectetur');
			assert.strictEqual('ipsum dolor amet adipiscing elit consectetur', element.className);
		});
	});

	describe('contains', function() {
		it('should check if element contains another', function() {
			var element1 = document.createElement('div');
			var element2 = document.createElement('div');
			var element3 = document.createElement('div');
			dom.append(element1, element2);
			dom.enterDocument(element3);

			assert.ok(dom.contains(element1, element2));
			assert.ok(dom.contains(document, element3));

			assert.ok(!dom.contains(element1, element3));
			assert.ok(!dom.contains(element2, element1));
			assert.ok(!dom.contains(document, element1));
			assert.ok(!dom.contains(document, element2));
		});
	});

	describe('manipulation', function() {
		it('should append html string to parent element', function() {
			var parent = document.createElement('div');
			var childHtml = '<div class="myChild"></div>';

			dom.append(parent, childHtml);
			assert.strictEqual(childHtml, parent.innerHTML);
			assert.strictEqual('myChild', parent.childNodes[0].className);
		});

		it('should append element to parent element', function() {
			var parent = document.createElement('div');
			var child = document.createElement('div');

			dom.append(parent, child);
			assert.strictEqual(parent, child.parentNode);
		});

		it('should append node list to parent element', function() {
			var parent = document.createElement('div');
			var childFrag = dom.buildFragment('<div class="myChild"></div><div class="myChild2"></div>');

			dom.append(parent, childFrag.childNodes);
			assert.strictEqual(2, parent.childNodes.length);
			assert.strictEqual('myChild', parent.childNodes[0].className);
			assert.strictEqual('myChild2', parent.childNodes[1].className);
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

		it('should not throw error if trying to replace element that doesn\'t have a parent', function() {
			var element1 = document.createElement('div');
			var element2 = document.createElement('div');

			assert.doesNotThrow(function() {
				dom.replace(element1, element2);
			});
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

		it('should not throw error if "enterDocument" is called without element', function() {
			assert.doesNotThrow(function() {
				dom.enterDocument();
			});
		});

		it('should node exit document', function() {
			var element = document.createElement('div');
			dom.enterDocument(element);
			dom.exitDocument(element);
			assert.strictEqual(null, element.parentNode);
		});

		it('should not throw error if "exitDocument" is called on element without parent', function() {
			var element = document.createElement('div');
			assert.doesNotThrow(function() {
				dom.exitDocument(element);
			});
		});

		it('should not throw error if "exitDocument" is called without element', function() {
			assert.doesNotThrow(function() {
				dom.exitDocument();
			});
		});

		it('should append string as document fragment to parent element', function() {
			var parent = document.createElement('div');
			sinon.stub(parent, 'appendChild');

			dom.append(parent, '<div></div>');
			assert.strictEqual(1, parent.appendChild.callCount);

			const frag = parent.appendChild.args[0][0];
			assert.ok(frag);
			assert.strictEqual(11, frag.nodeType);
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

		it('should listen to event on document if selector is passed instead of element', function() {
			var element = document.createElement('div');
			element.className = 'myClass';
			dom.enterDocument(element);

			var listener = sinon.stub();
			dom.on('.myClass', 'click', listener);
			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should listen to event on capture phase', function() {
			var element = document.createElement('div');
			var parentElement = document.createElement('div');
			parentElement.appendChild(element);
			dom.enterDocument(parentElement);

			var listener = sinon.stub();
			dom.on(element, 'click', listener);
			var parentListener = sinon.stub();
			dom.on(parentElement, 'click', parentListener, true);

			dom.triggerEvent(element, 'click');
			sinon.assert.callOrder(parentListener, listener);
		});

		it('should remove listener that was attached on capture phase', function() {
			var element = document.createElement('div');
			dom.enterDocument(element);

			var listener = sinon.stub();
			var handle = dom.on(element, 'click', listener, true);
			handle.removeListener();

			dom.triggerEvent(element, 'click');
			assert.strictEqual(0, listener.callCount);
		});
	});

	describe('once', function() {
		it('should listen once to event on requested element', function() {
			var element = document.createElement('div');
			var listener = sinon.stub();
			dom.once(element, 'myEvent', listener);
			assert.strictEqual(0, listener.callCount);

			dom.triggerEvent(element, 'myEvent');
			dom.triggerEvent(element, 'myEvent');
			assert.strictEqual(1, listener.callCount);
		});

		it('should be able to remove listener from return value of "once"', function() {
			var element = document.createElement('div');
			var listener = sinon.stub();

			var handle = dom.once(element, 'myEvent', listener);
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

		it('should not trigger dom click event for disabled elements', function() {
			var input = document.createElement('input');
			var select = document.createElement('select');
			var button = document.createElement('button');
			var textarea = document.createElement('textarea');
			input.disabled = true;
			select.disabled = true;
			button.disabled = true;
			textarea.disabled = true;
			document.body.appendChild(input);
			document.body.appendChild(select);
			document.body.appendChild(button);
			document.body.appendChild(textarea);

			var listener1 = sinon.stub();
			var listener2 = sinon.stub();
			var listener3 = sinon.stub();
			var listener4 = sinon.stub();

			input.addEventListener('click', listener1);
			select.addEventListener('click', listener2);
			button.addEventListener('click', listener3);
			textarea.addEventListener('click', listener4);

			dom.triggerEvent(input, 'click');
			dom.triggerEvent(select, 'click');
			dom.triggerEvent(button, 'click');
			dom.triggerEvent(textarea, 'click');
			assert.strictEqual(0, listener1.callCount);
			assert.strictEqual(0, listener2.callCount);
			assert.strictEqual(0, listener3.callCount);
			assert.strictEqual(0, listener4.callCount);
		});

		it('should not trigger dom click event on a form control with a disabled fieldset parent', function() {
			var parent = document.createElement('fieldset');
			parent.disabled = true;
			document.body.appendChild(parent);

			var input = document.createElement('input');
			var select = document.createElement('select');
			var button = document.createElement('button');
			var textarea = document.createElement('textarea');
			parent.appendChild(input);
			parent.appendChild(select);
			parent.appendChild(button);
			parent.appendChild(textarea);

			var listener1 = sinon.stub();
			var listener2 = sinon.stub();
			var listener3 = sinon.stub();
			var listener4 = sinon.stub();

			input.addEventListener('click', listener1);
			select.addEventListener('click', listener2);
			button.addEventListener('click', listener3);
			textarea.addEventListener('click', listener4);

			dom.triggerEvent(input, 'click');
			dom.triggerEvent(select, 'click');
			dom.triggerEvent(button, 'click');
			assert.strictEqual(0, listener1.callCount);
			assert.strictEqual(0, listener2.callCount);
			assert.strictEqual(0, listener3.callCount);
			assert.strictEqual(0, listener4.callCount);
		});

		it('should trigger click event listeners for non-disabled elements even with its parent being disabled', function() {
			var element = document.createElement('fieldset');
			element.innerHTML = '<span class="match"></span>';
			element.disabled = true;
			document.body.appendChild(element);

			var target = element.querySelector('.match');

			var listener = sinon.stub();
			target.addEventListener('click', listener);

			dom.triggerEvent(target, 'click');

			assert.strictEqual(1, listener.callCount);
		});

		it('should keep bubling and triggering click event listeners for non-disabled elements', function() {
			var element = document.createElement('div');
			element.innerHTML = '<div class="match"><fieldset disabled>' +
				'<span class="match"></span></fieldset></div>';
			document.body.appendChild(element);

			var span = element.querySelector('span');

			var listeners = sinon.stub();
			dom.delegate(element, 'click', '.match', listeners);
			dom.triggerEvent(span, 'click');

			// Firefox works in a diferent way. It stops bubbling events when it hits a
			// disabled element.
			var spectedResult = UA.isFirefox ? 0 : 2;
			assert.strictEqual(spectedResult, listeners.callCount);
		});
	});

	describe('delegate', function() {
		describe('selector', function() {
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

			it('should trigger delegate listener for "focus" event', function() {
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
				dom.delegate(element, 'focus', '.match', listener);

				dom.triggerEvent(matchedElements[1], 'focus');
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

				var listenerTargets = [];
				var listener = function(event) {
					listenerTargets.push(event.delegateTarget);
				};
				dom.delegate(element, 'click', '.match', listener);

				dom.triggerEvent(matchedElements[0], 'click');
				assert.strictEqual(1, listenerTargets.length);
				assert.strictEqual(matchedElements[0], listenerTargets[0]);
			});

			it('should trigger listener twice when two ancestors are delegating', function() {
				var element = document.createElement('div');
				element.innerHTML = `<div class="nomatch">
					<div class="nomatch">
						<div class="match"></div>
					</div>
				</div>`;
				document.body.appendChild(element);

				var listener = sinon.stub();
				dom.delegate(element, 'click', '.match', listener);
				dom.delegate(element.childNodes[0], 'click', '.match', listener);

				dom.triggerEvent(element.querySelector('.match'), 'click');
				assert.strictEqual(2, listener.callCount);
			});

			it('should not trigger delegate event for parents of given element', function() {
				var element = document.createElement('div');
				element.innerHTML = '<div class="nomatch"></div>';
				element.className = 'match';
				document.body.appendChild(element);

				var childElement = element.childNodes[0];
				var listener = sinon.stub();
				dom.delegate(childElement, 'click', '.match', listener);

				dom.triggerEvent(childElement, 'click');
				assert.strictEqual(0, listener.callCount);
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

			it('should run default listeners last', function() {
				var element = document.createElement('div');
				element.innerHTML = '<div class="root"><div class="match"></div></div>';
				document.body.appendChild(element);

				var listener1 = sinon.stub();
				var listener2 = sinon.stub();
				var listener3 = sinon.stub();
				dom.delegate(element, 'click', '.match', listener1, true);
				dom.delegate(element, 'click', '.match', listener2);
				dom.delegate(element, 'click', '.root', listener3);

				dom.triggerEvent(element.querySelector('.match'), 'click');
				assert.strictEqual(1, listener1.callCount);
				assert.strictEqual(1, listener2.callCount);
				assert.strictEqual(1, listener3.callCount);
				listener1.calledAfter(listener2);
				listener1.calledAfter(listener3);
				listener3.calledAfter(listener2);
			});

			it('should pass correct delegateTarget to default listener', function() {
				var element = document.createElement('div');
				element.innerHTML = '<div class="root"><div class="match"></div></div>';
				document.body.appendChild(element);

				var target;
				var listener = function(event) {
					target = event.delegateTarget;
				};
				dom.delegate(element, 'click', '.match', listener, true);

				dom.triggerEvent(element.querySelector('.match'), 'click');
				assert.ok(target);
				assert.strictEqual(element.querySelector('.match'), target);
			});

			it('should not run default listener if event is prevented', function() {
				var element = document.createElement('div');
				element.innerHTML = '<div><div class="match"></div></div>';
				document.body.appendChild(element);

				var listener = sinon.stub();
				dom.delegate(element, 'click', '.match', listener, true);
				dom.delegate(element, 'click', '.match', event => event.preventDefault());

				dom.triggerEvent(element.querySelector('.match'), 'click');
				assert.strictEqual(0, listener.callCount);
			});

			it('should cancel listener through returned handle', function() {
				var element = document.createElement('div');
				element.innerHTML = '<div class="nomatch">' +
					'<div class="match">' +
					'<div class="nomatch">' +
					'<div class="match">' +
					'</div></div></div></div>';
				document.body.appendChild(element);
				var matchedElements = element.querySelectorAll('.match');

				var listener1 = sinon.stub();
				var handle = dom.delegate(element, 'click', '.match', listener1);

				handle.removeListener();
				dom.triggerEvent(matchedElements[0], 'click');
				assert.strictEqual(0, listener1.callCount);
			});

			it('should clear delegateTarget from event object after event is done', function() {
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

				dom.triggerEvent(matchedElements[1], 'click');
				assert.ok(!listener.args[0][0].delegateTarget);
			});

			it('should not run click event listeners for disabled elements', function() {
				var parent = document.createElement('div');
				document.body.appendChild(parent);

				var input = document.createElement('input');
				var select = document.createElement('select');
				var button = document.createElement('button');
				var textarea = document.createElement('textarea');
				input.disabled = true;
				select.disabled = true;
				button.disabled = true;
				textarea.disabled = true;
				parent.appendChild(input);
				parent.appendChild(select);
				parent.appendChild(button);
				parent.appendChild(textarea);

				var listener1 = sinon.stub();
				var listener2 = sinon.stub();
				var listener3 = sinon.stub();
				var listener4 = sinon.stub();

				dom.delegate(parent, 'click', input, listener1);
				dom.delegate(parent, 'click', select, listener2);
				dom.delegate(parent, 'click', button, listener3);
				dom.delegate(parent, 'click', button, listener4);

				dom.triggerEvent(input, 'click');
				dom.triggerEvent(select, 'click');
				dom.triggerEvent(button, 'click');
				dom.triggerEvent(textarea, 'click');
				assert.strictEqual(0, listener1.callCount);
				assert.strictEqual(0, listener2.callCount);
				assert.strictEqual(0, listener3.callCount);
				assert.strictEqual(0, listener4.callCount);
			});

			it('should not run click event listeners to an element with an disabled valid parent', function() {
				var parent = document.createElement('fieldset');
				parent.disabled = true;
				document.body.appendChild(parent);

				var input = document.createElement('input');
				var select = document.createElement('select');
				var button = document.createElement('button');
				var textarea = document.createElement('textarea');
				parent.appendChild(input);
				parent.appendChild(select);
				parent.appendChild(button);
				parent.appendChild(textarea);

				var listener1 = sinon.stub();
				var listener2 = sinon.stub();
				var listener3 = sinon.stub();
				var listener4 = sinon.stub();

				dom.delegate(parent, 'click', input, listener1);
				dom.delegate(parent, 'click', select, listener2);
				dom.delegate(parent, 'click', button, listener3);
				dom.delegate(parent, 'click', textarea, listener4);

				dom.triggerEvent(input, 'click');
				dom.triggerEvent(select, 'click');
				dom.triggerEvent(button, 'click');
				dom.triggerEvent(textarea, 'click');
				assert.strictEqual(0, listener1.callCount);
				assert.strictEqual(0, listener2.callCount);
				assert.strictEqual(0, listener3.callCount);
				assert.strictEqual(0, listener4.callCount);
			});

			it('should run click event listeners to an element that have not the disabled attribute with a disabled parent using "dispatchEvent()"', function() {
				var element = document.createElement('div');
				element.innerHTML = '<fieldset class="nomatch" disabled>' +
					'<span class="match"></span></fieldset>';
				document.body.appendChild(element);

				var listener = sinon.stub();
				dom.delegate(element, 'click', '.match', listener);

				var eventObj = document.createEvent('HTMLEvents');
				eventObj.initEvent('click', true, true);

				var target = element.querySelector('.match');
				target.dispatchEvent(eventObj);

				// Firefox works in a diferent way. It stops bubbling events when it hits a
				// disabled element.
				var expectedResult = UA.isFirefox ? 0 : 1;
				assert.strictEqual(expectedResult, listener.callCount);
			});
		});

		describe('without selector', function() {
			it('should trigger delegate listener for specified element', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);
				var grandchild = document.createElement('div');
				dom.append(child, grandchild);

				var eventCopy;
				dom.delegate(element, 'click', child, function(event) {
					eventCopy = object.mixin({}, event);
				});

				dom.triggerEvent(element, 'click');
				assert.ok(!eventCopy);

				dom.triggerEvent(child, 'click');
				assert.ok(eventCopy);
				assert.strictEqual(child, eventCopy.delegateTarget);
				assert.strictEqual(child, eventCopy.target);
				assert.strictEqual(element, eventCopy.currentTarget);

				dom.triggerEvent(grandchild, 'click');
				assert.ok(eventCopy);
				assert.strictEqual(child, eventCopy.delegateTarget);
				assert.strictEqual(grandchild, eventCopy.target);
				assert.strictEqual(element, eventCopy.currentTarget);
			});

			it('should not add listener to container twice for the same event type', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child1 = document.createElement('div');
				dom.append(element, child1);
				var child2 = document.createElement('div');
				dom.append(element, child2);

				sinon.spy(element, 'addEventListener');
				dom.delegate(element, 'click', child1, sinon.stub());
				dom.delegate(element, 'click', child2, sinon.stub());
				assert.strictEqual(1, element.addEventListener.callCount);
			});

			it('should trigger all delegated listeners for right element', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child1 = document.createElement('div');
				dom.append(element, child1);
				var child2 = document.createElement('div');
				dom.append(element, child2);

				var child1Listener1 = sinon.stub();
				var child1Listener2 = sinon.stub();
				var child2Listener = sinon.stub();
				dom.delegate(element, 'click', child1, child1Listener1);
				dom.delegate(element, 'click', child1, child1Listener2);
				dom.delegate(element, 'click', child2, child2Listener);

				dom.triggerEvent(child1, 'click');
				assert.strictEqual(1, child1Listener1.callCount);
				assert.strictEqual(1, child1Listener2.callCount);
				assert.strictEqual(0, child2Listener.callCount);

				dom.triggerEvent(child2, 'click');
				assert.strictEqual(1, child1Listener1.callCount);
				assert.strictEqual(1, child1Listener2.callCount);
				assert.strictEqual(1, child2Listener.callCount);
			});

			it('should not trigger listener twice when two ancestors are delegating', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);
				var grandchild = document.createElement('div');
				dom.append(child, grandchild);
				var greatgrandchild = document.createElement('div');
				dom.append(grandchild, greatgrandchild);

				var listener1 = sinon.stub();
				var listener2 = sinon.stub();
				dom.delegate(grandchild, 'click', greatgrandchild, listener1);
				dom.delegate(element, 'click', child, listener2);

				dom.triggerEvent(greatgrandchild, 'click');
				assert.strictEqual(1, listener1.callCount);
				assert.strictEqual(1, listener2.callCount);
			});

			it('should not trigger listeners from ancestors when stopPropagation is called', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);
				var grandchild = document.createElement('div');
				dom.append(child, grandchild);

				var listener1 = sinon.stub();
				var listener2 = sinon.stub();
				dom.delegate(element, 'click', grandchild, function(event) {
					event.stopPropagation();
				});
				dom.delegate(element, 'click', grandchild, listener1);
				dom.delegate(element, 'click', child, listener2);

				dom.triggerEvent(grandchild, 'click');
				assert.strictEqual(1, listener1.callCount);
				assert.strictEqual(0, listener2.callCount);
			});

			it('should not trigger any other listeners when stopImmediatePropagation is called', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);
				var grandchild = document.createElement('div');
				dom.append(child, grandchild);

				var listener1 = sinon.stub();
				var listener2 = sinon.stub();
				dom.delegate(element, 'click', grandchild, function(event) {
					event.stopImmediatePropagation();
				});
				dom.delegate(element, 'click', grandchild, listener1);
				dom.delegate(element, 'click', child, listener2);

				dom.triggerEvent(grandchild, 'click');
				assert.strictEqual(0, listener1.callCount);
				assert.strictEqual(0, listener2.callCount);
			});

			it('should not trigger delegate "click" listener for right clicks', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);

				var listener = sinon.stub();
				dom.delegate(element, 'click', child, listener);
				dom.triggerEvent(child, 'click', {
					button: 2
				});
				assert.strictEqual(0, listener.callCount);
			});

			it('should run default listeners last', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);
				var grandchild = document.createElement('div');
				dom.append(child, grandchild);

				var listener1 = sinon.stub();
				var listener2 = sinon.stub();
				var listener3 = sinon.stub();
				dom.delegate(element, 'click', grandchild, listener1, true);
				dom.delegate(element, 'click', grandchild, listener2);
				dom.delegate(element, 'click', child, listener3);

				dom.triggerEvent(grandchild, 'click');
				assert.strictEqual(1, listener1.callCount);
				assert.strictEqual(1, listener2.callCount);
				assert.strictEqual(1, listener3.callCount);
				listener1.calledAfter(listener2);
				listener1.calledAfter(listener3);
				listener3.calledAfter(listener2);
			});

			it('should not run default listener if event is prevented', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);

				var listener = sinon.stub();
				dom.delegate(element, 'click', child, listener, true);
				dom.delegate(element, 'click', child, event => event.preventDefault());

				dom.triggerEvent(child, 'click');
				assert.strictEqual(0, listener.callCount);
			});

			it('should cancel listener through returned handle', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);

				var listener1 = sinon.stub();
				var listener2 = sinon.stub();
				var handle = dom.delegate(element, 'click', child, listener1);
				dom.delegate(element, 'click', child, listener2);

				handle.removeListener();
				dom.triggerEvent(child, 'click');
				assert.strictEqual(0, listener1.callCount);
				assert.strictEqual(1, listener2.callCount);
			});

			it('should cancel default listener through returned handle', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);

				var listener = sinon.stub();
				var handle = dom.delegate(element, 'click', child, listener, true);

				handle.removeListener();
				dom.triggerEvent(child, 'click');
				assert.strictEqual(0, listener.callCount);
			});

			it('should clear delegateTarget from event object after event is done', function() {
				var element = document.createElement('div');
				dom.enterDocument(element);
				var child = document.createElement('div');
				dom.append(element, child);

				var listener = sinon.stub();
				dom.delegate(element, 'click', child, listener);

				dom.triggerEvent(child, 'click');
				assert.ok(!listener.args[0][0].delegateTarget);
			});
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

	describe('parent', function() {
		it('should return the first parent that matches the given selector', function() {
			dom.enterDocument(
				'<div class="parent2"><div class="parent1"><div class="element"></div></div></div>'
			);
			var element = dom.toElement('.element');
			var parent2 = dom.toElement('.parent1');
			var parent3 = dom.toElement('.parent2');
			assert.strictEqual(null, dom.parent(element, '.element'));
			assert.strictEqual(parent2, dom.parent(element, '.parent1'));
			assert.strictEqual(parent3, dom.parent(element, '.parent2'));
			assert.strictEqual(null, dom.parent(element, '.parent3'));
		});
	});

	describe('closest', function() {
		it('should return the closest element up the tree that matches the given selector', function() {
			dom.enterDocument(
				'<div class="parent2"><div class="parent1"><div class="element"></div></div></div>'
			);
			var element = dom.toElement('.element');
			var parent2 = dom.toElement('.parent1');
			var parent3 = dom.toElement('.parent2');
			assert.strictEqual(element, dom.closest(element, '.element'));
			assert.strictEqual(parent2, dom.closest(element, '.parent1'));
			assert.strictEqual(parent3, dom.closest(element, '.parent2'));
			assert.strictEqual(null, dom.closest(element, '.parent3'));
		});
	});

	describe('next', function() {
		it('should return the next sibling that matches the given selector', function() {
			dom.enterDocument(
				'<div class="rootElement"></div><div class="sibling1"></div><div class="sibling2"></div>'
			);
			var element = dom.toElement('.rootElement');
			var sibling1 = dom.toElement('.sibling1');
			var sibling2 = dom.toElement('.sibling2');
			assert.strictEqual(sibling1, dom.next(element, '.sibling1'));
			assert.strictEqual(sibling2, dom.next(element, '.sibling2'));
			assert.strictEqual(null, dom.next(element, '.sibling3'));
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

		it('should return matching element if selector is document fragment', function () {
			var frag1 = document.createDocumentFragment();
			assert.strictEqual(frag1, dom.toElement(frag1));

			var frag2 = document.createDocumentFragment();
			assert.strictEqual(frag2, dom.toElement(frag2));

			var frag3 = '#document-fragment';
			assert.notStrictEqual(frag3, dom.toElement(frag3));
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
