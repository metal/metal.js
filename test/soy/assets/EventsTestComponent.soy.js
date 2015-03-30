/* jshint ignore:start */
import ComponentRegistry from '../../../src/component/ComponentRegistry';
var Templates = ComponentRegistry.Templates;
// This file was automatically generated from EventsTestComponent.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Templates.EventsTestComponent.
 * @hassoydeltemplate {ComponentElement}
 * @hassoydeltemplate {ComponentTemplate}
 * @hassoydeltemplate {EventsTestComponent}
 * @hassoydeltemplate {EventsTestComponent.footer}
 * @hassoydelcall {Component}
 * @hassoydelcall {ComponentElement}
 * @hassoydelcall {EventsTestComponent}
 * @hassoydelcall {EventsTestComponent.footer}
 * @hassoydelcall {Surface}
 */

if (typeof Templates.EventsTestComponent == 'undefined') { Templates.EventsTestComponent = {}; }


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.EventsTestComponent.content = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div class="content" data-onclick="handleClick" data-onmousedown="handleMouseDown"></div>' + soy.$$getDelegateFn(soy.$$getDelTemplateId('EventsTestComponent.footer'), '', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.EventsTestComponent.content.soyTemplateName = 'Templates.EventsTestComponent.content';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.EventsTestComponent.footer = function(opt_data, opt_ignored, opt_ijData) {
  var output = '';
  var buttonList200 = opt_data.footerButtons;
  var buttonListLen200 = buttonList200.length;
  for (var buttonIndex200 = 0; buttonIndex200 < buttonListLen200; buttonIndex200++) {
    var buttonData200 = buttonList200[buttonIndex200];
    output += '<button data-onclick="handleClick" data-onmouseover="handleMouseOver">$button.label</button>';
  }
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(output);
};
if (goog.DEBUG) {
  Templates.EventsTestComponent.footer.soyTemplateName = 'Templates.EventsTestComponent.footer';
}


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.EventsTestComponent.__deltemplate_s203_45e1aca9 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('Component'), '', true)(soy.$$augmentMap(opt_data, {componentName: 'EventsTestComponent'}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.EventsTestComponent.__deltemplate_s203_45e1aca9.soyTemplateName = 'Templates.EventsTestComponent.__deltemplate_s203_45e1aca9';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('EventsTestComponent'), '', 0, Templates.EventsTestComponent.__deltemplate_s203_45e1aca9);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.EventsTestComponent.__deltemplate_s206_3387fe49 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'EventsTestComponent', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.EventsTestComponent.content(opt_data, null, opt_ijData))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.EventsTestComponent.__deltemplate_s206_3387fe49.soyTemplateName = 'Templates.EventsTestComponent.__deltemplate_s206_3387fe49';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentTemplate'), 'EventsTestComponent', 0, Templates.EventsTestComponent.__deltemplate_s206_3387fe49);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.EventsTestComponent.__deltemplate_s210_fd583dc2 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '" class="eventstestcomponent component' + soy.$$escapeHtmlAttribute(opt_data.elementClasses ? ' ' + opt_data.elementClasses : '') + '" data-component="">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.EventsTestComponent.__deltemplate_s210_fd583dc2.soyTemplateName = 'Templates.EventsTestComponent.__deltemplate_s210_fd583dc2';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('EventsTestComponent'), 'element', 0, Templates.EventsTestComponent.__deltemplate_s210_fd583dc2);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.EventsTestComponent.__deltemplate_s218_8d9ee310 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('EventsTestComponent'), 'element', true)(opt_data, null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.EventsTestComponent.__deltemplate_s218_8d9ee310.soyTemplateName = 'Templates.EventsTestComponent.__deltemplate_s218_8d9ee310';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('ComponentElement'), 'EventsTestComponent', 0, Templates.EventsTestComponent.__deltemplate_s218_8d9ee310);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.EventsTestComponent.__deltemplate_s220_51421bb6 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml('<div id="' + soy.$$escapeHtmlAttribute(opt_data.id) + '-footer">' + soy.$$escapeHtml(opt_data.elementContent) + '</div>');
};
if (goog.DEBUG) {
  Templates.EventsTestComponent.__deltemplate_s220_51421bb6.soyTemplateName = 'Templates.EventsTestComponent.__deltemplate_s220_51421bb6';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('EventsTestComponent.footer'), 'element', 0, Templates.EventsTestComponent.__deltemplate_s220_51421bb6);


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @param {Object.<string, *>=} opt_ijData
 * @return {!soydata.SanitizedHtml}
 * @suppress {checkTypes}
 */
Templates.EventsTestComponent.__deltemplate_s226_d4ce8bf3 = function(opt_data, opt_ignored, opt_ijData) {
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$getDelegateFn(soy.$$getDelTemplateId('EventsTestComponent.footer'), 'element', true)(soy.$$augmentMap(opt_data, {elementContent: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + ((! opt_ijData.skipSurfaceContents) ? soy.$$getDelegateFn(soy.$$getDelTemplateId('Surface'), '', true)({content: soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks('' + Templates.EventsTestComponent.footer(opt_data, null, opt_ijData)), id: opt_data.id + '-footer'}, null, opt_ijData) : ''))}), null, opt_ijData));
};
if (goog.DEBUG) {
  Templates.EventsTestComponent.__deltemplate_s226_d4ce8bf3.soyTemplateName = 'Templates.EventsTestComponent.__deltemplate_s226_d4ce8bf3';
}
soy.$$registerDelegateFn(soy.$$getDelTemplateId('EventsTestComponent.footer'), '', 0, Templates.EventsTestComponent.__deltemplate_s226_d4ce8bf3);

Templates.EventsTestComponent.footer.params = ["footerButtons"];
/* jshint ignore:end */
