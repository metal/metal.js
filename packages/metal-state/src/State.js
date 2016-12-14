'use strict';

import { async, getStaticProperty, isDefAndNotNull, isFunction, isObject, isString, object } from 'metal';
import { EventEmitter } from 'metal-events';

/**
 * State adds support for having object properties that can be watched for
 * changes, as well as configured with validators, setters and other options.
 * See the `configState` method for a complete list of available configuration
 * options for each state key.
 * @extends {EventEmitter}
 */
class State extends EventEmitter {
	/**
	 * Constructor function for `State`.
	 * @param {Object=} opt_config Optional config object with initial values to
	 *     set state properties to.
	 * @param {Object=} opt_obj Optional object that should hold the state
	 *     properties. If none is given, they will be added directly to `this`
	 *     instead.
	 * @param {Object=} opt_context Optional context to call functions (like
	 *     validators and setters) on. Defaults to `this`.
	 */
	constructor(opt_config, opt_obj, opt_context) {
		super();

		/**
		 * Context to call functions (like validators and setters) on.
		 * @type {!Object}
		 * @protected
		 */
		this.context_ = opt_context || this;

		/**
		 * Map of keys that can not be used as state keys.
		 * @type {Object<string, boolean>}
		 * @protected
		 */
		this.keysBlacklist_ = null;

		/**
		 * Object that should hold the state properties.
		 * @type {!Object}
		 * @protected
		 */
		this.obj_ = opt_obj || this;

		this.eventData_ = null;

		/**
		 * Object with information about the batch event that is currently
		 * scheduled, or null if none is.
		 * @type {Object}
		 * @protected
		 */
		this.scheduledBatchData_ = null;

		/**
		 * Object that contains information about all this instance's state keys.
		 * @type {!Object<string, !Object>}
		 * @protected
		 */
		this.stateInfo_ = {};

		this.stateConfigs_ = {};

		this.initialValues_ = object.mixin({}, opt_config);

		this.setShouldUseFacade(true);
		this.configStateFromStaticHint_();

		Object.defineProperty(this.obj_, State.STATE_REF_KEY, {
			configurable: true,
			enumerable: false,
			value: this
		});
	}

	/**
	 * Logs an error if the given property is required but wasn't given.
	 * @param {string} name
	 * @protected
	 */
	assertGivenIfRequired_(name) {
		const config = this.stateConfigs_[name];
		if (config.required) {
			const info = this.getStateInfo(name);
			const value = info.state === State.KeyStates.INITIALIZED ?
				this.get(name) :
				this.initialValues_[name];
			if (!isDefAndNotNull(value)) {
				console.error(
					`The property called "${name}" is required but didn't receive a value.`
				);
			}
		}
	}

	/**
	 * Checks that the given name is a valid state key name. If it's not, an error
	 * will be thrown.
	 * @param {string} name The name to be validated.
	 * @throws {Error}
	 * @protected
	 */
	assertValidStateKeyName_(name) {
		if (this.keysBlacklist_ && this.keysBlacklist_[name]) {
			throw new Error(
				`It's not allowed to create a state key with the name "${name}".`
			);
		}
	}

