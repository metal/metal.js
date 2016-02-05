'use strict';

import dom from 'metal-dom';
import Component from '../src/Component';
import ComponentRegistry from '../src/ComponentRegistry';
import ComponentCollector from '../src/ComponentCollector';

class TestComponent extends Component {
}
ComponentRegistry.register(TestComponent);
TestComponent.ATTRS = {
	bar: {}
};

describe('ComponentCollector', function() {
	beforeEach(function() {
		sinon.stub(console, 'warn');
		document.body.innerHTML = '';
		ComponentCollector.components = {};
	});

	afterEach(function() {
		console.warn.restore();
	});

	it('should add component to the collector', function() {
		var collector = new ComponentCollector();
		var comp = new TestComponent({
			id: 'test'
		});
		collector.addComponent(comp);
		assert.strictEqual(comp, ComponentCollector.components.test);
	});

	it('should remove component from the collector', function() {
		var collector = new ComponentCollector();
		var comp = new TestComponent({
			id: 'test'
		});
		collector.addComponent(comp);
		collector.removeComponent(comp);
		assert.ok(!ComponentCollector.components.test);
	});

	it('should instantiate a new component', function() {
		var element = document.createElement('div');
		element.setAttribute('id', 'comp');
		dom.append(document.body, element);

		var collector = new ComponentCollector();
		var component = collector.createComponent('TestComponent', 'comp');

		assert.ok(component instanceof TestComponent);
		assert.strictEqual(element, component.element);
	});

	it('should instantiate a new component, passing requested data', function() {
		var element = document.createElement('div');
		element.setAttribute('id', 'comp');
		dom.append(document.body, element);

		var collector = new ComponentCollector();
		var component = collector.createComponent('TestComponent', 'comp', {
			bar: 1
		});

		assert.ok(component instanceof TestComponent);
		assert.strictEqual(1, component.bar);
		assert.strictEqual(element, component.element);
	});

	it('should not throw error if trying to create existing component', function() {
		var collector = new ComponentCollector();
		var component = collector.createComponent('TestComponent', 'comp');

		assert.doesNotThrow(function() {
			var newComponent = collector.createComponent('TestComponent', 'comp');
			assert.strictEqual(component, newComponent);
		});
	});

	it('should update an existing component', function() {
		var element = document.createElement('div');
		element.setAttribute('id', 'comp');
		dom.append(document.body, element);

		var collector = new ComponentCollector();
		var component = collector.createComponent('TestComponent', 'comp', {
			bar: 1
		});
		var updatedComponent = collector.updateComponent('comp', {
			bar: 2
		});

		assert.strictEqual(component, updatedComponent);
		assert.strictEqual(2, component.bar);
		assert.strictEqual(element, component.element);
	});

	it('should not throw error if trying to update non existing component', function() {
		var collector = new ComponentCollector();

		assert.doesNotThrow(function() {
			var component = collector.updateComponent('TestComponent', 'comp');
			assert.ok(!component);
		});
	});
});
