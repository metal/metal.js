'use strict';

import './incremental-dom';
import { getChanges, trackChanges } from './changes';
import { clearData, getData } from './data';
import { getOwner } from './children/children';
import { getPatchingComponent, patch } from './render/patch';
import { render, renderChild, renderFunction } from './render/render';
import { Component, ComponentRenderer } from 'metal-component';

class IncrementalDomRenderer extends ComponentRenderer.constructor {
	/**
	 * Returns an array with the args that should be passed to the component's
	 * `shouldUpdate` method. This can be overridden by sub classes to change
	 * what the method should receive.
	 * @param {Object} changes
	 * @return {!Array}
	 */
	buildShouldUpdateArgs(changes) {
		return [changes || {}];
	}

	/**
	 * @inheritDoc
	 */
	dispose(component) {
		const data = getData(component);
		var ref = data.config.ref;
		var owner = data.owner;
		if (owner && owner.components && owner.components[ref] === component) {
			delete owner.components[ref];
		}

		if (data.childComponents) {
			for (var i = 0; i < data.childComponents.length; i++) {
				const child = data.childComponents[i];
				if (!child.isDisposed()) {
					child.element = null;
					child.dispose();
				}
			}
		}

		clearData(component);
	}

	/**
	 * Generates a key for the element currently being rendered in the given
	 * component. By default, just returns the original key. Sub classes can
	 * override this to change the behavior.
	 * @param {!Component} component
	 * @param {string} key
	 * @return {?string}
	 */
	generateKey(component, key) {
		return key;
	}

	/**
	 * Gets the component that triggered the current patch operation.
	 * @return {Component}
	 */
	getPatchingComponent() {
		return getPatchingComponent();
	}

	/**
	 * Checks if the given object is an incremental dom node.
	 * @param {!Object} node
	 * @return {boolean}
	 */
	isIncDomNode(node) {
		return !!getOwner(node);
	}

	/**
	 * Renders the renderer's component for the first time, patching its element
	 * through incremental dom function calls. If the first arg is a function
	 * instead of a component instance, creates and renders this function, which
	 * can either be a simple incremental dom function or a component constructor.
	 * @param {!Component} component
	 * @param {!Component|function()} component Can be a component instance, a
	 *     simple incremental dom function or a component constructor.
	 * @param {Object|Element=} opt_dataOrElement Optional config data for the
	 *     function, or parent for the rendered content.
	 * @param {Element=} opt_parent Optional parent for the rendered content.
	 * @return {!Component} The rendered component's instance.
	 */
	render(component, opt_dataOrElement, opt_parent) {
		if (component instanceof Component) {
			patch(component);
		} else {
			return renderFunction(this, component, opt_dataOrElement, opt_parent);
		}
	}

	/**
	 * Renders the given child node via its owner renderer.
	 * @param {!Object} child
	 */
	renderChild(child) {
		renderChild(child);
	}

	/**
	 * Calls functions from `IncrementalDOM` to build the component element's
	 * content. Can be overriden by subclasses (for integration with template
	 * engines for example).
	 * @param {!Component} component
	 */
	renderIncDom(component) {
		if (component.render) {
			component.render();
		} else {
			IncrementalDOM.elementVoid('div');
		}
	}

	/**
	 * Runs the incremental dom functions for rendering this component, without
	 * calling `patch`. This function needs to be called inside a `patch`.
	 * @param {!Component} component
	 */
	renderInsidePatch(component) {
		const shouldRender = !component.wasRendered ||
			this.shouldUpdate(component) ||
			IncrementalDOM.currentPointer() !== component.element;
		if (shouldRender) {
			render(component);
		} else if (component.element) {
			this.skipRender();
		}
	}

	/**
	 * Sets up this component to be used by this renderer.
	 * @param {!Component} component
	 */
	setUp(component) {
		component.context = {};
		component.components = {};
		component.refs = {};

		const data = getData(component);
		data.config = component.getInitialConfig();
		trackChanges(component);
	}

	/**
	 * Checks if the component should be updated with the current state changes.
	 * @param {!Component} component
	 * @return {boolean}
	 */
	shouldUpdate(component) {
		const changes = getChanges(component);
		if (!changes) {
			return false;
		}
		if (component.shouldUpdate) {
			return component.shouldUpdate(...this.buildShouldUpdateArgs(changes));
		}
		return true;
	}

	/**
	 * Skips rendering the current node.
	 */
	skipRender() {
		IncrementalDOM.skipNode();
	}

	/**
	 * Updates the renderer's component when state changes, patching its element
	 * through incremental dom function calls.
	 * @param {!Component} component
	 */
	update(component) {
		if (this.shouldUpdate(component)) {
			patch(component);
		}
	}
}

const renderer = new IncrementalDomRenderer();

// Name of this renderer. Renderers should provide this as a way to identify
// them via a simple string (when calling enableCompatibilityMode to add
// support to old features for specific renderers for example).
renderer.RENDERER_NAME = 'incremental-dom';

export default renderer;
