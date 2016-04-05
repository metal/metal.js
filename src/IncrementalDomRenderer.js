'use strict';

import './incremental-dom';
import { array, core, object } from 'metal';
import dom from 'metal-dom';
import { ComponentRenderer, EventsCollector } from 'metal-component';
import IncrementalDomAop from './IncrementalDomAop';

/**
 * Class responsible for rendering components via incremental dom.
 */
class IncrementalDomRenderer extends ComponentRenderer {
	/**
	 * @inheritDoc
	 */
	constructor(comp) {
		super(comp);

		this.changes_ = {};
		this.eventsCollector_ = new EventsCollector(comp);
		comp.on('stateKeyChanged', this.handleStateKeyChanged_.bind(this));
		comp.on('detached', this.handleDetached_.bind(this));
	}

	/**
	 * Adds all inline listener attributes included in the given config.
	 * @param {!Array} listeners
	 * @protected
	 */
	addInlineListeners_(listeners) {
		for (var i = 0; i < listeners.length; i += 2) {
			var name = listeners[i];
			var fn = listeners[i + 1];
			if (name.startsWith('data-on') && core.isString(fn)) {
				this.listenersToAttach_.push({
					eventName: name.substr(7),
					fn
				});
			}
		}
	}

	/**
	 * Attaches any inline listeners found in the contents built via the last
	 * incremental dom patch.
	 * @protected
	 */
	attachInlineListeners_() {
		this.eventsCollector_.startCollecting();
		for (var i = 0; i < this.listenersToAttach_.length; i++) {
			var listener = this.listenersToAttach_[i];
			this.eventsCollector_.attachListener(listener.eventName, listener.fn);
		}
	}

	/**
	 * Disposes all sub components that were not found after an update anymore.
	 * @protected
	 */
	disposeUnusedSubComponents_() {
		var keys = Object.keys(this.component_.components);
		var unused = [];
		for (var i = 0; i < keys.length; i++) {
			if (!this.subComponentsFound_[keys[i]]) {
				unused.push(keys[i]);
			}
		}
		this.component_.disposeSubComponents(unused);
	}

	/**
	 * Gets the current rendering data for this component.
	 * @return {!Object}
	 * @protected
	 */
	getRenderingData() {
		if (!this.renderingData_) {
			this.renderingData_ = object.mixin({}, this.component_.getInitialConfig());
		}
		return this.renderingData_;
	}

	/**
	 * Gets the sub component referenced by the given tag and config data,
	 * creating it if it doesn't yet exist.
	 * @param {string} key The sub component's key.
	 * @param {string|!Function} tagOrCtor The tag name.
	 * @param {!Object} config The config object for the sub component.
	 * @return {!Component} The sub component.
	 * @protected
	 */
	getSubComponent_(key, tagOrCtor, config) {
		var comp = this.component_.addSubComponent(key, tagOrCtor, config);
		if (comp.wasRendered) {
			comp.setState(config);
		}
		comp.componentIncrementalDomKey_ = key;
		return comp;
	}

	/**
	 * Guarantees that the component's element has a parent. That's necessary
	 * when calling incremental dom's `patchOuter` for now, as otherwise it will
	 * throw an error if the element needs to be replaced.
	 * @return {Element} The parent, in case it was added.
	 * @protected
	 */
	guaranteeParent_() {
		var element = this.component_.element;
		if (!element || !element.parentNode) {
			var parent = document.createElement('div');
			if (element) {
				dom.append(parent, element);
			}
			return parent;
		}
	}

	/**
	 * Handles the `detached` listener. Removes all inline listeners.
	 * @protected
	 */
	handleDetached_() {
		this.eventsCollector_.detachAllListeners();
	}

