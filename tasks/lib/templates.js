var ComponentElement = '\n/**\n */\n' +
  '{deltemplate ComponentElement variant="\'<%= moduleName %>\'"}\n' +
    '{delcall <%= moduleName %> variant="\'element\'" data="all" /}\n' +
  '{/deltemplate}\n';

var ComponentTemplate = '\n/**\n */\n' +
    '{deltemplate ComponentTemplate variant="\'<%= moduleName %>\'"}\n' +
    '{delcall ComponentElement data="all" variant="\'<%= moduleName %>\'"}\n' +
      '{param elementContent kind="html"}\n' +
        '{call .content data="all" /}\n' +
      '{/param}\n' +
    '{/delcall}\n' +
  '{/deltemplate}\n';

var ModuleName = '\n/**\n * @param? elementContent\n * @param? elementClasses\n * @param id\n */\n' +
  '{deltemplate <%= moduleName %>}\n' +
    '{delcall Component data="all"}\n' +
      '{param componentName: \'<%= moduleName %>\' /}\n' +
    '{/delcall}\n' +
  '{/deltemplate}\n'

var ModuleNameElement = '\n/**\n * @param? elementContent\n * @param? elementClasses\n * @param id\n */\n' +
  '{deltemplate <%= moduleName %> variant="\'element\'"}\n' +
    '<div id="{$id}" class="<%= className %> component{$elementClasses ? \' \' + $elementClasses : \'\'}" data-component="">\n' +
      '{$elementContent}\n' +
    '</div>\n' +
  '{/deltemplate}\n';

var SurfaceElement = '\n/**\n * @param? elementContent\n * @param id\n */\n' +
  '{deltemplate <%= moduleName %>.<%= surfaceName %> variant="\'element\'"}\n' +
    '<div id="{$id}-<%= surfaceName %>">\n' +
      '{$elementContent}\n' +
    '</div>\n' +
  '{/deltemplate}\n'

var Surface = '\n/**\n * @param? elementContent\n * @param id\n */\n' +
  '{deltemplate <%= moduleName %>.<%= surfaceName %>}\n' +
    '{delcall <%= moduleName %>.<%= surfaceName %> variant="\'element\'" data="all"}\n' +
      '{param elementContent kind="html"}\n' +
        '{if not $ij.skipSurfaceContents}\n' +
          '{delcall Surface}\n' +
            '{param content kind="html"}\n' +
              '{call .<%= surfaceName %> data="all" /}\n' +
            '{/param}\n' +
            '{param id: $id + \'-<%= surfaceName %>\' /}\n' +
          '{/delcall}\n' +
        '{/if}\n' +
      '{/param}\n' +
    '{/delcall}\n' +
  '{/deltemplate}\n';

module.exports = {
  ComponentElement: ComponentElement,
  ComponentTemplate: ComponentTemplate,
  ModuleNameElement: ModuleNameElement,
  ModuleName: ModuleName,
  Surface: Surface,
  SurfaceElement: SurfaceElement
};
