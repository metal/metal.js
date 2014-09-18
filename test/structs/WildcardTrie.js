'use strict';

var lfr = require('../fixture/sandbox.js');

module.exports = {
  testValue: function(test) {
    var trie = new lfr.WildcardTrie('myValue');
    test.strictEqual('myValue', trie.getValue());

    test.done();
  },

  testGetWithWildcard: function(test) {
    var trie = new lfr.WildcardTrie('myValue');

    trie.setKeyValue(['some', 'event'], 'value-some.event');
    trie.setKeyValue(['some', 'other', 'event'], 'value-some.other.event');
    trie.setKeyValue(['some', 'other', 'event', 'i', 'went', 'to'], 'value-some.other.event.i.went.to');
    trie.setKeyValue(['some', 'people', 'go', 'to', 'the', 'event'], 'value-some.people.go.to.the.event');
    trie.setKeyValue(['some', 'one', 'went', 'to', 'spain', 'again'], 'value-some.one.went.to.spain.again');

    test.deepEqual(['value-some.event'], trie.getKeyValue(['some', 'event']));
    test.deepEqual(['value-some.other.event'], trie.getKeyValue(['some', 'other', 'event']));
    test.deepEqual(['value-some.event'], trie.getKeyValue(['some', '*']));
    test.deepEqual(['value-some.other.event'], trie.getKeyValue(['some', '*', 'event']));

    test.done();
  },

  testSetWithWildcard: function(test) {
    var trie = new lfr.WildcardTrie();

    trie.setKeyValue(['some', 'event'], 'value-some.event');
    trie.setKeyValue(['some', 'other', 'event'], 'value-some.other.event');
    trie.setKeyValue(['some', 'other', 'event', 'i', 'went', 'to'], 'value-some.other.event.i.went.to');
    trie.setKeyValue(['some', '*', 'event'], 'value-some.*.event');

    test.deepEqual(
      [
        'value-some.other.event',
        'value-some.*.event'
      ],
      trie.getKeyValue(['some', 'other', 'event'])
    );
    test.deepEqual(['value-some.event'], trie.getKeyValue(['*', 'event']));

    test.done();
  },

  testStringKeys: function(test) {
    var trie = new lfr.WildcardTrie();

    trie.setKeyValue('ab', 'value-ab');
    trie.setKeyValue('acb', 'value-acb');
    trie.setKeyValue('acbd', 'value-acbd');
    trie.setKeyValue('*cb', 'value-*cb');

    test.deepEqual(['value-ab'], trie.getKeyValue('ab'));
    test.deepEqual(['value-acb', 'value-*cb'], trie.getKeyValue('acb'));
    test.deepEqual(['value-acb', 'value-*cb'], trie.getKeyValue('a*b'));

    test.done();
  }
};
