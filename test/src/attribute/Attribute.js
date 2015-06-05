'use strict';

import async from '../../../src/async/async';
import Attribute from '../../../src/attribute/Attribute';

describe('Attribute', function() {
	it('should add an attribute', function() {
		var attr = new Attribute();
		attr.addAttr('attr1');

		var attrNames = Object.keys(attr.getAttrs());
		assert.strictEqual(1, attrNames.length);
		assert.strictEqual('attr1', attrNames[0]);
	});

	it('should add multiple attributes', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {},
			attr2: {}
		});

		var attrNames = Object.keys(attr.getAttrs());
		assert.strictEqual(2, attrNames.length);
		assert.strictEqual('attr1', attrNames[0]);
		assert.strictEqual('attr2', attrNames[1]);
	});

	it('should make attributes enumerable', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {},
			attr2: {}
		});

		var keys = Object.keys(attr);
		assert.notStrictEqual(-1, keys.indexOf('attr1'));
		assert.notStrictEqual(-1, keys.indexOf('attr2'));
	});

	it('should not allow adding attribute named "attrs"', function() {
		var attr = new Attribute();

		assert.throws(function() {
			attr.addAttrs({
				attrs: {}
			});
		});
	});

	it('should not allow adding attribute with name contained in INVALID_ATTRS', function() {
		class Test extends Attribute {
			constructor(opt_config) {
				super(opt_config);
			}
		}
		Test.INVALID_ATTRS = ['invalid'];

		var test = new Test();
		assert.throws(function() {
			test.addAttrs({
				invalid: {}
			});
		});
	});

	it('should not allow adding attribute named "attrs" on subclasses', function() {
		class Test extends Attribute {
			constructor(opt_config) {
				super(opt_config);
			}
		}
		Test.INVALID_ATTRS = ['invalid'];

		var test = new Test();
		assert.throws(function() {
			test.addAttrs({
				attrs: {}
			});
		});
	});

	it('should get an attribute\'s config object', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				a: 2
			}
		});

		assert.deepEqual({
			a: 2
		}, attr.getAttrConfig('attr1'));
	});

	it('should return null if requesting config object of non existing attribute', function() {
		var attr = new Attribute();
		assert.strictEqual(undefined, attr.getAttrConfig('attr1'));
	});

	it('should set and get attribute values', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {},
			attr2: {}
		});

		assert.strictEqual(undefined, attr.attr1);
		assert.strictEqual(undefined, attr.attr2);

		attr.attr1 = 1;
		attr.attr2 = 2;

		assert.strictEqual(1, attr.attr1);
		assert.strictEqual(2, attr.attr2);
	});

	it('should set default attribute value', function() {
		var attr = createAttributeInstance();

		assert.strictEqual(1, attr.attr1);
		assert.strictEqual(2, attr.attr2);
	});

	it('should set default attribute value with raw value', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				value: 1
			}
		});

		assert.strictEqual(1, attr.attr1);
	});

	it('should set default attribute value from function', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				valueFn: function() {
					return 1;
				}
			}
		});

		assert.strictEqual(1, attr.attr1);
	});

	it('should set default attribute value from function name', function() {
		var attr = new Attribute();
		attr.returns1 = function() {
			return 1;
		};
		attr.addAttrs({
			attr1: {
				valueFn: 'returns1'
			}
		});

		assert.strictEqual(1, attr.attr1);
	});

	it('should ignore invalid valueFn function', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				valueFn: 1
			}
		});

		assert.strictEqual(undefined, attr.attr1);
	});

	it('should not use valueFn function if value is also defined', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				value: '',
				valueFn: function() {
					return '1';
				}
			}
		});

		assert.strictEqual('', attr.attr1);
	});

	it('should override default attribute value', function() {
		var attr = new Attribute();
		attr.addAttrs(
			{
				attr1: {
					value: 1
				},
				attr2: {
					value: 2
				}
			},
			{
				attr1: 10,
				attr2: 20
			}
		);

		assert.strictEqual(10, attr.attr1);
		assert.strictEqual(20, attr.attr2);
	});

	it('should change initial attribute value', function() {
		var attr = createAttributeInstance();

		attr.attr1 = 10;

		assert.strictEqual(10, attr.attr1);
	});

	it('should initialize attributes lazily', function() {
		var attr = new Attribute();
		var valueFn = sinon.stub().returns(2);
		attr.addAttrs({
			attr1: {
				valueFn: valueFn
			}
		});

		assert.strictEqual(0, valueFn.callCount);

		assert.strictEqual(2, attr.attr1);
		assert.strictEqual(1, valueFn.callCount);
	});

	it('should validate new attribute values', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				validator: function(val) {
					return val > 0;
				},
				value: 1
			}
		});

		attr.attr1 = -1;
		assert.strictEqual(1, attr.attr1);

		attr.attr1 = 2;
		assert.strictEqual(2, attr.attr1);
	});

	it('should validate new attribute values through function name', function() {
		var attr = new Attribute();
		attr.isPositive = function(val) {
			return val > 0;
		};
		attr.addAttrs({
			attr1: {
				validator: 'isPositive',
				value: 1
			}
		});

		attr.attr1 = -1;
		assert.strictEqual(1, attr.attr1);

		attr.attr1 = 2;
		assert.strictEqual(2, attr.attr1);
	});

	it('should validate initial attribute values', function() {
		var attr = new Attribute();
		attr.addAttrs(
			{
				attr1: {
					validator: function(val) {
						return val > 0;
					},
					value: 1
				}
			},
			{
				attr1: -10
			}
		);

		assert.strictEqual(1, attr.attr1);
	});

	it('should not validate default attribute values', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				validator: function(val) {
					return val > 0;
				},
				value: -1
			}
		});

		assert.strictEqual(-1, attr.attr1);
	});

	it('should change attribute new value through setter', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				setter: Math.abs,
				value: -1
			}
		});

		assert.strictEqual(1, attr.attr1);

		attr.attr1 = -2;
		assert.strictEqual(2, attr.attr1);

		attr.attr1 = 3;
		assert.strictEqual(3, attr.attr1);
	});

	it('should change attribute new value through setter name', function() {
		var attr = new Attribute();
		attr.makePositive = Math.abs;
		attr.addAttrs({
			attr1: {
				setter: 'makePositive',
				value: -1
			}
		});

		assert.strictEqual(1, attr.attr1);

		attr.attr1 = -2;
		assert.strictEqual(2, attr.attr1);

		attr.attr1 = 3;
		assert.strictEqual(3, attr.attr1);
	});

	it('should allow setting a writeOnce with initial value', function() {
		var attr = new Attribute();
		attr.addAttrs(
			{
				attr1: {
					value: 1,
					writeOnce: true
				}
			},
			{
				attr1: 2
			}
		);

		assert.strictEqual(2, attr.attr1);
	});

	it('should allow setting a writeOnce attribute before it has been written', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				value: 1,
				writeOnce: true
			}
		});

		attr.attr1 = 2;
		assert.strictEqual(2, attr.attr1);
	});


	it('should not allow changing a writeOnce attribute after it has been written', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				value: 1,
				writeOnce: true
			}
		});

		assert.strictEqual(1, attr.attr1);
		attr.attr1 = 2;
		assert.strictEqual(1, attr.attr1);
	});

	it('should emit event when attribute changes', function() {
		var attr = new Attribute();
		attr.addAttrs({
			attr1: {
				value: 1,
				writeOnce: true
			}
		}, {
			attr1: 10
		});

		var listener = sinon.stub();
		attr.on('attr1Changed', listener);

		attr.attr1 = 2;
		assert.strictEqual(1, listener.callCount);
		assert.strictEqual('attr1', listener.args[0][0].attrName);
		assert.strictEqual(10, listener.args[0][0].prevVal);
		assert.strictEqual(2, listener.args[0][0].newVal);
	});

	it('should not emit events when attribute doesn\'t change', function() {
		var attr = createAttributeInstance();
		var listener = sinon.stub();
		attr.on('attr1Changed', listener);

		attr.attr1 = attr.attr1;
		assert.strictEqual(0, listener.callCount);
	});

	it('should emit events when attribute doesn\'t change if value is an object', function() {
		var attr = createAttributeInstance();
		attr.attr1 = {};

		var listener = sinon.stub();
		attr.on('attr1Changed', listener);

		attr.attr1 = attr.attr1;
		assert.strictEqual(1, listener.callCount);
	});

	it('should emit events when attribute doesn\'t change if value is an array', function() {
		var attr = createAttributeInstance();
		attr.attr1 = [];

		var listener = sinon.stub();
		attr.on('attr1Changed', listener);

		attr.attr1 = attr.attr1;
		assert.strictEqual(1, listener.callCount);
	});

	it('should emit events when attribute doesn\'t change if value is a function', function() {
		var attr = createAttributeInstance();
		attr.attr1 = function() {};

		var listener = sinon.stub();
		attr.on('attr1Changed', listener);

		attr.attr1 = attr.attr1;
		assert.strictEqual(1, listener.callCount);
	});

	it('should emit a batch event with all attribute changes for the cycle', function(done) {
		var attr = createAttributeInstance();

		attr.on('attrsChanged', function(data) {
			assert.strictEqual(2, Object.keys(data.changes).length);
			assert.strictEqual(undefined, data.changes.attr1.prevVal);
			assert.strictEqual(12, data.changes.attr1.newVal);
			assert.strictEqual(undefined, data.changes.attr2.prevVal);
			assert.strictEqual(21, data.changes.attr2.newVal);
			done();
		});

		attr.attr1 = 10;
		attr.attr1 = 11;
		attr.attr2 = 20;
		attr.attr1 = 12;
		attr.attr2 = 21;
	});

	it('should not throw error when trying to emit scheduled attrsChanged after disposed', function(done) {
		var attr = createAttributeInstance();

		attr.attr1 = 10;
		attr.dispose();
		async.nextTick(function() {
			done();
		});
	});

	it('should get all attribute values', function() {
		var attr = createAttributeInstance();

		attr.attr1 = 10;

		var attrsMap = attr.getAttrs();
		assert.strictEqual(2, Object.keys(attrsMap).length);
		assert.strictEqual(10, attrsMap.attr1);
		assert.strictEqual(2, attrsMap.attr2);
	});

	it('should set all attribute values', function() {
		var attr = createAttributeInstance();
		attr.setAttrs({
			attr1: 10,
			attr2: 20
		});

		assert.strictEqual(10, attr.attr1);
		assert.strictEqual(20, attr.attr2);
	});

	it('should not run setter, validator or events for removed attributes', function() {
		var attr = new Attribute();
		attr.addAttr('attr1', {
			setter: function(val) {
				return val + 10;
			},
			validator: function(val) {
				return val > 0;
			}
		});
		var listener = sinon.stub();
		attr.on('attr1Changed', listener);

		attr.removeAttr('attr1');
		assert.strictEqual(undefined, attr.attr1);

		attr.attr1 = -100;
		assert.strictEqual(-100, attr.attr1);
		assert.strictEqual(0, listener.callCount);
	});

	it('should not allow getting attribute data after disposed', function() {
		var attr = createAttributeInstance();
		attr.dispose();
		assert.throws(function() {
			attr.getAttrs();
		});
	});

	describe('Static ATTRS', function() {
		function createTestClass() {
			class Test extends Attribute {
				constructor(opt_config) {
					super(opt_config);
				}
			}
			return Test;
		}

		it('should automatically add attributes defined by ATTRS', function() {
			var Test = createTestClass();
			Test.ATTRS = {
				attr1: {
					value: 1
				}
			};

			var test = new Test();
			assert.strictEqual(1, test.attr1);
		});

		it('should use config object from constructor to initialize attrs', function() {
			var Test = createTestClass();
			Test.ATTRS = {
				attr1: {
					value: 1
				}
			};

			var test = new Test({
				attr1: 2
			});
			assert.strictEqual(2, test.attr1);
		});

		it('should merge ATTRS from super class', function() {
			var Test = createTestClass();
			Test.ATTRS = {
				attr1: {
					value: 1
				},
				attr2: {
					value: 2
				}
			};

			class ChildTest extends Test {
				constructor(opt_config) {
					super(opt_config);
				}
			}

			ChildTest.ATTRS = {
				attr1: {
					value: -1
				},
				attr3: {
					value: 3
				}
			};

			var child = new ChildTest();
			assert.strictEqual(-1, child.attr1);
			assert.strictEqual(2, child.attr2);
			assert.strictEqual(3, child.attr3);

			var test = new Test();
			assert.strictEqual(1, test.attr1);
			assert.strictEqual(2, test.attr2);
			assert.strictEqual(undefined, test.attr3);
		});
	});
});

function createAttributeInstance() {
	var attr = new Attribute();
	attr.addAttrs({
		attr1: {
			value: 1
		},
		attr2: {
			value: 2
		}
	});

	return attr;
}
