'use strict';

import array from '../array/array';
import core from '../core';
import dom from '../dom/dom';
import features from '../dom/features';
import html from '../html/html';
import object from '../object/object';
import string from '../string/string';
import Attribute from '../attribute/Attribute';
import ComponentCollector from '../component/ComponentCollector';
import EventEmitterProxy from '../events/EventEmitterProxy';
import EventHandler from '../events/EventHandler';

/**
 * Component collects common behaviors to be followed by UI components, such
 * as Lifecycle, bounding box element creation, CSS classes management,
 * events encapsulation and surfaces support. Surfaces are an area of the
 * component that can have information rendered into it. A component
 * manages multiple surfaces. Surfaces are only rendered when its content is
 * modified, representing render performance gains. For each surface, render
 * attributes could be associated, when the render context of a surface gets
 * modified the component Lifecycle re-paints the modified surface
 * automatically.
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
 *   decorateInternal() {
 *   }
 *
 *   renderInternal() {
 *     this.element.appendChild(this.getSurfaceElement('header'));
 *     this.element.appendChild(this.getSurfaceElement('bottom'));
 *   }
 *
 *   getSurfaceContent(surfaceId) {
 *   }
 *
 *   attached() {
 *   }
 *
 *   detached() {
 *   }
 * }
 *
 * CustomComponent.ATTRS = {
 *   title: { value: 'Title' },
 *   fontSize: { value: '10px' }
 * };
 *
 * CustomComponent.SURFACES = {
 *   header: { renderAttrs: ['title', 'fontSize'] },
 *   bottom: { renderAttrs: ['fontSize'] }
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
		 * Holds data about all surfaces that were collected through the
		 * `replaceSurfacePlaceholders_` method.
		 * @type {!Array}
		 * @protected
		 */
		this.collectedSurfaces_ = [];

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
		 * Instance of `EventEmitterProxy` which proxies events from the component's
		 * element to the component itself.
		 * @type {EventEmitterProxy}
		 * @protected
		 */
		this.elementEventProxy_ = null;

		/**
		 * Whether the element is in document.
		 * @type {boolean}
		 */
		this.inDocument = false;

		/**
		 * Maps that index the surfaces instances by the surface id.
		 * @type {Object}
		 * @default null
		 * @protected
		 */
		this.surfaces_ = null;

		/**
		 * Whether the element was rendered.
		 * @type {boolean}
		 */
		this.wasRendered = false;

		/**
		 * Whether the element was decorated.
		 * @type {boolean}
		 */
		this.wasDecorated = false;

		/**
		 * The component's element will be appended to the element this variable is
		 * set to, unless the user specifies another parent when calling `render` or
		 * `attach`.
		 * @type {!Element}
		 */
		this.DEFAULT_ELEMENT_PARENT = document.body;

		core.mergeSuperClassesProperty(this.constructor, 'ELEMENT_CLASSES', this.mergeElementClasses_);
		core.mergeSuperClassesProperty(this.constructor, 'ELEMENT_TAG_NAME', array.firstDefinedValue);
		core.mergeSuperClassesProperty(this.constructor, 'SURFACE_TAG_NAME', array.firstDefinedValue);
		this.addSurfacesFromStaticHint_();

		this.delegateEventHandler_ = new EventHandler();

		this.created_();
	}

	/**
	 * Overrides `addSingleListener_` from `EventEmitter`, so we can create
	 * the `EventEmitterProxy` instance only when it's needed for the first
	 * time.
	 * @param {string} event
	 * @param {!Function} listener
	 * @param {Function=} opt_origin The original function that was added as a
	 *   listener, if there is any.
	 * @protected
	 * @override
	 */
	addSingleListener_(event, listener, opt_origin) {
		if (!this.elementEventProxy_ &&
				dom.supportsEvent(this.constructor.ELEMENT_TAG_NAME_MERGED, event)) {
			this.elementEventProxy_ = new EventEmitterProxy(this.element, this);
		}
		super.addSingleListener_(event, listener, opt_origin);
	}

	/**
	 * Registers a surface to the component. Surface elements are not
	 * automatically appended to the component element.
	 * @param {string} surfaceId The surface id to be registered.
	 * @param {Object=} opt_config Optional surface configuration.
	 * @chainable
	 */
	addSurface(surfaceId, opt_config) {
		var config = opt_config || {};
		this.surfaces_[surfaceId] = config;
		if (config.componentName) {
			this.createSubComponent_(config.componentName, surfaceId);
		}
		this.cacheSurfaceRenderAttrs_(surfaceId);
		return this;
	}

	/**
	 * Registers surfaces to the component. Surface elements are not
	 * automatically appended to the component element.
	 * @param {!Object.<string, Object=>} configs An object that maps the names
	 *     of all the surfaces to be added to their configuration objects.
	 * @chainable
	 */
	addSurfaces(configs) {
		for (var surfaceId in configs) {
			this.addSurface(surfaceId, configs[surfaceId]);
		}
		return this;
	}

	/**
	 * Adds surfaces from super classes static hint.
	 * @protected
	 */
	addSurfacesFromStaticHint_() {
		core.mergeSuperClassesProperty(this.constructor, 'SURFACES', this.mergeSurfaces_);
		this.surfaces_ = {};
		this.surfacesRenderAttrs_ = {};

		var configs = this.constructor.SURFACES_MERGED;
		for (var surfaceId in configs) {
			this.addSurface(surfaceId, object.mixin({}, configs[surfaceId]));
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
		if (!this.inDocument) {
			this.renderElement_(opt_parentElement, opt_siblingElement);
			this.inDocument = true;
			if (!this.wasRendered) {
				this.updatePlaceholderSurfaces_();
			}
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
	attached() {
	}

	/**
	 * Caches the given content for the surface with the requested id.
	 * @param {string} surfaceId
	 * @param {string} content
	 */
	cacheSurfaceContent(surfaceId, content) {
		var cacheState = this.computeSurfaceCacheState_(content);
		var surface = this.getSurface(surfaceId);
		surface.cacheState = cacheState;
	}

	/**
	 * Caches surface render attributes into a O(k) flat map representation.
	 * Relevant for performance to calculate the surfaces group that were
	 * modified by attributes mutation.
	 * @param {string} surfaceId The surface id to be cached into the flat map.
	 * @protected
	 */
	cacheSurfaceRenderAttrs_(surfaceId) {
		var attrs = this.getSurface(surfaceId).renderAttrs || [];
		for (var i = 0; i < attrs.length; i++) {
			this.surfacesRenderAttrs_[attrs[i]] = this.surfacesRenderAttrs_[attrs[i]] || {};
			this.surfacesRenderAttrs_[attrs[i]][surfaceId] = true;
		}
	}

	/**
	 * Clears the surfaces content cache.
	 * @protected
	 */
	clearSurfacesCache_() {
		for (var surfaceId in this.surfaces_) {
			this.getSurface(surfaceId).cacheState = Component.Cache.NOT_INITIALIZED;
		}
	}

	/**
	 * Compares cache states.
	 * @param {number} currentCacheState
	 * @param {number} previousCacheState
	 * @return {boolean} True if there's a cache hit, or false for cache miss.
	 */
	compareCacheStates_(currentCacheState, previousCacheState) {
		return currentCacheState !== Component.Cache.NOT_INITIALIZED &&
			currentCacheState !== Component.Cache.NOT_CACHEABLE &&
			currentCacheState === previousCacheState;
	}

	/**
	 * Computes the cache state for the surface content. If value is string, the
	 * cache state is represented by its hashcode.
	 * @param {Object} value The value to calculate the cache state.
	 * @return {Object} The computed cache state.
	 * @protected
	 */
	computeSurfaceCacheState_(value) {
		if (core.isString(value)) {
			if (features.checkAttrOrderChange()) {
				value = this.convertHtmlToBrowserFormat_(value);
			}
			return string.hashCode(value);
		}
		return Component.Cache.NOT_CACHEABLE;
	}

	/**
	 * Computes the cache state for the surface content based on the decorated
	 * DOM element. The innerHTML of the surface element is read and compressed
	 * in order to minimize mismatches caused by breaking spaces or HTML
	 * formatting differences that does not affect the content structure.
	 * @protected
	 */
	computeSurfacesCacheStateFromDom_() {
		for (var surfaceId in this.surfaces_) {
			this.cacheSurfaceContent(surfaceId, html.compress(this.getSurfaceElement(surfaceId).innerHTML));
		}
	}

	/**
	 * Converts the given html string to the format the current browser uses
	 * when html is rendered. This is done by rendering the html in a temporary
	 * element, and returning its resulting rendered html.
	 * @param {string} htmlString The html to be converted.
	 * @return {string}
	 * @protected
	 */
	convertHtmlToBrowserFormat_(htmlString) {
		var element = document.createElement('div');
		dom.append(element, htmlString);
		return element.innerHTML;
	}

	/**
	 * Lifecycle. Creation phase of the component happens once after the
	 * component is instantiated, therefore its the initial phase of the
	 * component Lifecycle. Be conscious about actions performed in this phase
	 * to not compromise instantiation time with operations that can be
	 * postponed to further phases. It's recommended to bind component custom
	 * events in this phase, in contrast to DOM events that must be bind on
	 * attach phase.
	 */
	created() {
	}

	/**
	 * Creates a sub component.
	 * @param {string} componentName
	 * @param {string} componentId
	 * @return {!Component}
	 * @protected
	 */
	createSubComponent_(componentName, componentId) {
		var data = this.getSubComponentData(componentId);
		this.components[componentId] = Component.componentsCollector.createComponent(componentName, data);
		return this.components[componentId];
	}

	/**
	 * Creates the surface element with its id namespaced to the component id.
	 * @param {string} surfaceElementId The id of the element for the surface to be
	 *   created.
	 * @return {Element} The surface element.
	 * @protected
	 */
	createSurfaceElement_(surfaceElementId) {
		var el = document.createElement(this.constructor.SURFACE_TAG_NAME_MERGED);
		el.id = surfaceElementId;
		return el;
	}

	/**
	 * Lifecycle. Internal implementation for decoration. Any extra operation
	 * necessary to prepare the component DOM must be implemented in this phase.
	 */
	decorateInternal() {
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
			this.element.parentNode.removeChild(this.element);
			this.inDocument = false;
			this.detached();
		}
		return this;
	}

	/**
	 * Lifecycle. When detached, the component element is removed from the DOM
	 * and any other action to be performed must be implemented in this method,
	 * such as, unbinding DOM events. A component can be detached multiple
	 * times, therefore the undo behavior for any action performed in this phase
	 * must be implemented on the attach phase.
	 */
	detached() {
	}

	/**
	 * Internal implementation for the creation phase of the component.
	 * @protected
	 */
	created_() {
		this.on('attrsChanged', this.handleAttributesChanges_);
		this.created();
	}

	/**
	 * Lifecycle. Creates the component using existing DOM elements. Often the
	 * component can be created using existing elements in the DOM to leverage
	 * progressive enhancement. Any extra operation necessary to prepare the
	 * component DOM must be implemented in this phase. Decorate phase replaces
	 * render phase.
	 *
	 * Decoration Lifecycle:
	 *   decorate - Decorate is manually called.
	 *   decorateInternal - Internal implementation for decoration happens.
	 *   render surfaces - All surfaces content are rendered.
	 *   attribute synchronization - All synchronization methods are called.
	 *   attach - Attach Lifecycle is called.
	 * @chainable
	 */
	decorate() {
		if (this.inDocument) {
			throw new Error(Component.Error.ALREADY_RENDERED);
		}
		this.decorating_ = true;

		this.decorateInternal();
		this.computeSurfacesCacheStateFromDom_(); // TODO(edu): This optimization seems worth it, analyze it.
		this.renderSurfacesContent_(this.surfaces_); // TODO(edu): Sync surfaces on decorate?

		this.syncAttrs_();

		this.attach();

		this.decorating_ = false;
		this.wasDecorated = true;
		this.wasRendered = true;

		return this;
	}

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

		this.components = null;
		this.surfaces_ = null;
		this.surfacesRenderAttrs_ = null;
		super.disposeInternal();
	}

	/**
	 * Extracts the surfaceId from the elementId.
	 * @param {Element} element
	 * @return {?string}
	 */
	static extractComponentId(surfaceElementId) {
		var index = surfaceElementId.lastIndexOf('-');
		return index === -1 ? surfaceElementId : surfaceElementId.substring(0, index);
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
	 * Finds the element that matches the given id on this component. This searches
	 * on the document first, for performance. If the element is not found, it's
	 * searched in the component's element directly, as the component may not have
	 * been attached to the document yet.
	 * @param {string} id
	 * @return {Element}
	 * @protected
	 */
	findElementById_(id) {
		return document.getElementById(id) || this.element.querySelector('#' + id);
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
	 * Gets the content that should be rendered in the component's main element.
	 * Should be implemented by subclasses.
	 * @return {Object|string} The content to be rendered. If the content is a
	 *   string, surfaces can be represented by placeholders in the format specified
	 *   by Component.SURFACE_REGEX.
	 */
	getElementContent() {
	}

	/**
	 * Gets surfaces that got modified by the specified attributes changes.
	 * @param {Object.<string, Object>} changes Object containing the attribute
	 *     name as key and an object with newVal and prevVal as value.
	 * @return {Object.<string, boolean>} Object containing modified surface ids
	 *     as key and true as value.
	 */
	getModifiedSurfacesFromChanges_(changes) {
		var surfaces = [];
		for (var attr in changes) {
			surfaces.push(this.surfacesRenderAttrs_[attr]);
		}
		return object.mixin.apply(null, surfaces);
	}

	/**
	 * Gets data to be used for creating or updating a sub component that was
	 * rendered through string placeholders. Can be overridden by subclasses to
	 * add custom behavior.
	 * @param  {string} componentId
	 * @return {Object} The component's config data.
	 */
	getSubComponentData(componentId) {
		return {id: componentId};
	}

	/**
	 * Gets surface configuration object. If surface is not registered returns
	 * null.
	 * @param {string} surfaceId The surface id.
	 * @param {boolean=} opt_create If true, will create the surface if it doesn't exist.
	 * @param {Object=} opt_config Optional surface configuration.
	 * @return {?Object} The surface configuration object.
	 */
	getSurface(surfaceId, opt_create, opt_config) {
		var surface = this.surfaces_[surfaceId];
		if (opt_create && !surface) {
			this.addSurface(surfaceId, opt_config);
			surface = this.surfaces_[surfaceId];
		}
		return surface || null;
	}

	/**
	 * Gets the content for the requested surface. Should be implemented by subclasses.
	 * @param {string} surfaceId The surface id.
	 * @return {Object|string} The content to be rendered. If the content is a
	 *   string, surfaces can be represented by placeholders in the format specified
	 *   by Component.SURFACE_REGEX.
	 */
	getSurfaceContent() {
	}

	/**
	 * Gets the content for the requested surface. By default this just calls
	 * `getSurfaceContent`, but can be overriden to add more behavior (check
	 * `SoyComponent` for an example).
	 * @param {string} surfaceId The surface id.
	 * @return {Object|string} The content to be rendered.
	 * @protected
	 */
	getSurfaceContent_(surfaceId) {
		return this.getSurfaceContent(surfaceId);
	}

	/**
	 * Queries from the document or creates an element for the surface. Surface
	 * elements have its surface id namespaced to the component id, e.g. for a
	 * component with id `gallery` and a surface with id `pictures` the surface
	 * element will be represented by the id `gallery-pictures`. Surface
	 * elements must also be appended to the component element.
	 * @param {string} surfaceId The surface id.
	 * @return {Element} The surface element or null if surface not registered.
	 */
	getSurfaceElement(surfaceId) {
		var surface = this.getSurface(surfaceId);
		if (!surface) {
			return null;
		}
		if (!surface.element) {
			if (surface.componentName) {
				surface.element = this.components[surfaceId].element;
			} else {
				var surfaceElementId = this.makeSurfaceId_(surfaceId);
				surface.element = this.findElementById_(surfaceElementId) ||
					this.createSurfaceElement_(surfaceElementId);
			}
		}
		return surface.element;
	}

	/**
	 * Gets the html that should be used to build a surface's main element with its
	 * content.
	 * @param {string} surfaceId
	 * @param {string} content
	 * @return {string}
	 * @protected
	 */
	getSurfaceHtml_(surfaceId, content) {
		var surfaceElementId = this.getSurfaceElementId_(surfaceId);
		return '<' + this.constructor.SURFACE_TAG_NAME_MERGED + ' id="' + surfaceElementId +
			'">' + (content || '') + '</' + this.constructor.SURFACE_TAG_NAME_MERGED + '>';
	}

	/**
	 * Gets the element id of a surface.
	 * @param {string} surfaceId
	 * @return {string}
	 * @protected
	 */
	getSurfaceElementId_(surfaceId) {
		var surface = this.getSurface(surfaceId);
		return (surface && surface.componentName) ? surfaceId : this.makeSurfaceId_(surfaceId);
	}

	/**
	 * A map of surface ids to the respective surface object.
	 * @return {!Object}
	 */
	getSurfaces() {
		return this.surfaces_;
	}

	/**
	 * Handles attributes batch changes. Responsible for surface mutations and
	 * attributes synchronization.
	 * @param {Event} event
	 * @protected
	 */
	handleAttributesChanges_(event) {
		if (this.inDocument) {
			this.renderSurfacesContent_(this.getModifiedSurfacesFromChanges_(event.changes));
		}
		this.syncAttrsFromChanges_(event.changes);
	}

	/**
	 * Loops through all the surface placeholders found in the given content.
	 * @param {string} content
	 * @param {!function(string)} loopFn The function that should be run for
	 *   each placeholder. The function will receive the surface's id.
	 * @protected
	 */
	loopSurfacePlaceholders_(content, loopFn) {
		content.replace(Component.SURFACE_REGEX, function(match, type, componentName, surfaceId) {
			loopFn(surfaceId);
			return match;
		});
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
	 * Makes the id for the surface scoped by the component.
	 * @param {string} surfaceId The surface id.
	 * @return {string}
	 * @protected
	 */
	makeSurfaceId_(surfaceId) {
		return this.id + '-' + surfaceId;
	}

	/**
	 * Merges an array of values for the ELEMENT_CLASSES property into a single object.
	 * @param {!Array.<string>} values The values to be merged.
	 * @return {!string} The merged value.
	 * @protected
	 */
	mergeElementClasses_(values) {
		return values.filter(function(val) {
			return val;
		}).join(' ');
	}

	/**
	 * Merges an array of values for the SURFACES property into a single object.
	 * @param {!Array} values The values to be merged.
	 * @return {!Object} The merged value.
	 * @protected
	 */
	mergeSurfaces_(values) {
		return object.mixin.apply(null, [{}].concat(values.reverse()));
	}

	/**
	 * Unregisters a surface and removes its element from the DOM.
	 * @param {string} surfaceId The surface id.
	 * @chainable
	 */
	removeSurface(surfaceId) {
		var el = this.getSurfaceElement(surfaceId);
		if (el && el.parentNode) {
			el.parentNode.removeChild(el);
		}
		delete this.surfaces_[surfaceId];
		return this;
	}

	/**
	 * Lifecycle. Renders the component into the DOM. Render phase replaces
	 * decorate phase, without progressive enhancement support.
	 *
	 * Render Lifecycle:
	 *   render - Decorate is manually called.
	 *   renderInternal - Internal implementation for rendering happens.
	 *   render surfaces - All surfaces content are rendered.
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

		this.renderInternal();
		this.clearSurfacesCache_();
		this.renderSurfacesContent_(this.surfaces_);

		this.syncAttrs_();

		this.attach(opt_parentElement, opt_siblingElement);

		this.wasRendered = true;

		return this;
	}

	/**
	 * Renders a surface that holds a component.
	 * @param {string} surfaceId
	 * @protected
	 */
	renderComponentSurface_(surfaceId) {
		var component = this.components[surfaceId];
		component.setAttrs(this.getSubComponentData(surfaceId));
		if (!component.wasRendered) {
			component.render();
		}
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
	 * Lifecycle. Internal implementation for rendering. Any extra operation
	 * necessary to prepare the component DOM must be implemented in this phase.
	 */
	renderInternal() {
		var content = this.getElementContent();
		if (content) {
			content = this.replaceSurfacePlaceholders_(content);
			dom.append(this.element, content);
		}
	}

	/**
	 * Render content into a surface. If the specified content is the same of
	 * the current surface content, nothing happens. If the surface cache state
	 * is not initialized or the content is not eligible for cache or content is
	 * different, the surfaces re-renders. It's not recommended to use this
	 * method directly since surface content can be provided by
	 * `getSurfaceContent(surfaceId)`.
	 * @param {string} surfaceId The surface id.
	 * @param {(Object|string)?} opt_content The content to be rendered.
	 * @param {string?} opt_cacheContent The content that should be cached for
	 *   this surface. If none is given, the rendered content will be used for this.
	 */
	renderSurfaceContent(surfaceId, opt_content, opt_cacheContent) {
		var surface = this.getSurface(surfaceId);
		if (surface.componentName) {
			this.renderComponentSurface_(surfaceId);
			return;
		}

		var content = opt_content || this.getSurfaceContent_(surfaceId);
		if (core.isDefAndNotNull(content)) {
			var previousCacheState = surface.cacheState;
			this.cacheSurfaceContent(surfaceId, opt_cacheContent || content);
			if (this.compareCacheStates_(surface.cacheState, previousCacheState)) {
				this.loopSurfacePlaceholders_(content, this.renderSurfaceContent.bind(this));
			} else {
				this.replaceSurfaceContent_(surfaceId, content);
			}
		}
	}

	/**
	 * Renders all surfaces contents ignoring the cache.
	 * @param {Object.<string, Object=>} surfaces Object map where the key is
	 *     the surface id and value the optional surface configuration.
	 * @protected
	 */
	renderSurfacesContent_(surfaces) {
		for (var surfaceId in surfaces) {
			if (!this.getSurface(surfaceId).handled) {
				this.renderSurfaceContent(surfaceId);
			}
		}
		if (this.wasRendered) {
			this.updatePlaceholderSurfaces_();
		}
	}

	/**
	 * Replaces the content of a surface with a new one.
	 * @param {string} surfaceId The surface id.
	 * @param {Element|string} content The content to be rendered.
	 * @protected
	 */
	replaceSurfaceContent_(surfaceId, content) {
		content = this.replaceSurfacePlaceholders_(content);
		var el = this.getSurfaceElement(surfaceId);
		dom.removeChildren(el);
		dom.append(el, content);
	}

	/**
	 * Replaces the given content's surface placeholders with their real contents.
	 * @param {string|Element} content
	 * @return {string} The final string with replaced placeholders.
	 * @protected
	 */
	replaceSurfacePlaceholders_(content) {
		if (!core.isString(content)) {
			return content;
		}

		var instance = this;
		return content.replace(Component.SURFACE_REGEX, function(match, type, componentName, id) {
			// Surfaces should already have been created before being rendered so they can be
			// accessed from their getSurfaceContent calls.
			var surface = instance.getSurface(id, true, {componentName: componentName});
			surface.handled = true;

			var surfaceContent = instance.getSurfaceContent(id) || '';
			var expandedContent = instance.replaceSurfacePlaceholders_(surfaceContent);
			var surfaceHtml = instance.getSurfaceHtml_(id, expandedContent);
			instance.collectedSurfaces_.push({cacheContent: surfaceContent, content: expandedContent, surfaceId: id});

			return surfaceHtml;
		});
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
	 * Attribute synchronization logic for elementClasses attribute.
	 * @param {string} newVal
	 * @param {string} prevVal
	 */
	syncElementClasses(newVal, prevVal) {
		var classesToAdd = this.constructor.ELEMENT_CLASSES_MERGED;
		if (newVal) {
			classesToAdd = classesToAdd + ' ' + newVal;
		}
		if (prevVal) {
			dom.removeClasses(this.element, prevVal.split(' '));
		}
		dom.addClasses(this.element, classesToAdd.split(' '));
	}

	/**
	 * Updates a surface after it has been rendered through placeholders.
	 * @param {!{content: string, cacheContent: string, surfaceId: string}} collectedData
	 *   Data about the collected surface. Should have the surface's id, content and the
	 *   content that should be cached for it.
	 * @protected
	 */
	updatePlaceholderSurface_(collectedData) {
		var surfaceId = collectedData.surfaceId;
		var surface = this.getSurface(surfaceId);
		if (surface.element || surface.componentName) {
			// This surface already has an element, so it needs to replace the rendered
			// element and receive the new content.
			var placeholder = this.findElementById_(this.getSurfaceElementId_(surfaceId));
			dom.replace(placeholder, this.getSurfaceElement(surfaceId));
			this.renderSurfaceContent(surfaceId, collectedData.content, collectedData.cacheContent);
		} else {
			// This surface's element hasn't been created yet, so it doesn't need
			// to replace the rendered element. Let's just cache the content for
			// future use.
			this.cacheSurfaceContent(surfaceId, collectedData.cacheContent);
		}
	}

	/**
	 * Updates all collected surfaces.
	 * @protected
	 */
	updatePlaceholderSurfaces_() {
		for (var i = this.collectedSurfaces_.length - 1; i >= 0; i--) {
			this.updatePlaceholderSurface_(this.collectedSurfaces_[i]);
			this.getSurface(this.collectedSurfaces_[i].surfaceId).handled = false;
		}
		this.collectedSurfaces_ = [];
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
	 * Validator logic for elementClasses attribute.
	 * @param {string} val
	 * @return {Boolean} True if val is a valid element classes.
	 * @protected
	 */
	validatorElementClassesFn_(val) {
		return core.isString(val);
	}

	/**
	 * Validator logic for id attribute.
	 * @param {string} val
	 * @return {Boolean} True if val is a valid id.
	 * @protected
	 */
	validatorIdFn_(val) {
		return core.isString(val);
	}

	/**
	 * Provides the default value for element attribute.
	 * @return {Element} The element.
	 * @protected
	 */
	valueElementFn_() {
		return document.createElement(this.constructor.ELEMENT_TAG_NAME_MERGED);
	}

	/**
	 * Provides the default value for id attribute.
	 * @return {string} The id.
	 * @protected
	 */
	valueIdFn_() {
		return this.element.id || this.makeId_();
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
	 * Component element id. If not specified will be generated.
	 * @type {string}
	 * @writeOnce
	 */
	id: {
		validator: 'validatorIdFn_',
		valueFn: 'valueIdFn_',
		writeOnce: true
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
 * The regex used to search for surface placeholders.
 * @type {RegExp}
 * @static
 */
Component.SURFACE_REGEX = /\%\%\%\%~(surface|comp-([^~]+))-([^~]+)~\%\%\%\%/g;

/**
 * Surface tag name is a string that specifies the type of element to be
 * created for the surfaces. The nodeName of the created element is
 * initialized with the value of tag name.
 * @type {string}
 * @default div
 * @protected
 * @static
 */
Component.SURFACE_TAG_NAME = 'div';

/**
 * Cache states for the component.
 * @enum {string}
 */
Component.Cache = {
	/**
	 * Cache is not allowed for this state.
	 */
	NOT_CACHEABLE: -1,

	/**
	 * Cache not initialized.
	 */
	NOT_INITIALIZED: -2
};

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
Component.INVALID_ATTRS = ['componentName', 'components', 'elementContent', 'ref'];

export default Component;
