'use strict';

import dom from '../../../src/dom/dom';
import Component from '../../../src/component/Component';
import ComponentRegistry from '../../../src/component/ComponentRegistry';
import ComponentCollector from '../../../src/component/ComponentCollector';

class TestComponent extends Component {
	constructor(opt_config) {
		super(opt_config);
	}
}
ComponentRegistry.register('TestComponent', TestComponent);
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
		collector.setNextComponentData('comp', {
			bar: 1
		});
		var component = collector.createComponent('TestComponent', 'comp');

		assert.ok(component instanceof TestComponent);
		assert.strictEqual(1, component.bar);
		assert.strictEqual(element, component.element);
	});

	it('should not throw error if trying to create existing component', function() {
		var collector = new ComponentCollector();
		collector.setNextComponentData('comp', {
			bar: 1
		});
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
		collector.setNextComponentData('comp', {
			bar: 1
		});
		var component = collector.createComponent('TestComponent', 'comp');

		collector.setNextComponentData('comp', {
			bar: 2
		});
		var updatedComponent = collector.updateComponent('comp');

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
