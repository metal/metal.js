'use strict';

import { array, core, object, string } from 'metal';
import { dom, features, globalEval } from 'metal-dom';
import html from 'metal-html';
import Component from '../Component';
import ComponentCollector from '../ComponentCollector';
import ComponentRenderer from '../ComponentRenderer';
import EventsCollector from '../EventsCollector';
import SurfaceCollector from './SurfaceCollector';

/**
 * Renders components based on surfaces. Surfaces are an area of the component
 * that can have information rendered into it. This renderer can manage multiple
 * surfaces. Surfaces are only rendered when their contents are modified,
 * representing render performance gains. For each surface, render attributes
 * could be associated. When the render context of a surface gets modified, the
 * renderer's lifecycle will repaint the modified surface automatically.
 *
 * This renderer is not intended to be used on its own. Instead, subclasses
 * should override the `getSurfaceContent` function to implement the surface
 * rendering logic. This function will be called whenever a surface may need to
 * be repainted, and should return the rendered content as a string.
 *
 * For example:
 * <code>
 * class CustomSurfaceRenderer extends SurfaceRenderer {
 *   getSurfaceContent(surface) {
 *     return someTemplateEngine(surface.surfaceElementId);
 *   }
 * }
 * </code>
 *
 * To use the new renderer, you just need to set the component's RENDERER static
 * variable to the renderer class, like this:
 *
 * <code>
 * class CustomComponent extends Component {
 * }
 * CustomComponent.RENDERER = CustomSurfaceRenderer;
 * </code>
 */
class SurfaceRenderer extends ComponentRenderer {
	/**
	 * @inheritDoc
	 */
	constructor(component) {
		super(component);

		/**
		 * Holds data about all surfaces that were collected through the
		 * `replaceSurfacePlaceholders_` method.
		 * @type {!Array}
		 * @protected
		 */
		this.collectedSurfaces_ = [];

		/**
		 * Holds the number of generated ids for each surface's contents.
		 * @type {!Object}
		 * @protected
		 */
		this.generatedIdCount_ = {};

		/**
		 * The element ids of all surfaces that were removed on a repaint.
		 * @type {!Array<string>}
		 * @protected
		 */
		this.removedSurfaces_ = [];

		/**
		 * The ids of the surfaces registered for this renderer's component.
		 * @type {!Object<string, boolean>}
		 * @protected
		 */
		this.surfaceIds_ = {};

		/**
		 * Collects inline events from html contents.
		 * @type {!EventsCollector}
		 * @protected
		 */
		this.eventsCollector_ = new EventsCollector(this.component_);

		core.mergeSuperClassesProperty(this.component_.constructor, 'SURFACE_TAG_NAME', array.firstDefinedValue);
		this.component_.constructor.SURFACE_TAG_NAME_MERGED =
			this.component_.constructor.SURFACE_TAG_NAME_MERGED || 'div';

		this.setShouldUseFacade(true);
		this.addSurfacesFromStaticHint_();
		this.addSurface(this.component_.id, {
			componentName: this.component_.getName()
		});

		this.component_.once('attached', this.handleComponentAttachedOnce_.bind(this));
		this.component_.on('detached', this.handleComponentDetached_.bind(this));
		this.on('renderSurface', this.defaultRenderSurfaceFn_, true);
	}

	/**
	 * Adds a simple attribute with the given name to the component, if it doesn't
	 * exist yet.
	 * @param {string} attrName
	 * @param {Object=} opt_initialValue Optional initial value for the new attr.
	 * @protected
	 */
	addMissingAttr_(attrName, opt_initialValue) {
		if (!this.component_.getAttrConfig(attrName)) {
			this.component_.addAttr(attrName, {}, opt_initialValue);
		}
	}

