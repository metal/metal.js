'use strict';

import core from '../core';
import object from '../object/object';
import EventEmitter from '../events/EventEmitter';
import {async} from '../promise/Promise';

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
    super(opt_config);

    this.attrsInfo_ = {};
    this.addAttrsFromStaticHint_(opt_config);
  }

  /**
   * Adds the given attribute.
   * @param {string} name The name of the new attribute.
   * @param {Object.<string, *>=} config The configuration object for the new attribute.
   *   This object can have the following keys:
   *   initOnly - Ignores writes to the attribute after it's been initialized. That is,
   *   allows writes only when adding the attribute for the first time.
   *   setter - Function for normalizing new attribute values. It receives the new value
   *   that was set, and returns the value that should be stored.
   *   validator - Function that validates new attribute values. When it returns false,
   *   the new value is ignored.
   *   value - The default value for this attribute. Note that setting this to an object
   *   will cause all attribute instances to use the same reference to the object. To
   *   have each attribute instance use a different reference, use the `valueFn` option
   *   instead.
   *   valueFn - A function that returns the default value for this attribute.
   * @param {*} initialValue The initial value of the new attribute. This value has higher
   *   precedence than the default value specified in this attribute's configuration.
   */
  addAttr(name, config, initialValue) {
    this.assertValidAttrName_(name);

    this.attrsInfo_[name] = {
      config: config || {},
      initialValue: initialValue,
      state: Attribute.States.UNINITIALIZED
    };

    Object.defineProperty(this, name, {
      configurable: true,
      get: core.bind(this.getAttrValue_, this, name),
      set: core.bind(this.setAttrValue_, this, name)
    });
  }

  /**
   * Adds the given attributes.
   * @param {!Object.<string, !Object>} configs An object that maps the names of all the
   *   attributes to be added to their configuration objects.
   * @param {!Object.<string, *>} initialValues An object that maps the names of
   *   attributes to their initial values. These values have higher precedence than the
   *   default values specified in the attribute configurations.
   */
  addAttrs(configs, initialValues) {
    initialValues = initialValues || {};
    var names = Object.keys(configs);

    for (var i = 0; i < names.length; i++) {
      this.addAttr(names[i], configs[names[i]], initialValues[names[i]]);
    }
  }

  /**
   * Adds attributes from super classes static hint `MyClass.ATTRS = {};`.
   * @param {!Object.<string, !Object>} configs An object that maps the names
   *     of all the attributes to be added to their configuration objects.
   * @protected
   */
  addAttrsFromStaticHint_(config) {
    core.mergeSuperClassesProperty(this.constructor, 'ATTRS', this.mergeAttrs_);
    this.addAttrs(this.constructor.ATTRS_MERGED, config);
  }

  /**
   * Checks that the given name is a valid attribute name. If it's not, an error
   * will be thrown.
   * @param {string} name The name to be validated.
   * @throws {Error}
   */
  assertValidAttrName_(name) {
    if (name === 'attrs') {
      throw new Error('It\'s not allowed to create an attribute with the name "attrs".');
    }
  }

  /**
   * Checks if the it's allowed to write on the requested attribute.
   * @param {string} name The name of the attribute.
   * @return {Boolean}
   * @protected
   */
  canWrite_(name) {
    this.initAttr_(name);

    var info = this.attrsInfo_[name];
    return !info.config.initOnly || info.state !== Attribute.States.INITIALIZED;
  }

  /**
   * Calls the requested function, running the appropriate code for when it's
   * passed as an actual function object or just the function's name.
   * @param {!Function|string} fn Function, or name of the function to run.
   * @param {...*} A variable number of optional parameters to be passed to the
   *   function that will be called.
   * @return {*} The return value of the called function.
   * @protected
   */
  callFunction_(fn) {
    var args = Array.prototype.slice.call(arguments, 1);

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
      value = this.callFunction_(config.setter, value);
    }
    return value;
  }

  /**
   * Calls the attribute's validator, if there is one.
   * @param {string} name The name of the attribute.
   * @param {*} value The value to be validated.
   * @return {Boolean} Flag indicating if value is valid or not.
   */
  callValidator_(name, value) {
    var info = this.attrsInfo_[name];
    var config = info.config;
    if (config.validator) {
      return this.callFunction_(config.validator, value);
    }
    return true;
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
   * Returns an object that maps all attribute names to their values.
   * @return {Object.<string, *>}
   */
  getAttrs() {
    var attrsMap = {};
    var names = Object.keys(this.attrsInfo_);

    for (var i = 0; i < names.length; i++) {
      attrsMap[names[i]] = this[names[i]];
    }

    return attrsMap;
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
   */
  mergeAttrs_(values) {
    return object.mixin.apply(null, [{}].concat(values.reverse()));
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
    if (!this.canWrite_(name) || !this.validateAttrValue_(name, value)) {
      return;
    }

    var info = this.attrsInfo_[name];
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

    if (config.value) {
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
   * @return {Boolean}
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
   * @return {Boolean} Flag indicating if value is valid or not.
   */
  validateAttrValue_(name, value) {
    var info = this.attrsInfo_[name];

    return info.state === Attribute.States.INITIALIZING_DEFAULT ||
      this.callValidator_(name, value);
  }
}

/**
 * Constants that represent the states that an attribute can be in.
 * @type {Object}
 */
Attribute.States = {
  UNINITIALIZED: 0,
  INITIALIZING: 1,
  INITIALIZING_DEFAULT: 2,
  INITIALIZED: 3
};

/**
 * Object that contains information about all this instance's attributes.
 * @type {!Object<string, !Object>}
 * @protected
 */
Attribute.prototype.attrsInfo_ = null;

/**
 * Object with information about the batch event that is currently scheduled, or
 * null if none is.
 * @type {Object}
 * @protected
 */
Attribute.prototype.scheduledBatchData_ = null;

export default Attribute;
