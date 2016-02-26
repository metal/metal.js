'use strict';

import { array, core } from 'metal';
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
		 * Holds events that were listened through the `delegate` Component function.
		 * @type {EventHandler}
		 * @protected
		 */
		this.delegateEventHandler_ = null;

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
		core.mergeSuperClassesProperty(this.constructor, 'ELEMENT_TAG_NAME', array.firstDefinedValue);
		core.mergeSuperClassesProperty(this.constructor, 'RENDERER', array.firstDefinedValue);

		this.renderer_ = new this.constructor.RENDERER_MERGED(this);
		this.delegateEventHandler_ = new EventHandler();

		this.created_();
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
	 * Overrides `addSingleListener_` from `EventEmitter`, so we can create
	 * the `DomEventEmitterProxy` instance only when it's needed for the first
	 * time.
	 * @param {string} event
	 * @param {!Function} listener
	 * @param {boolean} opt_default Flag indicating if this listener is a default
	 *   action for this event. Default actions are run last, and only if no previous
	 *   listener call `preventDefault()` on the received event facade.
	 * @param {Function=} opt_origin The original function that was added as a
	 *   listener, if there is any.
	 * @protected
	 * @override
	 */
	addSingleListener_(event, listener, opt_default, opt_origin) {
		if (!this.elementEventProxy_ &&
			dom.supportsEvent(this.constructor.ELEMENT_TAG_NAME_MERGED, event)) {
			this.elementEventProxy_ = new DomEventEmitterProxy(this.element, this);
		}
		super.addSingleListener_(event, listener, opt_default, opt_origin);
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
		this.on('eventsChanged', this.onEventsChanged_);
		this.addListenersFromObj_(this.events);

		this.on('attrsChanged', this.handleAttributesChanges_);
		Component.componentsCollector.addComponent(this);
	}

	/**
	 * Adds a sub component, creating it if it doesn't yet exist.
	 * @param {string} componentName
	 * @param {Object=} opt_componentData
	 * @return {!Component}
	 */
	addSubComponent(componentName, opt_componentData) {
		// Avoid accessing id from component if possible, since that may cause
		// the lookup of the component's element in the dom unnecessarily, which is
		// bad for performance.
		var id = (opt_componentData || {}).id;
		var component = Component.componentsCollector.createComponent(
			componentName,
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
	 * @return {!DomEventHandle} Can be used to remove the listener.
	 */
	delegate(eventName, selector, callback) {
		var handle = dom.delegate(this.element, eventName, selector, callback);
		this.delegateEventHandler_.add(handle);
		return handle;
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

		this.delegateEventHandler_.removeAllListeners();
		this.delegateEventHandler_ = null;

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
	 * @param {(string|Element)=} opt_parentElement Optional parent element
	 *     to render the component.
	 * @param {(string|Element)=} opt_siblingElement Optional sibling element
	 *     to render the component before it. Relevant when the component needs
	 *     to be rendered before an existing element in the DOM, e.g.
	 *     `component.render(null, existingElement)`.
	 * @chainable
	 */
	render(opt_parentElement, opt_siblingElement) {
		if (this.wasRendered) {
			throw new Error(Component.Error.ALREADY_RENDERED);
		}

		this.emit('render', {
			decorating: this.decorating_
		});
		this.syncAttrs_();
		this.attach(opt_parentElement, opt_siblingElement);
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
		this.syncAttrs_();
		this.attach();
		this.wasRendered = true;
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
	 * @param {string|Element} val
	 * @return {Element}
	 * @protected
	 */
	setterElementFn_(val) {
		var element = dom.toElement(val);
		if (!element) {
			element = this.valueElementFn_();
		}
		return element;
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
		var classesToAdd = this.constructor.ELEMENT_CLASSES_MERGED;
		if (newVal) {
			classesToAdd = classesToAdd + ' ' + newVal;
		}
		if (prevVal) {
			dom.removeClasses(this.element, prevVal);
		}
		dom.addClasses(this.element, classesToAdd);
	}

	/**
	 * Attribute synchronization logic for `visible` attribute.
	 * Updates the element's display value according to its visibility.
	 * @param {boolean} newVal
	 */
	syncVisible(newVal) {
		this.element.style.display = newVal ? '' : 'none';
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
	 * Provides the default value for element attribute.
	 * @return {!Element} The element.
	 * @protected
	 */
	valueElementFn_() {
		if (!this.id) {
			// This may happen because the default value of "id" depends on "element",
			// and the default value of "element" depends on "id".
			this.id = this.makeId_();
		}
		return this.renderer_.buildElement();
	}

	/**
	 * Provides the default value for id attribute.
	 * @return {string} The id.
	 * @protected
	 */
	valueIdFn_() {
		return this.hasBeenSet('element') ? this.element.id : this.makeId_();
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
		validator: 'validatorElementFn_',
		valueFn: 'valueElementFn_',
		writeOnce: true
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
Component.ELEMENT_CLASSES = 'component';

/**
 * Element tag name is a string that specifies the type of element to be
 * created. The nodeName of the created element is initialized with the
 * value of tag name.
 * @type {string}
 * @default div
 * @protected
 * @static
 */
Component.ELEMENT_TAG_NAME = 'div';

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
	ALREADY_RENDERED: 'Component already rendered'
};

/**
 * A list with attribute names that will automatically be rejected as invalid.
 * @type {!Array<string>}
 */
Component.INVALID_ATTRS = ['components'];

export default Component;
