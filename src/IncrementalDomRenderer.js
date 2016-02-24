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
	 * Adds the given attribute and its value to the list of inline listeners if
	 * its name contains the expected prefix.
	 * @param {string} name The attribute's name.
	 * @param {*} value The attribute's value.
	 * @protected
	 */
	addIfInlineListener_(name, value) {
		if (name.startsWith('data-on')) {
			this.listenersToAttach_.push({
				eventName: name.substr(7),
				fn: value
			});
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
	 * Builds the component's main element, returning it without any content.
	 * TODO: Need to guarantee that the element won't have children before
	 * returning. Preferrably, we should not even allow creating the children in
	 * the first place.
	 * @return {!Element}
	 */
	buildElement() {
		this.builtElement_ = true;
		var tempParent = document.createElement('div');

		IncrementalDomAop.startInterception(this.handleInterceptedCall_.bind(this));
		IncrementalDOM.patch(tempParent, this.fn_);
		IncrementalDomAop.stopInterception();

		return tempParent.childNodes[0];
	}

	/**
	 * Handles an intercepted call to the `elementOpen` or `elementVoid` functions
	 * from incremental dom. Looks for attributes with the "data-on" prefix,
	 * adding them to the list of inline listeners to be attached once patching is
	 * done.
	 * @param {!function()} originalFn The original function before interception.
	 * @protected
	 */
	handleInterceptedCall_(originalFn) {
		for (var i = 4; i < arguments.length; i += 2) {
			this.addIfInlineListener_(arguments[i], arguments[i + 1]);
		}
		originalFn.apply(null, array.slice(arguments, 1));
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
	 * Patches the component's element with the incremental dom function calls
	 * done by `renderIncDom`.
	 */
	patch() {
		this.listenersToAttach_ = [];
		IncrementalDomAop.startInterception(this.handleInterceptedCall_.bind(this));
		IncrementalDOM.patchOuter(this.component_.element, this.fn_);
		IncrementalDomAop.stopInterception();
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
}

IncrementalDomRenderer.FN_NAME = 'renderIncDom';

export default IncrementalDomRenderer;
