'use strict';

import array from '../array/array';
import core from '../core';
import object from '../object/object';
import EventEmitter from '../events/EventEmitter';
import async from '../async/async';

/**
 * Attribute adds support for having object properties that can be watched for
 * changes, as well as configured with validators, setters and other options.
 * See the `addAttr` method for a complete list of available attribute
 * configuration options.
 * @constructor
 * @extends {EventEmitter}
 */
class Attribute extends EventEmitter {
	constructor(opt_config) {
		super();

		/**
		 * Object with information about the batch event that is currently
		 * scheduled, or null if none is.
		 * @type {Object}
		 * @protected
		 */
		this.scheduledBatchData_ = null;

		/**
		 * Object that contains information about all this instance's attributes.
		 * @type {!Object<string, !Object>}
		 * @protected
		 */
		this.attrsInfo_ = {};

		this.setShouldUseFacade(true);
		this.mergeInvalidAttrs_();
		this.addAttrsFromStaticHint_(opt_config);
	}

	/**
	 * Adds the given attribute.
	 * @param {string} name The name of the new attribute.
	 * @param {Object.<string, *>=} config The configuration object for the new attribute.
	 *   This object can have the following keys:
	 *   setter - Function for normalizing new attribute values. It receives the new value
	 *   that was set, and returns the value that should be stored.
	 *   validator - Function that validates new attribute values. When it returns false,
	 *   the new value is ignored.
	 *   value - The default value for this attribute. Note that setting this to an object
	 *   will cause all attribute instances to use the same reference to the object. To
	 *   have each attribute instance use a different reference, use the `valueFn` option
	 *   instead.
	 *   valueFn - A function that returns the default value for this attribute.
	 *   writeOnce - Ignores writes to the attribute after it's been first written to. That is,
	 *   allows writes only when setting the attribute for the first time.
	 * @param {*} initialValue The initial value of the new attribute. This value has higher
	 *   precedence than the default value specified in this attribute's configuration.
	 */
	addAttr(name, config, initialValue) {
		this.buildAttrInfo_(name, config, initialValue);
		Object.defineProperty(this, name, this.buildAttrPropertyDef_(name));
	}

	/**
	 * Adds the given attributes.
	 * @param {!Object.<string, !Object>} configs An object that maps the names of all the
	 *   attributes to be added to their configuration objects.
	 * @param {!Object.<string, *>} initialValues An object that maps the names of
	 *   attributes to their initial values. These values have higher precedence than the
	 *   default values specified in the attribute configurations.
	 * @param {boolean|Object=} opt_defineContext If value is false
	 *     `Object.defineProperties` will not be called. If value is a valid
	 *     context it will be used as definition context, otherwise `this`
	 *     will be the context.
	 */
	addAttrs(configs, initialValues, opt_defineContext) {
		initialValues = initialValues || {};
		var names = Object.keys(configs);

		var props = {};
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			this.buildAttrInfo_(name, configs[name], initialValues[name]);
			props[name] = this.buildAttrPropertyDef_(name);
		}

