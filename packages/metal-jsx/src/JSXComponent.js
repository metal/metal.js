'use strict';

import './iDOMHelpers';
import {object} from 'metal';
import Component from 'metal-component';
import IncrementalDomRenderer from 'metal-incremental-dom';
import JSXDataManager from './JSXDataManager';
import JSXRenderer from './JSXRenderer';

/**
 * A component that has built-in integration with JSX templates. Example:
 *
 * <code>
 * class MyComponent extends JSXComponent {
 *   render() {
 *     return <div>Hello World</div>
 *   }
 * }
 * </code>
 */
class JSXComponent extends Component {
	/**
	 * Creates and renders the given function, which can either be a simple
	 * JSX function or a component constructor.
	 * @param {!function()} fnOrCtor Either be a simple jsx dom function or a
	 *     component constructor.
	 * @param {Object=} opt_data Optional config data for the function.
	 * @param {Element=} opt_element Optional parent for the rendered content.
	 * @return {!Component} The rendered component's instance.
	 * @override
	 */
	static render(...args) {
		return IncrementalDomRenderer.render(...args);
	}

	/**
	 * Fires before state batch changes. Provides hook point for modifying
	 *     state.
	 * @param {Event} event
	 * @protected
	 */
	handleStateWillChange_(event) {
		if (event.type !== 'state') {
			this.willReceiveProps(event.changes);
		}
	}

	/**
	 * Returns props that are not used or declared in the component.
	 * @return {Object} Object containing props
	 */
	otherProps() {
		const removeKeys = [
			...this.getDataManager()
				.getPropsInstance(this)
				.getStateKeys(),
			'key',
			'ref',
		];

		const retObj = object.mixin({}, this.props);

		for (let i = 0; i < removeKeys.length; i++) {
			const key = removeKeys[i];

			if (retObj.hasOwnProperty(key)) {
				delete retObj[key];
			}
		}

		return retObj;
	}

	/**
	 * Lifecycle. Called when the component is about to receive new props.
	 * Provides a hook point for modifying state that can be used in the next
	 * rerender.
	 * @param {Object} changes Changes made to this.props
	 */
	willReceiveProps() {}
}

JSXComponent.DATA_MANAGER = JSXDataManager;
JSXComponent.RENDERER = JSXRenderer;

export default JSXComponent;
