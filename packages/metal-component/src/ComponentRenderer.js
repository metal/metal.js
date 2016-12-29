'use strict';

/**
 * Base class that component renderers should extend from. It defines the
 * required methods all renderers should have.
 */
class ComponentRenderer {

	/**
	 * Disposes of any data specific to the given component.
	 * @param {!Component} component
	 */
	dispose() {}

	/**
	 * Returns extra configuration for data that should be added to the manager.
	 * Sub classes can override to return `State` config for properties that
	 * should be added to the component.
	 * @param {!Component} component
	 * @return {Object}
	 */
	getExtraDataConfig() {}

	/**
	 * Renders the whole content (including its main element) and informs the
	 * component about it. Should be overridden by sub classes.
	 * @param {!Component} component
	 */
	render(component) {
		if (!component.element) {
			component.element = document.createElement('div');
		}
		component.informRendered();
	}

	/**
	 * Sets up this component to be used by this renderer. Sub classes should
	 * override as needed for more behavior.
	 * @param {!Component} component
	 */
	setUp() {}

	/**
	 * Updates the component's element html. This is automatically called when
	 * the value of at least one of the component's state keys has changed.
	 * Should be implemented by sub classes. Sub classes have to remember to call
	 * "informRendered" on the component when any update rendering is done.
	 * @param {!Component} component
	 * @param {Object.<string, Object>} changes Object containing the names
	 *     of all changed state keys, each mapped to an object with its new
	 *     (newVal) and previous (prevVal) values.
	 */
	update() {}
}

export default new ComponentRenderer();
