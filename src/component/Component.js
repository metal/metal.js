(function() {
  'use strict';

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
   * function CustomComponent(opt_config) {
   *   CustomComponent.base(this, 'constructor', opt_config);
   * }
   * lfr.inherits(CustomComponent, lfr.Component);
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
   *
   * CustomComponent.prototype.created = function() {};
   * CustomComponent.prototype.decorateInternal = function() {};
   * CustomComponent.prototype.renderInternal = function() {
   *   this.element.appendChild(this.getSurfaceElement('header'));
   *   this.element.appendChild(this.getSurfaceElement('bottom'));
   * };
   * CustomComponent.prototype.getSurfaceContent = function() {};
   * CustomComponent.prototype.attached = function() {};
   * CustomComponent.prototype.detached = function() {};
   * </code>
   *
   * @param {!Object} opt_config An object with the initial values for this component's
   *   attributes.
   * @constructor
   */
  lfr.Component = function(opt_config) {
    lfr.Component.base(this, 'constructor', opt_config);
    lfr.mergeSuperClassesProperty(this.constructor, 'ATTRS_SYNC', this.mergeAttrsSync_);
    lfr.mergeSuperClassesProperty(this.constructor, 'ELEMENT_CLASSES', this.mergeElementClasses_);
    lfr.mergeSuperClassesProperty(this.constructor, 'ELEMENT_TAG_NAME', lfr.array.firstDefinedValue);
    lfr.mergeSuperClassesProperty(this.constructor, 'SURFACE_TAG_NAME', lfr.array.firstDefinedValue);

    this.elementEventProxy_ = new lfr.EventEmitterProxy(this.element, this);
    this.delegateEventHandler_ = new lfr.EventHandler();

    this.addSurfacesFromStaticHint_();
    this.created_();
  };
  lfr.inherits(lfr.Component, lfr.Attribute);

  /**
   * Component attributes definition.
   * @type {Object}
   * @static
   */
  lfr.Component.ATTRS = {
    /**
     * Component element bounding box.
     * @type {Element}
     * @initOnly
     */
    element: {
      initOnly: true,
      setter: 'setterElementFn_',
      validator: 'validatorElementFn_',
      valueFn: 'valueElementFn_'
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
     * @initOnly
     */
    id: {
      initOnly: true,
      validator: 'validatorIdFn_',
      valueFn: 'valueIdFn_'
    }
  };

  /**
   * Defines component attributes that automatically invokes synchronization
   * logic when the component render or the attribute value change. For
   * instance, if attribute `foo` gets modified, the synchronization method
   * `syncFoo(newVal, prevVal)` is called. Synchronization methods are bound
   * to `attrsChanged` batch event, therefore they wait for all possible
   * attributes mutations to happen, and consecutively fire once for the last
   * attribute state.
   * @type {Array}
   * @static
   */
  lfr.Component.ATTRS_SYNC = ['elementClasses'];

  /**
   * CSS classes to be applied to the element.
   * @type {Array.<string>}
   * @protected
   * @static
   */
  lfr.Component.ELEMENT_CLASSES = ['component'];

  /**
   * Element tag name is a string that specifies the type of element to be
   * created. The nodeName of the created element is initialized with the
   * value of tag name.
   * @type {string}
   * @default div
   * @protected
   * @static
   */
  lfr.Component.ELEMENT_TAG_NAME = 'div';

  /**
   * Surface tag name is a string that specifies the type of element to be
   * created for the surfaces. The nodeName of the created element is
   * initialized with the value of tag name.
   * @type {string}
   * @default div
   * @protected
   * @static
   */
  lfr.Component.SURFACE_TAG_NAME = 'div';

  /**
   * Cache states for the component.
   * @enum {string}
   */
  lfr.Component.Cache = {
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
  lfr.Component.Error = {
    /**
     * Error when the component is already rendered and another render attempt
     * is made.
     */
    ALREADY_RENDERED: 'Component already rendered'
  };

  /**
   * Holds events that were listened through the `delegate` Component function.
   * @type {lfr.EventHandler}
   */
  lfr.Component.prototype.delegateEventHandler_ = null;

  /**
   * Instance of `lfr.EventEmitterProxy` which proxies events from the component's
   * element to the component itself.
   * @type {lfr.EventEmitterProxy}
   */
  lfr.Component.prototype.elementEventProxy_ = null;

  /**
   * Whether the element is in document.
   * @type {Boolean}
   */
  lfr.Component.prototype.inDocument = false;

  /**
   * Maps that index the surfaces instances by the surface id.
   * @type {Object}
   * @default null
   * @protected
   */
  lfr.Component.prototype.surfaces_ = null;

  /**
   * Registers a surface to the component. Surface elements are not
   * automatically appended to the component element.
   * @param {string} surfaceId The surface id to be registered.
   * @param {Object=} opt_config Optional surface configuration.
   * @chainable
   */
  lfr.Component.prototype.addSurface = function(surfaceId, opt_config) {
    this.surfaces_[surfaceId] = opt_config || {
      cacheState: lfr.Component.Cache.NOT_INITIALIZED
    };
    this.cacheSurfaceRenderAttrs_(surfaceId);
    return this;
  };

  /**
   * Registers surfaces to the component. Surface elements are not
   * automatically appended to the component element.
   * @param {!Object.<string, Object=>} configs An object that maps the names
   *     of all the surfaces to be added to their configuration objects.
   * @chainable
   */
  lfr.Component.prototype.addSurfaces = function(configs) {
    for (var surfaceId in configs) {
      this.addSurface(surfaceId, configs[surfaceId]);
    }
    return this;
  };

  /**
   * Adds surfaces from super classes static hint.
   * @protected
   */
  lfr.Component.prototype.addSurfacesFromStaticHint_ = function() {
    lfr.mergeSuperClassesProperty(this.constructor, 'SURFACES', this.mergeSurfaces_);
    this.surfaces_ = {};
    this.surfacesRenderAttrs_ = {};
    this.addSurfaces(this.constructor.SURFACES_MERGED);
  };

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
  lfr.Component.prototype.attach = function(opt_parentElement, opt_siblingElement) {
    this.renderElement_(opt_parentElement, opt_siblingElement);
    this.inDocument = true;
    this.attached();
    return this;
  };

  /**
   * Lifecycle. When attached, the component element is appended to the DOM
   * and any other action to be performed must be implemented in this method,
   * such as, binding DOM events. A component can be re-attached multiple
   * times, therefore the undo behavior for any action performed in this phase
   * must be implemented on the detach phase.
   */
  lfr.Component.prototype.attached = lfr.nullFunction;

  /**
   * Caches surface render attributes into a O(k) flat map representation.
   * Relevant for performance to calculate the surfaces group that were
   * modified by attributes mutation.
   * @param {string} surfaceId The surface id to be cached into the flat map.
   * @protected
   */
  lfr.Component.prototype.cacheSurfaceRenderAttrs_ = function(surfaceId) {
    var attrs = this.getSurface(surfaceId).renderAttrs;
    for (var i in attrs) {
      this.surfacesRenderAttrs_[attrs[i]] = this.surfacesRenderAttrs_[attrs[i]] || {};
      this.surfacesRenderAttrs_[attrs[i]][surfaceId] = true;
    }
  };

  /**
   * Clears the surfaces content cache.
   * @protected
   */
  lfr.Component.prototype.clearSurfacesCache_ = function() {
    for (var surfaceId in this.surfaces_) {
      this.getSurface(surfaceId).cacheState = lfr.Component.Cache.NOT_INITIALIZED;
    }
  };

  /**
   * Computes the cache state for the surface content. If value is string, the
   * cache state is represented by its hashcode.
   * @param {Object} value The value to calculate the cache state.
   * @return {Object} The computed cache state.
   * @protected
   */
  lfr.Component.prototype.computeSurfaceCacheState_ = function(value) {
    if (lfr.isString(value)) {
      return lfr.string.hashCode(value);
    }
    return lfr.Component.Cache.NOT_CACHEABLE;
  };

  /**
   * Computes the cache state for the surface content based on the decorated
   * DOM element. The innerHTML of the surface element is read and compressed
   * in order to minimize mismatches caused by breaking spaces or HTML
   * formatting differences that does not affect the content structure.
   * @protected
   */
  lfr.Component.prototype.computeSurfacesCacheStateFromDom_ = function() {
    for (var surfaceId in this.surfaces_) {
      var surface = this.getSurface(surfaceId);
      surface.cacheState = this.computeSurfaceCacheState_(lfr.html.compress(this.getSurfaceElement(surfaceId).innerHTML));
    }
  };

  /**
   * Creates the surface element with its id namespaced to the component id.
   * @param {string} surfaceElementId The id of the element for the surface to be
   *   created.
   * @return {Element} The surface element.
   * @protected
   */
  lfr.Component.prototype.createSurfaceElement_ = function(surfaceElementId) {
    var el = document.createElement(this.constructor.SURFACE_TAG_NAME_MERGED);
    el.id = surfaceElementId;
    return el;
  };

  /**
   * Listens to a delegate event on the component's element.
   * @param {string} eventName The name of the event to listen to.
   * @param {string} selector The selector that matches the child elements that
   *   the event should be triggered for.
   * @param {!function(!Object)} callback Function to be called when the event is
   *   triggered. It will receive the normalized event object.
   * @return {!lfr.DomEventHandle} Can be used to remove the listener.
   */
  lfr.Component.prototype.delegate = function(eventName, selector, callback) {
    var handle = lfr.dom.delegate(this.element, eventName, selector, callback);
    this.delegateEventHandler_.add(handle);
    return handle;
  };

  /**
   * Invokes the detached Lifecycle. When detached, the component element is
   * removed from the DOM and any other action to be performed must be
   * implemented in this method, such as, unbinding DOM events. A component
   * can be detached multiple times.
   * @chainable
   */
  lfr.Component.prototype.detach = function() {
    this.element.parentNode.removeChild(this.element);
    this.inDocument = false;
    this.detached();
    return this;
  };

  /**
   * Lifecycle. When detached, the component element is removed from the DOM
   * and any other action to be performed must be implemented in this method,
   * such as, unbinding DOM events. A component can be detached multiple
   * times, therefore the undo behavior for any action performed in this phase
   * must be implemented on the attach phase.
   */
  lfr.Component.prototype.detached = lfr.nullFunction;

  /**
   * Lifecycle. Creation phase of the component happens once after the
   * component is instantiated, therefore its the initial phase of the
   * component Lifecycle. Be conscious about actions performed in this phase
   * to not compromise instantiation time with operations that can be
   * postponed to further phases. It's recommended to bind component custom
   * events in this phase, in contrast to DOM events that must be bind on
   * attach phase.
   */
  lfr.Component.prototype.created = lfr.nullFunction;

  /**
   * Internal implementation for the creation phase of the component.
   * @protected
   */
  lfr.Component.prototype.created_ = function() {
    this.on('attrsChanged', this.handleAttributesChanges_);
    this.created();
  };

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
  lfr.Component.prototype.decorate = function() {
    if (this.inDocument) {
      throw new Error(lfr.Component.Error.ALREADY_RENDERED);
    }

    this.decorateInternal();
    this.computeSurfacesCacheStateFromDom_(); // TODO(edu): This optimization seems worth it, analyze it.
    this.renderSurfacesContent_(this.surfaces_); // TODO(edu): Sync surfaces on decorate?

    this.fireAttrsChanges_(this.constructor.ATTRS_SYNC_MERGED);

    this.attach();
    return this;
  };

  /**
   * Lifecycle. Internal implementation for decoration. Any extra operation
   * necessary to prepare the component DOM must be implemented in this phase.
   */
  lfr.Component.prototype.decorateInternal = lfr.nullFunction;

  /**
   * @inheritDoc
   */
  lfr.Component.prototype.disposeInternal = function() {
    this.detach();

    this.elementEventProxy_.dispose();
    this.elementEventProxy_ = null;

    this.delegateEventHandler_.removeAllListeners();
    this.delegateEventHandler_ = null;

    this.surfaces_ = null;
    this.surfacesRenderAttrs_ = null;
    lfr.Component.base(this, 'disposeInternal');
  };

  /**
   * Fires attributes synchronization changes for attributes registered on
   * `ATTRS_SYNC` static hint.
   * @param {Object.<string, Object>} changes Object containing the attribute
   *     name as key and an object with newVal and prevVal as value.
   * @protected
   */
  lfr.Component.prototype.fireAttrsChanges_ = function(changes) {
    for (var attr in changes) {
      if (attr in this.constructor.ATTRS_SYNC_MERGED) {
        this.fireAttrChange_(attr, changes[attr]);
      }
    }
  };

  /**
   * Fires attribute synchronization change for the attribute.
   * @param {Object.<string, Object>} change Object containing newVal and
   *     prevVal keys.
   * @protected
   */
  lfr.Component.prototype.fireAttrChange_ = function(attr, opt_change) {
    var fn = this['sync' + attr.charAt(0).toUpperCase() + attr.slice(1)];
    if (lfr.isFunction(fn)) {
      if (!opt_change) {
        opt_change = {
          newVal: this[attr],
          prevVal: undefined
        };
      }
      fn.call(this, opt_change.newVal, opt_change.prevVal);
    }
  };

  /**
   * Gets surfaces that got modified by the specified attributes changes.
   * @param {Object.<string, Object>} changes Object containing the attribute
   *     name as key and an object with newVal and prevVal as value.
   * @return {Object.<string, boolean>} Object containing modified surface ids
   *     as key and true as value.
   */
  lfr.Component.prototype.getModifiedSurfacesFromChanges_ = function(changes) {
    var surfaces = [];
    for (var attr in changes) {
      surfaces.push(this.surfacesRenderAttrs_[attr]);
    }
    return lfr.object.mixin.apply(null, surfaces);
  };

  /**
   * Gets surface configuration object. If surface is not registered returns
   * null.
   * @param {string} surfaceId The surface id.
   * @return {?Object} The surface configuration object.
   */
  lfr.Component.prototype.getSurface = function(surfaceId) {
    return this.surfaces_[surfaceId] || null;
  };

  /**
   * Gets the content for the requested surface. By default this just calls
   * `getSurfaceContent`, but can be overriden to add more behavior (check
   * `lfr.SoyComponent` for an example).
   * @param {string} surfaceId The surface id.
   * @return {Object|string} The content to be rendered.
   * @protected
   */
  lfr.Component.prototype.getSurfaceContent_ = function(surfaceId) {
    return this.getSurfaceContent(surfaceId);
  };

  /**
   * Gets the content for the requested surface. Should be implemented by subclasses.
   * @param {string} surfaceId The surface id.
   * @return {Object|string} The content to be rendered.
   */
  lfr.Component.prototype.getSurfaceContent = lfr.nullFunction;

  /**
   * Queries from the document or creates an element for the surface. Surface
   * elements have its surface id namespaced to the component id, e.g. for a
   * component with id `gallery` and a surface with id `pictures` the surface
   * element will be represented by the id `gallery-pictures`. Surface
   * elements must also be appended to the component element.
   * @param {string} surfaceId The surface id.
   * @return {Element} The surface element or null if surface not registered.
   */
  lfr.Component.prototype.getSurfaceElement = function(surfaceId) {
    var surface = this.getSurface(surfaceId);
    if (!surface) {
      return null;
    }
    if (!surface.element) {
      var surfaceElementId = this.makeSurfaceId_(surfaceId);
      surface.element = document.getElementById(surfaceElementId) ||
      this.element.querySelector('#' + surfaceElementId) ||
      this.createSurfaceElement_(surfaceElementId);
    }
    return surface.element;
  };

  /**
   * A map of surface ids to the respective surface object.
   * @return {!Object}
   */
  lfr.Component.prototype.getSurfaces = function() {
    return this.surfaces_;
  };

  /**
   * Handles attributes batch changes. Responsible for surface mutations and
   * attributes synchronization.
   * @param {Event} event
   * @protected
   */
  lfr.Component.prototype.handleAttributesChanges_ = function(event) {
    if (this.inDocument) {
      this.renderSurfacesContent_(this.getModifiedSurfacesFromChanges_(event.changes));
    }
    this.fireAttrsChanges_(event.changes);
  };

  /**
   * Makes an unique id for the component.
   * @return {string} Unique id.
   * @protected
   */
  lfr.Component.prototype.makeId_ = function() {
    return 'lfr_c_' + lfr.getUid(this);
  };

  /**
   * Makes the id for the surface scoped by the component.
   * @param {string} surfaceId The surface id.
   * @return {string}
   * @protected
   */
  lfr.Component.prototype.makeSurfaceId_ = function(surfaceId) {
    return this.id + '-' + surfaceId;
  };

  /**
   * Merges an array of values for the ATTRS_SYNC property into a single object.
   * The final object's keys are the names of the attributes to be synchronized.
   * @param {!Array} values The values to be merged.
   * @return {!Object} The merged value.
   * @protected
   */
  lfr.Component.prototype.mergeAttrsSync_ = function(values) {
    var merged = {};
    values = lfr.array.flatten(values);
    for (var i = 0; i < values.length; i++) {
      if (values[i]) {
        merged[values[i]] = undefined;
      }
    }
    return merged;
  };

  /**
   * Merges an array of values for the ELEMENT_CLASSES property into a single object.
   * @param {!Array} values The values to be merged.
   * @return {!Object} The merged value.
   * @protected
   */
  lfr.Component.prototype.mergeElementClasses_ = function(values) {
    return lfr.array.flatten(values.filter(function(val) {
      return val;
    }));
  };

  /**
   * Merges an array of values for the SURFACES property into a single object.
   * @param {!Array} values The values to be merged.
   * @return {!Object} The merged value.
   * @protected
   */
  lfr.Component.prototype.mergeSurfaces_ = function(values) {
    return lfr.object.mixin.apply(null, [{}].concat(values.reverse()));
  };

  /**
   * Unregisters a surface and removes its element from the DOM.
   * @param {string} surfaceId The surface id.
   * @chainable
   */
  lfr.Component.prototype.removeSurface = function(surfaceId) {
    var el = this.getSurfaceElement(surfaceId);
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
    delete this.surfaces_[surfaceId];
    return this;
  };

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
  lfr.Component.prototype.render = function(opt_parentElement, opt_siblingElement) {
    if (this.inDocument) {
      throw new Error(lfr.Component.Error.ALREADY_RENDERED);
    }

    this.renderInternal();
    this.clearSurfacesCache_();
    this.renderSurfacesContent_(this.surfaces_);

    this.fireAttrsChanges_(this.constructor.ATTRS_SYNC_MERGED);

    this.attach(opt_parentElement, opt_siblingElement);
    return this;
  };

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
  lfr.Component.prototype.renderElement_ = function(opt_parentElement, opt_siblingElement) {
    this.element.id = this.id;
    if (opt_siblingElement || !this.element.parentNode) {
      var parent = lfr.dom.toElement(opt_parentElement) || document.body;
      parent.insertBefore(this.element, lfr.dom.toElement(opt_siblingElement));
    }
  };

  /**
   * Lifecycle. Internal implementation for rendering. Any extra operation
   * necessary to prepare the component DOM must be implemented in this phase.
   */
  lfr.Component.prototype.renderInternal = lfr.nullFunction;

  /**
   * Render content into a surface. If the specified content is the same of
   * the current surface content, nothing happens. If the surface cache state
   * is not initialized or the content is not eligible for cache or content is
   * different, the surfaces re-renders. It's not recommended to use this
   * method directly since surface content can be provided by
   * `getSurfaceContent(surfaceId)`.
   * @param {string} surfaceId The surface id.
   * @param {Object|string} content The content to be rendered.
   */
  lfr.Component.prototype.renderSurfaceContent = function(surfaceId, content) {
    if (lfr.isDefAndNotNull(content)) {
      var surface = this.getSurface(surfaceId);
      var cacheState = this.computeSurfaceCacheState_(content);

      if (cacheState === lfr.Component.Cache.NOT_INITIALIZED ||
        cacheState === lfr.Component.Cache.NOT_CACHEABLE ||
        cacheState !== surface.cacheState) {

        var el = this.getSurfaceElement(surfaceId);
        lfr.dom.removeChildren(el);
        lfr.dom.append(el, content);
      }
      surface.cacheState = cacheState;
    }
  };

  /**
   * Renders all surfaces contents ignoring the cache.
   * @param {Object.<string, Object=>} surfaces Object map where the key is
   *     the surface id and value the optional surface configuration.
   * @protected
   */
  lfr.Component.prototype.renderSurfacesContent_ = function(surfaces) {
    for (var surfaceId in surfaces) {
      this.renderSurfaceContent(surfaceId, this.getSurfaceContent_(surfaceId));
    }
  };

  /**
   * Setter logic for element attribute.
   * @param {string|Element} val
   * @return {Element}
   * @protected
   */
  lfr.Component.prototype.setterElementFn_ = function(val) {
    return lfr.dom.toElement(val);
  };

  /**
   * Attribute synchronization logic for elementClasses attribute.
   * @param {Array.<string>} newVal
   * @param {Array.<string>} prevVal
   */
  lfr.Component.prototype.syncElementClasses = function(newVal, prevVal) {
    var classList = this.element.classList;
    var classesToAdd = this.constructor.ELEMENT_CLASSES_MERGED;
    if (newVal) {
      classesToAdd = classesToAdd.concat(newVal);
    }
    classList.remove.apply(classList, prevVal);
    classList.add.apply(classList, classesToAdd);
  };

  /**
   * Validator logic for element attribute.
   * @param {string|Element} val
   * @return {Boolean} True if val is a valid element.
   * @protected
   */
  lfr.Component.prototype.validatorElementFn_ = function(val) {
    return lfr.isElement(val) || lfr.isString(val);
  };

  /**
   * Validator logic for elementClasses attribute.
   * @param {Array.<string>} val
   * @return {Boolean} True if val is a valid element classes.
   * @protected
   */
  lfr.Component.prototype.validatorElementClassesFn_ = function(val) {
    return Array.isArray(val);
  };

  /**
   * Validator logic for id attribute.
   * @param {string} val
   * @return {Boolean} True if val is a valid id.
   * @protected
   */
  lfr.Component.prototype.validatorIdFn_ = function(val) {
    return lfr.isString(val);
  };

  /**
   * Provides the default value for element attribute.
   * @return {Element} The element.
   * @protected
   */
  lfr.Component.prototype.valueElementFn_ = function() {
    return document.createElement(this.constructor.ELEMENT_TAG_NAME_MERGED);
  };

  /**
   * Provides the default value for id attribute.
   * @return {string} The id.
   * @protected
   */
  lfr.Component.prototype.valueIdFn_ = function() {
    return this.element.id || this.makeId_();
  };

}());
