'use strict';

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} The unescaped {@code str} string.
 */
 function unescape(str) {
   /** @type {!Object<string, string>} */
   var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
   var div = document.createElement('div');

   // Match as many valid entity characters as possible. If the actual entity
   // happens to be shorter, it will still work as innerHTML will return the
   // trailing characters unchanged. Since the entity characters do not include
   // open angle bracket, there is no chance of XSS from the innerHTML use.
   // Since no whitespace is passed to innerHTML, whitespace is preserved.
   return str.replace(HTML_ENTITY_PATTERN_, function(s, entity) {
     // Check for cached entity.
     var value = seen[s];
     if (value) {
       return value;
     }
     // Check for numeric entity.
     if (entity.charAt(0) === '#') {
       // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
       var n = Number('0' + entity.substr(1));
       if (!isNaN(n)) {
         value = String.fromCharCode(n);
       }
     }
     // Fall back to innerHTML otherwise.
     if (!value) {
       // Append a non-entity character to avoid a bug in Webkit that parses
       // an invalid entity at the end of innerHTML text as the empty string.
       div.innerHTML = s + ' ';
       // Then remove the trailing character from the result.
       value = div.firstChild.nodeValue.slice(0, -1);
     }
     // Cache and return.
     seen[s] = value;
     return value;
   });
 }

export default unescape;

/**
 * Regular expression that matches an HTML entity.
 * @type {!RegExp}
 */
var HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
