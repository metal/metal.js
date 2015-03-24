'use strict';

import core from '../../src/core';

describe('core', function() {
  describe('Debounce', function() {
    it('should debounce function execution', function() {
      var listener = sinon.stub();
      var fn = core.debounce(listener, 0);
      fn();
      fn();
      fn();
      setTimeout(function() {
        assert.strictEqual(1, listener.callCount);
      }, 0);
    });

    it('should debounce function execution for the specified delay', function(done) {
      var listener = sinon.stub();
      var fn = core.debounce(listener, 20);
      fn();
      setTimeout(function() {
        fn();
      }, 10);
      setTimeout(function() {
        fn();
      }, 10);
      setTimeout(function() {
        assert.strictEqual(1, listener.callCount);
        done();
      }, 40);
    });
  });

  describe('Uid', function() {
    it('should always generate unique id', function() {
      assert.notStrictEqual(core.getUid(), core.getUid());
    });

    it('should mutate object with unique id', function() {
      var obj = {};
      assert.strictEqual(core.getUid(obj), core.getUid(obj));
    });
  });

  describe('Abstract Method', function() {
    it('should throw errors for calling abstract methods', function() {
      assert.throws(function() {
        core.abstractMethod();
      }, Error);
    });
  });

  describe('Merge Super Classes Property', function() {
    it('should collect superclass properties', function() {
      var TestSuperClass = function() {};
      TestSuperClass.FOO = 1;

      class TestClass extends TestSuperClass {
        constructor() {
          super();
        }
      }
      TestClass.FOO = 0;

      assert.deepEqual([0, 1], core.collectSuperClassesProperty(TestClass, 'FOO'));
    });

    it('should merge properties', function() {
      class Test1 {}
      Test1.FOO = 1;
      class Test2 extends Test1 {}
      Test2.FOO = 2;
      class Test3 extends Test2 {}
      Test3.FOO = 3;

      var merged = core.mergeSuperClassesProperty(Test3, 'FOO');
      assert.deepEqual([3, 2, 1], merged);
      assert.deepEqual([3, 2, 1], Test3.FOO_MERGED);
      assert.strictEqual(undefined, Test2.FOO_MERGED);
      assert.strictEqual(undefined, Test1.FOO_MERGED);

      assert.deepEqual([2, 1], core.mergeSuperClassesProperty(Test2, 'FOO'));
      assert.deepEqual([1], core.mergeSuperClassesProperty(Test1, 'FOO'));
    });

    it('should reuse existing merged static property', function() {
      class Test1 {}
      Test1.FOO = 1;
      class Test2 extends Test1 {}
      Test2.FOO = 2;

      var merged = core.mergeSuperClassesProperty(Test2, 'FOO');

      assert.strictEqual(merged, core.mergeSuperClassesProperty(Test2, 'FOO'));
    });

    it('should call merge function when given', function() {
      class Test1 {}
      Test1.FOO = 1;
      class Test2 extends Test1 {}
      Test2.FOO = 2;
      class Test3 extends Test2 {}
      Test3.FOO = 3;

      var merged = core.mergeSuperClassesProperty(Test3, 'FOO', function(values) {
        return values.reduce(function(prev, curr) {
          return Math.max(prev, curr);
        });
      });
      assert.strictEqual(3, merged);
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

    it('should check if var is string', function() {
      assert.ok(!core.isString(1));
      assert.ok(!core.isString({}));
      assert.ok(!core.isString([]));
      assert.ok(!core.isString(function() {}));
      assert.ok(!core.isString(null));
      assert.ok(!core.isString(undefined));

      assert.ok(core.isString(''));
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
});
