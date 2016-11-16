'use strict';

import { registerCustomEvent } from './dom';
import features from './features';
import * as KEYMAP from './keyConstants';

const REGEX_EVENT = /^(key+(down|up|press)):((,?[a-z])+)/;

/**
 * Returns the relative keyCode from each key name in an array.
 * @param {Array<string>} keyNames An array with the key names.
 */
function convertKeynamesToKeyCode_(keyNames) {
  let keys = {};

  for (let i = 0; keyNames.length > i; i++) {
    keys[KEYMAP[keyNames[i].toUpperCase()]] = true;
  }

  return keys;
}

/**
 * Creates an event configuration object to deail with keyboard events.
 * @param {!Array} matchedRegexInfo The information extracted from the regex
 *  that has matched with the parameterized event name.
 * @return {object} The custom keyboard event configuration that has all the
 *  necessary informations for the handler function.
 */
function createCustomKeyboardEventConfig(matchedRegexInfo) {
  return {
    event: true,
    delegate: true,
    keys: convertKeynamesToKeyCode_(matchedRegexInfo[3].split(',')),
    handler: function (callback, event) {
      if (this.keys[event.keyCode]) {
        event.customType = matchedRegexInfo[0];
        callback(event);
      }
    },
    originalEvent: matchedRegexInfo[1]
  }
}

var mouseEventMap = {
	mouseenter: 'mouseover',
	mouseleave: 'mouseout',
	pointerenter: 'pointerover',
	pointerleave: 'pointerout'
};
Object.keys(mouseEventMap).forEach(function(eventName) {
	registerCustomEvent(eventName, {
		delegate: true,
		handler: function(callback, event) {
			var related = event.relatedTarget;
			var target = event.delegateTarget;
			if (!related || (related !== target && !target.contains(related))) {
				event.customType = eventName;
				return callback(event);
			}
		},
		originalEvent: mouseEventMap[eventName]
	});
});

var animationEventMap = {
	animation: 'animationend',
	transition: 'transitionend'
};
Object.keys(animationEventMap).forEach(function(eventType) {
	var eventName = animationEventMap[eventType];
	registerCustomEvent(eventName, {
		event: true,
		delegate: true,
		handler: function(callback, event) {
			event.customType = eventName;
			return callback(event);
		},
		originalEvent: features.checkAnimationEventName()[eventType]
	});
});

registerCustomEvent(REGEX_EVENT, createCustomKeyboardEventConfig);
