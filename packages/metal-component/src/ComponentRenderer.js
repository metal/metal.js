'use strict';

import { EventEmitter, EventHandler } from 'metal-events';

/**
 * Base class that component renderers should extend from. It defines the
 * required methods all renderers should have.
 */
class ComponentRenderer extends EventEmitter {
	/**
	 * Constructor function for `ComponentRenderer`.
	 * @param {!Component} component The component that this renderer is
	 *     responsible for.
	 */
	constructor(component) {
		super();
		this.component_ = component;

		this.componentRendererEvents_ = new EventHandler();
		this.componentRendererEvents_.add(
			this.component_.once('render', this.render.bind(this))
		);

		if (this.component_.constructor.SYNC_UPDATES_MERGED) {
			this.componentRendererEvents_.add(
				this.component_.on(
					'stateKeyChanged',
					this.handleComponentRendererStateKeyChanged_.bind(this)
				)
			);
		} else {
			this.componentRendererEvents_.add(
				this.component_.on(
					'stateChanged',
					this.handleComponentRendererStateChanged_.bind(this)
				)
			);
		}
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.componentRendererEvents_.removeAllListeners();
		this.componentRendererEvents_ = null;
	}

	/**
	 * Handles a `stateChanged` event from this renderer's component. Calls the
	 * `update` function if the component has already been rendered for the first
	 * time.
	 * @param {!Object<string, Object>} changes Object containing the names
	 *     of all changed state keys, each mapped to an object with its new
	 *     (newVal) and previous (prevVal) values.
	 * @protected
	 */
	handleComponentRendererStateChanged_(changes) {
		if (this.component_.wasRendered) {
			this.update(changes);
		}
	}

	/**
	 * Handles a `stateKeyChanged` event from this renderer's component. This is
	 * similar to `handleComponentRendererStateChanged_`, but only called for
	 * components that have requested updates to happen synchronously.
	 * @param {!{key: string, newVal: *, prevVal: *}} data
	 * @protected
	 */
	handleComponentRendererStateKeyChanged_(data) {
		if (this.component_.wasRendered) {
			this.update({
				changes: {
					[data.key]: data
				}
			});
		}
	}

	/**
	 * Renders the component's whole content (including its main element).
	 */
	render() {
		if (!this.component_.element) {
			this.component_.element = document.createElement('div');
		}
	}

	/**
	 * Updates the component's element html. This is automatically called by
	 * the component when the value of at least one of its state keys has changed.
	 * @param {Object.<string, Object>} changes Object containing the names
	 *     of all changed state keys, each mapped to an object with its new
	 *     (newVal) and previous (prevVal) values.
	 */
	update() {}
}

export default ComponentRenderer;
