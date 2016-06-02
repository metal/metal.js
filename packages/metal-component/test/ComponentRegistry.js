'use strict';

import ComponentRegistry from '../src/ComponentRegistry';

describe('ComponentRegistry', function() {
	beforeEach(function() {
		sinon.stub(console, 'error');
	});

	afterEach(function() {
		console.error.restore();
	});

	it('should return undefined for getting constructor of unregistered component', function() {
		assert.ok(!ComponentRegistry.getConstructor('UnregisteredComponent'));
	});

	it('should log error when getting constructor of unregistered component', function() {
		ComponentRegistry.getConstructor('UnregisteredComponent');
		assert.strictEqual(1, console.error.callCount);
	});

	it('should return constructor of registered components', function() {
		class MyComponent1 {
		}
		class MyComponent2 {
		}

		ComponentRegistry.register(MyComponent1, 'MyComponent1');
		ComponentRegistry.register(MyComponent2, 'MyComponent2');

		assert.strictEqual(MyComponent1, ComponentRegistry.getConstructor('MyComponent1'));
		assert.strictEqual(MyComponent2, ComponentRegistry.getConstructor('MyComponent2'));
	});

	it('should set NAME static property of registered components', function() {
		class MyComponent {
		}
		ComponentRegistry.register(MyComponent, 'MyName');
		assert.strictEqual('MyName', MyComponent.NAME);
	});

	it('should use NAME static property if no name is passed to ComponentRegistry.register', function() {
		class MyComponent {
		}
		MyComponent.NAME = 'StaticName';
		ComponentRegistry.register(MyComponent);

		assert.strictEqual(MyComponent, ComponentRegistry.getConstructor('StaticName'));
	});

	it('should use function name if no name is passed to ComponentRegistry.register', function() {
		class MyComponent {
		}
		ComponentRegistry.register(MyComponent);

		assert.strictEqual('MyComponent', MyComponent.NAME);
		assert.strictEqual(MyComponent, ComponentRegistry.getConstructor('MyComponent'));
	});

	it('should use function name if NAME is only set on super class and no name is passed to ComponentRegistry.register', function() {
		class SuperComponent {
		}
		SuperComponent.NAME = 'SuperComponent';
		class MyComponent extends SuperComponent {
		}
		ComponentRegistry.register(MyComponent);

		assert.strictEqual('MyComponent', MyComponent.NAME);
		assert.strictEqual(MyComponent, ComponentRegistry.getConstructor('MyComponent'));
	});
});
