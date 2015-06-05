// This file was automatically generated from main.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace main.
 */

if (typeof main == 'undefined') { var main = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
main.page = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Metal.js</title></head><body>' + soy.$$escapeHtml(opt_data.content) + '</body></html>');
};
if (goog.DEBUG) {
  main.page.soyTemplateName = 'main.page';
}
