'use strict';

import ComponentRegistry from '../component/ComponentRegistry';
import Disposable from '../disposable/Disposable';

class ComponentCollector extends Disposable {
	constructor() {
		super();

		/**
		 * Holds the data that should be passed to a component, mapped by component id.
		 * @type {!Object<string, Object>}
		 */
		this.nextComponentData_ = {};
	}

	/**
	 * Adds a component to this collector.
	 * @param {Component} component
	 */
	addComponent(component) {
		ComponentCollector.components[component.id] = component;
	}

	/**
	 * Creates the appropriate component from the given config data if it doesn't
	 * exist yet.
	 * @param {string} componentName The name of the component to be created.
	 * @param {string} id The id of the component to be created.
	 * @return {!Component} The component instance.
	 */
	createComponent(componentName, id) {
		var component = ComponentCollector.components[id];
		if (!component) {
			var ConstructorFn = ComponentRegistry.getConstructor(componentName);
			var data = this.getNextComponentData(id);
			data.element = '#' + id;
			component = new ConstructorFn(data);
		}
		return component;
	}

	/**
	 * Gets the data that should be passed to the next creation or update of a
	 * component with the given id.
	 * @param {string} id
	 * @param {Object} data
	 */
	getNextComponentData(id) {
		var data = this.nextComponentData_[id] || {};
		data.id = id;
		return data;
	}

	/**
	 * Sets the data that should be passed to the next creation or update of a
	 * component with the given id.
	 * @param {string} id
	 * @param {Object} data
	 */
	setNextComponentData(id, data) {
		this.nextComponentData_[id] = data;
	}

	/**
	 * Updates an existing component instance with new attributes.
	 * @param {string} id The id of the component to be created or updated.
	 * @return {Component} The extracted component instance.
	 */
	updateComponent(id) {
		var component = ComponentCollector.components[id];
		if (component) {
			var data = this.getNextComponentData(id);
			component.setAttrs(data);
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
