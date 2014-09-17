'use strict';

var lfr = require('../fixture/sandbox.js');

module.exports = {
  testNormalizeKey: function(test) {
    var trie = new lfr.Trie();

    test.deepEqual(['a', '@', 'b', '2'], trie.normalizeKey('a@b2'));
    test.deepEqual(['1', '2'], trie.normalizeKey(['1', '2']));

    test.done();
  },

  testValue: function(test) {
    var trie = new lfr.Trie();

    test.ok(!trie.getValue());

    trie.setValue('a');
    test.strictEqual('a', trie.getValue());

    test.done();
  },

  testChildren: function(test) {
    var child1 = new lfr.Trie();
    var child2 = new lfr.Trie();
    var trie = new lfr.Trie();

    test.ok(!trie.getChild('1'));
    test.ok(!trie.getChild('2'));

    trie.setChild('1', child1);
    trie.setChild('2', child2);

    test.strictEqual(child1, trie.getChild('1'));
    test.strictEqual(child2, trie.getChild('2'));
    test.ok(!trie.getChild('3'));

    test.done();
  },

  testSetKeyValue: function(test) {
    var trie = new lfr.Trie();

    trie.setKeyValue('abc', 'abcValue');
    test.ok(trie.getChild('a'));
    test.ok(trie.getChild('a').getChild('b'));
    test.ok(trie.getChild('a').getChild('b').getChild('c'));
    test.strictEqual('abcValue', trie.getChild('a').getChild('b').getChild('c').getValue());

    trie.setKeyValue('az', 'azValue');
    test.ok(trie.getChild('a').getChild('z'));
    test.strictEqual('azValue', trie.getChild('a').getChild('z').getValue());

    trie.setKeyValue('cba', 'cbaValue');
    test.ok(trie.getChild('c'));
    test.ok(trie.getChild('c').getChild('b'));
    test.ok(trie.getChild('c').getChild('b').getChild('a'));
    test.strictEqual('cbaValue', trie.getChild('c').getChild('b').getChild('a').getValue());

    test.done();
  },

  testSetKeyValueArray: function(test) {
    var trie = new lfr.Trie();

    trie.setKeyValue(['abc', 'def'], '1');
    trie.setKeyValue(['abc', 'z'], '2');

    test.ok(trie.getChild('abc').getChild('def'));
    test.ok(!trie.getChild('a'));
    test.strictEqual('1', trie.getChild('abc').getChild('def').getValue());
    test.strictEqual('2', trie.getChild('abc').getChild('z').getValue());

    test.done();
  },

  testSetKeyValueNoMerge: function(test) {
    var trie = new lfr.Trie();

    trie.setKeyValue('abc', ['1']);
    trie.setKeyValue('abc', ['2']);

    test.deepEqual(['2'], trie.getChild('a').getChild('b').getChild('c').getValue());

    test.done();
  },

  testSetKeyValueMerge: function(test) {
    var trie = new lfr.Trie();
    var mergeFn = function(value1, value2) {
      return value1.concat(value2);
    };

    trie.setKeyValue('abc', ['1'], mergeFn);
    trie.setKeyValue('abc', ['2'], mergeFn);

    test.deepEqual(['1', '2'], trie.getChild('a').getChild('b').getChild('c').getValue());

    test.done();
  },

  testGetKeyValue: function(test) {
    var trie = new lfr.Trie();

    trie.setKeyValue('', 'Value');
    trie.setKeyValue('abc', 'abcValue');
    trie.setKeyValue('az', 'azValue');
    trie.setKeyValue('cba', 'cbaValue');

    test.strictEqual('Value', trie.getKeyValue(''));
    test.strictEqual('abcValue', trie.getKeyValue('abc'));
    test.strictEqual('azValue', trie.getKeyValue('az'));
    test.strictEqual('cbaValue', trie.getKeyValue('cba'));
    test.ok(!trie.getKeyValue('abcd'));

    test.done();
  },

  testClear: function(test) {
    var trie = new lfr.Trie();

    trie.setKeyValue('abc', 'abcValue');
    trie.setKeyValue('az', 'azValue');

    trie.clear();

    test.ok(!trie.getKeyValue('abc'));
    test.ok(!trie.getKeyValue('az'));

    test.done();
  }
};
