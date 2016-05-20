'use strict';

import './incremental-dom';
import { array, core, object } from 'metal';
import dom from 'metal-dom';
import { Component, ComponentRenderer, EventsCollector } from 'metal-component';
import IncrementalDomAop from './IncrementalDomAop';
import IncrementalDomChildren from './children/IncrementalDomChildren';
import IncrementalDomUtils from './utils/IncrementalDomUtils';

/**
 * Class responsible for rendering components via incremental dom.
 */
class IncrementalDomRenderer extends ComponentRenderer {
	/**
	 * @inheritDoc
	 */
	constructor(comp) {
		super(comp);

		comp.context = {};
		this.changes_ = {};
		this.eventsCollector_ = new EventsCollector(comp);
		this.lastElementCreationCall_ = [];
		comp.on('stateKeyChanged', this.handleStateKeyChanged_.bind(this));
		comp.on('attached', this.handleAttached_.bind(this));
		comp.on('detached', this.handleDetached_.bind(this));

		// Binds functions that will be used many times, to avoid creating new
		// functions each time.
		this.handleInterceptedAttributesCall_ =
			this.handleInterceptedAttributesCall_.bind(this);
		this.handleInterceptedOpenCall_ =
			this.handleInterceptedOpenCall_.bind(this);
		this.handleChildrenCaptured_ = this.handleChildrenCaptured_.bind(this);
		this.handleChildRender_ = this.handleChildRender_.bind(this);
		this.renderInsidePatchDontSkip_ = this.renderInsidePatchDontSkip_.bind(this);
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
			if (this.isListenerAttr_(name) && core.isString(fn)) {
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
	 * Builds the "children" config property to be passed to the current
	 * component.
	 * @param {!Array<!Object>} children
	 * @return {!Array<!Object>}
	 * @protected
	 */
	buildChildren_(children) {
		return children.length === 0 ? emptyChildren_ : children;
	}

	/**
	 * Builds the key for the next component that is found.
	 * @return {string}
	 */
	buildKey() {
		var count = this.generatedKeyCount_[this.currentPrefix_] || 0;
		this.generatedKeyCount_[this.currentPrefix_] = count + 1;
		return this.currentPrefix_ + 'sub' + count;
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
	 * Gets the component being currently rendered via `IncrementalDomRenderer`.
	 * @return {Component}
	 */
	static getComponentBeingRendered() {
		return renderingComponents_[renderingComponents_.length - 1];
	}

	/**
	 * Gets the sub component referenced by the given tag and config data,
	 * creating it if it doesn't yet exist.
	 * @param {string|!Function} tagOrCtor The tag name.
	 * @param {!Object} config The config object for the sub component.
	 * @return {!Component} The sub component.
	 * @protected
	 */
	getSubComponent_(tagOrCtor, config) {
		var comp = this.component_.addSubComponent(config.key, tagOrCtor, config);
		if (comp.wasRendered) {
			comp.setState(config);
		}
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
	 * Removes the most recent component from the queue of rendering components.
	 */
	static finishedRenderingComponent() {
		renderingComponents_.pop();
	}

	/**
	 * Handles the `attached` listener. Stores attach data.
	 * @param {!Object} data
	 * @protected
	 */
	handleAttached_(data) {
		this.attachData_ = data;
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
		if (this.isListenerAttr_(name)) {
			var eventName = name.substr(7);
			if (core.isFunction(element[name])) {
				element.removeEventListener(eventName, element[name]);
			}
			if (core.isFunction(value)) {
				dom.on(element, eventName, value);
			}
		}

		if (name === 'checked') {
			// This is a temporary fix to account for incremental dom setting
			// "checked" as an attribute only, which can cause bugs since that won't
			// necessarily check/uncheck the element it's set on. See
			// https://github.com/google/incremental-dom/issues/198 for more details.
			value = core.isDefAndNotNull(value) && value !== false;
		}

		if (core.isBoolean(value)) {
			// Incremental dom sets boolean values as string data attributes, which
			// is counter intuitive. This changes the behavior to use the actual
			// boolean value.
			element[name] = value;
			if (value) {
				element.setAttribute(name, '');
			} else {
				element.removeAttribute(name);
			}
		} else {
			originalFn(element, name, value);
		}
	}

	/**
	 * Handles the event of children having finished being captured.
	 * @param {!Object} The captured children in tree format.
	 * @protected
	 */
	handleChildrenCaptured_(tree) {
		var {config, tag} = this.componentToRender_;
		config.children = this.buildChildren_(tree.config.children);
		this.componentToRender_ = null;
		this.currentPrefix_ = this.prevPrefix_;
		this.prevPrefix_ = null;
		this.renderFromTag_(tag, config);
	}

	/**
	 * Handles a child being rendered via `IncrementalDomChildren.render`. Skips
	 * component nodes so that they can be rendered the correct way without
	 * having to recapture both them and their children via incremental dom.
	 * @param {!Object} node
	 * @return {boolean}
	 * @protected
	 */
	handleChildRender_(node) {
		if (node.tag && IncrementalDomUtils.isComponentTag(node.tag)) {
			node.config.children = this.buildChildren_(node.config.children);
			this.renderFromTag_(node.tag, node.config);
			return true;
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
		if (IncrementalDomUtils.isComponentTag(tag)) {
			return this.handleSubComponentCall_.apply(this, arguments);
		} else {
			return this.handleRegularCall_.apply(this, arguments);
		}
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

		var currComp = IncrementalDomRenderer.getComponentBeingRendered();
		var currRenderer = currComp.getRenderer();
		if (!currRenderer.rootElementReached_ && currComp.config.key) {
			args[1] = currComp.config.key;
		}

		var node = originalFn.apply(null, args);
		this.updateElementIfNotReached_(node, args);
		return node;
	}

	/**
	 * Handles the `stateKeyChanged` event. Stores state properties that have
	 * changed since the last render.
	 * @param {!Object} data
	 * @protected
	 */
	handleStateKeyChanged_(data) {
		this.changes_[data.key] = data;
	}

	/**
	 * Handles an intercepted call to the `elementOpen` function from incremental
	 * dom, done for a sub component element. Creates and updates the appropriate
	 * sub component.
	 * @param {!function()} originalFn The original function before interception.
	 * @protected
	 */
	handleSubComponentCall_(originalFn, ...args) {
		var config = IncrementalDomUtils.buildConfigFromCall(args);
		config.key = config.key || this.buildKey();
		this.componentToRender_ = {
			config,
			tag: args[0]
		};

		this.prevPrefix_ = this.currentPrefix_;
		this.currentPrefix_ = config.key;
		this.generatedKeyCount_[this.currentPrefix_] = 0;
		IncrementalDomChildren.capture(this, this.handleChildrenCaptured_);
	}

	/**
	 * Checks if any other state property besides "element" has changed since the
	 * last render.
	 * @protected
	 */
	hasChangedBesidesElement_() {
		var count = Object.keys(this.changes_).length;
		if (this.changes_.hasOwnProperty('element')) {
			count--;
		}
		return count > 0;
	}

	/**
	 * Intercepts incremental dom calls from this component.
	 * @protected
	 */
	intercept_() {
		IncrementalDomAop.startInterception({
			attributes: this.handleInterceptedAttributesCall_,
			elementOpen: this.handleInterceptedOpenCall_
		});
	}

	/**
	 * Checks if the given object is an incremental dom node.
	 * @param {!Object} node
	 * @return {boolean}
	 */
	static isIncDomNode(node) {
		return !!node[IncrementalDomChildren.CHILD_OWNER];
	}

	/**
	 * Checks if the given attribute name is for a dom event listener.
	 * @param {string} attr
	 * @return {boolean}
	 * @protected
	 */
	isListenerAttr_(attr) {
		return attr.substr(0, 7) === 'data-on';
	}

	/**
	 * Renders the renderer's component for the first time, patching its element
	 * through the incremental dom function calls done by `renderIncDom`.
	 */
	render() {
		this.patch();
	}

	/**
	 * Renders the given child node via its owner renderer.
	 * @param {!Object} child
	 */
	static renderChild(child) {
		child[IncrementalDomChildren.CHILD_OWNER].renderChild(child);
	}

	/**
	 * Renders the given child node.
	 * @param {!Object} child
	 */
	renderChild(child) {
		this.intercept_();
		IncrementalDomChildren.render(child, this.handleChildRender_);
		IncrementalDomAop.stopInterception();
	}

	/**
	 * Renders the contents for the given tag.
	 * @param {!function()|string} tag
	 * @param {!Object} config
	 * @protected
	 */
	renderFromTag_(tag, config) {
		if (core.isString(tag) || tag.prototype.getRenderer) {
			var comp = this.renderSubComponent_(tag, config);
			this.updateElementIfNotReached_(comp);
			return comp.element;
		} else {
			return tag(config);
		}
	}

	/**
	 * Calls functions from `IncrementalDOM` to build the component element's
	 * content. Can be overriden by subclasses (for integration with template
	 * engines for example).
	 */
	renderIncDom() {
		if (this.component_.render) {
			this.component_.render();
		} else {
			IncrementalDOM.elementVoid('div');
		}
	}

	/**
	 * Runs the incremental dom functions for rendering this component, but
	 * doesn't call `patch` yet. Rather, this will be the function that should be
	 * called by `patch`.
	 */
	renderInsidePatch() {
		if (this.component_.wasRendered && !this.shouldUpdate(this.changes_)) {
			this.skipRerender_();
			return;
		}
		this.renderInsidePatchDontSkip_();
	}

	/**
	 * The same as `renderInsidePatch`, but without the check that may skip the
	 * render action.
	 * @protected
	 */
	renderInsidePatchDontSkip_() {
		IncrementalDomRenderer.startedRenderingComponent(this.component_);
		this.changes_ = {};
		this.rootElementReached_ = false;
		this.subComponentsFound_ = {};
		this.generatedKeyCount_ = {};
		this.listenersToAttach_ = [];
		this.currentPrefix_ = '';
		this.intercept_();
		this.renderIncDom();
		IncrementalDomAop.stopInterception();
		this.attachInlineListeners_();
		IncrementalDomRenderer.finishedRenderingComponent();
		if (!this.rootElementReached_) {
			this.component_.element = null;
		}
		this.emit('rendered', !this.component_.wasRendered);
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
		var comp = this.getSubComponent_(tagOrCtor, config);
		this.updateContext_(comp);
		var renderer = comp.getRenderer();
		if (renderer instanceof IncrementalDomRenderer) {
			renderer.lastParentComponent_ = IncrementalDomRenderer.getComponentBeingRendered();
			renderer.renderInsidePatch();
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
		this.subComponentsFound_[config.key] = true;
		return comp;
	}

	/**
	 * Checks if the component should be updated with the current state changes.
	 * Can be overridden by subclasses or implemented by components to provide
	 * customized behavior (only updating when a state property used by the
	 * template changes, for example).
	 * @param {!Object} changes
	 * @return {boolean}
	 */
	shouldUpdate(changes) {
		if (this.component_.shouldUpdate) {
			return this.component_.shouldUpdate(changes);
		}
		return true;
	}

	/**
	 * Skips rerendering the component by repeating the last incremental dom call
	 * for creating its main element and then calling `IncrementalDOM.skip`.
	 * @protected
	 */
	skipRerender_() {
		if (this.lastElementCreationCall_.length > 0) {
			IncrementalDOM.elementOpen.apply(null, this.lastElementCreationCall_);
			IncrementalDOM.skip();
			IncrementalDOM.elementClose(this.lastElementCreationCall_[0]);
		}
	}

	/**
	 * Stores the component that has just started being rendered.
	 * @param {!Component} comp
	 */
	static startedRenderingComponent(comp) {
		renderingComponents_.push(comp);
	}

	/**
	 * Patches the component's element with the incremental dom function calls
	 * done by `renderIncDom`.
	 */
	patch() {
		if (!this.component_.element && this.lastParentComponent_) {
			// If the component has no content but was rendered from another component,
			// we'll need to patch this parent to make sure that any new content will
			// be added in the right place.
			this.lastParentComponent_.getRenderer().patch();
			return;
		}

		var tempParent = this.guaranteeParent_();
		if (tempParent) {
			IncrementalDOM.patch(tempParent, this.renderInsidePatchDontSkip_);
			dom.exitDocument(this.component_.element);
			if (this.component_.element && this.component_.inDocument) {
				this.component_.renderElement_(
					this.attachData_.parent,
					this.attachData_.sibling
				);
			}
		} else {
			var element = this.component_.element;
			IncrementalDOM.patchOuter(element, this.renderInsidePatchDontSkip_);
			if (!this.component_.element) {
				dom.exitDocument(element);
			}
		}
	}

	/**
	 * Updates the renderer's component when state changes, patching its element
	 * through the incremental dom function calls done by `renderIncDom`. Makes
	 * sure that it won't cause a rerender if the only change was for the
	 * "element" property.
	 */
	update() {
		if (this.hasChangedBesidesElement_() && this.shouldUpdate(this.changes_)) {
			this.patch();
			this.eventsCollector_.detachUnusedListeners();
			this.disposeUnusedSubComponents_();
		}
	}

	/**
	 * Updates this renderer's component's element with the given values, unless
	 * it has already been reached by an earlier call.
	 * @param {!Element|Component} nodeOrComponent
	 * @param {Array=} opt_args The arguments that were used to create this
	 *     element via incremental dom.
	 * @protected
	 */
	updateElementIfNotReached_(nodeOrComponent, opt_args) {
		var currComp = IncrementalDomRenderer.getComponentBeingRendered();
		var currRenderer = currComp.getRenderer();
		if (!currRenderer.rootElementReached_) {
			currRenderer.rootElementReached_ = true;

			var node = nodeOrComponent;
			var args = opt_args;

			if (nodeOrComponent instanceof Component) {
				var renderer = nodeOrComponent.getRenderer();
				args = renderer instanceof IncrementalDomRenderer ?
					renderer.lastElementCreationCall_ :
					[];
				node = nodeOrComponent.element;
			}

			if (currComp.element !== node) {
				currComp.element = node;
			}
			currRenderer.lastElementCreationCall_ = args;
		}
	}

	/**
	 * Updates the given component's context according to the data from the
	 * component that is currently being rendered.
	 * @param {!Component} comp
	 * @protected
	 */
	updateContext_(comp) {
		var context = comp.context;
		var parent = IncrementalDomRenderer.getComponentBeingRendered();
		var childContext = parent.getChildContext ? parent.getChildContext() : {};
		object.mixin(context, parent.context, childContext);
		comp.context = context;
	}
}

var renderingComponents_ = [];
var emptyChildren_ = [];

export default IncrementalDomRenderer;
