'use strict';

import Component from '../src/Component';
import ComponentRegistry from '../src/ComponentRegistry';
import ComponentCollector from '../src/ComponentCollector';

class TestComponent extends Component {
}
TestComponent.ATTRS = {
	bar: {}
};

describe('ComponentCollector', function() {
	beforeEach(function() {
		sinon.stub(console, 'warn');
		document.body.innerHTML = '';
		ComponentCollector.components = {};
		ComponentRegistry.components_ = {};

		ComponentRegistry.register(TestComponent);
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

	it('should instantiate a new component from constructor function', function() {
		var collector = new ComponentCollector();
		var component = collector.createComponent(TestComponent);

		assert.ok(component instanceof TestComponent);
	});

	it('should instantiate a new component from name', function() {
		var collector = new ComponentCollector();
		var component = collector.createComponent('TestComponent');

		assert.ok(component instanceof TestComponent);
	});

	it('should instantiate a new component, passing requested data', function() {
		var collector = new ComponentCollector();
		var component = collector.createComponent('TestComponent', {
			bar: 1
		});

		assert.ok(component instanceof TestComponent);
		assert.strictEqual(1, component.bar);
	});

	it('should not throw error if trying to create existing component', function() {
		var collector = new ComponentCollector();
		var component = collector.createComponent('TestComponent', {
			id: 'comp'
		});

		var newComponent;
		assert.doesNotThrow(function() {
			newComponent = collector.createComponent('TestComponent', {
				id: 'comp'
			});
		});
		assert.strictEqual(component, newComponent);
	});

	it('should update an existing component', function() {
		var collector = new ComponentCollector();
		var component = collector.createComponent('TestComponent', {
			bar: 1,
			id: 'comp'
		});
		var updatedComponent = collector.updateComponent('comp', {
			bar: 2
		});

		assert.strictEqual(component, updatedComponent);
		assert.strictEqual(2, component.bar);
	});

	it('should not throw error if trying to update non existing component', function() {
		var collector = new ComponentCollector();

		assert.doesNotThrow(function() {
			var component = collector.updateComponent('TestComponent', {
				id: 'comp'
			});
			assert.ok(!component);
		});
	});
});
