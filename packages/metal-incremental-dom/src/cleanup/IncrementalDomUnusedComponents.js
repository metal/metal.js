'use strict';

var comps_ = [];

class IncrementalDomUnusedComponents {
	/**
	 * Disposes all sub components that were not rerendered since the last
	 * time this function was scheduled.
	 */
	static disposeUnused() {
		for (var i = 0; i < comps_.length; i++) {
			if (!comps_[i].isDisposed()) {
				var renderer = comps_[i].getRenderer();
				if (!renderer.getParent()) {
					// Don't let disposing cause the element to be removed, since it may
					// be currently being reused by another component.
					comps_[i].element = null;
					renderer.getOwner().disposeSubComponents([comps_[i].config.ref]);
				}
			}
		}
		comps_ = [];
	}

	/**
	 * Schedules the given components to be checked and disposed if not used
	 * anymore, when `IncrementalDomUnusedComponents.disposeUnused` is called.
	 * @param {!Array<!Component} comps
	 */
	static schedule(comps) {
		for (var i = 0; i < comps.length; i++) {
			comps[i].getRenderer().parent_ = null;
			comps_.push(comps[i]);
		}
	}
}

export default IncrementalDomUnusedComponents;
