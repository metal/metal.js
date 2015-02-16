'use strict';

import core from '../core';
import Trie from './Trie';

/**
 * A trie that can handle wildcards.
 * @param {*} value
 * @constructor
 * @extends {Trie}
 */
var WildcardTrie = function(value) {
  WildcardTrie.base(this, 'constructor', value);
};
core.inherits(WildcardTrie, Trie);

/**
 * A token representing any single namespace.
 * @type {string}
 * @static
 */
WildcardTrie.TOKEN_SKIP_SINGLE = '*';

/**
 * Creates a new trie node.
 * @return {Trie}
 * @override
 */
WildcardTrie.prototype.createNewTrieNode = function() {
  return new WildcardTrie();
};

/**
 * Gets all the children that match any of the given list of key parts.
 * @param {!Array} keyParts
 * @return {!Array}
 * @protected
 */
WildcardTrie.prototype.getChildrenMatchingKeyParts_ = function(keyParts) {
  var matchingChildren = [];

  for (var i = 0; i < keyParts.length; i++) {
    var child = this.getChild(keyParts[i]);
    if (child) {
      matchingChildren.push(child);
    }
  }

  return matchingChildren;
};

/**
 * Gets the value for the given key in the tree.
 * @param {!(Array|string)} key
 * @return {!Array}
 * @override
 */
WildcardTrie.prototype.getKeyValue = function(key) {
  key = this.normalizeKey(key);

  var nextKey = key.concat();
  var keyPart = nextKey.shift();

  if (!keyPart) {
    return this.getValue() ? [this.getValue()] : [];
  }

  return this.getKeyValueForChildren_(nextKey, keyPart);
};

/**
 * Gets the values of a key on the children that match the given key part.
 * @param  {!Array} key
 * @param  {string} keyPart
 * @return {!Array}
 */
WildcardTrie.prototype.getKeyValueForChildren_ = function(key, keyPart) {
  var values = [];

  var children = this.getMatchingChildren_(keyPart);
  for (var i = 0; i < children.length; i++) {
    values = values.concat(children[i].getKeyValue(key));
  }

  return values;
};

/**
 * Gets all the children of this trie that match the given key part.
 * @param  {string} keyPart
 * @return {!Array.<Trie>}
 */
WildcardTrie.prototype.getMatchingChildren_ = function(keyPart) {
  var matchingChildren = [];

  if (keyPart === WildcardTrie.TOKEN_SKIP_SINGLE) {
    matchingChildren = this.getAllChildren();
  } else {
    matchingChildren = this.getChildrenMatchingKeyParts_(
      [keyPart, WildcardTrie.TOKEN_SKIP_SINGLE]
    );
  }

  return matchingChildren;
};

export default WildcardTrie;
