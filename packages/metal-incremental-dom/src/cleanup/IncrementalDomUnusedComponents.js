'use strict';

var comps_ = [];
var disposing_ = false;

class IncrementalDomUnusedComponents {
	/**
	 * Disposes all sub components that were not rerendered since the last
	 * time this function was scheduled.
	 */
	static disposeUnused() {
		if (disposing_) {
			return;
		}
		disposing_ = true;

		for (var i = 0; i < comps_.length; i++) {
			var comp = comps_[i];
			if (!comp.isDisposed() && !comp.getRenderer().getParent()) {
				// Don't let disposing cause the element to be removed, since it may
				// be currently being reused by another component.
				comp.element = null;
				comp.dispose();
			}
		}
		comps_ = [];
		disposing_ = false;
	}

	/**
	 * Schedules the given components to be checked and disposed if not used
	 * anymore, when `IncrementalDomUnusedComponents.disposeUnused` is called.
	 * @param {!Array<!Component} comps
	 */
	static schedule(comps) {
		for (var i = 0; i < comps.length; i++) {
			if (!comps[i].isDisposed()) {
				comps[i].getRenderer().parent_ = null;
				comps_.push(comps[i]);
			}
		}
	}
}

export default IncrementalDomUnusedComponents;
