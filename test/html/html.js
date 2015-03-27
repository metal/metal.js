'use strict';

import html from '../../src/html/html';

describe('html', function() {
  describe('compress', function() {
    it('should simplify doctype', function() {
      var source = __html__['test/html/fixture/testSimpleDoctype.html'];
      var result = __html__['test/html/fixture/testSimpleDoctypeResult.html'];
      assert.strictEqual(result, html.compress(source));
    });

    it('should remove comments', function() {
      var source = __html__['test/html/fixture/testRemoveComments.html'];
      var result = __html__['test/html/fixture/testRemoveCommentsResult.html'];
      assert.strictEqual(result, html.compress(source));
    });

    it('should remove intertag spaces', function() {
      var source = __html__['test/html/fixture/testRemoveIntertagSpaces.html'];
      var result = __html__['test/html/fixture/testRemoveIntertagSpacesResult.html'];
      assert.strictEqual(result, html.compress(source));
    });

    it('should remove multi spaces', function() {
      var source = __html__['test/html/fixture/testRemoveMultiSpaces.html'];
      var result = __html__['test/html/fixture/testRemoveMultiSpacesResult.html'];
      assert.strictEqual(result, html.compress(source));
    });

    it('should remove spaces inside tags', function() {
      var source = __html__['test/html/fixture/testRemoveSpacesInsideTags.html'];
      var result = __html__['test/html/fixture/testRemoveSpacesInsideTagsResult.html'];
      assert.strictEqual(result, html.compress(source));
    });

    it('should remove surrounding spaces', function() {
      var source = __html__['test/html/fixture/testSurroundingSpaces.html'];
      var result = __html__['test/html/fixture/testSurroundingSpacesResult.html'];
      assert.strictEqual(result, html.compress(source));
    });

    it('should compress html', function() {
      var source = __html__['test/html/fixture/testCompress.html'];
      var result = __html__['test/html/fixture/testCompressResult.html'];
      assert.strictEqual(result, html.compress(source));
    });

    it('should compress text content', function() {
      assert.strictEqual('foo', html.compress('   foo   '));
    });
  });
});
