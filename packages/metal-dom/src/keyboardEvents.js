'use strict';

import { object } from 'metal';

export const KEYMAP = {
  BACKSPACE: 8,
  TAB: 9,
  NUM_CENTER: 12,
  ENTER: 13,
  RETURN: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  PRINT_SCREEN: 44,
  INSERT: 45,
  DELETE: 46,
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  CONTEXT_MENU: 93,
  NUM_ZERO: 96,
  NUM_ONE: 97,
  NUM_TWO: 98,
  NUM_THREE: 99,
  NUM_FOUR: 100,
  NUM_FIVE: 101,
  NUM_SIX: 102,
  NUM_SEVEN: 103,
  NUM_EIGHT: 104,
  NUM_NINE: 105,
  NUM_MULTIPLY: 106,
  NUM_PLUS: 107,
  NUM_MINUS: 109,
  NUM_PERIOD: 110,
  NUM_DIVISION: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123
}

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
