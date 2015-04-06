'use strict';

import core from '../core';
import string from '../string/string';

class html {
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
	 * @param {string} htmlString Input HTML to be compressed.
	 * @return {string} Compressed version of the HTML.
	 */
	static compress(htmlString) {
		var preserved = {};
		htmlString = html.preserveBlocks_(htmlString, preserved);
		htmlString = html.simplifyDoctype_(htmlString);
		htmlString = html.removeComments_(htmlString);
		htmlString = html.removeIntertagSpaces_(htmlString);
		htmlString = html.collapseBreakingSpaces_(htmlString);
		htmlString = html.removeSpacesInsideTags_(htmlString);
		htmlString = html.removeSurroundingSpaces_(htmlString);
		htmlString = html.returnBlocks_(htmlString, preserved);
		return htmlString.trim();
	}

	/**
	 * Collapses breaking spaces into a single space.
	 * @param {string} htmlString
	 * @return {string}
	 * @protected
	 */
	static collapseBreakingSpaces_(htmlString) {
		return string.collapseBreakingSpaces(htmlString);
	}

	/**
	 * Searches for first occurrence of the specified open tag string pattern
	 * and from that point finds next ">" position, identified as possible tag
	 * end position.
	 * @param {string} htmlString
	 * @param {string} openTag Open tag string pattern without open tag ending
	 *     character, e.g. "<textarea" or "<code".
	 * @return {string}
	 * @protected
	 */
	static lookupPossibleTagBoundary_(htmlString, openTag) {
		var tagPos = htmlString.indexOf(openTag);
		if (tagPos > -1) {
			tagPos += htmlString.substring(tagPos).indexOf('>') + 1;
		}
		return tagPos;
	}

	/**
	 * Preserves contents inside any <code>, <pre>, <script>, <style>,
	 * <textarea> and conditional comment tags. When preserved, original content
	 * are replaced with an unique generated block id and stored into
	 * `preserved` map.
	 * @param {string} htmlString
	 * @param {Object} preserved Object to preserve the content indexed by an
	 *     unique generated block id.
	 * @return {html} The preserved HTML.
	 * @protected
	 */
	static preserveBlocks_(htmlString, preserved) {
		htmlString = html.preserveOuterHtml_(htmlString, '<!--[if', '<![endif]-->', preserved);
		htmlString = html.preserveInnerHtml_(htmlString, '<code', '</code', preserved);
		htmlString = html.preserveInnerHtml_(htmlString, '<pre', '</pre', preserved);
		htmlString = html.preserveInnerHtml_(htmlString, '<script', '</script', preserved);
		htmlString = html.preserveInnerHtml_(htmlString, '<style', '</style', preserved);
		htmlString = html.preserveInnerHtml_(htmlString, '<textarea', '</textarea', preserved);
		return htmlString;
	}

	/**
	 * Preserves inner contents inside the specified tag. When preserved,
	 * original content are replaced with an unique generated block id and
	 * stored into `preserved` map.
	 * @param {string} htmlString
	 * @param {string} openTag Open tag string pattern without open tag ending
	 *     character, e.g. "<textarea" or "<code".
	 * @param {string} closeTag Close tag string pattern without close tag
	 *     ending character, e.g. "</textarea" or "</code".
	 * @param {Object} preserved Object to preserve the content indexed by an
	 *     unique generated block id.
	 * @return {html} The preserved HTML.
	 * @protected
	 */
	static preserveInnerHtml_(htmlString, openTag, closeTag, preserved) {
		var tagPosEnd = html.lookupPossibleTagBoundary_(htmlString, openTag);
		while (tagPosEnd > -1) {
			var tagEndPos = htmlString.indexOf(closeTag);
			htmlString = html.preserveInterval_(htmlString, tagPosEnd, tagEndPos, preserved);
			htmlString = htmlString.replace(openTag, '%%%~1~%%%');
			htmlString = htmlString.replace(closeTag, '%%%~2~%%%');
			tagPosEnd = html.lookupPossibleTagBoundary_(htmlString, openTag);
		}
		htmlString = htmlString.replace(/%%%~1~%%%/g, openTag);
		htmlString = htmlString.replace(/%%%~2~%%%/g, closeTag);
		return htmlString;
	}

	/**
	 * Preserves interval of the specified HTML into the preserved map replacing
	 * original contents with an unique generated id.
	 * @param {string} htmlString
	 * @param {Number} start Start interval position to be replaced.
	 * @param {Number} end End interval position to be replaced.
	 * @param {Object} preserved Object to preserve the content indexed by an
	 *     unique generated block id.
	 * @return {string} The HTML with replaced interval.
	 * @protected
	 */
	static preserveInterval_(htmlString, start, end, preserved) {
		var blockId = '%%%~BLOCK~' + core.getUid() + '~%%%';
		preserved[blockId] = htmlString.substring(start, end);
		return string.replaceInterval(htmlString, start, end, blockId);
	}

