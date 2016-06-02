'use strict';

import { async } from 'metal';

class IncrementalDomUnusedComponents {
	/**
	 * Schedules a cleanup of unused components to happen in the next tick.
	 * @param {!Array<!Component} comps
	 */
	static schedule(comps) {
		for (var i = 0; i < comps.length; i++) {
			comps[i].getRenderer().parent_ = null;
			comps_.push(comps[i]);
		}
		if (!scheduled_) {
			scheduled_ = true;
			async.nextTick(disposeUnused_);
		}
	}
}

var comps_ = [];
var scheduled_ = false;

/**
 * Disposes all sub components that were not rerendered since the last
 * time this function was scheduled.
 * @protected
 */
function disposeUnused_() {
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
	scheduled_ = false;
	comps_ = [];
}

export default IncrementalDomUnusedComponents;