	/**
	 * Registers a surface to the component. Surface elements are not
	 * automatically appended to the component element.
	 * @param {string} surfaceId The surface id to be registered.
	 * @param {Object=} opt_surfaceConfig Optional surface configuration.
	 * @chainable
	 */
	addSurface(surfaceId, opt_surfaceConfig) {
		var config = opt_surfaceConfig || {};
		var surfaceElementId = this.getSurfaceElementId(surfaceId, config);
		if (this.surfaceIds_[surfaceElementId]) {
			SurfaceRenderer.surfacesCollector.updateSurface(surfaceElementId, config);
		} else {
			this.surfaceIds_[surfaceElementId] = true;
			config.cacheState = config.cacheState || SurfaceRenderer.Cache.NOT_INITIALIZED;
			SurfaceRenderer.surfacesCollector.addSurface(surfaceElementId, config);
			if (config.componentName && surfaceId !== this.component_.id) {
				this.addSubComponent(config.componentName, surfaceElementId);
			}
		}
		this.cacheSurfaceRenderAttrs_(surfaceElementId, config.renderAttrs);

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
		core.mergeSuperClassesProperty(this.component_.constructor, 'SURFACES', this.mergeObjects_);
		this.surfacesRenderAttrs_ = {};

		var configs = this.component_.constructor.SURFACES_MERGED;
		for (var surfaceId in configs) {
			this.addSurface(surfaceId, object.mixin({}, configs[surfaceId]));
		}
	}

	/**
	 * Adds the given surface element ids to the list of removed surfaces,
	 * removing their parent reference as well.
	 * @param {!Array<string>} surfaceElementIds
	 * @protected
	 */
	addToRemovedSurfaces_(surfaceElementIds) {
		for (var i = 0; i < surfaceElementIds.length; i++) {
			var surface = this.getSurface(surfaceElementIds[i]);
			this.removedSurfaces_.push(surface);
			surface.parent = null;
		}
	}

	/**
	 * @inheritDoc
	 */
	buildElement() {
		var compId = this.component_.id;
		var element = this.findElementInContent_(compId, this.getElementContent_(true) || '');
		if (!element) {
			element = this.findElementInContent_(compId, this.getComponentHtml(''));
		}
		dom.removeChildren(element);
		dom.exitDocument(element);
		return element;
	}

	/**
	 * Builds a fragment element with the given content, so it can be rendered.
	 * Any script tags inside the content will be moved to the header, so they can
	 * be reevaluated when this content is rendered.
	 * @param {string} content
	 * @return {!Element}
	 * @protected
	 */
	buildFragment_(content) {
		var frag = dom.buildFragment(content);
		if (content.indexOf('<script') !== -1) {
			globalEval.runScriptsInElement(frag);
		}
		return frag;
	}

	/**
	 * Builds a surface placeholder, attaching it to the given data.
	 * @param {string} surfaceElementId
	 * @param {Object=} opt_data
	 * @return {string}
	 */
	buildPlaceholder(surfaceElementId, opt_data) {
		if (surfaceElementId && opt_data) {
			opt_data.surfaceElementId = surfaceElementId;
			this.addSurface(surfaceElementId, opt_data);
		}
		return '%%%%~s' + (surfaceElementId ? '-' + surfaceElementId : '') + '~%%%%';
	}

	/**
	 * Caches the given content for the surface with the requested id.
	 * @param {string} surfaceElementId
	 * @param {string} content
	 */
	cacheSurfaceContent(surfaceElementId, content) {
		var cacheState = this.computeSurfaceCacheState_(content);
		var surface = this.getSurfaceFromElementId(surfaceElementId);
		surface.cacheState = cacheState;
	}

	/**
	 * Caches surface render attributes into a O(k) flat map representation.
	 * Relevant for performance to calculate the surfaces group that were
	 * modified by attributes mutation.
	 * @param {string} surfaceElementId The surface id to be cached into the flat map.
	 * @param {Array} renderAttrs The surface's render attrs.
	 * @protected
	 */
	cacheSurfaceRenderAttrs_(surfaceElementId, renderAttrs) {
		var attrs = renderAttrs || [];
		for (var i = 0; i < attrs.length; i++) {
			if (!this.surfacesRenderAttrs_[attrs[i]]) {
				this.surfacesRenderAttrs_[attrs[i]] = {};
				this.addMissingAttr_(attrs[i], this.component_.getInitialConfig()[attrs[i]]);
			}
			this.surfacesRenderAttrs_[attrs[i]][surfaceElementId] = true;
		}
	}

	/**
	 * Checks if the given content has an element tag with the given id.
	 * @param {string} content
	 * @param {string} id
	 * @return {boolean}
	 * @protected
	 */
	checkHasElementTag_(content, id) {
		return content.indexOf(' id="' + id + '"') !== -1;
	}

	/**
	 * Clears the cache of the specified surface.
	 * @param {string} surfaceIds
	 */
	clearSurfaceCache(surfaceId) {
		this.getSurface(surfaceId).cacheState = SurfaceRenderer.Cache.NOT_INITIALIZED;
	}

