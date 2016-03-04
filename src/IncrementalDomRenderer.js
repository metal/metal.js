'use strict';

import { array } from 'metal';
import dom from 'metal-dom';
import { ComponentRenderer, EventsCollector } from 'metal-component';
import IncrementalDomAop from './IncrementalDomAop';

class IncrementalDomRenderer extends ComponentRenderer {
	/**
	 * @inheritDoc
	 */
	constructor(comp) {
		super(comp);

		this.listenersToAttach_ = [];
		this.eventsCollector_ = new EventsCollector(comp);
		comp.on('attrChanged', this.handleAttrChanged_.bind(this));
	}

	/**
	 * Adds all inline listener attributes included in the given config.
	 * @param {!Array} listeners
	 * @protected
	 */
	addInlineListeners_(listeners) {
		for (var i = 0; i < listeners.length; i += 2) {
			var name = listeners[i];
			if (name.startsWith('data-on')) {
				this.listenersToAttach_.push({
					eventName: name.substr(7),
					fn: listeners[i + 1]
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
	 * Handles the `attrChanged` event.
	 * @param {!Object} data
	 * @protected
	 */
	handleAttrChanged_(data) {
		this.shouldUpdate_ = data.attrName !== 'element';
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
		var node = originalFn.apply(null, array.slice(arguments, 1));
		if (!this.rootElementReached_) {
			this.rootElementReached_ = true;
			if (this.component_.element !== node) {
				this.component_.element = node;
			}
		}
		return node;
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
		var comp = this.updateSubComponent_(tag, config);
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
	 */
	renderIncDom() {
		IncrementalDOM.elementVoid('div', null, ['id', this.component_.id]);
	}

	/**
	 * Runs the incremental dom functions for rendering this component, but
	 * doesn't call `patch` yet. Rather, this will be the function that should be
	 * called by `patch`.
	 */
	renderWithoutPatch() {
		// Mark that there shouldn't be an update for attrs changed so far, since
		// render has already been called.
		this.shouldUpdate_ = false;

		this.rootElementReached_ = false;
		this.listenersToAttach_ = [];
		IncrementalDomAop.startInterception(
			this.handleInterceptedOpenCall_.bind(this),
			this.handleInterceptedCloseCall_.bind(this)
		);
		this.renderIncDom();
		IncrementalDomAop.stopInterception();
		this.attachInlineListeners_();
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
	 * Updates the renderer's component when attributes change, patching its
	 * element through the incremental dom function calls done by `renderIncDom`.
	 */
	update() {
		if (this.shouldUpdate_) {
			this.patch();
			this.eventsCollector_.detachUnusedListeners();
		}
	}

	/**
	 * This updates the sub component that is represented by the given data.
	 * The sub component is created, added to its parent and rendered. If it
	 * had already been rendered before though, it will only have its attributes
	 * updates instead.
	 * @param {string} tag The tag name.
	 * @param {!Object} config The config object for the sub component.
	 * @return {!Component} The updated sub component.
	 * @protected
	 */
	updateSubComponent_(tag, config) {
		var comp = this.component_.addSubComponent(tag, config);
		if (comp.wasRendered) {
			comp.setAttrs(config);
		}
		comp.getRenderer().renderWithoutPatch();
		if (!comp.wasRendered) {
			comp.renderAsSubComponent();
		}
		return comp;
	}
}

export default IncrementalDomRenderer;
