'use strict';

import { getStaticProperty, Disposable } from 'metal';

/**
 * Base class that component renderers should extend from. It defines the
 * required methods all renderers should have.
 */
class ComponentRenderer extends Disposable {
	/**
	 * Constructor function for `ComponentRenderer`.
	 * @param {!Component} component The component that this renderer is
	 *     responsible for.
	 */
	constructor(component) {
		super();
		this.component_ = component;

		this.syncUpdates_ = getStaticProperty(component.constructor, 'SYNC_UPDATES');
		if (this.hasSyncUpdates()) {
			this.component_.on(
				'stateKeyChanged',
				this.handleRendererStateKeyChanged_.bind(this)
			);
		}
	}

	/**
	 * Returns this renderer's component.
	 * @return {!Component}
	 */
	getComponent() {
		return this.component_;
	}

	/**
	 * Returns extra configuration for data that should be added to the manager.
	 * @return {Object}
	 */
	getExtraDataConfig() {
		return null;
	}

	/**
	 * Handles a `dataPropChanged` event from the component's data manager. This
	 * is similar to `handleRendererStateChanged_`, but only called for
	 * components that have requested updates to happen synchronously.
	 * @param {!{key: string, newVal: *, prevVal: *}} data
	 * @protected
	 */
	handleRendererStateKeyChanged_(data) {
		if (this.shouldRerender_()) {
			this.update({
				changes: {
					[data.key]: data
				}
			});
		}
	}

	/**
	 * Checks if this component has sync updates enabled.
	 * @return {boolean}
	 */
	hasSyncUpdates() {
		return this.syncUpdates_;
	}

	/**
	 * Informs the component that it has just been rendered, via both a lifecycle
	 * function and an event. Sub classes should make sure to call this when
	 * appropriate.
	 * @protected
	 */
	informRendered_() {
		var firstRender = !this.isRendered_;
		this.isRendered_ = true;
		this.component_.rendered(firstRender);
		this.component_.emit('rendered', firstRender);
	}

	/**
	 * Renders the whole content (including its main element) and informs the
	 * component about it. Should be overridden by sub classes.
	 */
	render() {
		if (!this.component_.element) {
			this.component_.element = document.createElement('div');
		}
		this.informRendered_();
	}

	/**
	 * Checks if changes should cause a rerender right now.
	 * @return {boolean}
	 * @protected
	 */
	shouldRerender_() {
		return this.isRendered_ && !this.skipUpdates_;
	}

	/**
	 * Rerenders the component according to the given changes.
	 * @param {!Object<string, Object>} changes Object containing the names
	 *     of all changed state keys, each mapped to an object with its new
	 *     (newVal) and previous (prevVal) values.
	 */
	sync(changes) {
		if (!this.hasSyncUpdates() && this.shouldRerender_()) {
			this.update(changes);
		}
	}

	/**
	 * Skips updates until `stopSkipUpdates` is called.
	 */
	startSkipUpdates() {
		this.skipUpdates_ = true;
	}

	/**
	 * Stops skipping updates.
	 */
	stopSkipUpdates() {
		this.skipUpdates_ = false;
	}

	/**
	 * Updates the component's element html. This is automatically called when
	 * the value of at least one of the component's state keys has changed.
	 * Should be implemented by sub classes.
	 * @param {Object.<string, Object>} changes Object containing the names
	 *     of all changed state keys, each mapped to an object with its new
	 *     (newVal) and previous (prevVal) values.
	 */
	update() {}
}

export default ComponentRenderer;
