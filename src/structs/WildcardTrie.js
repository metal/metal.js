'use strict';

import Trie from './Trie';

/**
 * A trie that can handle wildcards.
 * @param {*} value
 * @constructor
 * @extends {Trie}
 */
class WildcardTrie extends Trie {
  constructor(value) {
    super(value);
  }

  /**
   * Creates a new trie node.
   * @return {Trie}
   * @override
   */
  createNewTrieNode() {
    return new WildcardTrie();
  }

  /**
   * Gets all the children that match any of the given list of key parts.
   * @param {!Array} keyParts
   * @return {!Array}
   * @protected
   */
  getChildrenMatchingKeyParts_(keyParts) {
    var matchingChildren = [];

    for (var i = 0; i < keyParts.length; i++) {
      var child = this.getChild(keyParts[i]);
      if (child) {
        matchingChildren.push(child);
      }
    }

    return matchingChildren;
  }

  /**
   * Gets the value for the given key in the tree.
   * @param {!(Array|string)} key
   * @return {!Array}
   * @override
   */
  getKeyValue(key) {
    key = this.normalizeKey(key);

    var nextKey = key.concat();
    var keyPart = nextKey.shift();

    if (!keyPart) {
      return this.getValue() ? [this.getValue()] : [];
    }

    return this.getKeyValueForChildren_(nextKey, keyPart);
  }

  /**
   * Gets the values of a key on the children that match the given key part.
   * @param  {!Array} key
   * @param  {string} keyPart
   * @return {!Array}
   */
  getKeyValueForChildren_(key, keyPart) {
    var values = [];

    var children = this.getMatchingChildren_(keyPart);
    for (var i = 0; i < children.length; i++) {
      values = values.concat(children[i].getKeyValue(key));
    }

    return values;
  }

  /**
   * Gets all the children of this trie that match the given key part.
   * @param  {string} keyPart
   * @return {!Array.<Trie>}
   */
  getMatchingChildren_(keyPart) {
    var matchingChildren = [];

    if (keyPart === WildcardTrie.TOKEN_SKIP_SINGLE) {
      matchingChildren = this.getAllChildren();
    } else {
      matchingChildren = this.getChildrenMatchingKeyParts_(
        [keyPart, WildcardTrie.TOKEN_SKIP_SINGLE]
      );
    }

    return matchingChildren;
  }
}

/**
 * A token representing any single namespace.
 * @type {string}
 * @static
 */
WildcardTrie.TOKEN_SKIP_SINGLE = '*';

export default WildcardTrie;
