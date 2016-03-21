'use strict';

import { array, core, object } from 'metal';
import { dom, DomEventEmitterProxy } from 'metal-dom';
import Attribute from 'metal-attribute';
import ComponentCollector from './ComponentCollector';
import ComponentRegistry from './ComponentRegistry';
import ComponentRenderer from './ComponentRenderer';
import { EventHandler } from 'metal-events';

/**
 * Component collects common behaviors to be followed by UI components, such
 * as Lifecycle, CSS classes management, events encapsulation and support for
 * different types of rendering.
 * Rendering logic can be done by either:
 *     - Listening to the `render` event and adding the rendering logic to the
 *       listener.
 *     - Using an existing implementation of `ComponentRenderer` like
 *       `SurfaceRenderer` or `SoyRenderer`, and following its patterns.
 *     - Building your own implementation of a `ComponentRenderer`.
 * Specifying the renderer that will be used can be done by setting the RENDERER
 * static variable to the renderer's constructor function.
 *
 * Example:
 *
 * <code>
 * class CustomComponent extends Component {
 *   constructor(config) {
 *     super(config);
 *   }
 *
 *   attached() {
 *   }
 *
 *   detached() {
 *   }
 * }
 *
 * CustomComponent.RENDERER = MyRenderer;
 *
 * CustomComponent.ATTRS = {
 *   title: { value: 'Title' },
 *   fontSize: { value: '10px' }
 * };
 * </code>
 *
 * @param {!Object} opt_config An object with the initial values for this component's
 *   attributes.
 * @constructor
 * @extends {Attribute}
 */
class Component extends Attribute {
	constructor(opt_config) {
		super(opt_config);

		/**
		 * All listeners that were attached until the `DomEventEmitterProxy` instance
		 * was created.
		 * @type {!Object<string, bool>}
		 * @protected
		 */
		this.attachedListeners_ = {};

		/**
		 * Gets all nested components.
		 * @type {!Array<!Component>}
		 */
		this.components = {};

		/**
		 * Whether the element is being decorated.
		 * @type {boolean}
		 * @protected
		 */
		this.decorating_ = false;

		/**
		 * Instance of `DomEventEmitterProxy` which proxies events from the component's
		 * element to the component itself.
		 * @type {DomEventEmitterProxy}
		 * @protected
		 */
		this.elementEventProxy_ = null;

		/**
		 * The `EventHandler` instance for events attached from the `events` attribute.
		 * @type {!EventHandler}
		 * @protected
		 */
		this.eventsAttrHandler_ = new EventHandler();

		/**
		 * Whether the element is in document.
		 * @type {boolean}
		 */
		this.inDocument = false;

		/**
		 * The initial config option passed to this constructor.
		 * @type {!Object}
		 * @protected
		 */
		this.initialConfig_ = opt_config || {};

		/**
		 * Whether the element was rendered.
		 * @type {boolean}
		 */
		this.wasRendered = false;

		/**
		 * The component's element will be appended to the element this variable is
		 * set to, unless the user specifies another parent when calling `render` or
		 * `attach`.
		 * @type {!Element}
		 */
		this.DEFAULT_ELEMENT_PARENT = document.body;

		core.mergeSuperClassesProperty(this.constructor, 'ELEMENT_CLASSES', this.mergeElementClasses_);
		core.mergeSuperClassesProperty(this.constructor, 'RENDERER', array.firstDefinedValue);

		this.renderer_ = new this.constructor.RENDERER_MERGED(this);

		this.created_();
	}

	/**
	 * Adds the necessary classes to the component's element.
	 * @protected
	 */
	addElementClasses_() {
		var classesToAdd = this.constructor.ELEMENT_CLASSES_MERGED;
		if (this.elementClasses) {
			classesToAdd = classesToAdd + ' ' + this.elementClasses;
		}
		dom.addClasses(this.element, classesToAdd);
	}

