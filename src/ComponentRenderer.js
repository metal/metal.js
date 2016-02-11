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
			this.component_.on('attrsChanged', this.handleComponentRendererAttrsChanged_.bind(this)),
			this.component_.once('render', this.render.bind(this))
		);
	}

	/**
	 * Builds and returns the component's main element, without any content. This
	 * is used by Component when building the element attribute from scratch,
	 * which can happen before the first render, whenever the attribute is first
	 * accessed.
	 * Subclasses should override this to customize the creation of the default
	 * component element.
	 * @return {!Element}
	 */
	buildElement() {
		return document.createElement('div');
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.componentRendererEvents_.removeAllListeners();
		this.componentRendererEvents_ = null;
	}

	/**
	 * Handles an `attrsChanged` event from this renderer's component. Calls the
	 * `update` function if the component has already been rendered for the first
	 * time.
	 * @param {Object.<string, Object>} changes Object containing the names
	 *     of all changed attributes as keys, each mapped to an object with its
	 *     new (newVal) and previous (prevVal) values.
	 */
	handleComponentRendererAttrsChanged_(changes) {
		if (this.component_.wasRendered) {
			this.update(changes);
		}
	}

	/**
	 * Renders the component's whole content. When decorating this should avoid
	 * replacing the existing content if it's already correct.
	 * @param {decorating: boolean} data
	 */
	render() {}

	/**
	 * Updates the component's element html. This is automatically called by
	 * the component when the value of at least one of its attributes has changed.
	 * @param {Object.<string, Object>} changes Object containing the names
	 *     of all changed attributes as keys, each mapped to an object with its
	 *     new (newVal) and previous (prevVal) values.
	 */
	update() {}
}

export default ComponentRenderer;
