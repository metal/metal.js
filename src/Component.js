'use strict';

import { array, core, object } from 'metal';
import { dom, DomEventEmitterProxy } from 'metal-dom';
import ComponentRegistry from './ComponentRegistry';
import ComponentRenderer from './ComponentRenderer';
import { EventHandler } from 'metal-events';
import State from 'metal-state';

/**
 * Component collects common behaviors to be followed by UI components, such
 * as Lifecycle, CSS classes management, events encapsulation and support for
 * different types of rendering.
 * Rendering logic can be done by either:
 *     - Listening to the `render` event inside the `created` lifecycle function
 *       and adding the rendering logic to the listener.
 *     - Using an existing implementation of `ComponentRenderer` like `Soy`,
 *       and following its patterns.
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
 *   created() {
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
 * CustomComponent.STATE = {
 *   title: { value: 'Title' },
 *   fontSize: { value: '10px' }
 * };
 * </code>
 *
 * @extends {State}
 */
class Component extends State {
	/**
	 * Constructor function for `Component`.
	 * @param {Object=} opt_config An object with the initial values for this
	 *     component's state.
	 * @param {boolean|string|Element=} opt_parentElement The element where the
	 *     component should be rendered. Can be given as a selector or an element.
	 *     If `false` is passed, the component won't be rendered automatically
	 *     after created.
	 * @constructor
	 */
	constructor(opt_config, opt_parentElement) {
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
		 * Instance of `DomEventEmitterProxy` which proxies events from the component's
		 * element to the component itself.
		 * @type {DomEventEmitterProxy}
		 * @protected
		 */
		this.elementEventProxy_ = null;

		/**
		 * The `EventHandler` instance for events attached from the `events` state key.
		 * @type {!EventHandler}
		 * @protected
		 */
		this.eventsStateKeyHandler_ = new EventHandler();

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

		this.on('stateChanged', this.handleStateChanged_);
		this.newListenerHandle_ = this.on('newListener', this.handleNewListener_);
		this.on('eventsChanged', this.onEventsChanged_);
		this.addListenersFromObj_(this.events);

		this.created();
		if (opt_parentElement !== false) {
			this.render_(opt_parentElement);
		}
		this.on('elementChanged', this.onElementChanged_);
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
				this.eventsStateKeyHandler_.add(handler);
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
	 *     to be rendered before an existing element in the DOM.
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
	 * Adds a sub component, creating it if it doesn't yet exist.
	 * @param {string} key
	 * @param {string|!Function} componentNameOrCtor
	 * @param {Object=} opt_data
	 * @return {!Component}
	 */
	addSubComponent(key, componentNameOrCtor, opt_data) {
		if (!this.components[key]) {
			var ConstructorFn = componentNameOrCtor;
			if (core.isString(ConstructorFn)) {
				ConstructorFn = ComponentRegistry.getConstructor(componentNameOrCtor);
			}
			this.components[key] = new ConstructorFn(opt_data, false);
		}
		return this.components[key];
	}

	/**
	 * Lifecycle. This is called when the component has just been created, before
	 * it's rendered.
	 */
	created() {
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
	 * @param {!Array<string>} keys
	 */
	disposeSubComponents(keys) {
		for (var i = 0; i < keys.length; i++) {
			var component = this.components[keys[i]];
			if (!component.isDisposed()) {
				component.dispose();
				delete this.components[keys[i]];
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
		if (core.isFunction(this[fnName])) {
			return this[fnName].bind(this);
		} else {
			console.error('No function named "' + fnName + '" was found in the ' +
			  'component "' + core.getFunctionName(this.constructor) + '". Make ' +
				'sure that you specify valid function names when adding inline listeners.'
			);
		}
	}

	/**
	 * Calls the synchronization function for the state key.
	 * @param {string} key
	 * @param {Object.<string, Object>=} opt_change Object containing newVal and
	 *     prevVal keys.
	 * @protected
	 */
	fireStateKeyChange_(key, opt_change) {
		var fn = this['sync' + key.charAt(0).toUpperCase() + key.slice(1)];
		if (core.isFunction(fn)) {
			if (!opt_change) {
				opt_change = {
					newVal: this[key],
					prevVal: undefined
				};
			}
			fn.call(this, opt_change.newVal, opt_change.prevVal);
		}
	}

	/**
	 * Gets the `ComponentRenderer` instance being used.
	 * @return {!ComponentRenderer}
	 */
	getRenderer() {
		return this.renderer_;
	}

	/**
	 * Handles state batch changes. Calls any existing `sync` functions that
	 * match the changed state keys.
	 * @param {Event} event
	 * @protected
	 */
	handleStateChanged_(event) {
		this.syncStateFromChanges_(event.changes);
		this.emit('stateSynced', event);
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
	 * Fired when the `element` state value is changed.
	 * @param {!Object} event
	 * @protected
	 */
	onElementChanged_(event) {
		if (event.prevVal === event.newVal) {
			// The `elementChanged` event will be fired whenever the element is set,
			// even if its value hasn't actually changed, since that's how State
			// handles objects. We need to check manually here.
			return;
		}

		this.setUpProxy_();
		this.elementEventProxy_.setOriginEmitter(event.newVal);
		this.addElementClasses_();
		this.syncVisible(this.visible);
	}

	/**
	 * Fired when the `events` state value is changed.
	 * @param {!Object} event
	 * @protected
	 */
	onEventsChanged_(event) {
		this.eventsStateKeyHandler_.removeAllListeners();
		this.addListenersFromObj_(event.newVal);
	}

	/**
	 * Lifecycle. Renders the component into the DOM.
	 *
	 * Render Lifecycle:
	 *   render event - The "render" event is emitted. Renderers act on this step.
	 *   state synchronization - All synchronization methods are called.
	 *   attach - Attach Lifecycle is called.
	 *
	 * @param {(string|Element|boolean)=} opt_parentElement Optional parent element
	 *     to render the component. If set to `false`, the element won't be
	 *     attached to any element after rendering. In this case, `attach` should
	 *     be called manually later to actually attach it to the dom.
	 * @param {boolean=} opt_skipRender Optional flag indicating that the actual
	 *     rendering should be skipped. Only the other render lifecycle logic will
	 *     be run, like syncing state and attaching the element. Should only
	 *     be set if the component has already been rendered, like sub components.
	 * @protected
	 */
	render_(opt_parentElement, opt_skipRender) {
		if (!opt_skipRender) {
			this.emit('render');
		}
		this.setUpProxy_();
		this.syncState_();
		this.attach(opt_parentElement);
		this.wasRendered = true;
	}

	/**
	 * Renders this component as a subcomponent, meaning that no actual rendering is
	 * needed since it was already rendered by the parent component. This just handles
	 * other logics from the rendering lifecycle, like calling sync methods for the
	 * state.
	 */
	renderAsSubComponent() {
		this.render_(null, true);
	}

	/**
	 * Renders the component element into the DOM.
	 * @param {(string|Element)=} opt_parentElement Optional parent element
	 *     to render the component.
	 * @param {(string|Element)=} opt_siblingElement Optional sibling element
	 *     to render the component before it. Relevant when the component needs
	 *     to be rendered before an existing element in the DOM, e.g.
	 *     `component.attach(null, existingElement)`.
	 * @protected
	 */
	renderElement_(opt_parentElement, opt_siblingElement) {
		var element = this.element;
		if (opt_siblingElement || !element.parentNode) {
			var parent = dom.toElement(opt_parentElement) || this.DEFAULT_ELEMENT_PARENT;
			parent.insertBefore(element, dom.toElement(opt_siblingElement));
		}
	}

	/**
	 * Setter logic for element state key.
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
		if (this.elementEventProxy_) {
			return;
		}

		var proxy = new DomEventEmitterProxy(this.element, this);
		this.elementEventProxy_ = proxy;

		object.map(this.attachedListeners_, proxy.proxyEvent.bind(proxy));
		this.attachedListeners_ = null;

		this.newListenerHandle_.removeListener();
		this.newListenerHandle_ = null;
	}

	/**
	 * Fires state synchronization functions.
	 * @protected
	 */
	syncState_() {
		var keys = this.getStateKeys();
		for (var i = 0; i < keys.length; i++) {
			this.fireStateKeyChange_(keys[i]);
		}
	}

	/**
	 * Fires synchronization changes for state keys.
	 * @param {Object.<string, Object>} changes Object containing the state key
	 *     name as key and an object with newVal and prevVal as value.
	 * @protected
	 */
	syncStateFromChanges_(changes) {
		for (var key in changes) {
			this.fireStateKeyChange_(key, changes[key]);
		}
	}

	/**
	 * State synchronization logic for the `elementClasses` state key.
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
	 * State synchronization logic for `visible` state key.
	 * Updates the element's display value according to its visibility.
	 * @param {boolean} newVal
	 */
	syncVisible(newVal) {
		if (this.element) {
			this.element.style.display = newVal ? '' : 'none';
		}
	}

	/**
	 * Validator logic for elementClasses state key.
	 * @param {string} val
	 * @return {boolean} True if val is a valid element classes.
	 * @protected
	 */
	validatorElementClassesFn_(val) {
		return core.isString(val);
	}

	/**
	 * Validator logic for element state key.
	 * @param {string|Element} val
	 * @return {boolean} True if val is a valid element.
	 * @protected
	 */
	validatorElementFn_(val) {
		return core.isElement(val) || core.isString(val);
	}

	/**
	 * Validator logic for the `events` state key.
	 * @param {Object} val
	 * @return {boolean}
	 * @protected
	 */
	validatorEventsFn_(val) {
		return !core.isDefAndNotNull(val) || core.isObject(val);
	}
}

/**
 * Component state definition.
 * @type {Object}
 * @static
 */
Component.STATE = {
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
	 * Error when the component is attached but its element hasn't been created yet.
	 */
	ELEMENT_NOT_CREATED: 'Can\'t attach component element. It hasn\'t been created yet.'
};

/**
 * A list with state key names that will automatically be rejected as invalid.
 * @type {!Array<string>}
 */
Component.INVALID_KEYS = ['components'];

export default Component;