	/**
	 * Adds the listeners specified in the given object.
	 * @param {Object} events
	 * @protected
	 */
	addListenersFromObj_(events) {
		var eventNames = Object.keys(events || {});
		for (var i = 0; i < eventNames.length; i++) {
			var info = this.extractListenerInfo_(events[eventNames[i]]);
			if (info.fn) {
				var handler;
				if (info.selector) {
					handler = this.delegate(eventNames[i], info.selector, info.fn);
				} else {
					handler = this.on(eventNames[i], info.fn);
				}
				this.eventsAttrHandler_.add(handler);
			}
		}
	}

	/**
	 * Invokes the attached Lifecycle. When attached, the component element is
	 * appended to the DOM and any other action to be performed must be
	 * implemented in this method, such as, binding DOM events. A component can
	 * be re-attached multiple times.
	 * @param {(string|Element)=} opt_parentElement Optional parent element
	 *     to render the component.
	 * @param {(string|Element)=} opt_siblingElement Optional sibling element
	 *     to render the component before it. Relevant when the component needs
	 *     to be rendered before an existing element in the DOM, e.g.
	 *     `component.render(null, existingElement)`.
	 * @protected
	 * @chainable
	 */
	attach(opt_parentElement, opt_siblingElement) {
		if (!this.element) {
			throw new Error(Component.Error.ELEMENT_NOT_CREATED);
		}
		if (!this.inDocument) {
			this.renderElement_(opt_parentElement, opt_siblingElement);
			this.inDocument = true;
			this.emit('attached');
			this.attached();
		}
		return this;
	}

	/**
	 * Lifecycle. When attached, the component element is appended to the DOM
	 * and any other action to be performed must be implemented in this method,
	 * such as, binding DOM events. A component can be re-attached multiple
	 * times, therefore the undo behavior for any action performed in this phase
	 * must be implemented on the detach phase.
	 */
	attached() {}

	/**
	 * Internal implementation for the creation phase of the component.
	 * @protected
	 */
	created_() {
		this.on('attrsChanged', this.handleAttributesChanges_);
		Component.componentsCollector.addComponent(this);

		this.newListenerHandle_ = this.on('newListener', this.handleNewListener_);

		this.on('eventsChanged', this.onEventsChanged_);
		this.addListenersFromObj_(this.events);
	}

	/**
	 * Adds a sub component, creating it if it doesn't yet exist.
	 * @param {string|!Function} componentNameOrCtor
	 * @param {Object=} opt_componentData
	 * @return {!Component}
	 */
	addSubComponent(componentNameOrCtor, opt_componentData) {
		// Avoid accessing id from component if possible, since that may cause
		// the lookup of the component's element in the dom unnecessarily, which is
		// bad for performance.
		var id = (opt_componentData || {}).id;
		var component = Component.componentsCollector.createComponent(
			componentNameOrCtor,
			opt_componentData
		);
		this.components[id || component.id] = component;
		return component;
	}

	/**
	 * Lifecycle. Creates the component using existing DOM elements. Often the
	 * component can be created using existing elements in the DOM to leverage
	 * progressive enhancement. Any extra operation necessary to prepare the
	 * component DOM must be implemented in this phase. Decorate phase replaces
	 * render phase.
	 * @chainable
	 */
	decorate() {
		this.decorating_ = true;
		this.render();
		this.decorating_ = false;
		return this;
	}

	/**
	 * Listens to a delegate event on the component's element.
	 * @param {string} eventName The name of the event to listen to.
	 * @param {string} selector The selector that matches the child elements that
	 *   the event should be triggered for.
	 * @param {!function(!Object)} callback Function to be called when the event is
	 *   triggered. It will receive the normalized event object.
	 * @return {!EventHandle} Can be used to remove the listener.
	 */
	delegate(eventName, selector, callback) {
		return this.on('delegate:' + eventName + ':' + selector, callback);
	}