	/**
	 * Handles an intercepted call to the attributes default handler from
	 * incremental dom.
	 * @param {!function()} originalFn The original function before interception.
	 * @param {!Element} element
	 * @param {string} name
	 * @param {*} value
	 * @protected
	 */
	handleInterceptedAttributesCall_(originalFn, element, name, value) {
		if (name.startsWith('data-on')) {
			var eventName = name.substr(7);
			if (core.isFunction(element[name])) {
				element.removeEventListener(eventName, element[name]);
			}
			if (core.isFunction(value)) {
				dom.on(element, eventName, value);
			}
		} else if (name === 'checked') {
			// This is a temporary fix to account for incremental dom setting
			// "checked" as an attribute only, which can cause bugs since that won't
			// necessarily check/uncheck the element it's set on. See
			// https://github.com/google/incremental-dom/issues/198 for more details.
			element.checked = core.isDefAndNotNull(value) && value !== false;
		}
		originalFn(element, name, value);
	}

	/**
	 * Handles an intercepted call to the `elementClose` function from incremental
	 * dom.
	 * @param {!function()} originalFn The original function before interception.
	 * @param {string} tag
	 * @protected
	 */
	handleInterceptedCloseCall_(originalFn, tag) {
		if (!this.isComponentTag_(tag)) {
			originalFn(tag);
		}
	}

	/**
	 * Handles an intercepted call to the `elementOpen` function from incremental
	 * dom.
	 * @param {!function()} originalFn The original function before interception.
	 * @param {string} tag
	 * @protected
	 */
	handleInterceptedOpenCall_(originalFn, tag) {
		var node;
		if (this.isComponentTag_(tag)) {
			node = this.handleSubComponentCall_.apply(this, arguments);
		} else {
			node = this.handleRegularCall_.apply(this, arguments);
		}
		return node;
	}

	/**
	 * Handles an intercepted call to the `elementOpen` function from incremental
	 * dom, done for a regular element. Adds any inline listeners found and makes
	 * sure that component root elements are always reused.
	 * @param {!function()} originalFn The original function before interception.
	 * @param {string} tag
	 * @param {?string} key
	 * @param {?Array} statics
	 * @protected
	 */
	handleRegularCall_(originalFn, tag, key, statics) {
		var attrsArr = array.slice(arguments, 4);
		this.addInlineListeners_((statics || []).concat(attrsArr));
		var args = array.slice(arguments, 1);
		if (!this.rootElementReached_ && this.component_.componentIncrementalDomKey_) {
			args[1] = this.component_.componentIncrementalDomKey_;
		}
		var node = originalFn.apply(null, args);
		if (!this.rootElementReached_) {
			this.rootElementReached_ = true;
			if (this.component_.element !== node) {
				this.component_.element = node;
			}
		}
		return node;
	}

	/**
	 * Handles the `stateKeyChanged` event. Makes sure that, when `stateChanged`
	 * is fired, the component's contents will only be updated if the changed
	 * state key wasn't `element`, since that wouldn't cause a rerender.
	 * @param {!Object} data
	 * @protected
	 */
	handleStateKeyChanged_(data) {
		if (data.key !== 'element') {
			this.changes_[data.key] = data;
		}
	}

	/**
	 * Handles an intercepted call to the `elementOpen` function from incremental
	 * dom, done for a sub component element. Creates and updates the appropriate
	 * sub component.
	 * @param {!function()} originalFn The original function before interception.
	 * @param {string} tag
	 * @param {?string} key
	 * @param {?Array} statics
	 * @protected
	 */
	handleSubComponentCall_(originalFn, tag, key, statics) {
		var config = {};
		var attrsArr = (statics || []).concat(array.slice(arguments, 4));
		for (var i = 0; i < attrsArr.length; i += 2) {
			config[attrsArr[i]] = attrsArr[i + 1];
		}

		var tagOrCtor = tag;
		if (tag === 'Component' && config.ctor) {
			tagOrCtor = config.ctor;
			config = config.data || {};
		}
		var comp = this.renderSubComponent_(tagOrCtor, config);
		return comp.element;
	}

