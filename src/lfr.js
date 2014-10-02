(function(root, undefined) {
  'use strict';

  /**
   * Base namespace for the Liferay library. Checks to see lfr is already
   * defined in the current scope before assigning to prevent clobbering if
   * lfr.js is loaded more than once.
   * @const
   */
  root.lfr = root.lfr || {};

  /**
   * When defining a class Foo with an abstract method bar(), you can do:
   * Foo.prototype.bar = lfr.abstractMethod
   *
   * Now if a subclass of Foo fails to override bar(), an error will be thrown
   * when bar() is invoked.
   *
   * @type {!Function}
   * @throws {Error} when invoked to indicate the method should be overridden.
   */
  lfr.abstractMethod = function() {
    throw Error('Unimplemented abstract method');
  };

  /**
   * Creates a new function that, when called, has its this keyword set to the
   * provided value, with a given sequence of arguments preceding any provided
   * when the new function is called.
   *
   * Usage: <pre>var fn = bind(myFunction, myObj, 'arg1', 'arg2');
   * fn('arg3', 'arg4');</pre>
   *
   * @param {function} fn A function to partially apply.
   * @param {!Object} context Specifies the object which this should point to
   *     when the function is run.
   * @param {...*} var_args Additional arguments that are partially applied to
   *     the function.
   * @return {!Function} A partially-applied form of the function bind() was
   *     invoked as a method of.
   */
  lfr.bind = function(fn, context) {
    if (!fn) {
      throw new Error();
    }

    if (Function.prototype.bind) {
      var bind = fn.call.apply(fn.bind, arguments);
      return function() {
        return bind.apply(null, arguments);
      };
    }

    if (arguments.length > 2) {
      var args = Array.prototype.slice.call(arguments, 2);
      return function() {
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, args);
        return fn.apply(context, newArgs);
      };
    } else {
      return function() {
        return fn.apply(context, arguments);
      };
    }
  };

  /**
   * Inherits the prototype methods from one constructor into another.
   *
   * Usage:
   * <pre>
   * function ParentClass(a, b) { }
   * ParentClass.prototype.foo = function(a) { }
   *
   * function ChildClass(a, b, c) {
   *   lfr.base(this, a, b);
   * }
   * lfr.inherits(ChildClass, ParentClass);
   *
   * var child = new ChildClass('a', 'b', 'c');
   * child.foo();
   * </pre>
   *
   * @param {Function} childCtor Child class.
   * @param {Function} parentCtor Parent class.
   */
  lfr.inherits = function(childCtor, parentCtor) {
    function TempCtor() {
    }
    TempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new TempCtor();
    childCtor.prototype.constructor = childCtor;

    /**
     * Calls superclass constructor/method.
     *
     * This function is only available if you use lfr.inherits to express
     * inheritance relationships between classes.
     *
     * @param {!object} me Should always be "this".
     * @param {string} methodName The method name to call. Calling superclass
     *     constructor can be done with the special string 'constructor'.
     * @param {...*} var_args The arguments to pass to superclass
     *     method/constructor.
     * @return {*} The return value of the superclass method/constructor.
     */
    childCtor.base = function(me, methodName) {
      var args = Array.prototype.slice.call(arguments, 2);
      return parentCtor.prototype[methodName].apply(me, args);
    };
  };

  /**
   * The identity function. Returns its first argument.
   * @param {*=} opt_returnValue The single value that will be returned.
   * @return {?} The first argument.
   */
  lfr.identityFunction = function(opt_returnValue) {
    return opt_returnValue;
  };

  /**
   * Returns true if the specified value is not undefined.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is defined.
   */
  lfr.isDef = function(val) {
    return val !== undefined;
  };

  /**
   * Returns true if the specified value is a function.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a function.
   */
  lfr.isFunction = function(val) {
    return typeof val === 'function';
  };

  /**
     * Returns true if the specified value is an object. This includes arrays
     * and functions.
     * @param {?} val Variable to test.
     * @return {boolean} Whether variable is an object.
     */
  lfr.isObject = function(val) {
    var type = typeof val;
    return type === 'object' && val !== null || type === 'function';
  };

  /**
   * Returns true if value is a string.
   * @param {*} val
   * @return {Boolean}
   */
  lfr.isString = function(val) {
    return typeof val === 'string';
  };

  /**
   * Null function used for default values of callbacks, etc.
   * @return {void} Nothing.
   */
  lfr.nullFunction = function() {};

  /**
   * Creates a new function that, when called, has its this keyword set to the
   * provided value, with a given sequence of arguments following any provided
   * when the new function is called.
   *
   * Usage: <pre>var fn = rbind(myFunction, myObj, 'arg1', 'arg2');
   * fn('arg3', 'arg4');</pre>
   *
   * @param {function} fn A function to partially apply.
   * @param {!Object} context Specifies the object which this should point to
   *     when the function is run.
   * @param {...*} var_args Additional arguments that are partially applied to
   *     the function.
   * @return {!Function} A partially-applied form of the function bind() was
   *     invoked as a method of.
   */
  lfr.rbind = function(fn, context) {
    if (!fn) {
      throw new Error();
    }

    if (arguments.length > 2) {
      var args = Array.prototype.slice.call(arguments, 2);
      return function() {
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.push.apply(newArgs, args);
        return fn.apply(context, newArgs);
      };
    } else {
      return function() {
        return fn.apply(context, arguments);
      };
    }
  };

}(this));
