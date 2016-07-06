'use strict';

import { object } from 'metal';
import { EventEmitter, EventEmitterProxy } from 'metal-events';
import State from 'metal-state';

class ComponentDataManager extends EventEmitter {
	/**
	 * Constructor for `ComponentDataManager`.
	 * @param {!Component} component
	 * @param {!Object} data
	 */
	constructor(component, data) {
		super();
		this.component_ = component;
		this.blacklist_ = {
			components: true,
			element: true,
			wasRendered: true
		};
		this.createState_(data);
	}

	/**
	 * Creates the `State` instance that will handle the main component data.
	 * @param {!Object} data
	 * @protected
	 */
	createState_(data) {
		State.mergeStateStatic(this.component_.constructor);
		data = object.mixin({}, data, this.component_.constructor.STATE_MERGED);

		var state = new State({}, this.component_, this.component_);
		state.setKeysBlacklist_(this.blacklist_);
		state.addToState(data, this.component_.getInitialConfig());
		state.on('stateChanged', data => this.emit('dataChanged', data));
		state.on('stateKeyChanged', data => this.emit('dataPropChanged', data));
		this.state_ = state;

		this.proxy_ = new EventEmitterProxy(state, this.component_);
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		super.disposeInternal();

		this.state_.dispose();
		this.state_ = null;

		this.proxy_.dispose();
		this.proxy_ = null;
	}

	/**
	 * Gets the data with the given name.
	 * @param {string} name
	 * @return {*}
	 */
	get(name) {
		return this.state_.get(name);
	}

	/**
	 * Gets the keys for the state data.
	 * @return {!Array<string>}
	 */
	getStateKeys() {
		return this.state_.getStateKeys();
	}

	/**
	 * Gets the whole state data.
	 * @return {!Object}
	 */
	getState() {
		return this.state_.getState();
	}

	/**
	 * Gets the `State` instance being used.
	 * @return {!Object}
	 */
	getStateInstance() {
		return this.state_;
	}

	/**
	 * Sets the value of all the specified state keys.
	 * @param {!Object.<string,*>} values A map of state keys to the values they
	 *   should be set to.
	 * @param {function()=} opt_callback An optional function that will be run
	 *   after the next batched update is triggered.
	 */
	setState(state, opt_callback) {
		this.state_.setState(state, opt_callback);
	}
}

export default ComponentDataManager;
