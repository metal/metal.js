/* jshint ignore:start */
import ComponentRegistry from '../../../../src/component/ComponentRegistry';
var Templates = ComponentRegistry.Templates;
// This file was automatically generated from DeeplyNestedTestComponent.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.DeeplyNestedTestComponent.
 * @hassoydeltemplate {ComponentElement}
 * @hassoydeltemplate {ComponentTemplate}
 * @hassoydeltemplate {DeeplyNestedTestComponent}
 * @hassoydeltemplate {DeeplyNestedTestComponent.components}
 * @hassoydelcall {ChildrenTestComponent}
 * @hassoydelcall {Component}
 * @hassoydelcall {ComponentElement}
 * @hassoydelcall {DeeplyNestedTestComponent}
 * @hassoydelcall {DeeplyNestedTestComponent.components}
 * @hassoydelcall {EventsTestComponent}
 * @hassoydelcall {NestedTestComponent}
 * @hassoydelcall {Surface}
 */

if (typeof Templates.DeeplyNestedTestComponent == 'undefined') { Templates.DeeplyNestedTestComponent = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.DeeplyNestedTestComponent.content = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('DeeplyNestedTestComponent.components'), '', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.DeeplyNestedTestComponent.content.soyTemplateName = 'Templates.DeeplyNestedTestComponent.content';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.DeeplyNestedTestComponent.components = function(opt_data, opt_ignored, opt_ijData) {
  var output = '';
  var child2__soy139 = '' + soy.$$getDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent'), '', true)({bar: opt_data.bar, children: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + soy.$$getDelegateFn(soy.$$getDelTemplateId('NestedTestComponent'), '', true)({count: 1, id: opt_data.id + '-child1'}, null, opt_ijData)), id: opt_data.id + '-child2'}, null, opt_ijData);
  child2__soy139 = soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks(child2__soy139);
  var child3__soy147 = '' + soy.$$getDelegateFn(soy.$$getDelTemplateId('EventsTestComponent'), '', true)({footerButtons: opt_data.footerButtons, id: opt_data.id + '-child3'}, null, opt_ijData);
  child3__soy147 = soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks(child3__soy147);
  output += soy.$$getDelegateFn(soy.$$getDelTemplateId('ChildrenTestComponent'), '', true)({bar: opt_data.bar, children: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + ((opt_data.invert) ? soy.$$escapeHtml(child3__soy147) + soy.$$escapeHtml(child2__soy139) : soy.$$escapeHtml(child2__soy139) + soy.$$escapeHtml(child3__soy147))), id: opt_data.id + '-main'}, null, opt_ijData) + '%%%%~comp-nonExisting~%%%%';
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(output);
};
if (goog.DEBUG) {
  Templates.DeeplyNestedTestComponent.components.soyTemplateName = 'Templates.DeeplyNestedTestComponent.components';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.DeeplyNestedTestComponent.__deltemplate_s163_8efabc7f = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('Component'), '', true)(soy.$$augmentMap(opt_data, {componentName: 'DeeplyNestedTestComponent'}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.DeeplyNestedTestComponent.__deltemplate_s163_8efabc7f.soyTemplateName = 'Templates.DeeplyNestedTestComponent.__deltemplate_s163_8efabc7f';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('DeeplyNestedTestComponent'), '', 0, Templates.DeeplyNestedTestComponent.__deltemplate_s163_8efabc7f);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.DeeplyNestedTestComponent.__deltemplate_s166_06cad6ce = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'DeeplyNestedTestComponent', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.DeeplyNestedTestComponent.content(opt_data, null, opt_ijData))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.DeeplyNestedTestComponent.__deltemplate_s166_06cad6ce.soyTemplateName = 'Templates.DeeplyNestedTestComponent.__deltemplate_s166_06cad6ce';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentTemplate'), 'DeeplyNestedTestComponent', 0, Templates.DeeplyNestedTestComponent.__deltemplate_s166_06cad6ce);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.DeeplyNestedTestComponent.__deltemplate_s170_df97559a = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" class="deeplynestedtestcomponent component' + soy.$$escapeHtmlAttribute(opt_data.elementClasses ? ' ' + opt_data.elementClasses : '') + '" data-component="">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.DeeplyNestedTestComponent.__deltemplate_s170_df97559a.soyTemplateName = 'Templates.DeeplyNestedTestComponent.__deltemplate_s170_df97559a';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('DeeplyNestedTestComponent'), 'element', 0, Templates.DeeplyNestedTestComponent.__deltemplate_s170_df97559a);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.DeeplyNestedTestComponent.__deltemplate_s178_361badd6 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('DeeplyNestedTestComponent'), 'element', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.DeeplyNestedTestComponent.__deltemplate_s178_361badd6.soyTemplateName = 'Templates.DeeplyNestedTestComponent.__deltemplate_s178_361badd6';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'DeeplyNestedTestComponent', 0, Templates.DeeplyNestedTestComponent.__deltemplate_s178_361badd6);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.DeeplyNestedTestComponent.__deltemplate_s180_c6abf237 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-components">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.DeeplyNestedTestComponent.__deltemplate_s180_c6abf237.soyTemplateName = 'Templates.DeeplyNestedTestComponent.__deltemplate_s180_c6abf237';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('DeeplyNestedTestComponent.components'), 'element', 0, Templates.DeeplyNestedTestComponent.__deltemplate_s180_c6abf237);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.DeeplyNestedTestComponent.__deltemplate_s186_d76ee0db = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('DeeplyNestedTestComponent.components'), 'element', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + ((! opt_ijData.skipSurfaceContents) ? soy.$$getDelegateFn(soy.$$getDelTemplateId('Surface'), '', true)({content: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.DeeplyNestedTestComponent.components(opt_data, null, opt_ijData)), id: opt_data.id + '-components'}, null, opt_ijData) : ''))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.DeeplyNestedTestComponent.__deltemplate_s186_d76ee0db.soyTemplateName = 'Templates.DeeplyNestedTestComponent.__deltemplate_s186_d76ee0db';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('DeeplyNestedTestComponent.components'), '', 0, Templates.DeeplyNestedTestComponent.__deltemplate_s186_d76ee0db);

Templates.DeeplyNestedTestComponent.components.params = ["bar","footerButtons","id","invert"];
/* jshint ignore:end */