	/**
	 * Checks if the given tag represents a metal component.
	 * @param {string} tag
	 * @protected
	 */
	isComponentTag_(tag) {
		return tag[0] === tag[0].toUpperCase();
	}

	/**
	 * Renders the renderer's component for the first time, patching its element
	 * through the incremental dom function calls done by `renderIncDom`.
	 */
	render() {
		this.patch();
	}

	/**
	 * Calls functions from `IncrementalDOM` to build the component element's
	 * content. Can be overriden by subclasses (for integration with template
	 * engines for example).
	 * @param {!Object} data Data passed to the component when rendering it.
	 */
	renderIncDom() {
		IncrementalDOM.elementVoid('div');
	}

	/**
	 * Runs the incremental dom functions for rendering this component, but
	 * doesn't call `patch` yet. Rather, this will be the function that should be
	 * called by `patch`.
	 * @param {Object=} opt_data Data passed to the component when rendering it.
	 */
	renderWithoutPatch(opt_data) {
		// Mark that there shouldn't be an update for state changes so far, since
		// render has already been called.
		this.changes_ = {};

		this.rootElementReached_ = false;
		this.subComponentsFound_ = {};
		this.generatedKeyCount_ = 0;
		this.listenersToAttach_ = [];
		IncrementalDomAop.startInterception(
			this.handleInterceptedOpenCall_.bind(this),
			this.handleInterceptedCloseCall_.bind(this),
			this.handleInterceptedAttributesCall_.bind(this)
		);
		object.mixin(this.getRenderingData(), opt_data);
		this.renderIncDom(this.getRenderingData());
		IncrementalDomAop.stopInterception();
		this.attachInlineListeners_();
	}

	/**
	 * Checks if the component should be updated with the current state changes.
	 * Can be overridden by subclasses to provide customized behavior (only
	 * updating when a state key used by the template is changed for example).
	 * @param {!Object} changes
	 * @return {boolean}
	 */
	shouldUpdate() {
		return true;
	}

	/**
	 * Patches the component's element with the incremental dom function calls
	 * done by `renderIncDom`.
	 */
	patch() {
		var tempParent = this.guaranteeParent_();
		if (tempParent) {
			IncrementalDOM.patch(tempParent, this.renderWithoutPatch.bind(this));
			dom.exitDocument(this.component_.element);
		} else {
			IncrementalDOM.patchOuter(this.component_.element, this.renderWithoutPatch.bind(this));
		}
	}

	/**
	 * Updates the renderer's component when state changes, patching its element
	 * through the incremental dom function calls done by `renderIncDom`.
	 */
	update() {
		var changedKeys = Object.keys(this.changes_);
		if (changedKeys.length > 0 && this.shouldUpdate(this.changes_)) {
			this.patch();
			this.eventsCollector_.detachUnusedListeners();
			this.disposeUnusedSubComponents_();
		}
	}

	/**
	 * This updates the sub component that is represented by the given data.
	 * The sub component is created, added to its parent and rendered. If it
	 * had already been rendered before though, it will only have its state
	 * updated instead.
	 * @param {string|!function()} tagOrCtor The tag name or constructor function.
	 * @param {!Object} config The config object for the sub component.
	 * @return {!Component} The updated sub component.
	 * @protected
	 */
	renderSubComponent_(tagOrCtor, config) {
		var key = config.key || ('sub' + this.generatedKeyCount_++);
		var comp = this.getSubComponent_(key, tagOrCtor, config);
		var renderer = comp.getRenderer();
		if (renderer instanceof IncrementalDomRenderer) {
			renderer.renderWithoutPatch(config);
		} else {
			console.warn(
				'IncrementalDomRenderer doesn\'t support rendering sub components ' +
				'that don\'t use IncrementalDomRenderer as well, like:',
				comp
			);
		}
		if (!comp.wasRendered) {
			comp.renderAsSubComponent();
		}
		this.subComponentsFound_[key] = true;
		return comp;
	}
}

export default IncrementalDomRenderer;
