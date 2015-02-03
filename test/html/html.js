'use strict';

describe('html', function() {
  describe('compress', function() {
    it('should simplify doctype', function() {
      var source = fs.readFileSync(__dirname + '/fixture/testSimpleDoctype.html');
      var result = fs.readFileSync(__dirname + '/fixture/testSimpleDoctypeResult.html');
      assert.strictEqual(result.toString(), lfr.html.compress(source.toString()));
    });

    it('should remove comments', function() {
      var source = fs.readFileSync(__dirname + '/fixture/testRemoveComments.html');
      var result = fs.readFileSync(__dirname + '/fixture/testRemoveCommentsResult.html');
      assert.strictEqual(result.toString(), lfr.html.compress(source.toString()));
    });

    it('should remove intertag spaces', function() {
      var source = fs.readFileSync(__dirname + '/fixture/testRemoveIntertagSpaces.html');
      var result = fs.readFileSync(__dirname + '/fixture/testRemoveIntertagSpacesResult.html');
      assert.strictEqual(result.toString(), lfr.html.compress(source.toString()));
    });

    it('should remove multi spaces', function() {
      var source = fs.readFileSync(__dirname + '/fixture/testRemoveMultiSpaces.html');
      var result = fs.readFileSync(__dirname + '/fixture/testRemoveMultiSpacesResult.html');
      assert.strictEqual(result.toString(), lfr.html.compress(source.toString()));
    });

    it('should remove spaces inside tags', function() {
      var source = fs.readFileSync(__dirname + '/fixture/testRemoveSpacesInsideTags.html');
      var result = fs.readFileSync(__dirname + '/fixture/testRemoveSpacesInsideTagsResult.html');
      assert.strictEqual(result.toString(), lfr.html.compress(source.toString()));
    });

    it('should remove surrounding spaces', function() {
      var source = fs.readFileSync(__dirname + '/fixture/testSurroundingSpaces.html');
      var result = fs.readFileSync(__dirname + '/fixture/testSurroundingSpacesResult.html');
      assert.strictEqual(result.toString(), lfr.html.compress(source.toString()));
    });

    it('should compress html', function() {
      var source = fs.readFileSync(__dirname + '/fixture/testCompress.html');
      var result = fs.readFileSync(__dirname + '/fixture/testCompressResult.html');
      assert.strictEqual(result.toString(), lfr.html.compress(source.toString()));
    });

    it('should compress text content', function() {
      assert.strictEqual('foo', lfr.html.compress('   foo   '));
    });
  });
});
