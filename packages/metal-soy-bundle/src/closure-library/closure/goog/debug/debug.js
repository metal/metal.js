goog.debug = {};

/**
 * Returns the type of a value. If a constructor is passed, and a suitable
 * string cannot be found, 'unknown type name' will be returned.
 *
 * <p>Forked rather than moved from {@link goog.asserts.getType_}
 * to avoid adding a dependency to goog.asserts.
 * @param {*} value A constructor, object, or primitive.
 * @return {string} The best display name for the value, or 'unknown type name'.
 */
goog.debug.runtimeType = function(value) {
  if (value instanceof Function) {
    return value.displayName || value.name || 'unknown type name';
  } else if (value instanceof Object) {
    return value.constructor.displayName || value.constructor.name ||
        Object.prototype.toString.call(value);
  } else {
    return value === null ? 'null' : typeof value;
  }
};
