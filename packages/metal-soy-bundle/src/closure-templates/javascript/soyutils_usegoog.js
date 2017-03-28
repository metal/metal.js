/*
 * Copyright 2008 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview
 * Utility functions and classes for Soy.
 *
 * <p>
 * The top portion of this file contains utilities for Soy users:<ul>
 *   <li> soy.StringBuilder: Compatible with the 'stringbuilder' code style.
 * </ul>
 *
 * <p>
 * The bottom portion of this file contains utilities that should only be called
 * by Soy-generated JS code. Please do not use these functions directly from
 * your hand-writen code. Their names all start with '$$'.
 *
 */


// -----------------------------------------------------------------------------
// StringBuilder (compatible with the 'stringbuilder' code style).

(function() {
  var soy = {};
  soy.asserts = {};
  soy.esc = {};
  var soydata = {};

  /**
   * Utility class to facilitate much faster string concatenation in IE,
   * using Array.join() rather than the '+' operator. For other browsers
   * we simply use the '+' operator.
   *
   * @param {Object} var_args Initial items to append,
   *     e.g., new soy.StringBuilder('foo', 'bar').
   * @constructor
   */
  soy.StringBuilder = goog.string.StringBuffer;


  // -----------------------------------------------------------------------------
  // soydata: Defines typed strings, e.g. an HTML string {@code "a<b>c"} is
  // semantically distinct from the plain text string {@code "a<b>c"} and smart
  // templates can take that distinction into account.

  /**
   * A type of textual content.
   *
   * This is an enum of type Object so that these values are unforgeable.
   *
   * @enum {!Object}
   */
  soydata.SanitizedContentKind = goog.soy.data.SanitizedContentKind;


  /**
   * Checks whether a given value is of a given content kind.
   *
   * @param {*} value The value to be examined.
   * @param {soydata.SanitizedContentKind} contentKind The desired content
   *     kind.
   * @return {boolean} Whether the given value is of the given kind.
   * @private
   */
  soydata.isContentKind = function(value, contentKind) {
    // TODO(user): This function should really include the assert on
    // value.constructor that is currently sprinkled at most of the call sites.
    // Unfortunately, that would require a (debug-mode-only) switch statement.
    // TODO(user): Perhaps we should get rid of the contentKind property
    // altogether and only at the constructor.
    return value != null && value.contentKind === contentKind;
  };

  /**
   * Content of type {@link soydata.SanitizedContentKind.URI}.
   *
   * The content is a URI chunk that the caller knows is safe to emit in a
   * template. The content direction is LTR.
   *
   * @constructor
   * @extends {goog.soy.data.SanitizedContent}
   */
  soydata.SanitizedUri = function() {
    goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
  };
  goog.inherits(soydata.SanitizedUri, goog.soy.data.SanitizedContent);

  /** @override */
  soydata.SanitizedUri.prototype.contentKind = soydata.SanitizedContentKind.URI;

  /** @override */
  soydata.SanitizedUri.prototype.contentDir = goog.i18n.bidi.Dir.LTR;

  /**
   * Unsanitized plain text string.
   *
   * While all strings are effectively safe to use as a plain text, there are no
   * guarantees about safety in any other context such as HTML. This is
   * sometimes used to mark that should never be used unescaped.
   *
   * @param {*} content Plain text with no guarantees.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
   *     unknown and thus to be estimated when necessary. Default: null.
   * @constructor
   * @extends {goog.soy.data.UnsanitizedText}
   */
  soydata.UnsanitizedText = function(content, opt_contentDir) {
    /** @override */
    this.content = String(content);
    this.contentDir = opt_contentDir != null ? opt_contentDir : null;
  };
  goog.inherits(soydata.UnsanitizedText, goog.soy.data.UnsanitizedText);

  /** @override */
  soydata.UnsanitizedText.prototype.contentKind =
      soydata.SanitizedContentKind.TEXT;


  /**
   * Empty string, used as a type in Soy templates.
   * @enum {string}
   * @private
   */
  soydata.$$EMPTY_STRING_ = {
    VALUE: ''
  };


  /**
   * Creates a factory for SanitizedContent types.
   *
   * This is a hack so that the soydata.VERY_UNSAFE.ordainSanitized* can
   * instantiate Sanitized* classes, without making the Sanitized* constructors
   * publicly usable. Requiring all construction to use the VERY_UNSAFE names
   * helps callers and their reviewers easily tell that creating SanitizedContent
   * is not always safe and calls for careful review.
   *
   * @param {function(new: T)} ctor A constructor.
   * @return {!function(*, ?goog.i18n.bidi.Dir=): T} A factory that takes
   *     content and an optional content direction and returns a new instance. If
   *     the content direction is undefined, ctor.prototype.contentDir is used.
   * @template T
   * @private
   */
  soydata.$$makeSanitizedContentFactory_ = function(ctor) {
    /**
     * @param {string} content
     * @constructor
     * @extends {goog.soy.data.SanitizedContent}
     */
    function InstantiableCtor(content) {
      /** @override */
      this.content = content;
    }
    InstantiableCtor.prototype = ctor.prototype;
    /**
     * Creates a ctor-type SanitizedContent instance.
     *
     * @param {*} content The content to put in the instance.
     * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction. If
     *     undefined, ctor.prototype.contentDir is used.
     * @return {!goog.soy.data.SanitizedContent} The new instance. It is actually
     *     of type T above (ctor's type, a descendant of SanitizedContent), but
     *     there is no way to express that here.
     */
    function sanitizedContentFactory(content, opt_contentDir) {
      var result = new InstantiableCtor(String(content));
      if (opt_contentDir !== undefined) {
        result.contentDir = opt_contentDir;
      }
      return result;
    }
    return sanitizedContentFactory;
  };


  /**
   * Creates a factory for SanitizedContent types that should always have their
   * default directionality.
   *
   * This is a hack so that the soydata.VERY_UNSAFE.ordainSanitized* can
   * instantiate Sanitized* classes, without making the Sanitized* constructors
   * publicly usable. Requiring all construction to use the VERY_UNSAFE names
   * helps callers and their reviewers easily tell that creating SanitizedContent
   * is not always safe and calls for careful review.
   *
   * @param {function(new: T, string)} ctor A constructor.
   * @return {!function(*): T} A factory that takes content and returns a new
   *     instance (with default directionality, i.e. ctor.prototype.contentDir).
   * @template T
   * @private
   */
  soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_ = function(ctor) {
    /**
     * @param {string} content
     * @constructor
     * @extends {goog.soy.data.SanitizedContent}
     */
    function InstantiableCtor(content) {
      /** @override */
      this.content = content;
    }
    InstantiableCtor.prototype = ctor.prototype;
    /**
     * Creates a ctor-type SanitizedContent instance.
     *
     * @param {*} content The content to put in the instance.
     * @return {!goog.soy.data.SanitizedContent} The new instance. It is actually
     *     of type T above (ctor's type, a descendant of SanitizedContent), but
     *     there is no way to express that here.
     */
    function sanitizedContentFactory(content) {
      var result = new InstantiableCtor(String(content));
      return result;
    }
    return sanitizedContentFactory;
  };


  // -----------------------------------------------------------------------------
  // Sanitized content ordainers. Please use these with extreme caution (with the
  // exception of markUnsanitizedText). A good recommendation is to limit usage
  // of these to just a handful of files in your source tree where usages can be
  // carefully audited.


  /**
   * Protects a string from being used in an noAutoescaped context.
   *
   * This is useful for content where there is significant risk of accidental
   * unescaped usage in a Soy template. A great case is for user-controlled
   * data that has historically been a source of vulernabilities.
   *
   * @param {*} content Text to protect.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
   *     unknown and thus to be estimated when necessary. Default: null.
   * @return {!soydata.UnsanitizedText} A wrapper that is rejected by the
   *     Soy noAutoescape print directive.
   */
  soydata.markUnsanitizedText = function(content, opt_contentDir) {
    return new soydata.UnsanitizedText(content, opt_contentDir);
  };

  soydata.VERY_UNSAFE = {};


  /**
  * Takes a leap of faith that the provided content is "safe" to use as a URI
  * in a Soy template.
  *
  * This creates a Soy SanitizedContent object which indicates to Soy there is
  * no need to escape it when printed as a URI (e.g. in an href or src
  * attribute), such as if it's already been encoded or  if it's a Javascript:
  * URI.
  *
  * @param {*} content A chunk of URI that the caller knows is safe to
  *     emit in a template.
  * @return {!soydata.SanitizedUri} Sanitized content wrapper that indicates to
  *     Soy not to escape or filter when printed in URI context.
  */
  soydata.VERY_UNSAFE.ordainSanitizedUri =
      soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(
          soydata.SanitizedUri);

  // -----------------------------------------------------------------------------
  // Below are private utilities to be used by Soy-generated code only.

  /**
   * Builds an augmented map. The returned map will contain mappings from both
   * the base map and the additional map. If the same key appears in both, then
   * the value from the additional map will be visible, while the value from the
   * base map will be hidden. The base map will be used, but not modified.
   *
   * @param {!Object} baseMap The original map to augment.
   * @param {!Object} additionalMap A map containing the additional mappings.
   * @return {!Object} An augmented map containing both the original and
   *     additional mappings.
   */
  soy.$$augmentMap = function(baseMap, additionalMap) {
    return soy.$$assignDefaults(soy.$$assignDefaults({}, additionalMap), baseMap);
  };


  /**
   * Copies extra properties into an object if they do not already exist. The
   * destination object is mutated in the process.
   *
   * @param {!Object} obj The destination object to update.
   * @param {!Object} defaults An object with default properties to apply.
   * @return {!Object} The destination object for convenience.
   */
  soy.$$assignDefaults = function(obj, defaults) {
    for (var key in defaults) {
      if (!(key in obj)) {
        obj[key] = defaults[key];
      }
    }

    return obj;
  };

  /**
   * Checks that the given map key is a string.
   * @param {*} key Key to check.
   * @return {string} The given key.
   */
  soy.$$checkMapKey = function(key) {
    // TODO: Support map literal with nonstring key.
    if ((typeof key) != 'string') {
      throw Error(
          'Map literal\'s key expression must evaluate to string' +
          ' (encountered type "' + (typeof key) + '").');
    }
    return key;
  };


  /**
   * Gets the keys in a map as an array. There are no guarantees on the order.
   * @param {Object} map The map to get the keys of.
   * @return {!Array<string>} The array of keys in the given map.
   */
  soy.$$getMapKeys = function(map) {
    var mapKeys = [];
    for (var key in map) {
      mapKeys.push(key);
    }
    return mapKeys;
  };


  /**
   * Returns the argument if it is not null.
   *
   * @param {T} val The value to check
   * @return {T} val if is isn't null
   * @template T
   */
  soy.$$checkNotNull = function(val) {
    if (val == null) {
      throw Error('unexpected null value');
    }
    return val;
  };


  /**
   * Gets a consistent unique id for the given delegate template name. Two calls
   * to this function will return the same id if and only if the input names are
   * the same.
   *
   * <p> Important: This function must always be called with a string constant.
   *
   * <p> If Closure Compiler is not being used, then this is just this identity
   * function. If Closure Compiler is being used, then each call to this function
   * will be replaced with a short string constant, which will be consistent per
   * input name.
   *
   * @param {string} delTemplateName The delegate template name for which to get a
   *     consistent unique id.
   * @return {string} A unique id that is consistent per input name.
   *
   * @consistentIdGenerator
   */
  soy.$$getDelTemplateId = function(delTemplateName) {
    return delTemplateName;
  };


  /**
   * Map from registered delegate template key to the priority of the
   * implementation.
   * @type {Object}
   * @private
   */
  soy.$$DELEGATE_REGISTRY_PRIORITIES_ = {};

  /**
   * Map from registered delegate template key to the implementation function.
   * @type {Object}
   * @private
   */
  soy.$$DELEGATE_REGISTRY_FUNCTIONS_ = {};


  /**
   * Registers a delegate implementation. If the same delegate template key (id
   * and variant) has been registered previously, then priority values are
   * compared and only the higher priority implementation is stored (if
   * priorities are equal, an error is thrown).
   *
   * @param {string} delTemplateId The delegate template id.
   * @param {string} delTemplateVariant The delegate template variant (can be
   *     empty string).
   * @param {number} delPriority The implementation's priority value.
   * @param {Function} delFn The implementation function.
   */
  soy.$$registerDelegateFn = function(
      delTemplateId, delTemplateVariant, delPriority, delFn) {

    var mapKey = 'key_' + delTemplateId + ':' + delTemplateVariant;
    var currPriority = soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey];
    if (currPriority === undefined || delPriority > currPriority) {
      // Registering new or higher-priority function: replace registry entry.
      soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey] = delPriority;
      soy.$$DELEGATE_REGISTRY_FUNCTIONS_[mapKey] = delFn;
    } else if (delPriority == currPriority) {
      // Registering same-priority function: error.
      throw Error(
          'Encountered two active delegates with the same priority ("' +
              delTemplateId + ':' + delTemplateVariant + '").');
    } else {
      // Registering lower-priority function: do nothing.
    }
  };


  /**
   * Retrieves the (highest-priority) implementation that has been registered for
   * a given delegate template key (id and variant). If no implementation has
   * been registered for the key, then the fallback is the same id with empty
   * variant. If the fallback is also not registered, and allowsEmptyDefault is
   * true, then returns an implementation that is equivalent to an empty template
   * (i.e. rendered output would be empty string).
   *
   * @param {string} delTemplateId The delegate template id.
   * @param {string} delTemplateVariant The delegate template variant (can be
   *     empty string).
   * @param {boolean} allowsEmptyDefault Whether to default to the empty template
   *     function if there's no active implementation.
   * @return {Function} The retrieved implementation function.
   */
  soy.$$getDelegateFn = function(
      delTemplateId, delTemplateVariant, allowsEmptyDefault) {

    var delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_[
        'key_' + delTemplateId + ':' + delTemplateVariant];
    if (! delFn && delTemplateVariant != '') {
      // Fallback to empty variant.
      delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_['key_' + delTemplateId + ':'];
    }

    if (delFn) {
      return delFn;
    } else if (allowsEmptyDefault) {
      return soy.$$EMPTY_TEMPLATE_FN_;
    } else {
      throw Error(
          'Found no active impl for delegate call to "' + delTemplateId + ':' +
              delTemplateVariant + '" (and not allowemptydefault="true").');
    }
  };


  /**
   * Private helper soy.$$getDelegateFn(). This is the empty template function
   * that is returned whenever there's no delegate implementation found.
   *
   * @param {Object<string, *>=} opt_data
   * @param {soy.StringBuilder=} opt_sb
   * @param {Object<string, *>=} opt_ijData
   * @return {string}
   * @private
   */
  soy.$$EMPTY_TEMPLATE_FN_ = function(opt_data, opt_sb, opt_ijData) {
    return '';
  };

  // -----------------------------------------------------------------------------
  // Basic directives/functions.


  /**
   * Truncates a string to a given max length (if it's currently longer),
   * optionally adding ellipsis at the end.
   *
   * @param {*} str The string to truncate. Can be other types, but the value will
   *     be coerced to a string.
   * @param {number} maxLen The maximum length of the string after truncation
   *     (including ellipsis, if applicable).
   * @param {boolean} doAddEllipsis Whether to add ellipsis if the string needs
   *     truncation.
   * @return {string} The string after truncation.
   */
  soy.$$truncate = function(str, maxLen, doAddEllipsis) {

    str = String(str);
    if (str.length <= maxLen) {
      return str;  // no need to truncate
    }

    // If doAddEllipsis, either reduce maxLen to compensate, or else if maxLen is
    // too small, just turn off doAddEllipsis.
    if (doAddEllipsis) {
      if (maxLen > 3) {
        maxLen -= 3;
      } else {
        doAddEllipsis = false;
      }
    }

    // Make sure truncating at maxLen doesn't cut up a unicode surrogate pair.
    if (soy.$$isHighSurrogate_(str.charAt(maxLen - 1)) &&
        soy.$$isLowSurrogate_(str.charAt(maxLen))) {
      maxLen -= 1;
    }

    // Truncate.
    str = str.substring(0, maxLen);

    // Add ellipsis.
    if (doAddEllipsis) {
      str += '...';
    }

    return str;
  };

  /**
   * Private helper for $$truncate() to check whether a char is a high surrogate.
   * @param {string} ch The char to check.
   * @return {boolean} Whether the given char is a unicode high surrogate.
   * @private
   */
  soy.$$isHighSurrogate_ = function(ch) {
    return 0xD800 <= ch && ch <= 0xDBFF;
  };

  /**
   * Private helper for $$truncate() to check whether a char is a low surrogate.
   * @param {string} ch The char to check.
   * @return {boolean} Whether the given char is a unicode low surrogate.
   * @private
   */
  soy.$$isLowSurrogate_ = function(ch) {
    return 0xDC00 <= ch && ch <= 0xDFFF;
  };

  // -----------------------------------------------------------------------------
  // Assertion methods used by runtime.

  /**
   * Checks if the type assertion is true if goog.asserts.ENABLE_ASSERTS is
   * true. Report errors on runtime types if goog.DEBUG is true.
   * @template T
   * @param {T} typeCheck An condition for type checks.
   * @param {string} paramName The Soy name of the parameter.
   * @param {?Object} param The resolved JS object for the parameter.
   * @param {!string} jsDocTypeStr JSDoc type str to cast the value to if the
   *     type test succeeds
   * @param {...*} var_args The items to substitute into the failure message.
   * @return {T} The value of the condition.
   * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
   */
  soy.asserts.assertType = function(typeCheck, paramName,
      param, jsDocTypeStr, var_args) {
    var msg = 'expected param ' + paramName + ' of type ' + jsDocTypeStr +
        (goog.DEBUG ? (', but got ' + goog.debug.runtimeType(param)) : '') +
        '.';
    return goog.asserts.assert(typeCheck, msg, var_args);
  };


  // -----------------------------------------------------------------------------
  // Generated code.


  // START GENERATED CODE FOR ESCAPERS.

  /**
   * @type {function (*) : string}
   */
  soy.esc.$$escapeHtmlHelper = function(v) {
    return goog.string.htmlEscape(String(v));
  };

  /**
   * Allows only data-protocol image URI's.
   *
   * @param {*} value The value to process. May not be a string, but the value
   *     will be coerced to a string.
   * @return {!soydata.SanitizedUri} An escaped version of value.
   */
  soy.$$filterImageDataUri = function(value) {
    // NOTE: Even if it's a SanitizedUri, we will still filter it.
    return soydata.VERY_UNSAFE.ordainSanitizedUri(
        soy.esc.$$filterImageDataUriHelper(value));
  };

  /**
   * A pattern that vets values produced by the named directives.
   * @private {!RegExp}
   */
  soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_ = /^data:image\/(?:bmp|gif|jpe?g|png|tiff|webp);base64,[a-z0-9+\/]+=*$/i;

  /**
   * A helper for the Soy directive |filterImageDataUri
   * @param {*} value Can be of any type but will be coerced to a string.
   * @return {string} The escaped text.
   */
  soy.esc.$$filterImageDataUriHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_.test(str)) {
      goog.asserts.fail('Bad value `%s` for |filterImageDataUri', [str]);
      return 'data:image/gif;base64,zSoyz';
    }
    return str;
  };

  // END GENERATED CODE

  goog.loadModule(function() {
    goog.module('soy');
    return soy;
  });

  goog.loadModule(function() {
    goog.module('soydata');
    return soydata;
  });

  goog.loadModule(function() {
    goog.module('soy.asserts');
    return soy;
  });
})();
