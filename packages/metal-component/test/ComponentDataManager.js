'use strict';

import ComponentDataManager from '../src/ComponentDataManager';
import EventEmitter from 'metal-events';
import State from 'metal-state';

describe('ComponentDataManager', function() {
	let initialConfig;
	let component;

	beforeEach(function() {
		class StubComponent extends EventEmitter {
			getInitialConfig() {
				return initialConfig;
			}
		}
		component = new StubComponent();
		initialConfig = {};
	});

	afterEach(function() {
		ComponentDataManager.dispose(component);
	});

	it('should add the specified properties to the given component', function() {
		ComponentDataManager.setUp(component, {
			foo: {
				value: 'fooValue',
			},
		});
		assert.strictEqual('fooValue', component.foo);
	});

	it('should use component\'s config as initial state values', function() {
		initialConfig = {
			foo: 'initialFoo',
		};
		ComponentDataManager.setUp(component, {
			foo: {},
		});
		assert.strictEqual('initialFoo', component.foo);
	});

	it('should use default state value when "undefined" is passed as initial value', function() {
		initialConfig = {
			foo: undefined,
		};
		ComponentDataManager.setUp(component, {
			foo: {
				value: 'defaultFoo',
			},
		});

		assert.strictEqual(component.foo, 'defaultFoo');
	});

	it('should throw error if attempting to add state property named "element"', function() {
		assert.throws(() => {
			ComponentDataManager.setUp(component, {
				element: {},
			});
		});
	});

	it('should add the state properties defined in STATE to the given component', function() {
		component.constructor.STATE = {
			foo: {
				value: 'fooValue',
			},
		};
		ComponentDataManager.setUp(component, {});
		assert.strictEqual('fooValue', component.foo);
	});

	it('should replace all non internal data with given values or default', function() {
		component.constructor.STATE = {
			bar: {
				internal: true,
				value: 'initialBar',
			},
			foo: {
				value: 'initialFoo',
			},
			foo2: {
				value: 'initialFoo2',
			},
		};

		initialConfig = {
			bar: 'bar',
			foo: 'foo',
			foo2: 'foo2',
		};
		ComponentDataManager.setUp(component, {});

		ComponentDataManager.replaceNonInternal(component, {
			foo: 'newFoo',
		});
		assert.strictEqual('newFoo', component.foo);
		assert.strictEqual('initialFoo2', component.foo2);
		assert.strictEqual('bar', component.bar);
	});

	it('should return state instance', function() {
		ComponentDataManager.setUp(component, {});
		assert.ok(
			ComponentDataManager.getStateInstance(component) instanceof State
		);
	});

	it('should return an object with state properties', function() {
		ComponentDataManager.setUp(component, {
			foo: {
				value: 'fooValue',
			},
		});

		let expected = {
			foo: 'fooValue',
		};
		assert.deepEqual(expected, ComponentDataManager.getState(component));
	});

	it('should return list of state keys', function() {
		ComponentDataManager.setUp(component, {
			foo: {
				value: 'fooValue',
			},
		});
		assert.deepEqual(['foo'], ComponentDataManager.getStateKeys(component));
	});

	it('should return list of sync keys', function() {
		ComponentDataManager.setUp(component, {
			foo: {
				value: 'fooValue',
			},
		});
		assert.deepEqual(['foo'], ComponentDataManager.getSyncKeys(component));
	});

	it('should get value from state key', function() {
		ComponentDataManager.setUp(component, {
			foo: {
				value: 'fooValue',
			},
		});
		assert.strictEqual('fooValue', ComponentDataManager.get(component, 'foo'));
	});

	it('should set value for state key', function() {
		ComponentDataManager.setUp(component, {
			foo: {
				value: 'fooValue',
			},
		});

		ComponentDataManager.setState(component, {
			foo: 'fooValue2',
		});
		assert.strictEqual('fooValue2', component.foo);
	});

	it('should emit events from state on component', function() {
		ComponentDataManager.setUp(component, {
			foo: {
				value: 'fooValue',
			},
		});

		let listener = sinon.stub();
		component.on('fooChanged', listener);

		component.foo = 'fooValue2';
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('fooValue2', listener.args[0][0].newVal);
	});
});
