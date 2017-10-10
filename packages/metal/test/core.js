'use strict';

import core from '../src/core';

describe('core', function() {
	describe('Uid', function() {
		it('should always generate unique id', function() {
			assert.notStrictEqual(core.getUid(), core.getUid());
		});

		it('should mutate object with unique id', function() {
			var obj = {};
			assert.strictEqual(core.getUid(obj), core.getUid(obj));
		});

		it('should not use same uid for both an object and the one it inherits from', function() {
			class Class1 {
			}
			class Class2 extends Class1 {
			}
			assert.strictEqual(core.getUid(Class1, true), core.getUid(Class1, true));
			assert.strictEqual(core.getUid(Class2, true), core.getUid(Class2, true));
			assert.notStrictEqual(core.getUid(Class1, true), core.getUid(Class2, true));
		});
	});

	describe('Abstract Method', function() {
		it('should throw errors for calling abstract methods', function() {
			assert.throws(function() {
				core.abstractMethod();
			}, Error);
		});
	});

	describe('getStaticProperty', function() {
		it('should get inherited static properties from super classes', function() {
			class Test1 {
			}
			class Test2 extends Test1 {
			}
			Test2.FOO = 1;
			class Test3 extends Test2 {
			}
			class Test4 extends Test2 {
			}
			Test4.FOO = 2;

			assert.equal(undefined, core.getStaticProperty(Test1, 'FOO'));
			assert.equal(1, core.getStaticProperty(Test2, 'FOO'));
			assert.equal(1, core.getStaticProperty(Test3, 'FOO'));
			assert.equal(2, core.getStaticProperty(Test4, 'FOO'));
		});

		it('should set property with suffix "MERGED" with merged value', function() {
			class Test1 {
			}
			Test1.FOO = 1;
			class Test2 extends Test1 {
			}

			assert.ok(!Test1.hasOwnProperty('FOO_MERGED'));
			assert.ok(!Test2.hasOwnProperty('FOO_MERGED'));

			core.getStaticProperty(Test2, 'FOO');
			assert.ok(Test1.hasOwnProperty('FOO_MERGED'));
			assert.ok(Test2.hasOwnProperty('FOO_MERGED'));
		});

		it('should call merge function when given', function() {
			class Test1 {
			}
			Test1.FOO = 1;
			class Test2 extends Test1 {
			}
			Test2.FOO = 2;
			class Test3 extends Test2 {
			}
			Test3.FOO = 3;

			var prop = core.getStaticProperty(Test3, 'FOO', (a, b) => a + b);
			assert.equal(prop, 6);
		});

		it('should not recalculate static property after set for the first time', function() {
			class Test1 {
			}
			Test1.FOO = 1;
			class Test2 extends Test1 {
			}
			Test2.FOO = 2;
			class Test3 extends Test2 {
			}
			Test3.FOO = 3;

			const mergeFn = sinon.stub().returns(1);
			var prop = core.getStaticProperty(Test3, 'FOO', mergeFn);
			assert.equal(2, mergeFn.callCount);

			assert.equal(prop, core.getStaticProperty(Test3, 'FOO', mergeFn));
			assert.equal(2, mergeFn.callCount);
		});
	});

	describe('Identity Function', function() {
		it('should return the first arg passed to identity function', function() {
			assert.strictEqual(1, core.identityFunction(1));

			var obj = {
				a: 2
			};
			assert.strictEqual(obj, core.identityFunction(obj));
		});
	});

	describe('Type Check', function() {
		it('should check if var is defined', function() {
			assert.ok(!core.isDef(undefined));

			assert.ok(core.isDef(1));
			assert.ok(core.isDef(''));
			assert.ok(core.isDef({}));
			assert.ok(core.isDef([]));
			assert.ok(core.isDef(function() {}));
			assert.ok(core.isDef(null));
		});

		it('should check if var is function', function() {
			assert.ok(!core.isFunction(1));
			assert.ok(!core.isFunction(''));
			assert.ok(!core.isFunction({}));
			assert.ok(!core.isFunction([]));
			assert.ok(!core.isFunction(null));
			assert.ok(!core.isFunction(undefined));

			assert.ok(core.isFunction(function() {}));
		});

		it('should check if var is object', function() {
			assert.ok(!core.isObject(1));
			assert.ok(!core.isObject(''));
			assert.ok(!core.isObject(null));
			assert.ok(!core.isObject(undefined));

			assert.ok(core.isObject({}));
			assert.ok(core.isObject([]));
			assert.ok(core.isObject(function() {}));
		});

		it('should check if var is promise', function() {
			assert.ok(!core.isPromise(1));
			assert.ok(!core.isPromise({}));
			assert.ok(!core.isPromise([]));
			assert.ok(!core.isPromise(function() {}));
			assert.ok(!core.isPromise(null));
			assert.ok(!core.isPromise(undefined));

			assert.ok(core.isPromise({
				then: core.nullFunction
			}));
		});

		it('should check if var is string', function() {
			assert.ok(!core.isString(1));
			assert.ok(!core.isString({}));
			assert.ok(!core.isString([]));
			assert.ok(!core.isString(function() {}));
			assert.ok(!core.isString(null));
			assert.ok(!core.isString(undefined));

			assert.ok(core.isString(''));
			assert.ok(core.isString(new String(''))); // eslint-disable-line
		});

		it('should check if var is boolean', function() {
			assert.ok(core.isBoolean(true));
			assert.ok(core.isBoolean(false));
			assert.ok(core.isBoolean(Boolean(true)));
			assert.ok(core.isBoolean(Boolean(false)));

			assert.ok(!core.isBoolean(undefined));
			assert.ok(!core.isBoolean(null));
			assert.ok(!core.isBoolean(''));
			assert.ok(!core.isBoolean(0));

			assert.ok(!core.isBoolean(1));
			assert.ok(!core.isBoolean('foo'));
		});

		it('should check if var is element', function() {
			assert.ok(core.isElement({
				nodeType: 1
			}));
			assert.ok(!core.isElement({}));
			assert.ok(!core.isElement(null));
			assert.ok(!core.isElement(true));
		});

		it('should check if var is document', function() {
			assert.ok(core.isDocument({
				nodeType: 9
			}));
			assert.ok(!core.isDocument({
					nodeType: 1
				}));
			assert.ok(!core.isDocument({}));
			assert.ok(!core.isDocument(null));
			assert.ok(!core.isDocument(true));
		});

		it('should check if var is document fragment', function () {
			assert.ok(!core.isDocumentFragment(null));
			assert.ok(!core.isDocumentFragment({nodeType: 0}));
			assert.ok(!core.isDocumentFragment({nodeType: 9}));
			assert.ok(core.isDocumentFragment({nodeType: 11}));
		});

		it('should check if var is window', function() {
			if (typeof window === 'undefined') {
				// Skip this test when on node environment.
				return;
			}

			assert.ok(!core.isWindow({
					nodeType: 9
				}));
			assert.ok(!core.isWindow({
					nodeType: 1
				}));
			assert.ok(core.isWindow(window));
			assert.ok(!core.isWindow(null));
			assert.ok(!core.isWindow(true));
		});

		it('should check if var is null', function() {
			assert.ok(core.isNull(null));
			assert.ok(!core.isNull(false));
			assert.ok(!core.isNull(undefined));
			assert.ok(!core.isNull(''));
			assert.ok(!core.isNull(0));
		});

		it('should check if var is defined and not null', function() {
			assert.ok(core.isDefAndNotNull(false));
			assert.ok(core.isDefAndNotNull(''));
			assert.ok(core.isDefAndNotNull(0));
			assert.ok(!core.isDefAndNotNull(null));
			assert.ok(!core.isDefAndNotNull(undefined));
		});

		it('should check if var is number', function() {
			assert.ok(core.isNumber(-1));
			assert.ok(core.isNumber(0));
			assert.ok(core.isNumber(1));
			assert.ok(core.isNumber(Number.NEGATIVE_INFINITY));
			assert.ok(core.isNumber(Infinity));
		});
	});

	describe('Null Function', function() {
		it('should not return anything', function() {
			assert.strictEqual(undefined, core.nullFunction());
		});
	});

	describe('getFunctionName', function() {
		it('should return the name of the given function', function() {
			function myFunction() {
			}
			assert.strictEqual('myFunction', core.getFunctionName(myFunction));
		});
	});

	describe('Compatibility Mode', function() {
		afterEach(function() {
			window.__METAL_COMPATIBILITY__ = undefined;
			core.disableCompatibilityMode();
		});

		it('should return no data if compatibility mode is not enabled', function() {
			assert.ok(!core.getCompatibilityModeData());
		});

		it('should return the data specified when enabling compatibility mode', function() {
			const data = {};
			core.enableCompatibilityMode(data);
			assert.strictEqual(data, core.getCompatibilityModeData());
		});

		it('should return the data specified by global var', function() {
			const data = {};
			window.__METAL_COMPATIBILITY__ = data;
			assert.strictEqual(data, core.getCompatibilityModeData());
		});

		it('should return no data if compatibility mode is disabled', function() {
			const data = {};
			core.enableCompatibilityMode(data);
			core.disableCompatibilityMode();
			assert.ok(!core.getCompatibilityModeData());
		});
	});
});
