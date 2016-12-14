'use strict';

import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';
import JSXDataManager from '../src/JSXDataManager';

describe('JSXDataManager', function() {
	var component;
	var component2;

	afterEach(function() {
		if (component) {
			component.dispose();
		}
		if (component2) {
			component2.dispose();
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

		it('should not include default component data in "state"', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;

			component = new TestComponent();
			assert.ok(!component.state.hasOwnProperty('elementClasses'));
			assert.ok(!component.state.hasOwnProperty('events'));
			assert.ok(!component.state.hasOwnProperty('visible'));
		});

		it('should keep state objects different between component instances', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			component2 = new TestComponent();
			assert.notEqual(component.state, component2.state);

			component.state.foo = 'foo1';
			assert.equal('foo1', component.state.foo);
			assert.equal('defaultFoo', component2.state.foo);

			component2.state.foo = 'foo2';
			assert.equal('foo1', component.state.foo);
			assert.equal('foo2', component2.state.foo);
		});

		it('should run setState\'s callback after component is rerendered', function(done) {
			class TestComponent extends Component {
				render() {}
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.RENDERER = IncrementalDomRenderer;
			TestComponent.STATE = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			sinon.spy(component, 'render');

			component.setState({
				foo: 'newFoo'
			}, () => {
				assert.strictEqual(1, component.render.callCount);
				done();
			});
		});

		it('should now allow changes to a component\'s props cause changes to another\s', function() {
			class TestComponent extends Component {
				render() {}
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.RENDERER = IncrementalDomRenderer;

			component = new TestComponent();
			component2 = new TestComponent();

			component.props.foo = 'foo';
			assert.equal('foo', component.props.foo);
			assert.notEqual('foo', component2.props.foo);
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

		it('should include default component data in "props"', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;

			component = new TestComponent();
			assert.ok(component.props.hasOwnProperty('elementClasses'));
			assert.ok(component.props.hasOwnProperty('events'));
			assert.ok(component.props.hasOwnProperty('visible'));
		});

		it('should keep prop objects different between component instances', function() {
			class TestComponent extends Component {
			}
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			component2 = new TestComponent();
			assert.notEqual(component.props, component2.props);

			component.props.foo = 'foo1';
			assert.equal('foo1', component.props.foo);
			assert.equal('defaultFoo', component2.props.foo);

			component2.props.foo = 'foo2';
			assert.equal('foo1', component.props.foo);
			assert.equal('foo2', component2.props.foo);
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
			assert.strictEqual('defaultPropsFoo', manager.get(component, 'foo'));
		});

		it('should return the "State" instance for props from "getPropsInstance"', function() {
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
			var propsInstance = component.getDataManager().getPropsInstance(component);
			assert.ok(propsInstance);
			assert.equal('defaultPropsFoo', propsInstance.get('foo'));
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
			var expected = ['children', 'elementClasses', 'events', 'foo', 'visible'];
			assert.deepEqual(expected, manager.getSyncKeys(component).sort());
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
			manager.replaceNonInternal(component, {
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
			manager.replaceNonInternal(component, {
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
			manager.replaceNonInternal(component, {
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
			manager.replaceNonInternal(component, {
				bar: 'bar',
				foo: 'foo'
			});

			assert.strictEqual('bar', component.props.bar);
			assert.strictEqual('foo', component.props.foo);
		});

		it('should call "propsChanged" lifecycle method when props are replaced', function() {
			class TestComponent extends Component {
			}
			TestComponent.prototype.propsChanged = sinon.stub();
			TestComponent.DATA_MANAGER = JSXDataManager;
			TestComponent.PROPS = {
				foo: {
					value: 'defaultFoo'
				}
			};

			component = new TestComponent();
			var manager = component.getDataManager();
			manager.replaceNonInternal(component, {
				foo: 'foo'
			});

			assert.strictEqual(1, component.propsChanged.callCount);
			assert.strictEqual('defaultFoo', component.propsChanged.args[0][0].foo);
			assert.strictEqual('foo', component.props.foo);
		});
	});
});
