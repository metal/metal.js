(function() {
  'use strict';

  lfr.html = lfr.html || {};

  /**
   * HTML regex patterns.
   * @enum {RegExp}
   * @protected
   */
  lfr.html.Patterns = {
    /**
     * @type {RegExp}
     */
    INTERTAG_CUSTOM_CUSTOM: /~%%%\s+%%%~/g,

    /**
     * @type {RegExp}
     */
    INTERTAG_TAG_CUSTOM: />\s+%%%~/g,

    /**
     * @type {RegExp}
     */
    INTERTAG_CUSTOM_TAG: /~%%%\s+</g,

    /**
     * @type {RegExp}
     */
    INTERTAG_TAG: />\s+</g,

    /**
     * @type {RegExp}
     */
    SURROUNDING_SPACES: /\s*(<[^>]+>)\s*/g,

    /**
     * @type {RegExp}
     */
    TAG_END_SPACES: /(<(?:[^>]+?))(?:\s+?)(\/?>)/g,

    /**
     * @type {RegExp}
     */
    TAG_QUOTE_SPACES: /\s*=\s*(["']?)\s*(.*?)\s*(\1)/g
  };

  /**
   * Minifies given HTML source by removing extra white spaces, comments and
   * other unneeded characters without breaking the content structure. As a
   * result HTML become smaller in size.
   * - Contents within <code>, <pre>, <script>, <style>, <textarea> and
   *   conditional comments tags are preserved.
   * - Comments are removed.
   * - Conditional comments are preserved.
   * - Breaking spaces are collapsed into a single space.
   * - Unneeded spaces inside tags (around = and before />) are removed.
   * - Spaces between tags are removed, even from inline-block elements.
   * - Spaces surrounding tags are removed.
   * - DOCTYPE declaration is simplified to <!DOCTYPE html>.
   * - Does not remove default attributes from <script>, <style>, <link>,
   *   <form>, <input>.
   * - Does not remove values from boolean tag attributes.
   * - Does not remove "javascript:" from in-line event handlers.
   * - Does not remove http:// and https:// protocols.
   * @param {string} html Input HTML to be compressed.
   * @return {string} Compressed version of the HTML.
   */
  lfr.html.compress = function(html) {
    var preserved = {};
    html = lfr.html.preserveBlocks_(html, preserved);
    html = lfr.html.simplifyDoctype_(html);
    html = lfr.html.removeComments_(html);
    html = lfr.html.removeIntertagSpaces_(html);
    html = lfr.html.collapseBreakingSpaces_(html);
    html = lfr.html.removeSpacesInsideTags_(html);
    html = lfr.html.removeSurroundingSpaces_(html);
    html = lfr.html.returnBlocks_(html, preserved);
    return html.trim();
  };

  /**
   * Collapses breaking spaces into a single space.
   * @param {string} html
   * @return {string}
   * @protected
   */
  lfr.html.collapseBreakingSpaces_ = function(html) {
    return lfr.string.collapseBreakingSpaces(html);
  };

  /**
   * Searches for first occurrence of the specified open tag string pattern
   * and from that point finds next ">" position, identified as possible tag
   * end position.
   * @param {string} html
   * @param {string} openTag Open tag string pattern without open tag ending
   *     character, e.g. "<textarea" or "<code".
   * @return {string}
   * @protected
   */
  lfr.html.lookupPossibleTagEnd_ = function(html, openTag) {
    var tagPos = html.indexOf(openTag);
    if (tagPos > -1) {
      tagPos += html.substring(tagPos).indexOf('>') + 1;
    }
    return tagPos;
  };

  /**
   * Preserves contents inside any <code>, <pre>, <script>, <style>,
   * <textarea> and conditional comment tags. When preserved, original content
   * are replaced with an unique generated block id and stored into
   * `preserved` map.
   * @param {string} html
   * @param {Object} preserved Object to preserve the content indexed by an
   *     unique generated block id.
   * @return {html} The preserved HTML.
   * @protected
   */
  lfr.html.preserveBlocks_ = function(html, preserved) {
    html = lfr.html.preserveOuterHtml_(html, '<!--[if', '<![endif]-->', preserved);
    html = lfr.html.preserveInnerHtml_(html, '<code', '</code', preserved);
    html = lfr.html.preserveInnerHtml_(html, '<pre', '</pre', preserved);
    html = lfr.html.preserveInnerHtml_(html, '<script', '</script', preserved);
    html = lfr.html.preserveInnerHtml_(html, '<style', '</style', preserved);
    html = lfr.html.preserveInnerHtml_(html, '<textarea', '</textarea', preserved);
    return html;
  };

  /**
   * Preserves inner contents inside the specified tag. When preserved,
   * original content are replaced with an unique generated block id and
   * stored into `preserved` map.
   * @param {string} html
   * @param {string} openTag Open tag string pattern without open tag ending
   *     character, e.g. "<textarea" or "<code".
   * @param {string} closeTag Close tag string pattern without close tag
   *     ending character, e.g. "</textarea" or "</code".
   * @param {Object} preserved Object to preserve the content indexed by an
   *     unique generated block id.
   * @return {html} The preserved HTML.
   * @protected
   */
  lfr.html.preserveInnerHtml_ = function(html, openTag, closeTag, preserved) {
    var tagPosEnd = lfr.html.lookupPossibleTagEnd_(html, openTag);
    while (tagPosEnd > -1) {
      var tagEndPos = html.indexOf(closeTag);
      html = lfr.html.preserveInterval_(html, tagPosEnd, tagEndPos, preserved);
      html = html.replace(openTag, '%%%~1~%%%');
      html = html.replace(closeTag, '%%%~2~%%%');
      tagPosEnd = lfr.html.lookupPossibleTagEnd_(html, openTag);
    }
    html = html.replace(/%%%~1~%%%/g, openTag);
    html = html.replace(/%%%~2~%%%/g, closeTag);
    return html;
  };

  /**
   * Preserves interval of the specified HTML into the preserved map replacing
   * original contents with an unique generated id.
   * @param {string} html
   * @param {Number} start Start interval position to be replaced.
   * @param {Number} end End interval position to be replaced.
   * @param {Object} preserved Object to preserve the content indexed by an
   *     unique generated block id.
   * @return {string} The HTML with replaced interval.
   * @protected
   */
  lfr.html.preserveInterval_ = function(html, start, end, preserved) {
    var blockId = '%%%~BLOCK~' + lfr.getUid() + '~%%%';
    preserved[blockId] = html.substring(start, end);
    return lfr.string.replaceInterval(html, start, end, blockId);
  };

  /**
   * Preserves outer contents inside the specified tag. When preserved,
   * original content are replaced with an unique generated block id and
   * stored into `preserved` map.
   * @param {string} html
   * @param {string} openTag Open tag string pattern without open tag ending
   *     character, e.g. "<textarea" or "<code".
   * @param {string} closeTag Close tag string pattern without close tag
   *     ending character, e.g. "</textarea" or "</code".
   * @param {Object} preserved Object to preserve the content indexed by an
   *     unique generated block id.
   * @return {html} The preserved HTML.
   * @protected
   */
  lfr.html.preserveOuterHtml_ = function(html, openTag, closeTag, preserved) {
    var tagPos = html.indexOf(openTag);
    while (tagPos > -1) {
      var tagEndPos = html.indexOf(closeTag) + closeTag.length;
      html = lfr.html.preserveInterval_(html, tagPos, tagEndPos, preserved);
      tagPos = html.indexOf(openTag);
    }
    return html;
  };

  /**
   * Removes all comments of the HTML. Including conditional comments and
   * "<![CDATA[" blocks.
   * @param {string} html
   * @return {string} The HTML without comments.
   * @protected
   */
  lfr.html.removeComments_ = function(html) {
    var preserved = {};
    html = lfr.html.preserveOuterHtml_(html, '<![CDATA[', ']]>', preserved);
    html = lfr.html.preserveOuterHtml_(html, '<!--', '-->', preserved);
    html = lfr.html.replacePreservedBlocks_(html, preserved, '');
    return html;
  };

  /**
   * Removes spaces between tags, even from inline-block elements.
   * @param {string} html
   * @return {string} The HTML without spaces between tags.
   * @protected
   */
  lfr.html.removeIntertagSpaces_ = function(html) {
    html = html.replace(lfr.html.Patterns.INTERTAG_CUSTOM_CUSTOM, '~%%%%%%~');
    html = html.replace(lfr.html.Patterns.INTERTAG_CUSTOM_TAG, '~%%%<');
    html = html.replace(lfr.html.Patterns.INTERTAG_TAG, '><');
    html = html.replace(lfr.html.Patterns.INTERTAG_TAG_CUSTOM, '>%%%~');
    return html;
  };

  /**
   * Removes spaces inside tags.
   * @param {string} html
   * @return {string} The HTML without spaces inside tags.
   * @protected
   */
  lfr.html.removeSpacesInsideTags_ = function(html) {
    html = html.replace(lfr.html.Patterns.TAG_END_SPACES, '$1$2');
    html = html.replace(lfr.html.Patterns.TAG_QUOTE_SPACES, '=$1$2$3');
    return html;
  };

  /**
   * Removes spaces surrounding tags.
   * @param {string} html
   * @return {string} The HTML without spaces surrounding tags.
   * @protected
   */
  lfr.html.removeSurroundingSpaces_ = function(html) {
    return html.replace(lfr.html.Patterns.SURROUNDING_SPACES, '$1');
  };

  /**
   * Restores preserved map keys inside the HTML. Note that the passed HTML
   * should contain the unique generated block ids to be replaced.
   * @param {string} html
   * @param {Object} preserved Object to preserve the content indexed by an
   *     unique generated block id.
   * @param {string} replaceValue The value to replace any block id inside the
   * HTML.
   * @return {string}
   * @protected
   */
  lfr.html.replacePreservedBlocks_ = function(html, preserved, replaceValue) {
    for (var blockId in preserved) {
      html = html.replace(blockId, replaceValue);
    }
    return html;
  };

  /**
   * Simplifies DOCTYPE declaration to <!DOCTYPE html>.
   * @param {string} html
   * @return {string}
   * @protected
   */
  lfr.html.simplifyDoctype_ = function(html) {
    var preserved = {};
    html = lfr.html.preserveOuterHtml_(html, '<!DOCTYPE', '>', preserved);
    html = lfr.html.replacePreservedBlocks_(html, preserved, '<!DOCTYPE html>');
    return html;
  };

  /**
   * Restores preserved map original contents inside the HTML. Note that the
   * passed HTML should contain the unique generated block ids to be restored.
   * @param {string} html
   * @param {Object} preserved Object to preserve the content indexed by an
   *     unique generated block id.
   * @return {string}
   * @protected
   */
  lfr.html.returnBlocks_ = function(html, preserved) {
    for (var blockId in preserved) {
      html = html.replace(blockId, preserved[blockId]);
    }
    return html;
  };

}());
