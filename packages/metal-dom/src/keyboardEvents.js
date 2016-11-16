'use strict';

import { object } from 'metal';
import * as KEYMAP from './keyConstants';

/**
 * Breaks down and return the original keyboard event name and the matched keys.
 * @param {string} eventName The given event name.
 */
function convertKeynameIntoKeyCode_(keyName) {
  return KEYMAP[keyName.toUpperCase()];
}

/**
 * Breaks down the given parameterized event name and it returns the original
 * keyboard event name and the matched keys.
 * @param {string} eventName The given event name.
 */
function getEventConfig_(eventName) {
  let eventData = eventName.split(':');

  return {
    originalEvent: eventData[0],
    keys: eventData[1].split(',').map(convertKeynameIntoKeyCode_),
    handler: handlerKeys
  }
}

/**
 * Returns the event configuration from a given parameterized keyboard event name.
 * @param {string} eventName The given event name.
 * @return {Object} Object with the original DOM event name, the list of keyCodes
 * and the listener wrapper. Returns undefined if the given eventName has any
 * parameters.
 */
export function getKeyboardEventConfig(eventName) {
  if (!isParametedKeyboardEvent(eventName)) {
    return;
  }
  return getEventConfig_(eventName);
}

/**
 * Original listener wrapper. It checks if the pressed key matchs with the given
 * keys and it trigger the original listener function.
 * @param {!function(!Object)} callback The original listener that will called
 * when the event is triggered and if the pressed key and the given keys alias
 * matches.
 * @param {event} Normalized event object.
 * there is at least one parameter.
 */
function handlerKeys(callback, event) {
  if (this.keys.indexOf(event.keyCode) > -1) {
    callback(event);
  }
}

/**
 * Checks if the given event name is an keyboard event and it has matched key
 * parameters.
 * @param {string} eventName The given event name.
 * @return {boolean} True if eventName matches with an valid keyboard event and
 * there is at least one parameter.
 */
function isParametedKeyboardEvent(eventName) {
  return /^key(down|up|press):([a-z]+),?([a-z]+)?/g.test(eventName);
}
