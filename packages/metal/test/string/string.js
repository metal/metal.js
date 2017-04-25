'use strict';

import string from '../../src/string/string';

describe('string', function() {
	it('should compare strings ignoring their case', function() {
		assert.equal(0, string.caseInsensitiveCompare('foo', 'foo'));
		assert.equal(0, string.caseInsensitiveCompare('Foo', 'fOo'));
		assert.equal(-1, string.caseInsensitiveCompare('baR', 'foO'));
		assert.equal(1, string.caseInsensitiveCompare('Foo', 'bAr'));
	});

	it('should compute string hashcode', function() {
		assert.strictEqual(101574, string.hashCode('foo'));
	});

	it('should collapse breaking spaces', function() {
		assert.strictEqual('foo bar', string.collapseBreakingSpaces('   foo   bar   '));
	});

	it('should generate random strings', function() {
		assert.notStrictEqual(string.getRandomString(), string.getRandomString());
	});

	it('should replace interval', function() {
		assert.strictEqual('ae', string.replaceInterval('abcde', 1, 4, ''));
	});

	it('should escape regex', function() {
		var spec = '()[]{}+-?*.$^|,:#<!\\';
		var escapedSpec = '\\' + spec.split('').join('\\');
		assert.strictEqual(escapedSpec, string.escapeRegex(spec));
	});

	describe('unescape entities', function() {
		it('should unescape common entities', function() {
			assert.strictEqual('left & right', string.unescapeEntities('left &amp; right'));
			assert.strictEqual('left arrow < and right arrow >', string.unescapeEntities('left arrow &lt; and right arrow &gt;'));
			assert.strictEqual('"Content is king"', string.unescapeEntities('&quot;Content is king&quot;'));

			assert.strictEqual('left & right', string.unescapeEntitiesUsingDom('left &amp; right'));
			assert.strictEqual('left arrow < and right arrow >', string.unescapeEntitiesUsingDom('left arrow &lt; and right arrow &gt;'));
			assert.strictEqual('"Content is king"', string.unescapeEntitiesUsingDom('&quot;Content is king&quot;'));
		});

		it('should return the same escaped string if no unescaped string has been found', function() {
			assert.strictEqual('&Oacute;', string.unescapeEntities('&Oacute;'));
			assert.strictEqual('&OAcute;', string.unescapeEntitiesUsingDom('&OAcute;'));

			assert.strictEqual('&#xXD;', string.unescapeEntities('&#xXD;'));
			assert.strictEqual('&#xXD;', string.unescapeEntitiesUsingDom('&#xXD;'));
		});

		it('should only unescape a given string if there is a `&` character in it', function() {
			assert.strictEqual('Oacute;', string.unescapeEntities('Oacute;'));
			assert.strictEqual('Oacute;', string.unescapeEntitiesUsingDom('Oacute;'));
		});

		it('should unescape strings with hex format', function() {
			assert.strictEqual('Metal', string.unescapeEntities('&#x4d;&#x65;&#x74;&#x61;&#x6c;'));
			assert.strictEqual('Metal', string.unescapeEntitiesUsingDom('&#x4d;&#x65;&#x74;&#x61;&#x6c;'));
		});

		it('should unescape strings using DOM', function() {
			assert.strictEqual('©', string.unescapeEntitiesUsingDom('&copy;'));
		});
	});
});
