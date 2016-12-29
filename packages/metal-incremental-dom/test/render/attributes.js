'use strict';

import { applyAttribute } from '../../src/render/attributes';
import dom from 'metal-dom';
import Component from 'metal-component';

describe('attributes', function() {
	let component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should uncheck input element when "checked" attribute is removed', function() {
		const input = document.createElement('input');
		input.type = 'checkbox';
		input.checked = true;

		component = new Component();
		applyAttribute(component, input, 'checked', '');
		assert.ok(input.checked);

		applyAttribute(component, input, 'checked', undefined);
		assert.ok(!input.checked);
	});

	it('should add/remove html attributes by using boolean values', function() {
		const button = document.createElement('button');
		component = new Component();
		applyAttribute(component, button, 'disabled', true);
		assert.ok(button.disabled);
		assert.strictEqual('', button.getAttribute('disabled'));

		applyAttribute(component, button, 'disabled', false);
		assert.ok(!button.disabled);
		assert.ok(!button.getAttribute('disabled'));
	});

	it('should change input value via "value" attribute even after it\'s manually changed', function() {
		const input = document.createElement('input');
		component = new Component();
		applyAttribute(component, input, 'value', 'foo');
		assert.strictEqual('foo', input.value);

		input.value = 'userValue';
		applyAttribute(component, input, 'value', 'bar');
		assert.strictEqual('bar', input.value);
	});

	describe('listeners', function() {
		it('should attach listeners functions passed to "data-on<eventname>" attributes', function() {
			class TestComponent extends Component {
			}
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			const listener = sinon.stub();
			applyAttribute(component, element, 'data-onclick', listener);
			assert.strictEqual(0, listener.callCount);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should attach listeners functions passed to "on<EventName>" attributes', function() {
			class TestComponent extends Component {
			}
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			const listener = sinon.stub();
			applyAttribute(component, element, 'onClick', listener);
			assert.strictEqual(0, listener.callCount);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should not set attribute for listener references on elements', function() {
			class TestComponent extends Component {
			}
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			const listener = sinon.stub();

			applyAttribute(component, element, 'data-onclick', listener);
			assert.ok(!element.hasAttribute('data-onclick'));
			assert.ok(!element.hasAttribute('onClick'));
			assert.ok(!element.hasAttribute('onclick'));

			applyAttribute(component, element, 'onClick', listener);
			assert.ok(!element.hasAttribute('data-onclick'));
			assert.ok(!element.hasAttribute('onClick'));
			assert.ok(!element.hasAttribute('onclick'));
		});

		it('should set attribute for listener references with "givenAsName_" on elements', function() {
			class TestComponent extends Component {
			}
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			const listener = sinon.stub();
			listener.givenAsName_ = 'handleClick';

			applyAttribute(component, element, 'data-onclick', listener);
			assert.equal('handleClick', element.getAttribute('data-onclick'));
			assert.ok(!element.hasAttribute('onClick'));
			assert.ok(!element.hasAttribute('onclick'));

			listener.givenAsName_ = 'handleClick2';
			applyAttribute(component, element, 'onClick', listener);
			assert.equal('handleClick2', element.getAttribute('data-onclick'));
			assert.ok(!element.hasAttribute('onClick'));
			assert.ok(!element.hasAttribute('onclick'));
		});

		it('should attach listeners from "data-on<event-name>" attributes with multiple hifens', function() {
			dom.registerCustomEvent('test-event', {
				delegate: true,
				handler: (callback, event) => callback(event),
				originalEvent: 'click'
			});

			class TestComponent extends Component {
			}
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			const listener = sinon.stub();
			applyAttribute(component, element, 'data-ontest-event', listener);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should attach listeners from "on<Event-name>" attributes with multiple hifens', function() {
			dom.registerCustomEvent('test-event', {
				delegate: true,
				handler: (callback, event) => callback(event),
				originalEvent: 'click'
			});

			class TestComponent extends Component {
			}
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			const listener = sinon.stub();
			applyAttribute(component, element, 'onTest-event', listener);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, listener.callCount);
		});

		it('should remove unused inline listeners when attributes are removed', function() {
			class TestComponent extends Component {
			}
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			const listener = sinon.stub();
			applyAttribute(component, element, 'onClick', listener);
			applyAttribute(component, element, 'onClick', null);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(0, listener.callCount);
		});

		it('should replace inline listeners when attributes values change', function() {
			class TestComponent extends Component {
			}
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleClick2 = sinon.stub();
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			const listener = sinon.stub();
			const listener2 = sinon.stub();
			applyAttribute(component, element, 'onClick', listener);
			applyAttribute(component, element, 'onClick', listener2);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(0, listener.callCount);
			assert.strictEqual(1, listener2.callCount);
		});
	});
});
