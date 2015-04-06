'use strict';

import html from '../../../src/html/html';

describe('html', function() {
	describe('compress', function() {
		it('should simplify doctype', function() {
			var source = __html__['test/src/html/fixture/testSimpleDoctype.html'];
			var result = __html__['test/src/html/fixture/testSimpleDoctypeResult.html'];
			assert.strictEqual(result, html.compress(source));
		});

		it('should remove comments', function() {
			var source = __html__['test/src/html/fixture/testRemoveComments.html'];
			var result = __html__['test/src/html/fixture/testRemoveCommentsResult.html'];
			assert.strictEqual(result, html.compress(source));
		});

		it('should remove intertag spaces', function() {
			var source = __html__['test/src/html/fixture/testRemoveIntertagSpaces.html'];
			var result = __html__['test/src/html/fixture/testRemoveIntertagSpacesResult.html'];
			assert.strictEqual(result, html.compress(source));
		});

		it('should remove multi spaces', function() {
			var source = __html__['test/src/html/fixture/testRemoveMultiSpaces.html'];
			var result = __html__['test/src/html/fixture/testRemoveMultiSpacesResult.html'];
			assert.strictEqual(result, html.compress(source));
		});

		it('should remove spaces inside tags', function() {
			var source = __html__['test/src/html/fixture/testRemoveSpacesInsideTags.html'];
			var result = __html__['test/src/html/fixture/testRemoveSpacesInsideTagsResult.html'];
			assert.strictEqual(result, html.compress(source));
		});

		it('should remove surrounding spaces', function() {
			var source = __html__['test/src/html/fixture/testSurroundingSpaces.html'];
			var result = __html__['test/src/html/fixture/testSurroundingSpacesResult.html'];
			assert.strictEqual(result, html.compress(source));
		});

		it('should compress html', function() {
			var source = __html__['test/src/html/fixture/testCompress.html'];
			var result = __html__['test/src/html/fixture/testCompressResult.html'];
			assert.strictEqual(result, html.compress(source));
		});

		it('should compress text content', function() {
			assert.strictEqual('foo', html.compress('   foo   '));
		});
	});
});