	/**
	 * Invokes the detached Lifecycle. When detached, the component element is
	 * removed from the DOM and any other action to be performed must be
	 * implemented in this method, such as, unbinding DOM events. A component
	 * can be detached multiple times.
	 * @chainable
	 */
	detach() {
		if (this.inDocument) {
			if (this.element.parentNode) {
				this.element.parentNode.removeChild(this.element);
			}
			this.inDocument = false;
			this.detached();
		}
		this.emit('detached');
		return this;
	}

	/**
	 * Lifecycle. When detached, the component element is removed from the DOM
	 * and any other action to be performed must be implemented in this method,
	 * such as, unbinding DOM events. A component can be detached multiple
	 * times, therefore the undo behavior for any action performed in this phase
	 * must be implemented on the attach phase.
	 */
	detached() {}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.detach();

		if (this.elementEventProxy_) {
			this.elementEventProxy_.dispose();
			this.elementEventProxy_ = null;
		}

		this.disposeSubComponents(Object.keys(this.components));
		this.components = null;

		this.renderer_.dispose();
		this.renderer_ = null;

		super.disposeInternal();
	}

	/**
	 * Calls `dispose` on all subcomponents.
	 * @param {!Array<string>} ids
	 */
	disposeSubComponents(ids) {
		for (var i = 0; i < ids.length; i++) {
			var component = this.components[ids[i]];
			if (!component.isDisposed()) {
				Component.componentsCollector.removeComponent(component);
				component.dispose();
				delete this.components[ids[i]];
			}
		}
	}

	/**
	 * Extracts listener info from the given value.
	 * @param {function()|string|{selector:string,fn:function()|string}} value
	 * @return {!{selector:string,fn:function()}}
	 * @protected
	 */
	extractListenerInfo_(value) {
		var info = {
			fn: value
		};
		if (core.isObject(value) && !core.isFunction(value)) {
			info.selector = value.selector;
			info.fn = value.fn;
		}
		if (core.isString(info.fn)) {
			info.fn = this.getListenerFn(info.fn);
		}
		return info;
	}

	/**
	 * Gets the configuration object that was passed to this component's constructor.
	 * @return {!Object}
	 */
	getInitialConfig() {
		return this.initialConfig_;
	}

	/**
	 * Gets the listener function from its name. If the name is prefixed with a
	 * component id, the function will be called on that specified component. Otherwise
	 * it will be called on this component instead.
	 * @param {string} fnName
	 * @return {function()}
	 */
	getListenerFn(fnName) {
		var fnComponent;
		var split = fnName.split(':');
		if (split.length === 2) {
			fnName = split[1];
			fnComponent = ComponentCollector.components[split[0]];
			if (!fnComponent) {
				console.error('No component with the id "' + split[0] + '" has been collected' +
					'yet. Make sure that you specify an id for an existing component when ' +
					'adding inline listeners.'
				);
			}
		}
		fnComponent = fnComponent || this;
		if (core.isFunction(fnComponent[fnName])) {
			return fnComponent[fnName].bind(fnComponent);
		} else {
			console.error('No function named "' + fnName + '" was found in the component with id "' +
				fnComponent.id + '". Make sure that you specify valid function names when adding ' +
				'inline listeners.'
			);
		}
	}

	/**
	 * Finds the element that matches the given id on this component. This searches
	 * on the document first, for performance. If the element is not found, it's
	 * searched in the component's element directly.
	 * @param {string} id
	 * @return {Element}
	 */
	findElementById(id) {
		return document.getElementById(id) || (this.element && this.element.querySelector('#' + id));
	}

	/**
	 * Fires attribute synchronization change for the attribute.
	 * @param {Object.<string, Object>} change Object containing newVal and
	 *     prevVal keys.
	 * @protected
	 */
	fireAttrChange_(attr, opt_change) {
		var fn = this['sync' + attr.charAt(0).toUpperCase() + attr.slice(1)];
		if (core.isFunction(fn)) {
			if (!opt_change) {
				opt_change = {
					newVal: this[attr],
					prevVal: undefined
				};
			}
			fn.call(this, opt_change.newVal, opt_change.prevVal);
		}
	}

	/**
	 * Returns a map of all subcomponents with ids that have the specified prefix.
	 * @param {string} prefix
	 * @return {!Object<string, !Component>}
	 */
	getComponentsWithPrefix(prefix) {
		var ids = Object.keys(this.components)
			.filter(id => id.indexOf(prefix) === 0);
		var map = {};
		ids.forEach(id => map[id] = this.components[id]);
		return map;
	}

	/**
	 * Gets the name of this component. If the `NAME` static variable is set, this will
	 * be the component's name. Otherwise, it will be formed from the constructor's
	 * function name.
	 * @return {string}
	 */
	getName() {
		return this.constructor.NAME || core.getFunctionName(this.constructor);
	}

	/**
	 * Gets the `ComponentRenderer` instance being used.
	 * @return {!ComponentRenderer}
	 */
	getRenderer() {
		return this.renderer_;
	}

	/**
	 * Handles attributes batch changes. Calls any existing `sync` functions that
	 * match the changed attributes.
	 * @param {Event} event
	 * @protected
	 */
	handleAttributesChanges_(event) {
		this.syncAttrsFromChanges_(event.changes);
		this.emit('attrsSynced', event);
	}

	/**
	 * Handles the `newListener` event. Just flags that this event type has been
	 * attached, so we can start proxying it when `DomEventEmitterProxy` is created.
	 * @param {string} event
	 * @protected
	 */
	handleNewListener_(event) {
		this.attachedListeners_[event] = true;
	}

	/**
	 * Makes an unique id for the component.
	 * @return {string} Unique id.
	 * @protected
	 */
	makeId_() {
		return 'metal_c_' + core.getUid(this);
	}

	/**
	 * Merges an array of values for the ELEMENT_CLASSES property into a single object.
	 * @param {!Array.<string>} values The values to be merged.
	 * @return {!string} The merged value.
	 * @protected
	 */
	mergeElementClasses_(values) {
		var marked = {};
		return values.filter(function(val) {
			if (!val || marked[val]) {
				return false;
			} else {
				marked[val] = true;
				return true;
			}
		}).join(' ');
	}

	/**
	 * Fired when the `element` attribute value is changed.
	 * @param {!Object} event
	 * @protected
	 */
	onElementChanged_(event) {
		if (event.prevVal === event.newVal) {
			// The `elementChanged` event will be fired whenever the element is set,
			// even if its value hasn't actually changed, since that's how Attribute
			// handles objects. We need to check manually here.
			return;
		}

		this.elementEventProxy_.setOriginEmitter(event.newVal);
		event.newVal.id = this.id;
		this.addElementClasses_();
		this.syncVisible(this.visible);
	}

	/**
	 * Fired when the `events` attribute value is changed.
	 * @param {!Object} event
	 * @protected
	 */
	onEventsChanged_(event) {
		this.eventsAttrHandler_.removeAllListeners();
		this.addListenersFromObj_(event.newVal);
	}

	/**
	 * Registers a Metal.js component. This is just a helper function to allow
	 * subclasses to easily register themselves without having to import anything else.
	 * @param {!Function} constructorFn The component's constructor function.
	 * @param {string=} opt_name The component's name.
	 */
	registerMetalComponent(constructorFn, opt_name) {
		ComponentRegistry.register(constructorFn, opt_name);
	}

	/**
	 * Lifecycle. Renders the component into the DOM. Render phase replaces
	 * decorate phase, without progressive enhancement support.
	 *
	 * Render Lifecycle:
	 *   render - Decorate is manually called.
	 *   render event - The "render" event is emitted. Renderers act on this step.
	 *   attribute synchronization - All synchronization methods are called.
	 *   attach - Attach Lifecycle is called.
	 *
	 * @param {(string|Element|boolean)=} opt_parentElement Optional parent element
	 *     to render the component. If set to `false`, the element won't be
	 *     attached to any element after rendering. In this case, `attach` should
	 *     be called manually later to actually attach it to the dom.
	 * @param {(string|Element)=} opt_siblingElement Optional sibling element
	 *     to render the component before it. Relevant when the component needs
	 *     to be rendered before an existing element in the DOM, e.g.
	 *     `component.render(null, existingElement)`.
	 * @param {boolean=} opt_skipRender Optional flag indicating that the actual
	 *     rendering should be skipped. Only the other render lifecycle logic will
	 *     be run, like syncing attributes and attaching the element. Should only
	 *     be set if the component has already been rendered, like sub components.
	 * @chainable
	 */
	render(opt_parentElement, opt_siblingElement, opt_skipRender) {
		if (this.wasRendered) {
			throw new Error(Component.Error.ALREADY_RENDERED);
		}

		if (!opt_skipRender) {
			this.emit('render', {
				decorating: this.decorating_
			});
		}
		this.setUpProxy_();
		this.syncAttrs_();
		if (opt_parentElement !== false) {
			this.attach(opt_parentElement, opt_siblingElement);
		}
		this.wasRendered = true;
		return this;
	}

	/**
	 * Renders this component as a subcomponent, meaning that no actual rendering is
	 * needed since it was already rendered by the parent component. This just handles
	 * other logics from the rendering lifecycle, like calling sync methods for the
	 * attributes.
	 */
	renderAsSubComponent() {
		this.render(null, null, true);
	}

	/**
	 * Renders the component element into the DOM.
	 * @param {(string|Element)=} opt_parentElement Optional parent element
	 *     to render the component.
	 * @param {(string|Element)=} opt_siblingElement Optional sibling element
	 *     to render the component before it. Relevant when the component needs
	 *     to be rendered before an existing element in the DOM, e.g.
	 *     `component.render(null, existingElement)`.
	 * @protected
	 */
	renderElement_(opt_parentElement, opt_siblingElement) {
		var element = this.element;
		element.id = this.id;
		if (opt_siblingElement || !element.parentNode) {
			var parent = dom.toElement(opt_parentElement) || this.DEFAULT_ELEMENT_PARENT;
			parent.insertBefore(element, dom.toElement(opt_siblingElement));
		}
	}

	/**
	 * Setter logic for element attribute.
	 * @param {string|Element} newVal
	 * @param {Element} currentVal
	 * @return {Element}
	 * @protected
	 */
	setterElementFn_(newVal, currentVal) {
		return dom.toElement(newVal) || currentVal;
	}

	/**
	 * Creates the `DomEventEmitterProxy` instance and has it start proxying any
	 * listeners that have already been listened to.
	 * @protected
	 */
	setUpProxy_() {
		var proxy = new DomEventEmitterProxy(this.element, this);
		this.elementEventProxy_ = proxy;

		object.map(this.attachedListeners_, proxy.proxyEvent.bind(proxy));
		this.attachedListeners_ = null;

		this.newListenerHandle_.removeListener();
		this.newListenerHandle_ = null;

		this.on('elementChanged', this.onElementChanged_);
	}

	/**
	 * Fires attributes synchronization changes for attributes.
	 * @protected
	 */
	syncAttrs_() {
		var attrNames = this.getAttrNames();
		for (var i = 0; i < attrNames.length; i++) {
			this.fireAttrChange_(attrNames[i]);
		}
	}

	/**
	 * Fires attributes synchronization changes for attributes.
	 * @param {Object.<string, Object>} changes Object containing the attribute
	 *     name as key and an object with newVal and prevVal as value.
	 * @protected
	 */
	syncAttrsFromChanges_(changes) {
		for (var attr in changes) {
			this.fireAttrChange_(attr, changes[attr]);
		}
	}

	/**
	 * Attribute synchronization logic for the `elementClasses` attribute.
	 * @param {string} newVal
	 * @param {string} prevVal
	 */
	syncElementClasses(newVal, prevVal) {
		if (this.element && prevVal) {
			dom.removeClasses(this.element, prevVal);
		}
		this.addElementClasses_();
	}

	/**
	 * Attribute synchronization logic for `visible` attribute.
	 * Updates the element's display value according to its visibility.
	 * @param {boolean} newVal
	 */
	syncVisible(newVal) {
		if (this.element) {
			this.element.style.display = newVal ? '' : 'none';
		}
	}

	/**
	 * Validator logic for elementClasses attribute.
	 * @param {string} val
	 * @return {boolean} True if val is a valid element classes.
	 * @protected
	 */
	validatorElementClassesFn_(val) {
		return core.isString(val);
	}

	/**
	 * Validator logic for element attribute.
	 * @param {string|Element} val
	 * @return {boolean} True if val is a valid element.
	 * @protected
	 */
	validatorElementFn_(val) {
		return core.isElement(val) || core.isString(val);
	}

	/**
	 * Validator logic for the `events` attribute.
	 * @param {Object} val
	 * @return {boolean}
	 * @protected
	 */
	validatorEventsFn_(val) {
		return !core.isDefAndNotNull(val) || core.isObject(val);
	}

	/**
	 * Validator logic for the `id` attribute.
	 * @param {string} val
	 * @return {boolean} True if val is a valid id.
	 * @protected
	 */
	validatorIdFn_(val) {
		return core.isString(val);
	}

	/**
	 * Provides the default value for id attribute.
	 * @return {string} The id.
	 * @protected
	 */
	valueIdFn_() {
		var hasElement = this.hasBeenSet('element') && this.element;
		return hasElement && this.element.id ? this.element.id : this.makeId_();
	}
}

