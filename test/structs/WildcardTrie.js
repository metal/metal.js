'use strict';

var assert = require('assert');
require('../fixture/sandbox.js');

describe('WildcardTrie', function() {
  it('should set the value from the constructor', function() {
    var trie = new lfr.WildcardTrie('myValue');
    assert.strictEqual('myValue', trie.getValue());
  });

  it('should get values for wildcard keys', function() {
    var trie = new lfr.WildcardTrie('myValue');

    trie.setKeyValue(['some', 'event'], 'value-some.event');
    trie.setKeyValue(['some', 'other', 'event'], 'value-some.other.event');
    trie.setKeyValue(['some', 'other', 'event', 'i', 'went', 'to'], 'value-some.other.event.i.went.to');
    trie.setKeyValue(['some', 'people', 'go', 'to', 'the', 'event'], 'value-some.people.go.to.the.event');
    trie.setKeyValue(['some', 'one', 'went', 'to', 'spain', 'again'], 'value-some.one.went.to.spain.again');

    assert.deepEqual(['value-some.event'], trie.getKeyValue(['some', 'event']));
    assert.deepEqual(['value-some.other.event'], trie.getKeyValue(['some', 'other', 'event']));
    assert.deepEqual(['value-some.event'], trie.getKeyValue(['some', '*']));
    assert.deepEqual(['value-some.other.event'], trie.getKeyValue(['some', '*', 'event']));
  });

  it('should set values with wildcard keys', function() {
    var trie = new lfr.WildcardTrie();

    trie.setKeyValue(['some', 'event'], 'value-some.event');
    trie.setKeyValue(['some', 'other', 'event'], 'value-some.other.event');
    trie.setKeyValue(['some', 'other', 'event', 'i', 'went', 'to'], 'value-some.other.event.i.went.to');
    trie.setKeyValue(['some', '*', 'event'], 'value-some.*.event');

    assert.deepEqual(
      [
        'value-some.other.event',
        'value-some.*.event'
      ],
      trie.getKeyValue(['some', 'other', 'event'])
    );
    assert.deepEqual(['value-some.event'], trie.getKeyValue(['*', 'event']));
  });

  it('should work with string keys', function() {
    var trie = new lfr.WildcardTrie();

    trie.setKeyValue('ab', 'value-ab');
    trie.setKeyValue('acb', 'value-acb');
    trie.setKeyValue('acbd', 'value-acbd');
    trie.setKeyValue('*cb', 'value-*cb');

    assert.deepEqual(['value-ab'], trie.getKeyValue('ab'));
    assert.deepEqual(['value-acb', 'value-*cb'], trie.getKeyValue('acb'));
    assert.deepEqual(['value-acb', 'value-*cb'], trie.getKeyValue('a*b'));
  });
});