	/**
	 * Compares cache states.
	 * @param {number} currentCacheState
	 * @param {number} previousCacheState
	 * @return {boolean} True if there's a cache hit, or false for cache miss.
	 */
	compareCacheStates_(currentCacheState, previousCacheState) {
		return currentCacheState !== SurfaceRenderer.Cache.NOT_INITIALIZED &&
			currentCacheState === previousCacheState;
	}

	/**
	 * Computes the cache state for the surface content. If value is string, the
	 * cache state is represented by its hashcode.
	 * @param {?string} value The value to calculate the cache state.
	 * @return {Object} The computed cache state.
	 * @protected
	 */
	computeSurfaceCacheState_(value) {
		value = value || '';
		if (features.checkAttrOrderChange()) {
			value = this.convertHtmlToBrowserFormat_(value);
		}
		return string.hashCode(value);
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
	 * Creates a surface that was found via a string placeholder.
	 * @param {string} parentSurfaceElementId The id of the surface element that contains
	 *   the surface to be created, or undefined if there is none.
	 * @param {string=} opt_surfaceElementId
	 * @return {!Object} The created surface.
	 * @protected
	 */
	createPlaceholderSurface_(parentSurfaceElementId, opt_surfaceElementId) {
		var surfaceElementId = opt_surfaceElementId;
		if (!core.isDefAndNotNull(surfaceElementId)) {
			surfaceElementId = this.generateSurfaceElementId(parentSurfaceElementId);
		}
		var surface = this.getSurfaceFromElementId(surfaceElementId);
		if (!surface) {
			surface = {
				surfaceElementId: surfaceElementId
			};
			this.addSurface(surfaceElementId, surface);
		}
		return surface;
	}

	/**
	 * Adds a sub component to this renderer's component.
	 * @param {string} componentName
	 * @param {string} componentId
	 * @return {!Component}
	 * @protected
	 */
	addSubComponent(componentName, componentId) {
		return this.component_.addSubComponent(
			componentName,
			componentId,
			this.getSurfaceFromElementId(componentId).componentData
		);
	}

	/**
	 * Creates the surface element with its id namespaced to the component id.
	 * @param {string} surfaceElementId The id of the element for the surface to be
	 *   created.
	 * @return {Element} The surface element.
	 * @protected
	 */
	createSurfaceElement_(surfaceElementId) {
		var el = document.createElement(this.component_.constructor.SURFACE_TAG_NAME_MERGED);
		el.id = surfaceElementId;
		return el;
	}

	/**
	 * The default implementation for the `renderSurface` event. Renders
	 * content into a surface. If the specified content is the same of the
	 * current surface content, nothing happens. If the surface cache state
	 * is not initialized or the content is not eligible for cache or content
	 * is different, the surfaces re-renders.
	 * @param {!Object} data
	 * @protected
	 */
	defaultRenderSurfaceFn_(data) {
		var surfaceElementId = data.surfaceElementId;
		var surface = this.getSurfaceFromElementId(surfaceElementId);
		if (surface.componentName && surfaceElementId !== this.component_.id) {
			this.renderComponentSurface_(surfaceElementId, data.content);
			return;
		}

		var content = data.content || this.getSurfaceContent_(surfaceElementId);
		var cacheContent = data.cacheContent || content;
		var cacheHit = surface.static;
		if (!surface.static) {
			var previousCacheState = surface.cacheState;
			this.cacheSurfaceContent(surfaceElementId, cacheContent);
			cacheHit = this.compareCacheStates_(surface.cacheState, previousCacheState);
		}

		if (cacheHit) {
			this.renderPlaceholderSurfaceContents_(cacheContent, surfaceElementId);
		} else {
			this.eventsCollector_.attachListenersFromHtml(cacheContent, surfaceElementId);
			this.replaceSurfaceContent_(surfaceElementId, surface, content);
		}
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		super.disposeInternal();

		this.eventsCollector_.dispose();
		this.eventsCollector_ = null;

		this.surfacesRenderAttrs_ = null;

		Object.keys(this.surfaceIds_).forEach(surfaceId => this.removeSurface(surfaceId, true));
		this.surfaceIds_ = null;
	}

	/**
	 * Emits the `renderSurface` event, which will cause the specified surface to be
	 * rendered, unless it's prevented.
	 * @param {string} surfaceElementId
	 * @param {string=} opt_content
	 * @param {string=} opt_cacheContent
	 * @param {Array<string>=} opt_renderAttrs The render attributes that caused the
	 *   surface to be rerendered, or nothing if that wasn't the cause of the update.
	 * @protected
	 */
	emitRenderSurfaceEvent_(surfaceElementId, opt_content, opt_cacheContent, opt_renderAttrs) {
		this.emit('renderSurface', {
			cacheContent: opt_cacheContent,
			content: opt_content,
			renderAttrs: opt_renderAttrs || [],
			surfaceElementId: surfaceElementId,
			surfaceId: this.getSurfaceId(this.getSurfaceFromElementId(surfaceElementId))
		});
	}

	/**
	 * Finds the element with the given id in the given content, if there is one.
	 * @param {string} id
	 * @param {!Element|string} content
	 * @return {Element}
	 * @protected
	 */
	findElementInContent_(id, content) {
		content = core.isString(content) ? dom.buildFragment(content) : content;
		var firstChild = content.childNodes[0];
		if (firstChild && firstChild.id === id) {
			return firstChild;
		}
	}

	/**
	 * Generates an id for a surface that was found inside the contents of the main
	 * element or of a parent surface.
	 * @param {string} parentSurfaceElementId The id of the parent surface, or undefined
	 *   if there is none.
	 * @return {string} The generated id.
	 */
	generateSurfaceElementId(parentSurfaceElementId) {
		this.generatedIdCount_[parentSurfaceElementId] = (this.generatedIdCount_[parentSurfaceElementId] || 0) + 1;
		return parentSurfaceElementId + '-s' + this.generatedIdCount_[parentSurfaceElementId];
	}

	/**
	 * Gets the html that should be used to build this component's main element with
	 * some content.
	 * @param {string} content
	 * @return {string}
	 */
	getComponentHtml(content) {
		return this.wrapContentIfNecessary(
			content,
			this.component_.id,
			this.component_.constructor.ELEMENT_TAG_NAME_MERGED
		);
	}

	/**
	 * Calls `getElementContent` and creating its surface if it hasn't been created yet.
	 * @param {string=} opt_skipContents True if only the element's tag needs to be rendered.
	 * @return {Object|string} The content to be rendered. If the content is a
	 *   string, surfaces can be represented by placeholders in the format specified
	 *   by SurfaceRenderer.SURFACE_REGEX. Also, if the string content's main wrapper has
	 *   the component's id, then it will be used to render the main element tag.
	 * @protected
	 */
	getElementContent_(opt_skipContents) {
		return this.getSurfaceContent(this.getSurface(this.component_.id), opt_skipContents);
	}

	/**
	 * Calls `getElementContent` and replaces all placeholders in the returned content.
	 * This is called when rendering sub components, so it also attaches listeners to
	 * the original content.
	 * @return {string} The content with all placeholders already replaced.
	 */
	getElementExtendedContent() {
		var content = this.getElementContent_() || '';
		this.eventsCollector_.attachListenersFromHtml(content, this.component_.id);
		this.cacheSurfaceContent(this.component_.id, content);
		return this.replaceSurfacePlaceholders_(content, this.component_.id, this.getSurface(this.component_.id));
	}

	/**
	 * Gets surfaces that got modified by the specified attributes changes.
	 * @param {Object.<string, Object>} changes Object containing the attribute
	 *     name as key and an object with newVal and prevVal as value.
	 * @return {Object.<string, boolean>} Object containing modified surface ids
	 *     as key and true as value.
	 * @protected
	 */
	getModifiedSurfacesFromChanges_(changes) {
		var surfaces = {};
		for (var attr in changes) {
			var surfaceNames = Object.keys(this.surfacesRenderAttrs_[attr] || {});
			for (var i = 0; i < surfaceNames.length; i++) {
				if (!surfaces[surfaceNames[i]]) {
					surfaces[surfaceNames[i]] = [];
				}
				surfaces[surfaceNames[i]].push(attr);
			}
		}
		return surfaces;
	}

	/**
	 * Same as `getSurfaceHtml_`, but only called for non component surfaces.
	 * @param {string} surfaceElementId
	 * @param {string} content
	 * @return {string}
	 */
	getNonComponentSurfaceHtml(surfaceElementId, content) {
		return this.wrapContentIfNecessary(content, surfaceElementId, this.component_.constructor.SURFACE_TAG_NAME_MERGED);
	}

	/**
	 * Gets surface configuration object. If surface is not registered returns
	 * null.
	 * @param {string} surfaceId The surface id or its element id.
	 * @return {Object} The surface configuration object.
	 */
	getSurface(surfaceId) {
		var surface = this.getSurfaceFromElementId(this.getSurfaceElementId(surfaceId));
		return surface ? surface : this.getSurfaceFromElementId(surfaceId);
	}

	/**
	 * Returns the appropriate string content for the specified surface. Subclasses
	 * should implement this method.
	 * @param {!Object} surface The surface configuration.
	 * @param {string=} opt_skipContents True if only the element's tag needs to be rendered.
	 * @return {string}
	 * @override
	 */
	getSurfaceContent() {
		core.abstractMethod();
	}

	/**
	 * Gets the content for the requested surface. Calls `getSurfaceContent` for non
	 * component surfaces, handling component surfaces automatically.
	 * @param {string} surfaceElementId The surface element id.
	 * @return {string} The content to be rendered.
	 * @protected
	 */
	getSurfaceContent_(surfaceElementId) {
		var surface = this.getSurfaceFromElementId(surfaceElementId);
		if (surface.componentName && surfaceElementId !== this.component_.id) {
			var component = ComponentCollector.components[surfaceElementId];
			if (component.wasRendered) {
				return '';
			} else {
				return component.getRenderer().getElementExtendedContent();
			}
		} else {
			return this.getSurfaceContent(surface) || '';
		}
	}

	/**
	 * Queries from the document or creates an element for the surface. Surface
	 * elements have its surface id namespaced to the component id, e.g. for a
	 * component with id `gallery` and a surface with id `pictures` the surface
	 * element will be represented by the id `gallery-pictures`. Surface
	 * elements must also be appended to the component element.
	 * @param {string} surfaceId The surface id.
	 * @param {Object=} opt_surface The surface's config. If not given, it will
	 *   be fetched.
	 * @return {Element} The surface element or null if surface not registered.
	 */
	getSurfaceElement(surfaceId, opt_surface) {
		var surface = opt_surface || this.getSurface(surfaceId);
		if (!surface) {
			return null;
		}
		if (!surface.element) {
			if (surface.componentName) {
				var component = ComponentCollector.components[surfaceId];
				if (component) {
					surface.element = component.element;
				}
			} else {
				var surfaceElementId = this.getSurfaceElementId(surfaceId, surface);
				surface.element = this.component_.findElementById(surfaceElementId) ||
					this.createSurfaceElement_(surfaceElementId);
			}
		}
		return surface.element;
	}

	/**
	 * Adds the component id as the prefix of the given surface id if necessary.
	 * @param {string} surfaceId
	 * @param {Object=} opt_surface The surface data.
	 * @return {string}
	 */
	getSurfaceElementId(surfaceId, opt_surface) {
		var surface = opt_surface || {};
		if (surface.surfaceElementId) {
			return surface.surfaceElementId;
		} else if (surface.componentName || this.hasComponentPrefix_(surfaceId)) {
			return surfaceId;
		} else {
			return this.prefixSurfaceId(surfaceId);
		}
	}

	/**
	 * Gets surface configuration object. This is similar to `getSurface`, but
	 * receives the surface's element id, while `getSurface` can also receive
	 * a local surface id.
	 * @param {string} surfaceElementId The surface's element id
	 * @return {Object} The surface configuration object.
	 */
	getSurfaceFromElementId(surfaceElementId) {
		return SurfaceRenderer.surfacesCollector.getSurface(surfaceElementId);
	}

	/**
	 * Gets the html that should be used to build a surface's main element with its
	 * content.
	 * @param {!Object} surface
	 * @param {string} content
	 * @return {string}
	 * @protected
	 */
	getSurfaceHtml_(surface, content) {
		var surfaceElementId = surface.surfaceElementId;
		if (surface.componentName) {
			var component = ComponentCollector.components[surfaceElementId];
			return component.getRenderer().getComponentHtml(content);
		} else {
			return this.getNonComponentSurfaceHtml(surfaceElementId, content);
		}
	}

	/**
	 * Gets the surface id for the given surface.
	 * @param {!Object} surface
	 * @return {string}
	 */
	getSurfaceId(surface) {
		if (surface.componentName || !this.hasComponentPrefix_(surface.surfaceElementId)) {
			return surface.surfaceElementId;
		} else {
			return surface.surfaceElementId.substr(this.component_.id.length + 1);
		}
	}

	/**
	 * A map of surface ids to the respective surface object.
	 * @return {!Object}
	 */
	getSurfaces() {
		var surfaces = {};
		Object.keys(this.surfaceIds_).forEach(function(surfaceElementId) {
			var surface = this.getSurfaceFromElementId(surfaceElementId);
			surfaces[this.getSurfaceId(surface)] = surface;
		}.bind(this));
		return surfaces;
	}

	/**
	 * Handles the `attached` event from this renderer's component. This function
	 * is called only once, on the first time the event is triggered.
	 * @protected
	 */
	handleComponentAttachedOnce_() {
		this.updatePlaceholderSurfaces_();
	}

	/**
	 * Handles the `detached` event from this renderer's component, removing all
	 * event listeners.
	 * @protected
	 */
	handleComponentDetached_() {
		this.eventsCollector_.detachAllListeners();
	}

	/**
	 * Checks if the given surface id has this component's prefix.
	 * @param {string} surfaceId
	 * @return {boolean}
	 * @protected
	 */
	hasComponentPrefix_(surfaceId) {
		var compId = this.component_.id;
		return surfaceId.substr(0, compId.length) === compId &&
			(surfaceId.length === compId.length || surfaceId[compId.length] === '-');
	}

	/**
	 * Merges an array of objects into a single object. Used by the SURFACES static
	 * variable.
	 * @param {!Array} values The values to be merged.
	 * @return {!Object} The merged value.
	 * @protected
	 */
	mergeObjects_(values) {
		return object.mixin.apply(null, [{}].concat(values.reverse()));
	}

	/**
	 * Prefixes the given surface id with this component's id.
	 * @param {string} surfaceId
	 * @return {string}
	 */
	prefixSurfaceId(surfaceId) {
		return this.component_.id + '-' + surfaceId;
	}

	/**
	 * Unregisters a surface and removes its element from the DOM.
	 * @param {string} surfaceId The surface id.
	 * @param {boolean=} opt_skipDomRemoval Flag indicating if the removal
	 *     of the surface from the dom should be skipped. When true, only the
	 *     surface data is going to be removed.
	 * @chainable
	 */
	removeSurface(surfaceId, opt_skipDomRemoval) {
		if (!opt_skipDomRemoval) {
			var el = this.getSurfaceElement(surfaceId);
			if (el && el.parentNode) {
				el.parentNode.removeChild(el);
			}
		}
		var surfaceElementId = this.getSurfaceElementId(surfaceId, this.getSurface(surfaceId));
		SurfaceRenderer.surfacesCollector.removeSurface(surfaceElementId);
		this.surfaceIds_[surfaceElementId] = false;
		return this;
	}

	/**
	 * Removes all surfaces that were removed during the repaint of their parents,
	 * and weren't added back again. Component surfaces will be disposed.
	 * @protected
	 */
	removeUnusedSurfaces_() {
		var compIds = [];
		for (var i = 0; i < this.removedSurfaces_.length; i++) {
			var surface = this.removedSurfaces_[i];
			if (!surface.parent) {
				this.removeSurface(surface.surfaceElementId);
				if (surface.componentName) {
					compIds.push(surface.surfaceElementId);
				}
			}
		}
		this.component_.disposeSubComponents(compIds);
	}

	/**
	 * @inheritDoc
	 */
	render(data) {
		var id = this.component_.id;
		if (data.decorating) {
			var extendedContent = this.getElementExtendedContent();
			var extendedCacheState = this.computeSurfaceCacheState_(extendedContent);
			var originalContent = html.compress(this.component_.element.outerHTML);
			var htmlCacheState = this.computeSurfaceCacheState_(originalContent);
			if (!this.compareCacheStates_(htmlCacheState, extendedCacheState)) {
				this.replaceElementContent(extendedContent);
			}
		} else {
			this.emitRenderSurfaceEvent_(id);
		}
	}

	/**
	 * Renders a surface that holds a component.
	 * @param {string} surfaceElementId
	 * @param {string=} opt_content The content to be rendered.
	 * @protected
	 */
	renderComponentSurface_(surfaceElementId, opt_content) {
		var component = ComponentCollector.components[surfaceElementId];
		if (component.wasRendered) {
			var surface = this.getSurfaceFromElementId(surfaceElementId);
			Component.componentsCollector.updateComponent(surfaceElementId, surface.componentData);
		} else {
			if (opt_content && dom.isEmpty(component.element)) {
				// If we have the rendered content for this component, but it hasn't
				// been rendered in its element yet, we render it manually here. That
				// can happen if the subcomponent's element is set before the parent
				// element renders its content, making originally rendered content be
				// set on the wrong place.
				component.getRenderer().replaceElementContent(opt_content);
			}
	 		component.renderAsSubComponent();
		}
	}

	/**
	 * Renders the contents of all the surface placeholders found in the given content.
	 * @param {string} content
	 * @param {string} surfaceElementId The id of surface element the content is from.
	 * @protected
	 */
	renderPlaceholderSurfaceContents_(content, surfaceElementId) {
		var instance = this;
		content.replace(SurfaceRenderer.SURFACE_REGEX, function(match, id) {
			var surface = instance.createPlaceholderSurface_(surfaceElementId, id);
			instance.emitRenderSurfaceEvent_(surface.surfaceElementId);
			return match;
		});
	}

	/**
	 * Renders all surfaces contents ignoring the cache.
	 * @param {Object.<string, Array=>} surfaces Object map where the key is
	 *     the surface id and value the optional attributes list that caused
	 *     the rerender.
	 * @protected
	 */
	renderSurfacesContent_(surfaces) {
		this.generatedIdCount_ = {};
		this.removedSurfaces_ = [];

		var compId = this.component_.id;
		var surfaceElementIds = Object.keys(surfaces);
		var idIndex = surfaceElementIds.indexOf(compId);
		if (idIndex !== -1) {
			// Always render the main content surface first, for performance reasons.
			surfaceElementIds.splice(idIndex, 1);
			surfaceElementIds = [compId].concat(surfaceElementIds);
		}

		for (var i = 0; i < surfaceElementIds.length; i++) {
			var surface = this.getSurfaceFromElementId(surfaceElementIds[i]);
			if (!surface.handled && (surface.parent || surfaceElementIds[i] === compId)) {
				this.emitRenderSurfaceEvent_(surfaceElementIds[i], null, null, surfaces[surfaceElementIds[i]]);
			}
		}
		this.updatePlaceholderSurfaces_();
		this.eventsCollector_.detachUnusedListeners();
		this.removeUnusedSurfaces_();
	}

	/**
	 * Replaces the content of this component's element with the given one.
	 * @param {string} content The content to be rendered.
	 */
	replaceElementContent(content) {
		var element = this.component_.element;
		var newContent = this.buildFragment_(content);
		var newElement = this.findElementInContent_(this.component_.id, newContent);
		if (newElement) {
			this.updateElementAttributes_(element, newElement);
			newContent = newElement.childNodes;
		}
		dom.removeChildren(element);
		dom.append(element, newContent);
	}

	/**
	 * Replaces the content of a surface with a new one.
	 * @param {string} surfaceElementId The surface id.
	 * @param {!Object} surface The surface object.
	 * @param {string} content The content to be rendered.
	 * @protected
	 */
	replaceSurfaceContent_(surfaceElementId, surface, content) {
		content = this.replaceSurfacePlaceholders_(content, surfaceElementId, surface);
		if (surfaceElementId === this.component_.id) {
			this.replaceElementContent(content);
			return;
		}

		var el = this.getSurfaceElement(surfaceElementId);
		var frag = this.buildFragment_(content);
		var element = this.findElementInContent_(surfaceElementId, frag);
		if (element) {
			surface.element = element;
			dom.replace(el, surface.element);
		} else {
			dom.removeChildren(el);
			dom.append(el, frag);
		}
	}

	/**
	 * Replaces the given content's surface placeholders with their real contents.
	 * @param {string} content
	 * @param {string} surfaceElementId The id of the surface element that contains
	 *   the given content, or undefined if the content is from the main element.
	 * @param {!Object} surface The surface object.
	 * @return {string} The final string with replaced placeholders.
	 * @protected
	 */
	replaceSurfacePlaceholders_(content, surfaceElementId, surface) {
		if (!surface.componentName || surfaceElementId === this.component_.id) {
			this.addToRemovedSurfaces_(surface.children || []);
			surface.children = [];
		}

		var instance = this;
		return content.replace(SurfaceRenderer.SURFACE_REGEX, function(match, id) {
			// Surfaces should already have been created before being rendered so they can be
			// accessed from their getSurfaceContent calls.
			var placeholderSurface = instance.createPlaceholderSurface_(surfaceElementId, id);
			id = placeholderSurface.surfaceElementId;
			placeholderSurface.handled = true;
			placeholderSurface.parent = surfaceElementId;
			surface.children.push(id);

			var surfaceContent = instance.getSurfaceContent_(id);
			var surfaceHtml = instance.getSurfaceHtml_(placeholderSurface, surfaceContent);
			var expandedHtml = instance.replaceSurfacePlaceholders_(surfaceHtml, id, placeholderSurface);
			instance.collectedSurfaces_.push({
				cacheContent: surfaceContent,
				content: expandedHtml,
				surface: placeholderSurface
			});

			return expandedHtml;
		});
	}

	/**
	 * @inheritDoc
	 */
	update(data) {
		this.renderSurfacesContent_(this.getModifiedSurfacesFromChanges_(data.changes));
	}

	/**
	 * Sets the attributes from the second element to the first element.
	 * @param {!Element} element
	 * @param {!Element} newElement
	 * @protected
	 */
	updateElementAttributes_(element, newElement) {
		var attrs = newElement.attributes;
		for (var i = 0; i < attrs.length; i++) {
			// The "id" and "class" html attributes are already synced via the "id"
			// and "elementClasses" component attributes, respectively.
			if (attrs[i].name !== 'id' && attrs[i].name !== 'class') {
				element.setAttribute(attrs[i].name, attrs[i].value);
			}
		}

		if (element.tagName !== newElement.tagName) {
			console.error(
				'The component named "' + this.component_.getName() + '" tried to change the component ' +
				'element\'s tag name, which is not allowed. Make sure to always return the same tag ' +
				'name for the component element on the renderer\'s getSurfaceContent. This may also ' +
				'have been caused by passing an element to this component with a different tag name ' +
				'from the one it uses.'
			);
		}
	}

	/**
	 * Updates a surface after it has been rendered through placeholders.
	 * @param {!{content: string, cacheContent: string, surfaceElementId: string}} collectedData
	 *   Data about the collected surface. Should have the surface's id, content and the
	 *   content that should be cached for it.
	 * @protected
	 */
	updatePlaceholderSurface_(collectedData) {
		var surface = collectedData.surface;
		var surfaceElementId = surface.surfaceElementId;
		if (surface.componentName) {
			// Elements of component surfaces are unchangeable, so we need to replace the
			// rendered element with the component's.
			dom.replace(this.component_.findElementById(surfaceElementId), this.getSurfaceElement(surfaceElementId, surface));

			// Component surfaces need to be handled in case some internal details have changed.
			this.emitRenderSurfaceEvent_(surfaceElementId, collectedData.content, collectedData.cacheContent);
		} else {
			// This surface's element has either changed or never been created yet. Let's just
			// reset it to null, so it can be fetched from the dom again when necessary. Also,
			// since there's no need to do cache checks or rerender, let's just attach its
			// listeners and cache its content manually.
			surface.element = null;
			this.cacheSurfaceContent(surfaceElementId, collectedData.cacheContent);
			this.eventsCollector_.attachListenersFromHtml(collectedData.cacheContent, surfaceElementId);
		}
	}

	/**
	 * Updates all collected surfaces.
	 * @protected
	 */
	updatePlaceholderSurfaces_() {
		for (var i = this.collectedSurfaces_.length - 1; i >= 0; i--) {
			this.updatePlaceholderSurface_(this.collectedSurfaces_[i]);
			this.collectedSurfaces_[i].surface.handled = false;
		}
		this.collectedSurfaces_ = [];
	}

	/**
	 * Wraps the content with the given tag, unless the content already has an element with the
	 * correct id.
	 * @param {string} content
	 * @param {string} id
	 * @param {string} tag
	 * @return {string}
	 * @protected
	 */
	wrapContentIfNecessary(content, id, tag) {
		if (!this.checkHasElementTag_(content, id)) {
			content = '<' + tag + ' id="' + id + '">' + content + '</' + tag + '>';
		}
		return content;
	}
}

/**
 * Cache states for the surfaces.
 * @enum {string}
 */
SurfaceRenderer.Cache = {
	/**
	 * Cache not initialized.
	 */
	NOT_INITIALIZED: -2
};

/**
 * The regex used to search for surface placeholders.
 * @type {RegExp}
 * @static
 */
SurfaceRenderer.SURFACE_REGEX = /\%\%\%\%~s(?:-([^~:]+))?~\%\%\%\%/g;

/**
 * Helper responsible for temporarily holding surface data.
 * @type {!SurfaceCollector}
 * @protected
 * @static
 */
SurfaceRenderer.surfacesCollector = new SurfaceCollector();

export default SurfaceRenderer;
