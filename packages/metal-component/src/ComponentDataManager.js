'use strict';

import { object } from 'metal';
import State from 'metal-state';

const BLACKLIST = {
	components: true,
	context: true,
	element: true,
	refs: true,
	state: true,
	stateKey: true,
	wasRendered: true
};
const DATA_MANAGER_DATA = '__DATA_MANAGER_DATA__';

class ComponentDataManager {
	/**
	 * Creates the `State` instance that will handle the main component data.
	 * @param {!Component} component
	 * @param {!Object} data
	 * @protected
	 */
	createState_(component, data) {
		const state = new State(component.getInitialConfig(), component, component);
		state.setKeysBlacklist(BLACKLIST);
		state.configState(
			object.mixin({}, data, State.getStateStatic(component.constructor))
		);
		this.getManagerData(component).state_ = state;
	}

	/**
	 * Disposes of any data being used by the manager in this component.
	 * @param {!Component} component
	 */
	dispose(component) {
		const data = this.getManagerData(component);
		if (data.state_) {
			data.state_.dispose();
		}
		component[DATA_MANAGER_DATA] = null;
	}

	/**
	 * Gets the data with the given name.
	 * @param {!Component} component
	 * @param {string} name
	 * @return {*}
	 */
	get(component, name) {
		return this.getManagerData(component).state_.get(name);
	}

	/**
	 * Gets the manager data for the given component.
	 * @param {!Component} component
	 * @return {Object}
	 */
	getManagerData(component) {
		return component[DATA_MANAGER_DATA];
	}

	/**
	 * Gets the keys for state data that can be synced via `sync` functions.
	 * @param {!Component} component
	 * @return {!Array<string>}
	 */
	getSyncKeys(component) {
		return this.getManagerData(component).state_.getStateKeys();
	}

	/**
	 * Gets the keys for state data.
	 * @param {!Component} component
	 * @return {!Array<string>}
	 */
	getStateKeys(component) {
		return this.getManagerData(component).state_.getStateKeys();
	}

	/**
	 * Gets the whole state data.
	 * @param {!Component} component
	 * @return {!Object}
	 */
	getState(component) {
		return this.getManagerData(component).state_.getState();
	}

	/**
	 * Gets the `State` instance being used.
	 * @param {!Component} component
	 * @return {!Object}
	 */
	getStateInstance(component) {
		return this.getManagerData(component).state_;
	}

	/**
	 * Updates all non internal data with the given values (or to the default
	 * value if none is given).
	 * @param {!Component} component
	 * @param {!Object} data
	 * @param {State=} opt_state
	 */
	replaceNonInternal(component, data, opt_state) {
		const state = opt_state || this.getManagerData(component).state_;
		const keys = state.getStateKeys();
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			if (!state.getStateKeyConfig(key).internal) {
				if (data.hasOwnProperty(key)) {
					state.set(key, data[key]);
				} else {
					state.setDefaultValue(key);
				}
			}
		}
	}

	/**
	 * Sets the value of all the specified state keys.
	 * @param {!Component} component
	 * @param {!Object.<string,*>} values A map of state keys to the values they
	 *   should be set to.
	 * @param {function()=} opt_callback An optional function that will be run
	 *   after the next batched update is triggered.
	 */
	setState(component, state, opt_callback) {
		this.getManagerData(component).state_.setState(state, opt_callback);
	}

	/**
	 * Sets up the specified component's data.
	 * @param {!Component} component
	 * @param {!Object} data
	 */
	setUp(component, data) {
		component[DATA_MANAGER_DATA] = {};
		this.createState_(component, data);
	}
}

export default new ComponentDataManager();
