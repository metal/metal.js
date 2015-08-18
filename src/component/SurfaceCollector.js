'use strict';

import object from '../object/object';
import Disposable from '../disposable/Disposable';

/**
 * Stores surface data to be used later by Components.
 */
class SurfaceCollector extends Disposable {
	constructor() {
		super();

		/**
		 * Holds all registered surfaces, mapped by their element ids.
		 * @type {!Array<!Object>}
		 * @protected
		 */
		this.surfaces_ = {};
	}

	/**
	 * Adds a surface to this collector.
	 * @param {string} surfaceElementId
	 * @param {Object=} opt_data Surface data to be stored.
	 */
	addSurface(surfaceElementId, opt_data) {
		if (this.surfaces_[surfaceElementId]) {
			this.updateSurface(surfaceElementId, opt_data);
		} else {
			this.surfaces_[surfaceElementId] = opt_data;
		}
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.surfaces_ = null;
	}

	/**
	 * Gets the data for the given surface id.
	 * @param {string} surfaceElementId
	 * @return {!Object}
	 */
	getSurface(surfaceElementId) {
		return this.surfaces_[surfaceElementId] ? this.surfaces_[surfaceElementId] : null;
	}

	/**
	 * Removes all surfaces from this collector.
	 */
	removeAllSurfaces() {
		this.surfaces_ = [];
	}

	/**
	 * Removes the surface with the given surface id.
	 * @param {string} surfaceElementId
	 */
	removeSurface(surfaceElementId) {
		this.surfaces_[surfaceElementId] = null;
	}

	/**
	 * Updates a surface from this collector.
	 * @param {string} surfaceElementId
	 * @param {Object=} opt_data Surface data to update the existing data.
	 */
	updateSurface(surfaceElementId, opt_data) {
		object.mixin(this.surfaces_[surfaceElementId], opt_data);
	}
}

export default SurfaceCollector;