/**
 * Helper responsible for extracting components from strings and config data.
 * @type {!ComponentCollector}
 * @protected
 * @static
 */
Component.componentsCollector = new ComponentCollector();

/**
 * Component attributes definition.
 * @type {Object}
 * @static
 */
Component.ATTRS = {
	/**
	 * Component element bounding box.
	 * @type {Element}
	 * @writeOnce
	 */
	element: {
		setter: 'setterElementFn_',
		validator: 'validatorElementFn_'
	},

	/**
	 * CSS classes to be applied to the element.
	 * @type {Array.<string>}
	 */
	elementClasses: {
		validator: 'validatorElementClassesFn_'
	},

	/**
	 * Listeners that should be attached to this component. Should be provided as an object,
	 * where the keys are event names and the values are the listener functions (or function
	 * names).
	 * @type {Object<string, (function()|string|{selector: string, fn: function()|string})>}
	 */
	events: {
		validator: 'validatorEventsFn_',
		value: null
	},

	/**
	 * Component element id. If not specified will be generated.
	 * @type {string}
	 * @writeOnce
	 */
	id: {
		validator: 'validatorIdFn_',
		valueFn: 'valueIdFn_',
		writeOnce: true
	},

	/**
	 * Indicates if the component is visible or not.
	 * @type {boolean}
	 */
	visible: {
		validator: core.isBoolean,
		value: true
	}
};

/**
 * CSS classes to be applied to the element.
 * @type {string}
 * @protected
 * @static
 */
Component.ELEMENT_CLASSES = '';

/**
 * The `ComponentRenderer` that should be used. Components need to set this
 * to a subclass of `ComponentRenderer` that has the rendering logic, like
 * `SoyRenderer`.
 * @type {!ComponentRenderer}
 * @static
 */
Component.RENDERER = ComponentRenderer;

/**
 * Errors thrown by the component.
 * @enum {string}
 */
Component.Error = {
	/**
	 * Error when the component is already rendered and another render attempt
	 * is made.
	 */
	ALREADY_RENDERED: 'Component already rendered.',

	/**
	 * Error when the component is attached but its element hasn't been created yet.
	 */
	ELEMENT_NOT_CREATED: 'Can\'t attach component element. It hasn\'t been created yet.'
};

/**
 * A list with attribute names that will automatically be rejected as invalid.
 * @type {!Array<string>}
 */
Component.INVALID_ATTRS = ['components'];

export default Component;
