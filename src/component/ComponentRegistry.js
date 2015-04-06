'use strict';

/**
 * The component registry is used to register components, so they can
 * be accessible by name.
 * @type {Object}
 */
class ComponentRegistry {
	/**
	 * Gets the constructor function for the given component name, or
	 * undefined if it hasn't been registered yet.
	 * @param {string} name The component's name.
	 * @return {?function}
	 * @static
	 */
	static getConstructor(name) {
		var constructorFn = ComponentRegistry.components_[name];
		if (!constructorFn) {
			console.error(
				'There\'s no constructor registered for the component ' +
				'named ' + name + '. Components need to be registered via ' +
				'ComponentRegistry.register.'
			);
		}
		return constructorFn;
	}

	/**
	 * Registers a component.
	 * @param {string} name The component's name.
	 * @param {string} constructorFn The component's constructor function.
	 * @static
	 */
	static register(name, constructorFn) {
		ComponentRegistry.components_[name] = constructorFn;
		constructorFn.NAME = name;
		constructorFn.TEMPLATES = ComponentRegistry.Templates[name];
	}
}

/**
 * Holds all registered components, indexed by their names.
 * @type {!Object<string, function()>}
 * @protected
 * @static
 */
ComponentRegistry.components_ = {};

/**
 * Holds all registered component templates, indexed by component names.
 * Soy files automatically add their templates to this object when imported.
 * @type {!Object<string, !Object<string, !function()>>}
 * @static
 */
ComponentRegistry.Templates = {};

export default ComponentRegistry;
