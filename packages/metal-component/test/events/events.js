'use strict';

import { addListenersFromObj, getComponentFn } from '../../src/events/events';
import { append, triggerEvent } from 'metal-dom';
import Component from '../../src/Component';

describe('events', function() {
	let comp;
	let originalConsoleFn;

	beforeEach(function() {
		originalConsoleFn = console.error;
		console.error = sinon.stub();
	});

	afterEach(function() {
		if (comp) {
			comp.dispose();
		}
		console.error = originalConsoleFn;
	});

	describe('addListenersFromObj', function() {
		it('should attach events to specified functions', function() {
			var listener1 = sinon.stub();
			var listener2 = sinon.stub();

			comp = new Component();
			addListenersFromObj(comp, {
				event1: listener1,
				event2: listener2
			});

			comp.emit('event1');
			assert.strictEqual(1, listener1.callCount);
			assert.strictEqual(0, listener2.callCount);

			comp.emit('event2');
			assert.strictEqual(1, listener1.callCount);
			assert.strictEqual(1, listener2.callCount);
		});

		it('should attach events to specified function names', function() {
			class CustomComponent extends Component {
			}
			CustomComponent.prototype.listener = sinon.stub();

			comp = new CustomComponent();
			addListenersFromObj(comp, {
				event1: 'listener'
			});

			comp.emit('event1');
			assert.strictEqual(1, comp.listener.callCount);
		});

		it('should warn if trying to attach event to unexisting function name', function() {
			comp = new Component();
			addListenersFromObj(comp, {
				event1: 'listener'
			});

			assert.strictEqual(1, console.error.callCount);
		});

		it('should attach delegate events with specified selector', function() {
			class CustomComponent extends Component {
			}
			CustomComponent.prototype.listener = sinon.stub();

			comp = new CustomComponent();
			append(comp.element, '<button class="testButton"></button>');
			addListenersFromObj(comp, {
				click: {
					fn: 'listener',
					selector: '.testButton'
				}
			});

			triggerEvent(comp.element, 'click');
			assert.strictEqual(0, comp.listener.callCount);
			triggerEvent(comp.element.querySelector('.testButton'), 'click');
			assert.strictEqual(1, comp.listener.callCount);
		});
	});

	describe('getComponentFn', function() {
		it('should get component function by name', function() {
			comp = new Component();
			sinon.spy(comp, 'attach');

			const fn = getComponentFn(comp, 'attach');
			assert.equal(0, comp.attach.callCount);

			fn();
			assert.equal(1, comp.attach.callCount);
		});

		it('should warn if trying to get unexisting component function', function() {
			comp = new Component();
			getComponentFn(comp, 'fn');
			assert.strictEqual(1, console.error.callCount);
		});
	});
});
