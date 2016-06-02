'use strict';

import object from '../../src/object/object';

describe('object', function() {
	it('should mixin object arguments', function() {
		var original = {};

		var mixin = object.mixin(original, {
			a: 1
		}, {
			b: 1
		}, {
			b: 2
		}, null);

		assert.strictEqual(original, mixin);
		assert.strictEqual(1, mixin.a);
		assert.strictEqual(2, mixin.b);
		assert.strictEqual(2, Object.keys(mixin).length);
	});

	it('should mixin array arguments', function() {
		var original = [];

		var mixin = object.mixin(original, [null, 2, 3], [1]);

		assert.strictEqual(original, mixin);
		assert.deepEqual([1, 2, 3], mixin);
	});

	it('should get object by name from window', function() {
		if (typeof window === 'undefined') {
			// Skip this test when on node environment.
			return;
		}
		window.Foo = {
			Bar: 1
		};
		assert.strictEqual(1, object.getObjectByName('Foo.Bar'));
		assert.strictEqual(undefined, object.getObjectByName('Foo.Bar.None'));
	});

	it('should get object by name from object', function() {
		var obj = {
			Foo: {
				Bar: 1
			}
		};
		assert.strictEqual(1, object.getObjectByName('Foo.Bar', obj));
		assert.strictEqual(undefined, object.getObjectByName('Foo.Bar.None', obj));
	});

	it('should map an object\'s content to a new object', function() {
		var obj = {
			a: 1,
			b: 2
		};
		var mappedObj = object.map(obj, (key, value) => key + ':' + value);
		var expectedObj = {
			a: 'a:1',
			b: 'b:2'
		};
		assert.deepEqual(expectedObj, mappedObj);
	});

	it('should check if two objects are shallowly equal', function(){
		var obj1 = {};
		assert.ok(object.shallowEqual(obj1, obj1));

		var obj2 = {
			a: 1
		};
		assert.ok(!object.shallowEqual(obj1, obj2));

		var obj3 = {
			a: 1
		};
		assert.ok(!object.shallowEqual(obj1, obj3));
		assert.ok(object.shallowEqual(obj2, obj3));

		var obj4 = {
			a: 2
		};
		assert.ok(!object.shallowEqual(obj1, obj4));
		assert.ok(!object.shallowEqual(obj2, obj4));
		assert.ok(!object.shallowEqual(obj3, obj4));
	});
});
