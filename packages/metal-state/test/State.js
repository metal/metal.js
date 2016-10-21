'use strict';

import { async } from 'metal';
import State from '../src/State';

describe('State', function() {
	it('should add keys to the state', function() {
		var state = new State();
		state.configState({
			key1: {},
			key2: {}
		});

		var keys = Object.keys(state.getState());
		assert.strictEqual(2, keys.length);
		assert.strictEqual('key1', keys[0]);
		assert.strictEqual('key2', keys[1]);
	});

	it('should make state keys enumerable', function() {
		var state = new State();
		state.configState({
			key1: {},
			key2: {}
		});

		var keys = Object.keys(state);
		assert.notStrictEqual(-1, keys.indexOf('key1'));
		assert.notStrictEqual(-1, keys.indexOf('key2'));
	});

	it('should not allow adding key named "state"', function() {
		var state = new State();

		assert.throws(function() {
			state.configState({
				state: {}
			});
		});
	});

	it('should not allow adding key named "stateKey"', function() {
		var state = new State();

		assert.throws(function() {
			state.configState({
				stateKey: {}
			});
		});
	});

	it('should not allow adding state key with name contained in INVALID_KEYS', function() {
		class Test extends State {
		}
		Test.INVALID_KEYS = ['invalid'];

		var test = new Test();
		assert.throws(function() {
			test.configState({
				invalid: {}
			});
		});
	});

	it('should not allow adding state key with name contained in key blacklist', function() {
		class Test extends State {
		}

		var test = new Test();
		test.setKeysBlacklist_({
			invalid: true
		});
		assert.throws(function() {
			test.configState({
				invalid: {}
			});
		});
	});

	it('should not allow adding state key named "state" on subclasses', function() {
		class Test extends State {
		}
		Test.INVALID_KEYS = ['invalid'];

		var test = new Test();
		assert.throws(function() {
			test.configState({
				state: {}
			});
		});
	});

	it('should get a state key\'s config object', function() {
		var state = new State();
		state.configState({
			key1: {
				a: 2
			}
		});

		var expected = {
			a: 2
		};
		assert.deepEqual(expected, state.getStateKeyConfig('key1'));
	});

	it('should use config object from "config" key', function() {
		var state = new State();
		state.configState({
			key1: {
				config: {
					a: 2
				}
			}
		});

		var expected = {
			a: 2
		};
		assert.deepEqual(expected, state.getStateKeyConfig('key1'));
	});

	it('should return null if requesting config object of non existing key', function() {
		var state = new State();
		assert.strictEqual(undefined, state.getStateKeyConfig('key1'));
	});

	it('should set and get state values', function() {
		var state = new State();
		state.configState({
			key1: {},
			key2: {}
		});

		assert.strictEqual(undefined, state.key1);
		assert.strictEqual(undefined, state.key2);

		state.key1 = 1;
		state.key2 = 2;

		assert.strictEqual(1, state.key1);
		assert.strictEqual(2, state.key2);
	});

	it('should get state key value through "get" method', function() {
		var state = new State();
		state.configState({
			key1: {
				value: 2
			}
		});

		assert.strictEqual(2, state.get('key1'));
	});

	it('should set state key value through "set" method', function() {
		var state = new State();
		state.configState({
			key1: {
				value: 2
			}
		});

		state.set('key1', 3);
		assert.strictEqual(3, state.key1);
	});

	it('should set default state key value', function() {
		var state = createStateInstance();

		assert.strictEqual(1, state.key1);
		assert.strictEqual(2, state.key2);
	});

	it('should set default state key value with raw value', function() {
		var state = new State();
		state.configState({
			key1: {
				value: 1
			}
		});

		assert.strictEqual(1, state.key1);
	});

	it('should set default state key value from function', function() {
		var state = new State();
		state.configState({
			key1: {
				valueFn: function() {
					return 1;
				}
			}
		});

		assert.strictEqual(1, state.key1);
	});

	it('should set default state key value from function name', function() {
		var state = new State();
		state.returns1 = function() {
			return 1;
		};
		state.configState({
			key1: {
				valueFn: 'returns1'
			}
		});

		assert.strictEqual(1, state.key1);
	});

	it('should ignore invalid valueFn function', function() {
		var state = new State();
		state.configState({
			key1: {
				valueFn: 1
			}
		});

		assert.strictEqual(undefined, state.key1);
	});

	it('should not use valueFn function if value is also defined', function() {
		var state = new State();
		state.configState({
			key1: {
				value: '',
				valueFn: function() {
					return '1';
				}
			}
		});

		assert.strictEqual('', state.key1);
	});

	it('should override default state key value', function() {
		var state = new State({
			key1: 10,
			key2: 20
		});
		state.configState(
			{
				key1: {
					value: 1
				},
				key2: {
					value: 2
				}
			}
		);

		assert.strictEqual(10, state.key1);
		assert.strictEqual(20, state.key2);
	});

	it('should change initial state key value', function() {
		var state = createStateInstance();

		state.key1 = 10;

		assert.strictEqual(10, state.key1);
	});

	it('should initialize state values lazily', function() {
		var state = new State();
		var valueFn = sinon.stub().returns(2);
		state.configState({
			key1: {
				valueFn: valueFn
			}
		});

		assert.strictEqual(0, valueFn.callCount);

		assert.strictEqual(2, state.key1);
		assert.strictEqual(1, valueFn.callCount);
	});

	it('should pass value, name and context args to validator function', function(done) {
		var state = new State();
		var keyName = 'key1';
		var value = 2;
		state.configState({
			[keyName]: {
				validator: function(val, name, context) {
					assert.strictEqual(value, val);
					assert.strictEqual(keyName, name);
					assert.strictEqual(state, context);

					done();
				}
			}
		});

		state[keyName] = value;
	});

	it('should validate new state values', function() {
		var state = new State();
		state.configState({
			key1: {
				validator: function(val) {
					return val > 0;
				},
				value: 1
			}
		});

		state.key1 = -1;
		assert.strictEqual(1, state.key1);

		state.key1 = 2;
		assert.strictEqual(2, state.key1);
	});

	it('should validate new state values through function name', function() {
		var state = new State();
		state.isPositive = function(val) {
			return val > 0;
		};
		state.configState({
			key1: {
				validator: 'isPositive',
				value: 1
			}
		});

		state.key1 = -1;
		assert.strictEqual(1, state.key1);

		state.key1 = 2;
		assert.strictEqual(2, state.key1);
	});

	it('should validate initial state values', function() {
		var state = new State({
			key1: -10
		});
		state.configState(
			{
				key1: {
					validator: function(val) {
						return val > 0;
					},
					value: 1
				}
			}
		);

		assert.strictEqual(1, state.key1);
	});

	it('should allow accessing other state properties in validator', function() {
		var state = new State({
			key1: 1
		});
		state.configState(
			{
				key1: {
					validator: function(val) {
						return val < this.key2;
					}
				},
				key2: {
					value: 2
				}
			}
		);
		assert.strictEqual(1, state.key1);

		state.key1 = 3;
		assert.strictEqual(1, state.key1);

		state.key1 = 0;
		assert.strictEqual(0, state.key1);
	});

	it('should not validate default state values', function() {
		var state = new State();
		state.configState({
			key1: {
				validator: function(val) {
					return val > 0;
				},
				value: -1
			}
		});

		assert.strictEqual(-1, state.key1);
	});

	it('should emit error if validator returns an Error', function() {
		var originalConsoleFn = console.error;
		console.error = sinon.stub();
		var state = new State();
		state.configState(
			{
				key1: {
					validator: function(val) {
						return val;
					}
				}
			}
		);

		state.key1 = 1;
		assert.ok(!console.error.called);

		state.key1 = new Error('error');
		assert.ok(console.error.called);

		console.error = originalConsoleFn;
	});

	it('should emit validator error even for "undefined" initial values', function() {
		var originalConsoleFn = console.error;
		console.error = sinon.stub();
		class Test extends State {
		}
		Test.STATE = {
			key1: {
				validator: function() {
					return new Error();
				}
			}
		};

		new Test({
			key1: undefined
		});
		assert.ok(console.error.called);

		console.error = originalConsoleFn;
	});

	it('should change state new value through setter', function() {
		var state = new State();
		state.configState({
			key1: {
				setter: Math.abs,
				value: -1
			}
		});

		assert.strictEqual(1, state.key1);

		state.key1 = -2;
		assert.strictEqual(2, state.key1);

		state.key1 = 3;
		assert.strictEqual(3, state.key1);
	});

	it('should change state new value through setter name', function() {
		var state = new State();
		state.makePositive = Math.abs;
		state.configState({
			key1: {
				setter: 'makePositive',
				value: -1
			}
		});

		assert.strictEqual(1, state.key1);

		state.key1 = -2;
		assert.strictEqual(2, state.key1);

		state.key1 = 3;
		assert.strictEqual(3, state.key1);
	});

	it('should pass the state key\'s current value to setter', function() {
		var state = new State();
		state.configState({
			key1: {
				setter: (newValue, currentValue) => {
					return currentValue ? currentValue + ':' + newValue : newValue;
				},
				value: 'first'
			}
		});

		assert.strictEqual('first', state.key1);

		state.key1 = 'second';
		assert.strictEqual('first:second', state.key1);

		state.key1 = 'third';
		assert.strictEqual('first:second:third', state.key1);
	});

	it('should allow setting a writeOnce with initial value', function() {
		var state = new State({
			key1: 2
		});
		state.configState(
			{
				key1: {
					value: 1,
					writeOnce: true
				}
			}
		);

		assert.strictEqual(2, state.key1);
	});

	it('should allow setting a writeOnce state value before it has been written', function() {
		var state = new State();
		state.configState({
			key1: {
				value: 1,
				writeOnce: true
			}
		});

		state.key1 = 2;
		assert.strictEqual(2, state.key1);
	});


	it('should not allow changing a writeOnce state value after it has been written', function() {
		var state = new State();
		state.configState({
			key1: {
				value: 1,
				writeOnce: true
			}
		});

		assert.strictEqual(1, state.key1);
		state.key1 = 2;
		assert.strictEqual(1, state.key1);
	});

	describe('required', function() {
		let originalConsoleFn;

		beforeEach(function() {
			originalConsoleFn = console.error;
			console.error = sinon.stub();
		});

		afterEach(function() {
			console.error = originalConsoleFn;
		});

		it('should log error if required property gets no initial value via configState', function() {
			var state = new State({
				key2: 'initialValue'
			});
			state.configState({
				key1: {}
			});
			assert.strictEqual(0, console.error.callCount);

			state.configState(
				{
					key2: {
						required: true
					}
				}
			);
			assert.strictEqual(0, console.error.callCount);

			state.configState({
				key3: {
					required: true
				}
			});
			assert.strictEqual(1, console.error.callCount);
		});

		it('should log error if required property is set to null or undefined', function() {
			var state = new State({
				key: 'initialValue'
			});

			state.configState({
				key: {
					required: true
				}
			});
			assert.strictEqual(0, console.error.callCount);

			state.key = 'value';
			assert.strictEqual(0, console.error.callCount);

			state.key = null;
			assert.strictEqual(1, console.error.callCount);

			state.key = undefined;
			assert.strictEqual(2, console.error.callCount);
		});
	});

	it('should emit event when a state key\'s value changes', function() {
		var state = new State({
			key1: 10
		});
		state.configState({
			key1: {
				value: 1,
				writeOnce: true
			}
		});

		var listener = sinon.stub();
		state.on('key1Changed', listener);

		state.key1 = 2;
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('key1', listener.args[0][0].key);
		assert.strictEqual(10, listener.args[0][0].prevVal);
		assert.strictEqual(2, listener.args[0][0].newVal);
		assert.strictEqual(state, listener.args[0][1].target);
		assert.strictEqual('key1Changed', listener.args[0][1].type);
	});

	it('should emit stateKeyChanged event when a state key\'s value changes', function() {
		var state = new State({
			key1: 10
		});
		state.configState({
			key1: {
				value: 1,
				writeOnce: true
			}
		});

		var listener = sinon.stub();
		state.on('stateKeyChanged', listener);

		state.key1 = 2;
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('key1', listener.args[0][0].key);
		assert.strictEqual(10, listener.args[0][0].prevVal);
		assert.strictEqual(2, listener.args[0][0].newVal);
		assert.strictEqual(state, listener.args[0][1].target);
		assert.strictEqual('stateKeyChanged', listener.args[0][1].type);
	});

	it('should not emit events when state value doesn\'t change', function() {
		var state = createStateInstance();
		var listener = sinon.stub();
		state.on('key1Changed', listener);

		state.key1 = state.key1;
		assert.strictEqual(0, listener.callCount);
	});

	it('should emit events even when state value doesn\'t change if value is an object', function() {
		var state = createStateInstance();
		state.key1 = {};

		var listener = sinon.stub();
		state.on('key1Changed', listener);

		state.key1 = state.key1;
		assert.strictEqual(1, listener.callCount);
	});

	it('should emit events even when state value doesn\'t change if value is an array', function() {
		var state = createStateInstance();
		state.key1 = [];

		var listener = sinon.stub();
		state.on('key1Changed', listener);

		state.key1 = state.key1;
		assert.strictEqual(1, listener.callCount);
	});

	it('should emit events even when state value doesn\'t change if value is a function', function() {
		var state = createStateInstance();
		state.key1 = function() {};

		var listener = sinon.stub();
		state.on('key1Changed', listener);

		state.key1 = state.key1;
		assert.strictEqual(1, listener.callCount);
	});

	it('should emit a batch event with all state changes for the cycle', function(done) {
		var state = createStateInstance();

		state.on('stateChanged', function(data, facade) {
			assert.strictEqual(2, Object.keys(data.changes).length);
			assert.strictEqual(undefined, data.changes.key1.prevVal);
			assert.strictEqual(12, data.changes.key1.newVal);
			assert.strictEqual(undefined, data.changes.key2.prevVal);
			assert.strictEqual(21, data.changes.key2.newVal);
			assert.strictEqual(state, facade.target);
			assert.strictEqual('stateChanged', facade.type);
			done();
		});

		state.key1 = 10;
		state.key1 = 11;
		state.key2 = 20;
		state.key1 = 12;
		state.key2 = 21;
	});

	it('should call callback function from setState asynchronously after the batch event is triggered', function(done) {
		var state = createStateInstance();

		var listener = sinon.stub();
		state.on('stateChanged', listener);

		var newState = {
			key1: 12,
			key2: 21
		};
		state.setState(newState, function() {
			assert.strictEqual(1, listener.callCount);
			done();
		});
	});

	it('should get all state values', function() {
		var state = createStateInstance();

		state.key1 = 10;

		var stateObj = state.getState();
		assert.strictEqual(2, Object.keys(stateObj).length);
		assert.strictEqual(10, stateObj.key1);
		assert.strictEqual(2, stateObj.key2);
	});

	it('should get values for the specified state keys', function() {
		var state = createStateInstance();

		state.key1 = 10;

		var stateObj = state.getState(['key1']);
		assert.strictEqual(1, Object.keys(stateObj).length);
		assert.strictEqual(10, stateObj.key1);
	});

	it('should set all state values', function() {
		var state = createStateInstance();
		state.setState({
			key1: 10,
			key2: 20
		});

		assert.strictEqual(10, state.key1);
		assert.strictEqual(20, state.key2);
	});

	it('should not change properties that are not state keys via "setState"', function() {
		var state = createStateInstance();
		state.myVar = 1;
		state.setState({
			key1: 10,
			myVar: 2
		});

		assert.strictEqual(10, state.key1);
		assert.strictEqual(1, state.myVar);
	});

	it('should check if a state key\'s value has already been set', function() {
		var state = new State({
			key1: 1
		});
		state.configState({
			key1: {},
			key2: {}
		});

		assert.ok(state.hasBeenSet('key1'));
		assert.ok(!state.hasBeenSet('key2'));

		state.key2 = 2;
		assert.ok(state.hasBeenSet('key2'));
	});

	it('should not run setter, validator or events for removed state keys', function() {
		var state = new State();
		state.configState({
			key1: {
				setter: function(val) {
					return val + 10;
				},
				validator: function(val) {
					return val > 0;
				}
			}
		});
		var listener = sinon.stub();
		state.on('key1Changed', listener);

		state.removeStateKey('key1');
		assert.strictEqual(undefined, state.key1);

		state.key1 = -100;
		assert.strictEqual(-100, state.key1);
		assert.strictEqual(0, listener.callCount);
	});

	describe('Static STATE', function() {
		function createTestClass() {
			class Test extends State {
			}
			return Test;
		}

		it('should automatically add state keys defined by STATE', function() {
			var Test = createTestClass();
			Test.STATE = {
				key1: {
					value: 1
				}
			};

			var test = new Test();
			assert.strictEqual(1, test.key1);
		});

		it('should use config object from constructor to initialize state', function() {
			var Test = createTestClass();
			Test.STATE = {
				key1: {
					value: 1
				}
			};

			var test = new Test({
				key1: 2
			});
			assert.strictEqual(2, test.key1);
		});

		it('should merge STATE from super class', function() {
			var Test = createTestClass();
			Test.STATE = {
				key1: {
					value: 1
				},
				key2: {
					value: 2
				}
			};

			class ChildTest extends Test {
			}
			ChildTest.STATE = {
				key1: {
					value: -1
				},
				key3: {
					value: 3
				}
			};

			var child = new ChildTest();
			assert.strictEqual(-1, child.key1);
			assert.strictEqual(2, child.key2);
			assert.strictEqual(3, child.key3);

			var test = new Test();
			assert.strictEqual(1, test.key1);
			assert.strictEqual(2, test.key2);
			assert.strictEqual(undefined, test.key3);
		});

		it('should merge STATE variable of given constructor', function() {
			var Test = createTestClass();
			Test.STATE = {
				key1: {
					value: 1
				},
				key2: {
					value: 2
				}
			};

			class ChildTest extends Test {
			}
			ChildTest.STATE = {
				key1: {
					value: -1
				},
				key3: {
					value: 3
				}
			};

			State.mergeStateStatic(ChildTest);
			assert.deepEqual({
				key1: {
					value: -1
				},
				key2: {
					value: 2
				},
				key3: {
					value: 3
				}
			}, ChildTest.STATE_MERGED);
		});

		it('should conflict STATE properties from instance with previous instances', function() {
			var Test = createTestClass();
			Test.STATE = {
				key1: {
				}
			};

			var test1 = new Test({
				key1: 'foo1'
			});
			assert.strictEqual('foo1', test1.key1);

			var test2 = new Test({
				key1: 'foo2'
			});
			assert.strictEqual('foo2', test2.key1);
			assert.strictEqual('foo1', test1.key1);
		});
	});

	describe('Separate object', function() {
		it('should add state properties to given object', function() {
			var obj = {};
			var state = new State({}, obj);
			state.configState({
				key1: {},
				key2: {}
			});

			var keys = Object.keys(obj);
			assert.strictEqual(2, keys.length);
			assert.deepEqual(['key1', 'key2'], keys.sort());
		});

		it('should add state properties from STATE static variable to object under given name', function() {
			class Test extends State {
			}
			Test.STATE = {
				key1: {
					value: 1
				}
			};

			var obj = {};
			new Test({}, obj);
			assert.strictEqual(1, obj.key1);
		});

		it('should use given context object when calling functions', function() {
			class Test extends State {
				setFn(val) {
					return 'Test: ' + val;
				}
			}
			Test.prototype.setFn = sinon.stub();
			Test.STATE = {
				key1: {
					setter: 'setFn',
					value: 1
				}
			};

			var obj = {
				setFn(val) {
					return 'obj:' + val;
				}
			};
			new Test({}, obj, obj);
			assert.strictEqual('obj:1', obj.key1);
		});

		it('should pass given context object when calling validator', function() {
			var validator = sinon.stub().returns(true);
			class Test extends State {
			}
			Test.STATE = {
				key1: {
					validator
				}
			};

			var obj = {};
			var context = {};
			var key1 = 1;
			new Test({key1}, obj, context);
			assert.strictEqual(1, obj.key1);
			assert.strictEqual(1, validator.callCount);
			assert.strictEqual(1, validator.args[0][0]);
			assert.strictEqual('key1', validator.args[0][1]);
			assert.strictEqual(context, validator.args[0][2]);
		});

		it('should remove state properties from object under given name', function() {
			var obj = {};
			var state = new State({}, obj);

			state.configState({
				key1: {},
				key2: {}
			});
			state.removeStateKey('key1');

			var keys = Object.keys(obj);
			assert.strictEqual(1, keys.length);
			assert.deepEqual('key2', keys[0]);
		});

		it('should create new object with same state properties when getState is called', function() {
			var obj = {};
			var state = new State({}, obj);
			state.configState({
				key1: {},
				key2: {}
			});

			assert.deepEqual(obj, state.getState());
			assert.notStrictEqual(obj, state.getState());
		});

		it('should emit event when state property changes', function() {
			var obj = {};
			var state = new State({}, obj);
			state.configState({
				key1: {},
				key2: {}
			});

			var listener = sinon.stub();
			state.on('key1Changed', listener);

			obj.key1 = 'newVal';
			assert.strictEqual('newVal', obj.key1);
			assert.strictEqual(1, listener.callCount);
			assert.strictEqual('newVal', listener.args[0][0].newVal);
			assert.strictEqual(undefined, listener.args[0][0].prevVal);

			obj.key1 = 'newVal';
			assert.strictEqual(1, listener.callCount);

			obj.key1 = 'newVal2';
			assert.strictEqual(2, listener.callCount);
		});
	});

	describe('Dispose', function() {
		const originalWarnFn = console.warn;

		beforeEach(function() {
			console.warn = sinon.stub();
		});

		afterEach(function() {
			console.warn = originalWarnFn;
		});

		it('should not throw error when trying to emit scheduled stateChanged after disposed', function(done) {
			var state = createStateInstance();

			state.key1 = 10;
			state.dispose();
			async.nextTick(function() {
				done();
			});
		});

		it('should warn if trying to get state property after disposed', function() {
			var state = createStateInstance();
			state.dispose();
			assert.doesNotThrow(() => state.key1);
			assert.strictEqual(1, console.warn.callCount);
		});

		it('should warn if trying to set state property after disposed', function() {
			var state = createStateInstance();
			state.dispose();
			assert.doesNotThrow(() => state.key1 = 'new');
			assert.strictEqual(1, console.warn.callCount);
		});

		it('should warn if trying to use "setState" after disposed', function() {
			var state = createStateInstance();
			state.dispose();
			assert.doesNotThrow(() => {
				state.setState({
					key1: 'new'
				});
			});
			assert.strictEqual(1, console.warn.callCount);
		});

		it('should not throw error if trying to use "getState" after disposed', function() {
			var state = createStateInstance();
			state.dispose();
			assert.doesNotThrow(() => state.getState());
		});
	});
});

function createStateInstance() {
	var state = new State();
	state.configState({
		key1: {
			value: 1
		},
		key2: {
			value: 2
		}
	});

	return state;
}
