'use strict';

import core from '../core';
import dom from '../dom/dom';
import ComponentRegistry from '../component/ComponentRegistry';
import Disposable from '../disposable/Disposable';

class ComponentCollector extends Disposable {
  constructor() {
    super();

    /**
     * Holds the extracted components, indexed by id.
     * @type {!Object<string, !Component>}
     * @protected
     */
    this.components_ = {};

    /**
     * Holds the root extracted components (that is, components that are
     * not children of other extracted components), indexed by id.
     * @type {!Object<string, !Component>}
     * @protected
     */
    this.rootComponents_ = {};

    /**
     * Flag indicating if new components should be decorated instead of
     * rendered.
     * @type {boolean}
     * @protected
     */
    this.shouldDecorate_ = false;
  }

  /**
   * Creates a component instance.
   * @param {string} id The component id.
   * @param {string} name The component name.
   * @param {!Object} data The component config data.
   * @return {!Component} The created component instance.
   * @protected
   */
  createComponent_(id, name, data) {
    var ConstructorFn = ComponentRegistry.getConstructor(name);
    data.element = data.element ? data.element : '#' + id;
    this.components_[id] = new ConstructorFn(data);
    return this.components_[id];
  }

  /**
   * Creates a root component instance.
   * @param {string} id The component id.
   * @param {string} name The component name.
   * @param {!Object} data The component config data.
   * @param {Element} element The component's element.
   * @protected
   */
  createRootComponent_(id, name, data, element) {
    data.element = element;
    this.rootComponents_[id] = this.createComponent_(id, name, data);

    if (this.shouldDecorate_ && element.childNodes.length > 0) {
      this.rootComponents_[id].decorate();
    } else {
      this.rootComponents_[id].render();
    }
  }

  /**
   * Gets all the extracted components.
   * @return {!Array<!Component>}
   */
  getComponents() {
    return this.components_;
  }

  /**
   * Gets all the root extracted components.
   * @return {!Array<!Component>}
   */
  getRootComponents() {
    return this.rootComponents_;
  }

  /**
   * Extracts components from the given element.
   * @param {!Element} element
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ids.
   * @return {!Object<string, !Object>} The original `componentData` object.
   */
  extractComponents(element, componentData) {
    if (element.hasAttribute && element.hasAttribute('data-component')) {
      this.extractRootComponent_(element, componentData);
    }
    return componentData;
  }

  /**
   * Extracts a component from the given element.
   * @param {!Element} element Element that represents a component that should
   *   be extracted.
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ids.
   * @protected
   */
  extractRootComponent_(element, componentData) {
    var id = element.id;
    var data = componentData[id];
    if (!data) {
      return;
    }

    this.extractSubcomponents(data, componentData);

    if (this.components_[id]) {
      this.updateRootComponent_(id, data.data, element);
    } else {
      this.createRootComponent_(id, data.componentName, data.data, element);
    }
  }

  /**
   * Handles a subcomponent, creating it for the first time or updating it in
   * case it doesn't exist yet.
   * @param {!Object} data The subcomponent's template call data.
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ids.
   * @return {!Component} The subcomponent's instance.
   * @protected
   */
  extractSubcomponent_(data, componentData) {
    this.extractSubcomponents(data, componentData);

    var id = data.data.id;
    var component = this.components_[id];
    if (component) {
      component.setAttrs(data.data);
    } else {
      component = this.createComponent_(id, data.componentName, data.data);
      delete this.rootComponents_[id];
    }
    return component;
  }

  /**
   * Converts values in the given data object to arrays of components, when
   * possible.
   * @param {!Object} data The subcomponent's template call data.
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ids.
   */
  extractSubcomponents(data, componentData) {
    for (var key in data.data) {
      if (this.shouldExtractSubcomponents_(data.data[key])) {
        data.data[key] = this.extractSubcomponentsFromString_(data.data[key], componentData);
      }
    }
  }

  /**
   * Handles the given string of rendered templates, converting them to
   * component instances.
   * @param {string} renderedComponents Rendered components.
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ids.
   * @return {string|!Array<!Component>} [description]
   * @protected
   */
  extractSubcomponentsFromString_(renderedComponents, componentData) {
    var components = [];
    var frag = dom.buildFragment(renderedComponents);
    var ignored = false;
    for (var i = 0; i < frag.childNodes.length; i++) {
      var node = frag.childNodes[i];
      if (core.isElement(node) && node.hasAttribute('data-component') && node.id) {
        components.push(this.extractSubcomponent_(componentData[node.id], componentData));
      } else {
        ignored = true;
      }
    }

    if (components.length) {
      if (ignored) {
        console.warn(
          'One or more HTML nodes were ignored when extracting components. ' +
          'Only nodes with both the id and the data-component attribute set are valid.'
        );
      }
      return components;
    } else {
      return renderedComponents;
    }
  }

  /**
   * Sets the flag that indicates if new components should be decorated instead
   * of rendered.
   * @param {boolean} shouldDecorate
   */
  setShouldDecorate(shouldDecorate) {
    this.shouldDecorate_ = shouldDecorate;
  }

  /**
   * Checks if the given value has sub components that should be extracted.
   * @param {*} value
   * @return {boolean}
   */
  shouldExtractSubcomponents_(value) {
    return core.isString(value) && value.indexOf('data-component') !== -1;
  }

  /**
   * Updates a root component's data and parentNode.
   * @param {string} id The component's id.
   * @param {!Object} data The component's data.
   * @param {Element} element The element indicating the position the component
   *   should be at.
   * @protected
   */
  updateRootComponent_(id, data, element) {
    var component = this.components_[id];
    if (component.element !== element) {
      element.parentNode.insertBefore(component.element, element);
      element.parentNode.removeChild(element);
    }
    component.setAttrs(data);
  }
}

export default ComponentCollector;
