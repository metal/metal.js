'use strict';

import { isFunction } from 'metal';

const SYNC_FNS_KEY = '__METAL_SYNC_FNS__';

/**
 * Gets the `sync` methods for this component's state. Caches the results in
 * the component's constructor whenever possible, so that this doesn't need to
 * be calculated again. It's not possible to cache the results when at least
 * one sync method is defined in the instance itself instead of in its
 * prototype, as it may be bound to the instance (not reusable by others).
 * @param {!Component} component
 * @return {!Object}
 * @private
 */
function getSyncFns_(component) {
	const ctor = component.constructor;
	if (ctor.hasOwnProperty(SYNC_FNS_KEY)) {
		return ctor[SYNC_FNS_KEY];
	}

	const fns = {};
	const keys = component.getDataManager().getSyncKeys(component);
	let canCache = true;
	for (let i = 0; i < keys.length; i++) {
		const name = `sync${keys[i].charAt(0).toUpperCase()}${keys[i].slice(1)}`;
		const fn = component[name];
		if (fn) {
			fns[keys[i]] = fn;
			canCache = canCache && component.constructor.prototype[name];
		}
	}

	if (canCache) {
		ctor[SYNC_FNS_KEY] = fns;
	}
	return fns;
}

/**
 * Calls "sync" functions for the given component's state.
 * @param {!Component} component
 * @param {Object=} opt_changes When given, only the properties inside it will
 *     be synced. Otherwise all state properties will be synced.
 */
export function syncState(component, opt_changes) {
	const syncFns = getSyncFns_(component);
	const keys = Object.keys(opt_changes || syncFns);
	for (let i = 0; i < keys.length; i++) {
		const fn = syncFns[keys[i]];
		if (isFunction(fn)) {
			const change = opt_changes && opt_changes[keys[i]];
			const manager = component.getDataManager();
			fn.call(
				component,
				change ? change.newVal : manager.get(component, keys[i]),
				change ? change.prevVal : undefined
			);
		}
	}
}
