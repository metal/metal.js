'use strict';

import { getData } from '../data';

let comps_ = [];
let disposing_ = false;

/**
 * Disposes all sub components that were not rerendered since the last
 * time this function was scheduled.
 */
export function disposeUnused() {
	if (disposing_) {
		return;
	}
	disposing_ = true;

	for (let i = 0; i < comps_.length; i++) {
		const comp = comps_[i];
		if (!comp.isDisposed() && !getData(comp).parent) {
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
 * anymore when `disposeUnused` is called.
 * @param {!Array<!Component>} comps
 */
export function schedule(comps) {
	for (let i = 0; i < comps.length; i++) {
		if (!comps[i].isDisposed()) {
			getData(comps[i]).parent = null;
			comps_.push(comps[i]);
		}
	}
}
