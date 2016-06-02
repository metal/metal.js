'use strict';

/**
 * A collection of core utility functions.
 * @const
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var core = function () {
	function core() {
		_classCallCheck(this, core);
	}

	_createClass(core, null, [{
		key: 'abstractMethod',

		/**
   * When defining a class Foo with an abstract method bar(), you can do:
   * Foo.prototype.bar = core.abstractMethod
   *
   * Now if a subclass of Foo fails to override bar(), an error will be thrown
   * when bar() is invoked.
   *
   * @type {!Function}
   * @throws {Error} when invoked to indicate the method should be overridden.
   */
		value: function abstractMethod() {
			throw Error('Unimplemented abstract method');
		}

		/**
   * Loops constructor super classes collecting its properties values. If
   * property is not available on the super class `undefined` will be
   * collected as value for the class hierarchy position.
   * @param {!function()} constructor Class constructor.
   * @param {string} propertyName Property name to be collected.
   * @return {Array.<*>} Array of collected values.
   * TODO(*): Rethink superclass loop.
   */

	}, {
		key: 'collectSuperClassesProperty',
		value: function collectSuperClassesProperty(constructor, propertyName) {
			var propertyValues = [constructor[propertyName]];
			while (constructor.__proto__ && !constructor.__proto__.isPrototypeOf(Function)) {
				constructor = constructor.__proto__;
				propertyValues.push(constructor[propertyName]);
			}
			return propertyValues;
		}

		/**
   * Gets the name of the given function. If the current browser doesn't
   * support the `name` property, this will calculate it from the function's
   * content string.
   * @param {!function()} fn
   * @return {string}
   */

	}, {
		key: 'getFunctionName',
		value: function getFunctionName(fn) {
			if (!fn.name) {
				var str = fn.toString();
				fn.name = str.substring(9, str.indexOf('('));
			}
			return fn.name;
		}

		/**
   * Gets an unique id. If `opt_object` argument is passed, the object is
   * mutated with an unique id. Consecutive calls with the same object
   * reference won't mutate the object again, instead the current object uid
   * returns. See {@link core.UID_PROPERTY}.
   * @type {opt_object} Optional object to be mutated with the uid. If not
   *     specified this method only returns the uid.
   * @throws {Error} when invoked to indicate the method should be overridden.
   */

	}, {
		key: 'getUid',
		value: function getUid(opt_object) {
			if (opt_object) {
				return opt_object[core.UID_PROPERTY] || (opt_object[core.UID_PROPERTY] = core.uniqueIdCounter_++);
			}
			return core.uniqueIdCounter_++;
		}

		/**
   * The identity function. Returns its first argument.
   * @param {*=} opt_returnValue The single value that will be returned.
   * @return {?} The first argument.
   */

	}, {
		key: 'identityFunction',
		value: function identityFunction(opt_returnValue) {
			return opt_returnValue;
		}

		/**
   * Returns true if the specified value is a boolean.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is boolean.
   */

	}, {
		key: 'isBoolean',
		value: function isBoolean(val) {
			return typeof val === 'boolean';
		}

		/**
   * Returns true if the specified value is not undefined.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is defined.
   */

	}, {
		key: 'isDef',
		value: function isDef(val) {
			return val !== undefined;
		}

		/**
   * Returns true if value is not undefined or null.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isDefAndNotNull',
		value: function isDefAndNotNull(val) {
			return core.isDef(val) && !core.isNull(val);
		}

		/**
   * Returns true if value is a document.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isDocument',
		value: function isDocument(val) {
			return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val.nodeType === 9;
		}

		/**
   * Returns true if value is a dom element.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isElement',
		value: function isElement(val) {
			return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val.nodeType === 1;
		}

		/**
   * Returns true if the specified value is a function.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a function.
   */

	}, {
		key: 'isFunction',
		value: function isFunction(val) {
			return typeof val === 'function';
		}

		/**
   * Returns true if value is null.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isNull',
		value: function isNull(val) {
			return val === null;
		}

		/**
   * Returns true if the specified value is a number.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a number.
   */

	}, {
		key: 'isNumber',
		value: function isNumber(val) {
			return typeof val === 'number';
		}

		/**
   * Returns true if value is a window.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isWindow',
		value: function isWindow(val) {
			return val !== null && val === val.window;
		}

		/**
   * Returns true if the specified value is an object. This includes arrays
   * and functions.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is an object.
   */

	}, {
		key: 'isObject',
		value: function isObject(val) {
			var type = typeof val === 'undefined' ? 'undefined' : _typeof(val);
			return type === 'object' && val !== null || type === 'function';
		}

		/**
   * Returns true if value is a Promise.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isPromise',
		value: function isPromise(val) {
			return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && typeof val.then === 'function';
		}

		/**
   * Returns true if value is a string.
   * @param {*} val
   * @return {Boolean}
   */

	}, {
		key: 'isString',
		value: function isString(val) {
			return typeof val === 'string';
		}

		/**
   * Merges the values of a static property a class with the values of that
   * property for all its super classes, and stores it as a new static
   * property of that class. If the static property already existed, it won't
   * be recalculated.
   * @param {!function()} constructor Class constructor.
   * @param {string} propertyName Property name to be collected.
   * @param {function(*, *):*=} opt_mergeFn Function that receives an array filled
   *   with the values of the property for the current class and all its super classes.
   *   Should return the merged value to be stored on the current class.
   * @return {boolean} Returns true if merge happens, false otherwise.
   */

	}, {
		key: 'mergeSuperClassesProperty',
		value: function mergeSuperClassesProperty(constructor, propertyName, opt_mergeFn) {
			var mergedName = propertyName + '_MERGED';
			if (constructor.hasOwnProperty(mergedName)) {
				return false;
			}

			var merged = core.collectSuperClassesProperty(constructor, propertyName);
			if (opt_mergeFn) {
				merged = opt_mergeFn(merged);
			}
			constructor[mergedName] = merged;
			return true;
		}

		/**
   * Null function used for default values of callbacks, etc.
   * @return {void} Nothing.
   */

	}, {
		key: 'nullFunction',
		value: function nullFunction() {}
	}]);

	return core;
}();

/**
 * Unique id property prefix.
 * @type {String}
 * @protected
 */


core.UID_PROPERTY = 'core_' + (Math.random() * 1e9 >>> 0);

/**
 * Counter for unique id.
 * @type {Number}
 * @private
 */
core.uniqueIdCounter_ = 1;

exports.default = core;