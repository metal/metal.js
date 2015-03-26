'use strict';

import html from '../html/html';
import ComponentRegistry from '../component/ComponentRegistry';
import Disposable from '../disposable/Disposable';

class ComponentCollector extends Disposable {
  constructor() {
    super();
  }

  /**
   * Creates the appropriate component from the given config data if it doesn't
   * exist yet, or updates an existing instance with the new attributes.
   * @param {string} componentName The name of the component to be extracted.
   * @param {!Object} data The component's config data.
   * @return {!Component} The extracted component instance.
   */
  createOrUpdateComponent(componentName, data) {
    var component = ComponentCollector.components[data.id];
    if (component) {
      component.setAttrs(data);
    } else {
      var ConstructorFn = ComponentRegistry.getConstructor(componentName);
      data.element = '#' + data.id;
      component = new ConstructorFn(data);
      ComponentCollector.components[data.id] = component;
    }
    return component;
  }

  /**
   * Handles the given string of rendered templates, converting them to
   * component instances.
   * @param {string} renderedComponents Rendered components.
   * @return {!Array<!Component>}
   */
  extractComponentsFromString(renderedComponents) {
    var components = [];
    var content = html.removeElementContent(renderedComponents.toString(), ' data-component');
    var regex = /\sid=(?:["'\s])?([^"']+)\1?/g;
    var match = regex.exec(content);
    while(match) {
      if (match && match.length === 2) {
        var id = match[1];
        var component = ComponentCollector.components[id];
        if (component) {
          components.push(component);
        }
        match = regex.exec(content);
      }
    }
    return components;
  }
}

/**
 * Holds all collected components, indexed by their id.
 * @type {!Object<string, !Component>}
 */
ComponentCollector.components = {};

export default ComponentCollector;
