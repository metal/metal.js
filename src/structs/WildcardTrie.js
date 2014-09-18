(function() {
  'use strict';

  /**
   * A trie that can handle wildcards.
   * @param {*} value
   * @constructor
   */
  lfr.WildcardTrie = function(value) {
    lfr.WildcardTrie.base(this, 'constructor', value);
  };
  lfr.inherits(lfr.WildcardTrie, lfr.Trie);

  /**
   * A token representing any single namespace.
   * @type {string}
   * @static
   */
  lfr.WildcardTrie.TOKEN_SKIP_SINGLE = '*';

  /**
   * Creates a new trie node.
   * @return {Trie}
   * @override
   */
  lfr.WildcardTrie.prototype.createNewTrieNode = function() {
    return new lfr.WildcardTrie();
  };

  /**
   * Gets the value for the given key in the tree.
   * @param {!(Array|string)} key
   * @return {!Array}
   * @override
   */
  lfr.WildcardTrie.prototype.getKeyValue = function(key) {
    var values = [];

    key = this.normalizeKey(key);
    var nextKey = key.concat();
    var keyPart = nextKey.shift();

    if (!keyPart) {
      if (this.getValue()) {
        values.push(this.getValue());
      }
    } else {
      var matchingChildren = this.getMatchingChildren_(keyPart);

      for (var i = 0; i < matchingChildren.length; i++) {
        values = values.concat(matchingChildren[i].getKeyValue(nextKey));
      }
    }

    return values;
  };

  /**
   * Gets all the children of this trie that match the given key part.
   * @param  {string} keyPart
   * @return {!Array.<Trie>}
   */
  lfr.WildcardTrie.prototype.getMatchingChildren_ = function(keyPart) {
    var matchingChildren = [];

    if (keyPart === lfr.WildcardTrie.TOKEN_SKIP_SINGLE) {
      for (var k in this.children_) {
        if (this.children_.hasOwnProperty(k)) {
          matchingChildren.push(this.children_[k]);
        }
      }
    } else {
      var matchingKeyParts = [keyPart, lfr.WildcardTrie.TOKEN_SKIP_SINGLE];
      for (var i = 0; i < matchingKeyParts.length; i++) {
        var child = this.getChild(matchingKeyParts[i]);
        if (child) {
          matchingChildren.push(child);
        }
      }
    }

    return matchingChildren;
  };

}());