	/**
	 * Builds the property definition object for the specified state key.
	 * @param {string} name The name of the key.
	 * @return {!Object}
	 * @protected
	 */
	buildKeyPropertyDef_(name) {
		return {
			configurable: true,
			enumerable: true,
			get: function() {
				return this[State.STATE_REF_KEY].getStateKeyValue_(name);
			},
			set: function(val) {
				this[State.STATE_REF_KEY].setStateKeyValue_(name, val);
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
		if (isString(fn)) {
			return this.context_[fn].apply(this.context_, args);
		} else if (isFunction(fn)) {
			return fn.apply(this.context_, args);
		}
	}

	/**
	 * Calls the state key's setter, if there is one.
	 * @param {string} name The name of the key.
	 * @param {*} value The value to be set.
	 * @param {*} currentValue The current value.
	 * @return {*} The final value to be set.
	 * @protected
	 */
	callSetter_(name, value, currentValue) {
		const config = this.stateConfigs_[name];
		if (config.setter) {
			value = this.callFunction_(config.setter, [value, currentValue]);
		}
		return value;
	}

	/**
	 * Calls the state key's validator, if there is one. Emits console
	 * warning if validator returns a string.
	 * @param {string} name The name of the key.
	 * @param {*} value The value to be validated.
	 * @return {boolean} Flag indicating if value is valid or not.
	 * @protected
	 */
	callValidator_(name, value) {
		const config = this.stateConfigs_[name];
		if (config.validator) {
			const validatorReturn = this.callFunction_(
				config.validator,
				[value, name, this.context_]
			);

			if (validatorReturn instanceof Error) {
				console.error(`Warning: ${validatorReturn}`);
			}
			return validatorReturn;
		}
		return true;
	}

	/**
	 * Checks if the it's allowed to write on the requested state key.
	 * @param {string} name The name of the key.
	 * @return {boolean}
	 */
	canSetState(name) {
		const info = this.getStateInfo(name);
		return !this.stateConfigs_[name].writeOnce || !info.written;
	}

	/**
	 * Adds the given key(s) to the state, together with its(their) configs.
	 * Config objects support the given settings:
	 *     required - When set to `true`, causes errors to be printed (via
	 *     `console.error`) if no value is given for the property.
	 *
	 *     setter - Function for normalizing state key values. It receives the new
	 *     value that was set, and returns the value that should be stored.
	 *
	 *     validator - Function that validates state key values. When it returns
	 *     false, the new value is ignored. When it returns an instance of Error,
	 *     it will emit the error to the console.
	 *
	 *     value - The default value for the state key. Note that setting this to
	 *     an object will cause all class instances to use the same reference to
	 *     the object. To have each instance use a different reference for objects,
	 *     use the `valueFn` option instead.
	 *
	 *     valueFn - A function that returns the default value for a state key.
	 *
	 *     writeOnce - Ignores writes to the state key after it's been first
	 *     written to. That is, allows writes only when setting the value for the
	 *     first time.
	 * @param {!Object.<string, !Object>|string} configs An object that maps
	 *     configuration options for keys to be added to the state.
	 * @param {boolean|Object|*=} opt_context The context where the added state
	 *     keys will be defined (defaults to `this`), or false if they shouldn't
	 *     be defined at all.
	 */
	configState(configs, opt_context) {
		const names = Object.keys(configs);
		if (names.length === 0) {
			return;
		}

		if (opt_context !== false) {
			const props = {};
			for (let i = 0; i < names.length; i++) {
				const name = names[i];
				this.assertValidStateKeyName_(name);
				props[name] = this.buildKeyPropertyDef_(name);
			}
			Object.defineProperties(
				opt_context || this.obj_,
				props
			);
		}

		this.stateConfigs_ = configs;
		for (let i = 0; i < names.length; i++) {
			const name = names[i];
			configs[name] = configs[name].config ? configs[name].config : configs[name];
			this.assertGivenIfRequired_(names[i]);
			this.validateInitialValue_(names[i]);
		}
	}

	/**
	 * Adds state keys from super classes static hint `MyClass.STATE = {};`.
	 * @param {Object.<string, !Object>=} opt_config An object that maps all the
	 *     configurations for state keys.
	 * @protected
	 */
	configStateFromStaticHint_() {
		const ctor = this.constructor;
		if (ctor !== State) {
			let defineContext;
			if (this.obj_ === this) {
				defineContext = ctor.hasConfiguredState_ ? false : ctor.prototype;
				ctor.hasConfiguredState_ = true;
			}
			this.configState(State.getStateStatic(ctor), defineContext);
		}
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		super.disposeInternal();
		this.initialValues_ = null;
		this.stateInfo_ = null;
		this.stateConfigs_ = null;
		this.scheduledBatchData_ = null;
	}

	/**
	 * Emits the state change batch event.
	 * @protected
	 */
	emitBatchEvent_() {
		if (!this.isDisposed()) {
			const data = this.scheduledBatchData_;
			this.scheduledBatchData_ = null;
			this.context_.emit('stateChanged', data);
		}
	}

	/**
	 * Returns the value of the requested state key.
	 * Note: this can and should be accomplished by accessing the value as a
	 * regular property. This should only be used in cases where a function is
	 * actually needed.
	 * @param {string} name
	 * @return {*}
	 */
	get(name) {
		return this.obj_[name];
	}

	/**
	 * Returns an object that maps state keys to their values.
	 * @param {Array<string>=} opt_names A list of names of the keys that should
	 *   be returned. If none is given, the whole state will be returned.
	 * @return {Object.<string, *>}
	 */
	getState(opt_names) {
		const state = {};
		const names = opt_names || this.getStateKeys();

		for (let i = 0; i < names.length; i++) {
			state[names[i]] = this.get(names[i]);
		}

		return state;
	}

	/**
	 * Gets information about the specified state property.
	 * @param {string} name
	 * @return {!Object}
	 */
	getStateInfo(name) {
		if (!this.stateInfo_[name]) {
			this.stateInfo_[name] = {};
		}
		return this.stateInfo_[name];
	}

	/**
	 * Gets the config object for the requested state key.
	 * @param {string} name The key's name.
	 * @return {Object}
	 * @protected
	 */
	getStateKeyConfig(name) {
		return this.stateConfigs_ ? this.stateConfigs_[name] : null;
	}

	/**
	 * Returns an array with all state keys.
	 * @return {!Array.<string>}
	 */
	getStateKeys() {
		return this.stateConfigs_ ? Object.keys(this.stateConfigs_) : [];
	}

	/**
	 * Gets the value of the specified state key. This is passed as that key's
	 * getter to the `Object.defineProperty` call inside the `addKeyToState` method.
	 * @param {string} name The name of the key.
	 * @return {*}
	 * @protected
	 */
	getStateKeyValue_(name) {
		if (!this.warnIfDisposed_(name)) {
			this.initStateKey_(name);
			return this.getStateInfo(name).value;
		}
	}

	/**
	 * Merges the STATE static variable for the given constructor function.
	 * @param  {!Function} ctor Constructor function.
	 * @return {boolean} Returns true if merge happens, false otherwise.
	 * @static
	 */
	static getStateStatic(ctor) {
		return getStaticProperty(ctor, 'STATE', State.mergeState);
	}

	/**
	 * Checks if the value of the state key with the given name has already been
	 * set. Note that this doesn't run the key's getter.
	 * @param {string} name The name of the key.
	 * @return {boolean}
	 */
	hasBeenSet(name) {
		const info = this.getStateInfo(name);
		return info.state === State.KeyStates.INITIALIZED ||
			this.hasInitialValue_(name);
	}

	/**
	 * Checks if an initial value was given to the specified state property.
	 * @param {string} name The name of the key.
	 * @return {boolean}
	 * @protected
	 */
	hasInitialValue_(name) {
		return this.initialValues_.hasOwnProperty(name);
	}

	/**
	 * Checks if the given key is present in this instance's state.
	 * @param {string} key
	 * @return {boolean}
	 */
	hasStateKey(key) {
		if (!this.warnIfDisposed_(key)) {
			return !!this.stateConfigs_[key];
		}
	}

	/**
	 * Informs of changes to a state key's value through an event. Won't trigger
	 * the event if the value hasn't changed or if it's being initialized.
	 * @param {string} name The name of the key.
	 * @param {*} prevVal The previous value of the key.
	 * @protected
	 */
	informChange_(name, prevVal) {
		if (this.shouldInformChange_(name, prevVal)) {
			const data = object.mixin({
				key: name,
				newVal: this.get(name),
				prevVal: prevVal
			}, this.eventData_);
			this.context_.emit(`${name}Changed`, data);
			this.context_.emit('stateKeyChanged', data);
			this.scheduleBatchEvent_(data);
		}
	}

	/**
	 * Initializes the specified state key, giving it a first value.
	 * @param {string} name The name of the key.
	 * @protected
	 */
	initStateKey_(name) {
		const info = this.getStateInfo(name);
		if (info.state !== State.KeyStates.UNINITIALIZED) {
			return;
		}

		info.state = State.KeyStates.INITIALIZING;
		this.setInitialValue_(name);
		if (!info.written) {
			this.setDefaultValue(name);
		}
		info.state = State.KeyStates.INITIALIZED;
	}

	/**
	 * Merges two values for the STATE property into a single object.
	 * @param {Object} mergedVal
	 * @param {Object} currVal
	 * @return {!Object} The merged value.
	 * @static
	 */
	static mergeState(mergedVal, currVal) {
		return object.mixin({}, currVal, mergedVal);
	}

	/**
	 * Removes the requested state key.
	 * @param {string} name The name of the key.
	 */
	removeStateKey(name) {
		this.stateInfo_[name] = null;
		this.stateConfigs_[name] = null;
		delete this.obj_[name];
	}

	/**
	 * Schedules a state change batch event to be emitted asynchronously.
	 * @param {!Object} changeData Information about a state key's update.
	 * @protected
	 */
	scheduleBatchEvent_(changeData) {
		if (!this.scheduledBatchData_) {
			async.nextTick(this.emitBatchEvent_, this);
			this.scheduledBatchData_ = object.mixin({
				changes: {}
			}, this.eventData_);
		}

		const name = changeData.key;
		const changes = this.scheduledBatchData_.changes;
		if (changes[name]) {
			changes[name].newVal = changeData.newVal;
		} else {
			changes[name] = changeData;
		}
	}

	/**
	 * Sets the value of the requested state key.
	 * Note: this can and should be accomplished by setting the state key as a
	 * regular property. This should only be used in cases where a function is
	 * actually needed.
	 * @param {string} name
	 * @param {*} value
	 * @return {*}
	 */
	set(name, value) {
		if (this.hasStateKey(name)) {
			this.obj_[name] = value;
		}
	}

	/**
	 * Sets the default value of the requested state key.
	 * @param {string} name The name of the key.
	 * @return {*}
	 */
	setDefaultValue(name) {
		const config = this.stateConfigs_[name];

		if (config.value !== undefined) {
			this.set(name, config.value);
		} else {
			this.set(name, this.callFunction_(config.valueFn));
		}
	}

	/**
	 * Sets data to be sent with all events emitted from this instance.
	 * @param {Object}
	 */
	setEventData(data) {
		this.eventData_ = data;
	}

	/**
	 * Sets the initial value of the requested state key.
	 * @param {string} name The name of the key.
	 * @return {*}
	 * @protected
	 */
	setInitialValue_(name) {
		if (this.hasInitialValue_(name)) {
			this.set(name, this.initialValues_[name]);
			this.initialValues_[name] = undefined;
		}
	}

	/**
	 * Sets a map of keys that are not valid state keys.
	 * @param {!Object<string, boolean>}
	 */
	setKeysBlacklist(blacklist) {
		this.keysBlacklist_ = blacklist;
	}

	/**
	 * Sets the value of all the specified state keys.
	 * @param {!Object.<string,*>} values A map of state keys to the values they
	 *   should be set to.
	 * @param {function()=} opt_callback An optional function that will be run
	 *   after the next batched update is triggered.
	 */
	setState(values, opt_callback) {
		Object.keys(values).forEach(name => this.set(name, values[name]));
		if (opt_callback && this.scheduledBatchData_) {
			this.context_.once('stateChanged', opt_callback);
		}
	}

	/**
	 * Sets the value of the specified state key. This is passed as that key's
	 * setter to the `Object.defineProperty` call inside the `addKeyToState`
	 * method.
	 * @param {string} name The name of the key.
	 * @param {*} value The new value of the key.
	 * @protected
	 */
	setStateKeyValue_(name, value) {
		if (this.warnIfDisposed_(name) ||
			!this.canSetState(name) ||
			!this.validateKeyValue_(name, value)) {
			return;
		}

		const prevVal = this.get(name);
		const info = this.getStateInfo(name);
		info.value = this.callSetter_(name, value, prevVal);
		this.assertGivenIfRequired_(name);
		info.written = true;
		this.informChange_(name, prevVal);
	}

	/**
	 * Checks if we should inform about a state update. Updates are ignored during
	 * state initialization. Otherwise, updates to primitive values are only
	 * informed when the new value is different from the previous one. Updates to
	 * objects (which includes functions and arrays) are always informed outside
	 * initialization though, since we can't be sure if all of the internal data
	 * has stayed the same.
	 * @param {string} name The name of the key.
	 * @param {*} prevVal The previous value of the key.
	 * @return {boolean}
	 * @protected
	 */
	shouldInformChange_(name, prevVal) {
		const info = this.getStateInfo(name);
		return (info.state === State.KeyStates.INITIALIZED) &&
			(isObject(prevVal) || prevVal !== this.get(name));
	}

	/**
	 * Validates the initial value for the state property with the given name.
	 * @param {string} name
	 * @protected
	 */
	validateInitialValue_(name) {
		if (this.hasInitialValue_(name) && !this.callValidator_(name, this.initialValues_[name])) {
			delete this.initialValues_[name];
		}
	}

	/**
	 * Validates the state key's value, which includes calling the validator
	 * defined in the key's configuration object, if there is one.
	 * @param {string} name The name of the key.
	 * @param {*} value The value to be validated.
	 * @return {boolean} Flag indicating if value is valid or not.
	 * @protected
	 */
	validateKeyValue_(name, value) {
		const info = this.getStateInfo(name);
		return info.state === State.KeyStates.INITIALIZING ||
			this.callValidator_(name, value);
	}

	/**
	 * Warns if this instance has already been disposed.
	 * @param {string} name Name of the property to be accessed if not disposed.
	 * @return {boolean} True if disposed, or false otherwise.
	 * @protected
	 */
	warnIfDisposed_(name) {
		const disposed = this.isDisposed();
		if (disposed) {
			console.warn(
				`Error. Trying to access property "${name}" on disposed instance`
			);
		}
		return disposed;
	}
}

State.STATE_REF_KEY = '__METAL_STATE_REF_KEY__';

/**
 * Constants that represent the states that a state key can be in.
 * @type {!Object}
 */
State.KeyStates = {
	UNINITIALIZED: undefined,
	INITIALIZING: 1,
	INITIALIZED: 2
};

export default State;
