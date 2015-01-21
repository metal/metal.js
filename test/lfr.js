'use strict';

var assert = require('assert');
var sinon = require('sinon');
require('./fixture/sandbox.js');

describe('lfr', function() {
  describe('Abstract Method', function() {
    it('should throw errors for calling abstract methods', function() {
      assert.throws(function() {
        lfr.abstractMethod();
      }, Error);
    });
  });

  describe('Bind', function() {
    it('should throw errors when binding with no function', function() {
      var TestClass = function() {};
      TestClass.prototype.method = function() {
        this.innerVar = 1;
      };

      var obj = new TestClass();
      lfr.bind(obj.method, obj)();

      assert.strictEqual(1, obj.innerVar);
    });

    it('should work without Function.prototype.bind', function() {
      var bind = Function.prototype.bind;
      Function.prototype.bind = null;

      var TestClass = function() {};
      TestClass.prototype.method = function() {
        this.innerVar = 1;
      };

      var obj = new TestClass();
      lfr.bind(obj.method, obj)();

      assert.strictEqual(1, obj.innerVar);

      Function.prototype.bind = bind;
    });

    it('should pass args without Function.prototype.bind', function() {
      var bind = Function.prototype.bind;
      Function.prototype.bind = null;

      var TestClass = function() {};
      TestClass.prototype.method = function(arg1, arg2) {
        this.innerVar = 1;
        this.arg1 = arg1;
        this.arg2 = arg2;
      };

      var obj = new TestClass();
      lfr.bind(obj.method, obj, 2)(3);

      assert.strictEqual(1, obj.innerVar);
      assert.strictEqual(2, obj.arg1);
      assert.strictEqual(3, obj.arg2);

      Function.prototype.bind = bind;
    });

    it('should throw errors when binding with no function', function() {
      assert.throws(function() {
        lfr.bind();
      }, Error);
    });
  });

  describe('Inheritance', function() {
    it('should copy superclass prototype to subclass', function() {
      var TestSuperClass = function() {};
      TestSuperClass.prototype.var1 = 1;
      TestSuperClass.prototype.func = function() {};

      var TestClass = function() {};
      lfr.inherits(TestClass, TestSuperClass);
      TestClass.prototype.var2 = 2;
      TestClass.prototype.func2 = function() {};

      var obj = new TestClass();

      assert.strictEqual(1, obj.var1);
      assert.strictEqual(2, obj.var2);
      assert.strictEqual(TestSuperClass.prototype.func, obj.func);
      assert.strictEqual(TestClass.prototype.func2, obj.func2);
    });

    it('should override properties of the superclass', function() {
      var TestSuperClass = function() {};
      TestSuperClass.prototype.var1 = 1;
      TestSuperClass.prototype.func = function() {};

      var TestClass = function() {};
      lfr.inherits(TestClass, TestSuperClass);
      TestClass.prototype.var1 = 2;
      TestClass.prototype.func = function() {};

      var obj = new TestClass();

      assert.strictEqual(2, obj.var1);
      assert.notStrictEqual(TestSuperClass.prototype.func, obj.func);
    });

    it('should allow calling superclass functions', function() {
      var TestSuperClass = function() {};
      TestSuperClass.prototype.func = sinon.stub();

      var TestClass = function() {};
      lfr.inherits(TestClass, TestSuperClass);
      TestClass.prototype.func = function() {
        TestClass.base(this, 'func');
      };

      var obj = new TestClass();
      obj.func();

      assert.strictEqual(1, TestSuperClass.prototype.func.callCount);
    });

    it('should allow calling superclass constructor', function() {
      var called = false;
      var TestSuperClass = function() {
        called = true;
      };

      var TestClass = function() {
        TestClass.base(this, 'constructor');
      };
      lfr.inherits(TestClass, TestSuperClass);

      new TestClass();

      assert.ok(called);
    });
  });

  describe('Identity Function', function() {
    it('should return the first arg passed to identity function', function() {
      assert.strictEqual(1, lfr.identityFunction(1));

      var obj = {
        a: 2
      };
      assert.strictEqual(obj, lfr.identityFunction(obj));
    });
  });

  describe('Type Check', function() {
    it('should check if var is defined', function() {
      assert.ok(!lfr.isDef(undefined));

      assert.ok(lfr.isDef(1));
      assert.ok(lfr.isDef(''));
      assert.ok(lfr.isDef({}));
      assert.ok(lfr.isDef([]));
      assert.ok(lfr.isDef(function() {}));
      assert.ok(lfr.isDef(null));
    });

    it('should check if var is function', function() {
      assert.ok(!lfr.isFunction(1));
      assert.ok(!lfr.isFunction(''));
      assert.ok(!lfr.isFunction({}));
      assert.ok(!lfr.isFunction([]));
      assert.ok(!lfr.isFunction(null));
      assert.ok(!lfr.isFunction(undefined));

      assert.ok(lfr.isFunction(function() {}));
    });

    it('should check if var is string', function() {
      assert.ok(!lfr.isString(1));
      assert.ok(!lfr.isString({}));
      assert.ok(!lfr.isString([]));
      assert.ok(!lfr.isString(function() {}));
      assert.ok(!lfr.isString(null));
      assert.ok(!lfr.isString(undefined));

      assert.ok(lfr.isString(''));
    });

    it('should check if var is boolean', function() {
      assert.ok(lfr.isBoolean(true));
      assert.ok(lfr.isBoolean(false));
      assert.ok(lfr.isBoolean(Boolean(true)));
      assert.ok(lfr.isBoolean(Boolean(false)));

      assert.ok(!lfr.isBoolean(undefined));
      assert.ok(!lfr.isBoolean(null));
      assert.ok(!lfr.isBoolean(''));
      assert.ok(!lfr.isBoolean(0));

      assert.ok(!lfr.isBoolean(1));
      assert.ok(!lfr.isBoolean('foo'));
    });

    it('should check if var is element', function() {
      assert.ok(lfr.isElement({
        nodeType: 1
      }));
      assert.ok(!lfr.isElement({}));
      assert.ok(!lfr.isElement(null));
      assert.ok(!lfr.isElement(true));
    });

    it('should check if var is null', function() {
      assert.ok(lfr.isNull(null));
      assert.ok(!lfr.isNull(false));
      assert.ok(!lfr.isNull(undefined));
      assert.ok(!lfr.isNull(''));
      assert.ok(!lfr.isNull(0));
    });

    it('should check if var is defined and not null', function() {
      assert.ok(lfr.isDefAndNotNull(false));
      assert.ok(lfr.isDefAndNotNull(''));
      assert.ok(lfr.isDefAndNotNull(0));
      assert.ok(!lfr.isDefAndNotNull(null));
      assert.ok(!lfr.isDefAndNotNull(undefined));
    });
  });

  describe('Null Function', function() {
    it('should not return anything', function() {
      assert.strictEqual(undefined, lfr.nullFunction());
    });
  });

  describe('RBind', function() {
    it('should add additionally supplied parameters to the end of the arguments the function is executed with', function() {
      var TestClass = function() {};
      TestClass.prototype.method = function(param1, param2) {
        this.innerVar = 1;

        assert.strictEqual(param1, 'param1');
        assert.strictEqual(param2, 'param2');
      };

      TestClass.prototype.method2 = function() {
        assert.strictEqual(1, arguments.length);
      };

      var obj = new TestClass();
      lfr.rbind(obj.method, obj, 'param2')('param1');

      assert.strictEqual(1, obj.innerVar);

      lfr.rbind(obj.method2, obj)('param1');
    });

    it('should throw errors when rbinding with no function', function() {
      assert.throws(function() {
        lfr.rbind();
      }, Error);
    });
  });
});
