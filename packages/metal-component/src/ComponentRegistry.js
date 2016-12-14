'use strict';

import { getFunctionName } from 'metal';

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
	 * @return {?function()}
	 * @static
	 */
	static getConstructor(name) {
		const constructorFn = ComponentRegistry.components_[name];
		if (!constructorFn) {
			console.error(
				`There's no constructor registered for the component named ${name}.
				Components need to be registered via ComponentRegistry.register.`
			);
		}
		return constructorFn;
	}

	/**
	 * Registers a component, so it can be found by its name.
	 * @param {!Function} constructorFn The component's constructor function.
	 * @param {string=} opt_name Name of the registered component. If none is given
	 *   the name defined by the NAME static variable will be used instead. If that
	 *   isn't set as well, the name of the constructor function will be used.
	 * @static
	 */
	static register(constructorFn, opt_name) {
		let name = opt_name;
		if (!name) {
			if (constructorFn.hasOwnProperty('NAME')) {
				name = constructorFn.NAME;
			} else {
				name = getFunctionName(constructorFn);
			}
		}
		constructorFn.NAME = name;
		ComponentRegistry.components_[name] = constructorFn;
	}
}

/**
 * Holds all registered components, indexed by their names.
 * @type {!Object<string, function()>}
 * @protected
 * @static
 */
ComponentRegistry.components_ = {};

export default ComponentRegistry;
