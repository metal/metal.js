'use strict';

import ComponentRegistry from '../component/ComponentRegistry';
import Disposable from '../disposable/Disposable';

class ComponentCollector extends Disposable {
	/**
	 * Adds a component to this collector.
	 * @param {!Component} component
	 */
	addComponent(component) {
		ComponentCollector.components[component.id] = component;
	}

	/**
	 * Creates the appropriate component from the given config data if it doesn't
	 * exist yet.
	 * @param {string} componentName The name of the component to be created.
	 * @param {string} id The id of the component to be created.
	 * @param {Object=} opt_data
	 * @return {!Component} The component instance.
	 */
	createComponent(componentName, id, opt_data) {
		var component = ComponentCollector.components[id];
		if (!component) {
			var ConstructorFn = ComponentRegistry.getConstructor(componentName);
			var data = opt_data || {};
			data.id = id;
			data.element = '#' + id;
			component = new ConstructorFn(data);
		}
		return component;
	}

	/**
	 * Removes the given component from this collector.
	 * @param {!Component} component
	 */
	removeComponent(component) {
		delete ComponentCollector.components[component.id];
	}

	/**
	 * Updates an existing component instance with new attributes.
	 * @param {string} id The id of the component to be created or updated.
	 * @param {Object=} opt_data
	 * @return {Component} The extracted component instance.
	 */
	updateComponent(id, opt_data) {
		var component = ComponentCollector.components[id];
		if (component && opt_data) {
			component.setAttrs(opt_data);
		}
		return component;
	}
}

/**
 * Holds all collected components, indexed by their id.
 * @type {!Object<string, !Component>}
 */
ComponentCollector.components = {};

export default ComponentCollector;
