'use strict';

var comps_ = [];

class IncrementalDomUnusedComponents {
	/**
	 * Disposes all sub components that were not rerendered since the last
	 * time this function was scheduled.
	 */
	static disposeUnused() {
		for (var i = 0; i < comps_.length; i++) {
			var comp = comps_[i];
			if (!comp.isDisposed()) {
				var renderer = comp.getRenderer();
				if (!renderer.getParent()) {
					// Don't let disposing cause the element to be removed, since it may
					// be currently being reused by another component.
					comp.element = null;

					var ref = renderer.config_.ref;
					var owner = renderer.getOwner();
					if (owner && !owner.isDisposed() && owner.components[ref] === comp) {
						owner.disposeSubComponents([ref]);
					} else {
						comp.dispose();
					}
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
