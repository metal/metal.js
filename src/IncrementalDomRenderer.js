'use strict';

import { array, core } from 'metal';
import { ComponentRenderer, EventsCollector } from 'metal-component';
import IncrementalDomAop from './IncrementalDomAop';

class IncrementalDomRenderer extends ComponentRenderer {
	/**
	 * @inheritDoc
	 */
	constructor(comp) {
		super(comp);

		var mergeFn = array.firstDefinedValue;
		core.mergeSuperClassesProperty(this.constructor, 'FN_NAME', mergeFn);
		var name = this.constructor.FN_NAME_MERGED;
		this.fn_ = comp[name] ? comp[name].bind(comp) : this[name].bind(this);

		this.listenersToAttach_ = [];
		this.eventsCollector_ = new EventsCollector(comp);
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
	 * Builds a map of attribute name to attribute value, from an array that
	 * contains all this info sequentially.
	 * @param {!Array} arr
	 * @return {!Object}
	 * @protected
	 */
	static buildAttrsObject_(arr) {
		var config = {};
		for (var i = 0; i < arr.length; i += 2) {
			config[arr[i]] = arr[i + 1];
		}
		return config;
	}

	/**
	 * Builds the component's main element, returning it without any content.
	 * TODO: Need to guarantee that the element won't have children before
	 * returning. Preferrably, we should not even allow creating the children in
	 * the first place.
	 * @return {!Element}
	 */
	buildElement() {
		this.builtElement_ = true;
		var tempParent = document.createElement('div');
		IncrementalDOM.patch(tempParent, this.renderWithoutPatch_.bind(this, true));
		return tempParent.childNodes[0];
	}

	/**
	 * Returns the element of the component that has just been created, to
	 * guarantee that component elements will always be reused. This is called by
	 * incremental dom.
	 * @return {Element}
	 * @protected
	 */
	static findNode_() {
		if (IncrementalDomRenderer.currentComponent_) {
			return IncrementalDomRenderer.currentComponent_.element;
		}
	}

	/**
	 * Gets the attributes array used when rendering this component's element.
	 * @return {Array}
	 */
	getAttributesArray() {
		return this.attrsArr_;
	}

	/**
	 * Handles an intercepted call to the `elementOpen` or `elementVoid` functions
	 * from incremental dom. Looks for attributes with the "data-on" prefix,
	 * adding them to the list of inline listeners to be attached once patching is
	 * done.
	 * @param {!function()} originalFn The original function before interception.
	 * @param {string} tag
	 * @protected
	 */
	handleInterceptedCall_(originalFn, tag) {
		var node;
		if (tag[0] === tag[0].toUpperCase()) {
			node = this.handleSubComponentCall_.apply(this, arguments);
		} else {
			node = this.handleRegularCall_.apply(this, arguments);
		}
		IncrementalDomRenderer.currentComponent_ = null;
		return node;
	}

	/**
	 * Handles an intercepted call to the `elementOpen` or `elementVoid` functions
	 * from incremental dom, done for a regular element. Adds any inline listeners
	 * found and makes sure that component root elements are always reused.
	 * @param {!function()} originalFn The original function before interception.
	 * @param {string} tag
	 * @param {?string} key
	 * @param {?Array} statics
	 * @protected
	 */
	handleRegularCall_(originalFn, tag, key, statics) {
		var attrsArr = array.slice(arguments, 4);
		if (!this.rootElementReached_) {
			this.rootElementReached_ = true;
			IncrementalDomRenderer.currentComponent_ = this.component_;
			this.attrsArr_ = attrsArr;
			this.warnIfTagChanged_(tag);
		}
		this.addInlineListeners_((statics || []).concat(attrsArr));
		return originalFn.apply(null, array.slice(arguments, 1));
	}

	/**
	 * Handles an intercepted call to the `elementOpen` or `elementVoid` functions
	 * from incremental dom, done for a sub component element. Adds any inline
	 * listeners found and makes sure that component root elements are always
	 * reused.
	 * @param {!function()} originalFn The original function before interception.
	 * @param {string} tag
	 * @param {?string} key
	 * @param {?Array} statics
	 * @protected
	 */
	handleSubComponentCall_(originalFn, tag, key, statics) {
		var config = IncrementalDomRenderer.buildAttrsObject_(
			(statics || []).concat(array.slice(arguments, 4))
		);
		var comp = this.updateSubComponent_(tag, config);
		var renderer = comp.getRenderer();
		IncrementalDomRenderer.currentComponent_ = comp;

		// This guarantees that the following incremental dom call won't miss any
		// of the component element's attributes, which were just rendered above.
		// Also guarantees that the component data passed as attributes to this
		// placeholder will be ignored.
		var attrsArr = renderer.getAttributesArray && renderer.getAttributesArray();
		var node = originalFn.apply(null, [tag, key, statics].concat(attrsArr));
		comp.attach();
		IncrementalDOM.skip();
		return node;
	}

	/**
	 * Renders the renderer's component for the first time, patching its element
	 * through the incremental dom function calls done by `renderIncDom`.
	 */
	render() {
		// Access the `element` attribute first to check if it will be built via
		// `buildElement` now. If so, there's no need to patch it again, just to
		// attach the collected listeners.
		if (!this.builtElement_ && this.component_.element && this.builtElement_) {
			this.attachInlineListeners_();
			return;
		}
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
	renderWithoutPatch_() {
		this.listenersToAttach_ = [];
		IncrementalDomAop.startInterception(this.handleInterceptedCall_.bind(this));
		this.fn_();
		IncrementalDomAop.stopInterception();
	}

	/**
	 * Patches the component's element with the incremental dom function calls
	 * done by `renderIncDom`.
	 */
	patch() {
		IncrementalDOM.patchOuter(this.component_.element, this.renderWithoutPatch_.bind(this));
		this.attachInlineListeners_();
	}

	/**
	 * Updates the renderer's component when attributes change, patching its
	 * element through the incremental dom function calls done by `renderIncDom`.
	 */
	update() {
		this.patch();
		this.eventsCollector_.detachUnusedListeners();
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
		} else {
			comp.render(false);
		}
		return comp;
	}

	/**
	 * Warns if the chosen tag name for the component's root element has changed.
	 * @param {string} newTag
	 * @protected
	 */
	warnIfTagChanged_(newTag) {
		var currentTag = newTag;
		if (this.component_.hasBeenSet('element')) {
			currentTag = this.component_.element.tagName.toLowerCase();
		}
		if (newTag !== currentTag) {
			console.warn(
				'Changing the component\'s root element\'s tag is not ' +
				'allowed. The tag name will continue to be: "' + currentTag + '".'
			);
		}
	}
}

IncrementalDomRenderer.FN_NAME = 'renderIncDom';

IncrementalDOM.registerFindNode(IncrementalDomRenderer.findNode_);

export default IncrementalDomRenderer;
