(function() {
  'use strict';

  /**
   * Trie data structure. It's useful for quickly storing and finding
   * information related to strings and their prefixes. See
   * http://en.wikipedia.org/wiki/Trie.
   * @constructor
   */
  lfr.Trie = function(value) {
    this.value_ = value;
    this.children_ = {};
  };
  lfr.inherits(lfr.Trie, lfr.Disposable);

  /**
   * The list of children for this tree.
   * @type {Object.<string, Trie>}
   * @protected
   */
  lfr.Trie.prototype.children_ = null;

  /**
   * The value associated with this tree.
   * @type {*}
   * @protected
   */
  lfr.Trie.prototype.value_ = null;

  /**
   * Empties the trie of all keys and values.
   */
  lfr.Trie.prototype.clear = function() {
    this.children_ = {};
    this.value_ = null;
  };

  /**
   * Creates a new trie node.
   * @return {lfr.Trie}
   */
  lfr.Trie.prototype.createNewTrieNode = function() {
    return new lfr.Trie();
  };

  /**
   * Disposes of this instance's object references.
   * @override
   */
  lfr.Trie.prototype.disposeInternal = function() {
    for (var k in this.children_) {
      if (this.children_.hasOwnProperty(k)) {
        this.children_[k].dispose();
      }
    }

    this.children_ = null;
    this.value_ = null;
  };

  /**
   * Gets the child node for the given key part.
   * @param {string} keyPart String that can directly access a child of this
   *   Trie.
   * @return {lfr.Trie}
   */
  lfr.Trie.prototype.getChild = function(keyPart) {
    return this.children_[keyPart];
  };

  /**
   * Gets the value for the given key in the tree.
   * @param {!(Array|string)} key
   * @return {*}
   */
  lfr.Trie.prototype.getKeyValue = function(key) {
    var node = this;

    key = this.normalizeKey(key);

    for (var i = 0; i < key.length; i++) {
      node = node.getChild(key[i]);
      if (!node) {
        return null;
      }
    }

    return node.getValue();
  };

  /**
   * Gets this tree's value.
   * @return {*}
   */
  lfr.Trie.prototype.getValue = function() {
    return this.value_;
  };

  /**
   * Returns a normalized key, to be used by a Trie.
   * @param  {!(Array|string)} key The key to be normalized.
   * @return {!Array} The normalized key.
   */
  lfr.Trie.prototype.normalizeKey = function(key) {
    return lfr.isString(key) ? key.split('') : key;
  };

  /**
   * Sets the child node for the given key part.
   * @param {string} keyPart String that can directly access a child of this
   *   Trie.
   * @param {lfr.Trie} child
   */
  lfr.Trie.prototype.setChild = function(keyPart, child) {
    this.children_[keyPart] = child;
  };

  /**
   * Sets the given key/value pair in the tree. If the key already exists and
   * `mergeFn` is given, the result of its call will be set as the value
   * instead.
   * @param {!(Array|string)} key The key to set the value at.
   * @param {*} value The value to set.
   * @param {function(*, *)=} opt_mergeFn Function to be called if the key
   *   already exists. It will be called with the old and the new values, and
   *   the key will be set to its return value.
   */
  lfr.Trie.prototype.setKeyValue = function(key, value, opt_mergeFn) {
    var child;
    var node = this;

    key = this.normalizeKey(key);

    for (var i = 0; i < key.length; i++) {
      child = node.getChild(key[i]);
      if (!child) {
        child = this.createNewTrieNode();
        node.setChild(key[i], child);
      }

      node = child;
    }

    if (node.getValue() && opt_mergeFn) {
      value = opt_mergeFn(node.getValue(), value);
    }

    node.setValue(value);

    return node.getValue();
  };

  /**
   * Sets this tree's value.
   * @param {*} value
   */
  lfr.Trie.prototype.setValue = function(value) {
    this.value_ = value;
  };

}());