	/**
	 * Preserves outer contents inside the specified tag. When preserved,
	 * original content are replaced with an unique generated block id and
	 * stored into `preserved` map.
	 * @param {string} htmlString
	 * @param {string} openTag Open tag string pattern without open tag ending
	 *     character, e.g. "<textarea" or "<code".
	 * @param {string} closeTag Close tag string pattern without close tag
	 *     ending character, e.g. "</textarea" or "</code".
	 * @param {Object} preserved Object to preserve the content indexed by an
	 *     unique generated block id.
	 * @return {html} The preserved HTML.
	 * @protected
	 */
	static preserveOuterHtml_(htmlString, openTag, closeTag, preserved) {
		var tagPos = htmlString.indexOf(openTag);
		while (tagPos > -1) {
			var tagEndPos = htmlString.indexOf(closeTag) + closeTag.length;
			htmlString = html.preserveInterval_(htmlString, tagPos, tagEndPos, preserved);
			tagPos = htmlString.indexOf(openTag);
		}
		return htmlString;
	}

	/**
	 * Removes all comments of the HTML. Including conditional comments and
	 * "<![CDATA[" blocks.
	 * @param {string} htmlString
	 * @return {string} The HTML without comments.
	 * @protected
	 */
	static removeComments_(htmlString) {
		var preserved = {};
		htmlString = html.preserveOuterHtml_(htmlString, '<![CDATA[', ']]>', preserved);
		htmlString = html.preserveOuterHtml_(htmlString, '<!--', '-->', preserved);
		htmlString = html.replacePreservedBlocks_(htmlString, preserved, '');
		return htmlString;
	}

	/**
	 * Removes spaces between tags, even from inline-block elements.
	 * @param {string} htmlString
	 * @return {string} The HTML without spaces between tags.
	 * @protected
	 */
	static removeIntertagSpaces_(htmlString) {
		htmlString = htmlString.replace(html.Patterns.INTERTAG_CUSTOM_CUSTOM, '~%%%%%%~');
		htmlString = htmlString.replace(html.Patterns.INTERTAG_CUSTOM_TAG, '~%%%<');
		htmlString = htmlString.replace(html.Patterns.INTERTAG_TAG, '><');
		htmlString = htmlString.replace(html.Patterns.INTERTAG_TAG_CUSTOM, '>%%%~');
		return htmlString;
	}

	/**
	 * Removes spaces inside tags.
	 * @param {string} htmlString
	 * @return {string} The HTML without spaces inside tags.
	 * @protected
	 */
	static removeSpacesInsideTags_(htmlString) {
		htmlString = htmlString.replace(html.Patterns.TAG_END_SPACES, '$1$2');
		htmlString = htmlString.replace(html.Patterns.TAG_QUOTE_SPACES, '=$1$2$3');
		return htmlString;
	}

	/**
	 * Removes spaces surrounding tags.
	 * @param {string} htmlString
	 * @return {string} The HTML without spaces surrounding tags.
	 * @protected
	 */
	static removeSurroundingSpaces_(htmlString) {
		return htmlString.replace(html.Patterns.SURROUNDING_SPACES, '$1');
	}

	/**
	 * Restores preserved map keys inside the HTML. Note that the passed HTML
	 * should contain the unique generated block ids to be replaced.
	 * @param {string} htmlString
	 * @param {Object} preserved Object to preserve the content indexed by an
	 *     unique generated block id.
	 * @param {string} replaceValue The value to replace any block id inside the
	 * HTML.
	 * @return {string}
	 * @protected
	 */
	static replacePreservedBlocks_(htmlString, preserved, replaceValue) {
		for (var blockId in preserved) {
			htmlString = htmlString.replace(blockId, replaceValue);
		}
		return htmlString;
	}

	/**
	 * Simplifies DOCTYPE declaration to <!DOCTYPE html>.
	 * @param {string} htmlString
	 * @return {string}
	 * @protected
	 */
	static simplifyDoctype_(htmlString) {
		var preserved = {};
		htmlString = html.preserveOuterHtml_(htmlString, '<!DOCTYPE', '>', preserved);
		htmlString = html.replacePreservedBlocks_(htmlString, preserved, '<!DOCTYPE html>');
		return htmlString;
	}

	/**
	 * Restores preserved map original contents inside the HTML. Note that the
	 * passed HTML should contain the unique generated block ids to be restored.
	 * @param {string} htmlString
	 * @param {Object} preserved Object to preserve the content indexed by an
	 *     unique generated block id.
	 * @return {string}
	 * @protected
	 */
	static returnBlocks_(htmlString, preserved) {
		for (var blockId in preserved) {
			htmlString = htmlString.replace(blockId, preserved[blockId]);
		}
		return htmlString;
	}
}

/**
 * HTML regex patterns.
 * @enum {RegExp}
 * @protected
 */
html.Patterns = {
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

export default html;
