'use strict';

import { mergeSuperClassesProperty, object } from 'metal';
import { ComponentDataManager } from 'metal-component';
import State from 'metal-state';

class JSXDataManager extends ComponentDataManager {
	/**
	 * Overrides the original method so we can add properties to `props` by default.
	 * @param {string} name
	 * @param {!Object} config
	 * @param {*} opt_initialValue
	 * @override
	 */
	add() {
		this.props_.addToState(...arguments);
	}

	/**
	 * Manually adds props that weren't configured via `PROPS`.
	 * @param {!Object} data
	 * @protected
	 */
	addUnconfiguredProps_(data) {
		let keys = Object.keys(data);
		for (let i = 0; i < keys.length; i++) {
			if (!this.props_.hasStateKey(keys[i])) {
				this.component_.props[keys[i]] = data[keys[i]];
			}
		}
	}

	/**
	 * Overrides the original method so that the main `State` instance's data can
	 * come from `PROPS` instead of `STATE`.
	 * @param {!Object} data
	 * @return {!Object}
	 * @protected
	 * @override
	 */
	buildStateInstanceData_(data) {
		const ctor = this.component_.constructor;
		mergeSuperClassesProperty(ctor, 'PROPS', State.mergeState);
		return object.mixin({}, data, this.component_.constructor.PROPS_MERGED);
	}

	/**
	 * Overrides the original method so that we can have two separate `State`
	 * instances: one responsible for `state` and another for `props`.
	 * @param {!Object} data
	 * @protected
	 * @override
	 */
	createState_(data) {
		this.component_.props = {};
		super.createState_(data, this.component_.props);
		this.props_ = this.state_;
		this.addUnconfiguredProps_(this.component_.getInitialConfig());

		this.component_.state = {};
		this.state_ = new State({}, this.component_.state, this.component_, {
			internal: true
		});
		this.state_.setEventData({
			type: 'state'
		});
		this.state_.addToState(this.component_.constructor.STATE_MERGED);
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		super.disposeInternal();

		this.props_.dispose();
		this.props_ = null;
	}

	/**
	 * Overrides the original method so we can get properties from `props` by
	 * default.
	 * @param {string} name
	 * @return {*}
	 * @override
	 */
	get(name) {
		return this.props_.get(name);
	}

	/**
	 * Gets the `State` instance being used for "props".
	 * @return {!Object}
	 */
	getPropsInstance() {
		return this.props_;
	}

	/**
	 * Overrides the original method so we can enable "sync" methods just for
	 * `props`.
	 * @return {!Array<string>}
	 * @override
	 */
	getSyncKeys() {
		return this.props_.getStateKeys();
	}

	/**
	 * Overrides the original method so we can replace values in `props`.
	 * @param {!Object} data
	 * @override
	 */
	replaceNonInternal(data) {
		var prevProps = object.mixin({}, this.component_.props);
		ComponentDataManager.replaceNonInternal(data, this.props_);
		this.addUnconfiguredProps_(data);
		if (this.component_.propsChanged) {
			this.component_.propsChanged(prevProps);
		}
	}
}

JSXDataManager.BLACKLIST = {};

export default JSXDataManager;