		if (opt_defineContext !== false) {
			Object.defineProperties(opt_defineContext || this, props);
		}
	}

	/**
	 * Adds attributes from super classes static hint `MyClass.ATTRS = {};`.
	 * @param {!Object.<string, !Object>} configs An object that maps the names
	 *     of all the attributes to be added to their configuration objects.
	 * @protected
	 */
	addAttrsFromStaticHint_(config) {
		var ctor = this.constructor;
		var defineContext = false;
		if (Attribute.mergeAttrsStatic(ctor)) {
			defineContext = ctor.prototype;
		}
		this.addAttrs(ctor.ATTRS_MERGED, config, defineContext);
	}

	/**
	 * Checks that the given name is a valid attribute name. If it's not, an error
	 * will be thrown.
	 * @param {string} name The name to be validated.
	 * @throws {Error}
	 */
	assertValidAttrName_(name) {
		if (this.constructor.INVALID_ATTRS_MERGED[name]) {
			throw new Error('It\'s not allowed to create an attribute with the name "' + name + '".');
		}
	}

	/**
	 * Builds the info object for the requested attribute.
	 * @param {string} name The name of the attribute.
	 * @param {Object} config The config object of the attribute.
	 * @param {*} initialValue The initial value of the attribute.
	 * @protected
	 */
	buildAttrInfo_(name, config, initialValue) {
		this.assertValidAttrName_(name);

		this.attrsInfo_[name] = {
			config: config || {},
			initialValue: initialValue,
			state: Attribute.States.UNINITIALIZED
		};
	}

	/**
	 * Builds the property definition object for the requested attribute.
	 * @param {string} name The name of the attribute.
	 * @return {!Object}
	 * @protected
	 */
	buildAttrPropertyDef_(name) {
		return {
			configurable: true,
			enumerable: true,
			get: function() {
				return this.getAttrValue_(name);
			},
			set: function(val) {
				this.setAttrValue_(name, val);
			}
		};
	}

	/**
	 * Calls the requested function, running the appropriate code for when it's
	 * passed as an actual function object or just the function's name.
	 * @param {!Function|string} fn Function, or name of the function to run.
	 * @param {!Array} An optional array of parameters to be passed to the
	 *   function that will be called.
	 * @return {*} The return value of the called function.
	 * @protected
	 */
	callFunction_(fn, args) {
		if (core.isString(fn)) {
			return this[fn].apply(this, args);
		} else if (core.isFunction(fn)) {
			return fn.apply(this, args);
		}
	}

	/**
	 * Calls the attribute's setter, if there is one.
	 * @param {string} name The name of the attribute.
	 * @param {*} value The value to be set.
	 * @return {*} The final value to be set.
	 */
	callSetter_(name, value) {
		var info = this.attrsInfo_[name];
		var config = info.config;
		if (config.setter) {
			value = this.callFunction_(config.setter, [value]);
		}
		return value;
	}

	/**
	 * Calls the attribute's validator, if there is one.
	 * @param {string} name The name of the attribute.
	 * @param {*} value The value to be validated.
	 * @return {boolean} Flag indicating if value is valid or not.
	 */
	callValidator_(name, value) {
		var info = this.attrsInfo_[name];
		var config = info.config;
		if (config.validator) {
			return this.callFunction_(config.validator, [value]);
		}
		return true;
	}

	/**
	 * Checks if the it's allowed to write on the requested attribute.
	 * @param {string} name The name of the attribute.
	 * @return {boolean}
	 */
	canSetAttribute(name) {
		var info = this.attrsInfo_[name];
		return !info.config.writeOnce || !info.written;
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		super.disposeInternal();
		this.attrsInfo_ = null;
		this.scheduledBatchData_ = null;
	}

	/**
	 * Emits the attribute change batch event.
	 * @protected
	 */
	emitBatchEvent_() {
		if (!this.isDisposed()) {
			var data = this.scheduledBatchData_;
			this.scheduledBatchData_ = null;
			this.emit('attrsChanged', data);
		}
	}

	/**
	 * Returns the value of the requested attribute.
	 * Note: this can and should be accomplished by accessing the attribute as a regular property.
	 * This should only be used in cases where a function is actually needed.
	 * @param {string} name
	 * @return {*}
	 */
	get(name) {
		return this[name];
	}

	/**
	 * Gets the config object for the requested attribute.
	 * @param {string} name The attribute's name.
	 * @return {Object}
	 * @protected
	 */
	getAttrConfig(name) {
		return (this.attrsInfo_[name] || {}).config;
	}

	/**
	 * Returns an object that maps attribute names to their values.
	 * @param {Array<string>=} opt_names A list of names of the attributes that should be
	 *   returned. If none is given, all attributes will be returned.
	 * @return {Object.<string, *>}
	 */
	getAttrs(opt_names) {
		var attrsMap = {};
		var names = opt_names || this.getAttrNames();

		for (var i = 0; i < names.length; i++) {
			attrsMap[names[i]] = this[names[i]];
		}

		return attrsMap;
	}

	/**
	 * Returns an array with all attribute names.
	 * @return {Array.<string>}
	 */
	getAttrNames() {
		return Object.keys(this.attrsInfo_);
	}

	/**
	 * Gets the value of the specified attribute. This is passed as that attribute's
	 * getter to the `Object.defineProperty` call inside the `addAttr` method.
	 * @param {string} name The name of the attribute.
	 * @return {*}
	 * @protected
	 */
	getAttrValue_(name) {
		this.initAttr_(name);

		return this.attrsInfo_[name].value;
	}

	/**
	 * Informs of changes to an attributes value through an event. Won't trigger
	 * the event if the value hasn't changed or if it's being initialized.
	 * @param {string} name The name of the attribute.
	 * @param {*} prevVal The previous value of the attribute.
	 * @protected
	 */
	informChange_(name, prevVal) {
		if (this.shouldInformChange_(name, prevVal)) {
			var data = {
				attrName: name,
				newVal: this[name],
				prevVal: prevVal
			};
			this.emit(name + 'Changed', data);
			this.scheduleBatchEvent_(data);
		}
	}

	/**
	 * Initializes the specified attribute, giving it a first value.
	 * @param {string} name The name of the attribute.
	 * @protected
	 */
	initAttr_(name) {
		var info = this.attrsInfo_[name];
		if (info.state !== Attribute.States.UNINITIALIZED) {
			return;
		}

		info.state = Attribute.States.INITIALIZING;
		this.setInitialValue_(name);
		if (!info.written) {
			info.state = Attribute.States.INITIALIZING_DEFAULT;
			this.setDefaultValue_(name);
		}
		info.state = Attribute.States.INITIALIZED;
	}

	/**
	 * Merges an array of values for the ATTRS property into a single object.
	 * @param {!Array} values The values to be merged.
	 * @return {!Object} The merged value.
	 * @static
	 * @protected
	 */
	static mergeAttrs_(values) {
		return object.mixin.apply(null, [{}].concat(values.reverse()));
	}

	/**
	 * Merges the ATTRS static variable for the given constructor function.
	 * @param  {!Function} ctor Constructor function.
	 * @return {boolean} Returns true if merge happens, false otherwise.
	 * @static
	 */
	static mergeAttrsStatic(ctor) {
		return core.mergeSuperClassesProperty(ctor, 'ATTRS', Attribute.mergeAttrs_);
	}

	/**
	 * Merges the values of the `INVALID_ATTRS` static for the whole hierarchy of
	 * the current instance.
	 * @protected
	 */
	mergeInvalidAttrs_() {
		core.mergeSuperClassesProperty(this.constructor, 'INVALID_ATTRS', function(values) {
			return array.flatten(values).reduce(function(merged, val) {
				if (val) {
					merged[val] = true;
				}
				return merged;
			}, {});
		});
	}

	/**
	 * Removes the requested attribute.
	 * @param {string} name The name of the attribute.
	 */
	removeAttr(name) {
		this.attrsInfo_[name] = null;
		delete this[name];
	}

	/**
	 * Schedules an attribute change batch event to be emitted asynchronously.
	 * @param {!Object} attrChangeData Information about an attribute's update.
	 * @protected
	 */
	scheduleBatchEvent_(attrChangeData) {
		if (!this.scheduledBatchData_) {
			async.nextTick(this.emitBatchEvent_, this);
			this.scheduledBatchData_ = {
				changes: {}
			};
		}

		var name = attrChangeData.attrName;
		var changes = this.scheduledBatchData_.changes;
		if (changes[name]) {
			changes[name].newVal = attrChangeData.newVal;
		} else {
			changes[name] = attrChangeData;
		}
	}

	/**
	 * Sets the value of the requested attribute.
	 * Note: this can and should be accomplished by setting the attribute as a regular property.
	 * This should only be used in cases where a function is actually needed.
	 * @param {string} name
	 * @param {*} value
	 * @return {*}
	 */
	set(name, value) {
		this[name] = value;
	}

	/**
	 * Sets the value of all the specified attributes.
	 * @param {!Object.<string,*>} values A map of attribute names to the values they
	 *   should be set to.
	 */
	setAttrs(values) {
		var names = Object.keys(values);

		for (var i = 0; i < names.length; i++) {
			this[names[i]] = values[names[i]];
		}
	}

	/**
	 * Sets the value of the specified attribute. This is passed as that attribute's
	 * setter to the `Object.defineProperty` call inside the `addAttr` method.
	 * @param {string} name The name of the attribute.
	 * @param {*} value The new value of the attribute.
	 * @protected
	 */
	setAttrValue_(name, value) {
		if (!this.canSetAttribute(name) || !this.validateAttrValue_(name, value)) {
			return;
		}

		var info = this.attrsInfo_[name];
		if (info.initialValue === undefined && info.state === Attribute.States.UNINITIALIZED) {
			info.state = Attribute.States.INITIALIZED;
		}

		var prevVal = this[name];
		info.value = this.callSetter_(name, value);
		info.written = true;
		this.informChange_(name, prevVal);
	}

	/**
	 * Sets the default value of the requested attribute.
	 * @param {string} name The name of the attribute.
	 * @return {*}
	 */
	setDefaultValue_(name) {
		var config = this.attrsInfo_[name].config;

		if (config.value !== undefined) {
			this[name] = config.value;
		} else {
			this[name] = this.callFunction_(config.valueFn);
		}
	}

	/**
	 * Sets the initial value of the requested attribute.
	 * @param {string} name The name of the attribute.
	 * @return {*}
	 */
	setInitialValue_(name) {
		var info = this.attrsInfo_[name];
		if (info.initialValue !== undefined) {
			this[name] = info.initialValue;
			info.initialValue = undefined;
		}
	}

	/**
	 * Checks if we should inform about an attributes update. Updates are ignored
	 * during attribute initialization. Otherwise, updates to primitive values
	 * are only informed when the new value is different from the previous
	 * one. Updates to objects (which includes functions and arrays) are always
	 * informed outside initialization though, since we can't be sure if all of
	 * the internal data has stayed the same.
	 * @param {string} name The name of the attribute.
	 * @param {*} prevVal The previous value of the attribute.
	 * @return {boolean}
	 */
	shouldInformChange_(name, prevVal) {
		var info = this.attrsInfo_[name];
		return (info.state === Attribute.States.INITIALIZED) &&
			(core.isObject(prevVal) || prevVal !== this[name]);
	}

	/**
	 * Validates the attribute's value, which includes calling the validator defined
	 * in the attribute's configuration object, if there is one.
	 * @param {string} name The name of the attribute.
	 * @param {*} value The value to be validated.
	 * @return {boolean} Flag indicating if value is valid or not.
	 */
	validateAttrValue_(name, value) {
		var info = this.attrsInfo_[name];

		return info.state === Attribute.States.INITIALIZING_DEFAULT ||
			this.callValidator_(name, value);
	}
}

/**
 * A list with attribute names that will automatically be rejected as invalid.
 * Subclasses can define their own invalid attributes by setting this static
 * on their constructors, which will be merged together and handled automatically.
 * @type {!Array<string>}
 */
Attribute.INVALID_ATTRS = ['attrs'];

/**
 * Constants that represent the states that an attribute can be in.
 * @type {!Object}
 */
Attribute.States = {
	UNINITIALIZED: 0,
	INITIALIZING: 1,
	INITIALIZING_DEFAULT: 2,
	INITIALIZED: 3
};

export default Attribute;
