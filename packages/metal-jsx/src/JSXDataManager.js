'use strict';

import { mergeSuperClassesProperty, object } from 'metal';
import { ComponentDataManager } from 'metal-component';
import State from 'metal-state';

// TODO: Maybe change this to use regular `class` and `extend`, but export an
// instance of it instead of the constructor (though we need the constructor
// as a named export at least so we can extend it in JSXDataManager).

const JSXDataManager = Object.create(ComponentDataManager);
object.mixin(JSXDataManager, {
	/**
	 * Manually adds props that weren't configured via `PROPS`.
	 * @param {!Component} component
	 * @param {!State} props
	 * @param {!Object} data
	 * @protected
	 */
	addUnconfiguredProps_(component, props, data) {
		let keys = Object.keys(data);
		for (let i = 0; i < keys.length; i++) {
			if (!props.hasStateKey(keys[i])) {
				component.props[keys[i]] = data[keys[i]];
			}
		}
	},

	/**
	 * Overrides the original method so that we can have two separate `State`
	 * instances: one responsible for `state` and another for `props`.
	 * @param {!Component} comp
	 * @param {!Object} config
	 * @protected
	 * @override
	 */
	createState_(comp, config) {
		const ctor = comp.constructor;
		comp.props = {};
		comp.state = {};
		const data = this.getManagerData(comp);

		mergeSuperClassesProperty(ctor, 'PROPS', State.mergeState);
		data.props_ = new State(comp.getInitialConfig(), comp.props, comp);
		data.props_.configState(
			object.mixin({}, config, comp.constructor.PROPS_MERGED)
		);
		this.addUnconfiguredProps_(comp, data.props_, comp.getInitialConfig());

		data.state_ = new State({}, comp.state, comp);
		data.state_.setEventData({
			type: 'state'
		});
		data.state_.configState(ctor.STATE_MERGED);
	},

	/**
	 * @inheritDoc
	 */
	dispose(component) {
		var data = this.getManagerData(component);
		data.props_.dispose();
		ComponentDataManager.dispose.call(this, component);
	},

	/**
	 * Overrides the original method so we can get properties from `props` by
	 * default.
	 * @param {!Component} component
	 * @param {string} name
	 * @return {*}
	 * @override
	 */
	get(component, name) {
		return this.getManagerData(component).props_.get(name);
	},

	/**
	 * Gets the `State` instance being used for "props".
	 * @param {!Component} component
	 * @return {!Object}
	 */
	getPropsInstance(component) {
		return this.getManagerData(component).props_;
	},

	/**
	 * Overrides the original method so we can enable "sync" methods just for
	 * `props`.
	 * @param {!Component} component
	 * @return {!Array<string>}
	 * @override
	 */
	getSyncKeys(component) {
		return this.getManagerData(component).props_.getStateKeys();
	},

	/**
	 * Overrides the original method so we can replace values in `props`.
	 * @param {!Component} component
	 * @param {!Object} data
	 * @override
	 */
	replaceNonInternal(component, data) {
		var prevProps;
		if (component.propsChanged) {
			 prevProps = object.mixin({}, component.props);
		}

		const props = this.getManagerData(component).props_;
		ComponentDataManager.replaceNonInternal.call(this, component, data, props);
		this.addUnconfiguredProps_(component, props, data);
		if (component.propsChanged) {
			component.propsChanged(prevProps);
		}
	}
});

export default JSXDataManager;
