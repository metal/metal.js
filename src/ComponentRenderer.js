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
			this.component_.on('stateChanged', this.handleComponentRendererStateChanged_.bind(this)),
			this.component_.once('render', this.render.bind(this))
		);
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.componentRendererEvents_.removeAllListeners();
		this.componentRendererEvents_ = null;
	}

	/**
	 * Handles an `stateChanged` event from this renderer's component. Calls the
	 * `update` function if the component has already been rendered for the first
	 * time.
	 * @param {Object.<string, Object>} changes Object containing the names
	 *     of all changed state keys, each mapped to an object with its new
	 *     (newVal) and previous (prevVal) values.
	 */
	handleComponentRendererStateChanged_(changes) {
		if (this.component_.wasRendered) {
			this.update(changes);
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
