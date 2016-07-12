'use strict';

import Component from 'metal-component';
import JSXDataManager from '../src/JSXDataManager';

describe('JSXDataManager', function() {
	var component;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
	});

	it('should create "props" and "state" objects in component', function() {
		class TestComponent extends Component {
		}
		TestComponent.DATA_MANAGER = JSXDataManager;

		component = new TestComponent();
		assert.ok(component.state);
		assert.ok(component.props);
	});

	describe('state', function() {
		it('should add properties from STATE to `state` variable', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();

			assert.ok(!component.foo);
			assert.ok(!component.props.foo);
			assert.strictEqual('defaultFoo', component.state.foo);
		});

		it('should not use constructor values for properties in STATE', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent({
				foo: 'foo'
			});
			assert.strictEqual('defaultFoo', component.state.foo);
		});

		it('should automatically make all STATE properties "internal"', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			var stateInstance = component.getDataManager().getStateInstance();
			assert.ok(stateInstance.getStateKeyConfig('foo').internal);
		});

		it('should not include default component data in "state"', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;

			component = new TestComponent();
			assert.ok(!component.state.hasOwnProperty('elementClasses'));
			assert.ok(!component.state.hasOwnProperty('events'));
			assert.ok(!component.state.hasOwnProperty('visible'));
		});

		it('should emit "dataChanged" event with "state" type when state changes', function(done) {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();

			component.state.foo = 'newFoo';
			component.getDataManager().once('dataChanged', function(data) {
				assert.strictEqual('state', data.type);
				assert.strictEqual('newFoo', data.changes.foo.newVal);
				assert.strictEqual(undefined, data.changes.foo.prevVal);
				assert.strictEqual('newFoo', component.state.foo);
				done();
			});
		});

		it('should emit "dataPropChanged" event with "state" type when state changes', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			var listener = sinon.stub();
			component.getDataManager().on('dataPropChanged', listener);

			component.state.foo = 'newFoo';
			assert.strictEqual(1, listener.callCount);

			var data = listener.args[0][0];
			assert.strictEqual('state', data.type);
			assert.strictEqual('foo', data.key);
			assert.strictEqual('newFoo', data.newVal);
			assert.strictEqual(undefined, data.prevVal);
			assert.strictEqual('newFoo', component.state.foo);
		});
	});

	describe('props', function() {
		it('should add properties from PROPS to `props` variable', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();

			assert.ok(!component.foo);
			assert.ok(!component.state.foo);
			assert.strictEqual('defaultFoo', component.props.foo);
		});

		it('should use constructor values for properties in PROPS', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent({
				foo: 'foo'
			});
			assert.strictEqual('foo', component.props.foo);
		});

		it('should automatically make all PROPS properties not "internal"', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			var propsInstance = component.getDataManager().getPropsInstance();
			assert.ok(!propsInstance.getStateKeyConfig('foo').internal);
		});

		it('should include default component data in "props"', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;

			component = new TestComponent();
			assert.ok(component.props.hasOwnProperty('elementClasses'));
			assert.ok(component.props.hasOwnProperty('events'));
			assert.ok(component.props.hasOwnProperty('visible'));
		});

		it('should emit "dataChanged" event with "props" type when props change', function(done) {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();

			component.props.foo = 'newFoo';
			component.getDataManager().once('dataChanged', function(data) {
				assert.strictEqual('props', data.type);
				assert.strictEqual('newFoo', data.changes.foo.newVal);
				assert.strictEqual(undefined, data.changes.foo.prevVal);
				assert.strictEqual('newFoo', component.props.foo);
				done();
			});
		});

		it('should emit "dataPropChanged" event with "props" type when props change', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			var listener = sinon.stub();
			component.getDataManager().on('dataPropChanged', listener);

			component.props.foo = 'newFoo';
			assert.strictEqual(1, listener.callCount);

			var data = listener.args[0][0];
			assert.strictEqual('props', data.type);
			assert.strictEqual('foo', data.key);
			assert.strictEqual('newFoo', data.newVal);
			assert.strictEqual(undefined, data.prevVal);
			assert.strictEqual('newFoo', component.props.foo);
		});

		it('should return value from "props" when "get" is called', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				foo: {
					value: 'defaultPropsFoo'
				}
			};
			TestComponent.STATE = {
				foo: {
					value: 'defaultStateFoo'
				}
			};

			component = new TestComponent();
			assert.strictEqual('defaultPropsFoo', component.props.foo);
			assert.strictEqual('defaultStateFoo', component.state.foo);

			var manager = component.getDataManager();
			assert.strictEqual('defaultPropsFoo', manager.get('foo'));
		});

		it('should add value to "props" when "add" is called', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;

			component = new TestComponent();

			var manager = component.getDataManager();
			manager.add('foo', {
				value: 'defaultFoo'
			});
			assert.strictEqual('defaultFoo', component.props.foo);
		});

		it('should return keys from "props" when "getSyncKeys" is called', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				foo: {
				}
			};
			TestComponent.STATE = {
				bar: {
				}
			};

			component = new TestComponent();
			var manager = component.getDataManager();
			var expected = ['elementClasses', 'events', 'foo', 'visible'];
			assert.deepEqual(expected, manager.getSyncKeys().sort());
		});
	});

	describe('replaceNonInternal', function() {
		it('should replace props with given values', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				bar: {
					value: 'defaultBar'
				},
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			var manager = component.getDataManager();
			manager.replaceNonInternal({
				bar: 'bar',
				foo: 'foo'
			});

			assert.strictEqual('bar', component.props.bar);
			assert.strictEqual('foo', component.props.foo);
		});

		it('should replace props with default values if no value is given', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				bar: {
					value: 'defaultBar'
				},
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			var manager = component.getDataManager();
			manager.replaceNonInternal({
				bar: 'bar'
			});

			assert.strictEqual('bar', component.props.bar);
			assert.strictEqual('defaultFoo', component.props.foo);
		});

		it('should not replace state values', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			var manager = component.getDataManager();
			manager.replaceNonInternal({
				foo: 'foo'
			});
			assert.strictEqual('defaultFoo', component.state.foo);
		});

		it('should manually set prop values not specified in PROPS', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				bar: {
					value: 'defaultBar'
				}
			};

			component = new TestComponent();
			var manager = component.getDataManager();
			manager.replaceNonInternal({
				bar: 'bar',
				foo: 'foo'
			});

			assert.strictEqual('bar', component.props.bar);
			assert.strictEqual('foo', component.props.foo);
		});
	});
});
