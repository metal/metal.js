'use strict';

import Trie from '../../src/structs/Trie';

describe('Trie', function() {
  it('should normalize keys', function() {
    var trie = new Trie();

    assert.deepEqual(['a', '@', 'b', '2'], trie.normalizeKey('a@b2'));
    assert.deepEqual(['1', '2'], trie.normalizeKey(['1', '2']));
  });

  it('should set and get value', function() {
    var trie = new Trie();

    assert.ok(!trie.getValue());

    trie.setValue('a');
    assert.strictEqual('a', trie.getValue());
  });

  it('should set and get value through constructor', function() {
    var trie = new Trie('a');
    assert.strictEqual('a', trie.getValue());
  });

  it('should set and get children', function() {
    var child1 = new Trie();
    var child2 = new Trie();
    var trie = new Trie();

    assert.ok(!trie.getChild('1'));
    assert.ok(!trie.getChild('2'));

    trie.setChild('1', child1);
    trie.setChild('2', child2);

    assert.strictEqual(child1, trie.getChild('1'));
    assert.strictEqual(child2, trie.getChild('2'));
    assert.ok(!trie.getChild('3'));
  });

  it('should get all children', function() {
    var child1 = new Trie();
    var child2 = new Trie();
    var trie = new Trie();

    trie.setChild('1', child1);
    trie.setChild('2', child2);

    var children = trie.getAllChildren();
    assert.strictEqual(2, children.length);
    assert.strictEqual(child1, children[0]);
    assert.strictEqual(child2, children[1]);
  });

  it('should set values for string keys', function() {
    var trie = new Trie();

    trie.setKeyValue('abc', 'abcValue');
    assert.strictEqual('abcValue', trie.getKeyValue('abc'));

    trie.setKeyValue('az', 'azValue');
    assert.strictEqual('azValue', trie.getKeyValue('az'));

    trie.setKeyValue('cba', 'cbaValue');
    assert.strictEqual('cbaValue', trie.getKeyValue('cba'));
  });

  it('should set values for array keys', function() {
    var trie = new Trie();

    trie.setKeyValue(['abc', 'def'], '1');
    trie.setKeyValue(['abc', 'z'], '2');

    assert.ok(trie.getChild('abc').getChild('def'));
    assert.ok(!trie.getKeyValue('a'));
    assert.strictEqual('1', trie.getKeyValue(['abc', 'def']));
    assert.strictEqual('2', trie.getKeyValue(['abc', 'z']));
  });

  it('should override existing values', function() {
    var trie = new Trie();

    trie.setKeyValue('abc', ['1']);
    trie.setKeyValue('abc', ['2']);

    assert.deepEqual(['2'], trie.getKeyValue('abc'));
  });

  it('should merge existing values', function() {
    var trie = new Trie();
    var mergeFn = function(value1, value2) {
      return value1.concat(value2);
    };

    trie.setKeyValue('abc', ['1'], mergeFn);
    trie.setKeyValue('abc', ['2'], mergeFn);

    assert.deepEqual(['1', '2'], trie.getKeyValue('abc'));
  });

  it('should clear the trie', function() {
    var trie = new Trie();

    trie.setKeyValue('abc', 'abcValue');
    trie.setKeyValue('az', 'azValue');

    trie.clear();

    assert.ok(!trie.getKeyValue('abc'));
    assert.ok(!trie.getKeyValue('az'));
  });

  it('should dispose children on dispose', function() {
    var trie = new Trie([]);

    trie.setKeyValue('ab', 'abValue');
    trie.setKeyValue('cd', 'cdValue');

    var childA = trie.getChild('a');
    var childC = trie.getChild('c');

    trie.dispose();
    assert.ok(childA.isDisposed());
    assert.ok(childC.isDisposed());
    assert.ok(!trie.children_);
  });

  it('should clear value on dispose', function() {
    var trie = new Trie([]);

    trie.dispose();
    assert.ok(!trie.getValue());
  });
});
