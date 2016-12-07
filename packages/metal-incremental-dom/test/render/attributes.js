'use strict';

import { applyAttribute, attachFromAttrFirstTime } from '../../src/render/attributes';
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
		it('should attach listeners from "on<EventName>" attributes', function() {
			class TestComponent extends Component {
			}
			TestComponent.prototype.handleClick = sinon.stub();
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			applyAttribute(component, element, 'onClick', 'handleClick');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should not set "on<EventName>" string values as dom attributes', function() {
			class TestComponent extends Component {
				handleClick() {
				}
			}
			component = new TestComponent();

			const element = document.createElement('div');
			applyAttribute(component, element, 'onClick', 'handleClick');
			assert.ok(!element.getAttribute('onclick'));
			assert.ok(!element.getAttribute('onClick'));
		});

		it('should attach listeners from "data-on<eventname>" attributes', function() {
			class TestComponent extends Component {
			}
			TestComponent.prototype.handleClick = sinon.stub();
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			applyAttribute(component, element, 'data-onclick', 'handleClick');
			assert.strictEqual(0, component.handleClick.callCount);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should set "data-on<eventname>" string values as dom attributes', function() {
			class TestComponent extends Component {
				handleClick() {
				}
			}
			component = new TestComponent();

			const element = document.createElement('div');
			applyAttribute(component, element, 'data-onclick', 'handleClick');
			assert.strictEqual('handleClick', element.getAttribute('data-onclick'));
		});

		it('should attach listeners from "data-on<event-name>" attributes with multiple hifens', function() {
			dom.registerCustomEvent('test-event', {
  			delegate: true,
  			handler: (callback, event) => callback(event),
  			originalEvent: 'click'
			});

			class TestComponent extends Component {
			}
			TestComponent.prototype.handleClick = sinon.stub();
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			applyAttribute(component, element, 'data-ontest-event', 'handleClick');

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should attach listeners from "on<Event-name>" attributes with multiple hifens', function() {
			dom.registerCustomEvent('test-event', {
  			delegate: true,
  			handler: (callback, event) => callback(event),
  			originalEvent: 'click'
			});

			class TestComponent extends Component {
			}
			TestComponent.prototype.handleClick = sinon.stub();
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			applyAttribute(component, element, 'onTest-event', 'handleClick');

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
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

		it('should remove unused inline listeners when attributes are removed', function() {
			class TestComponent extends Component {
			}
			TestComponent.prototype.handleClick = sinon.stub();
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			applyAttribute(component, element, 'onClick', 'handleClick');
			applyAttribute(component, element, 'onClick', null);

			dom.triggerEvent(element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);
		});

		it('should replace inline listeners when attributes values change', function() {
			class TestComponent extends Component {
			}
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleClick2 = sinon.stub();
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			applyAttribute(component, element, 'onClick', 'handleClick');
			applyAttribute(component, element, 'onClick', 'handleClick2');

			dom.triggerEvent(element, 'click');
			assert.strictEqual(0, component.handleClick.callCount);
			assert.strictEqual(1, component.handleClick2.callCount);
		});

		it('should attach listener via "attachFromAttrFirstTime"', function() {
			class TestComponent extends Component {
			}
			TestComponent.prototype.handleClick = sinon.stub();
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			attachFromAttrFirstTime(component, element, 'onClick', 'handleClick');

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
		});

		it('should not attach listener via "attachFromAttrFirstTime" if one is already attached', function() {
			class TestComponent extends Component {
			}
			TestComponent.prototype.handleClick = sinon.stub();
			TestComponent.prototype.handleClick2 = sinon.stub();
			component = new TestComponent();

			const element = document.createElement('div');
			dom.enterDocument(element);
			applyAttribute(component, element, 'onClick', 'handleClick');
			attachFromAttrFirstTime(component, element, 'onClick', 'handleClick2');

			dom.triggerEvent(element, 'click');
			assert.strictEqual(1, component.handleClick.callCount);
			assert.strictEqual(0, component.handleClick2.callCount);
		});
	});
});
