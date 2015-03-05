'use strict';

import ComponentRegistry from '../component/ComponentRegistry';
import Disposable from '../disposable/Disposable';

class ComponentCollector extends Disposable {
  constructor() {
    super();

    /**
     * Holds the extracted components, indexed by ref.
     * @type {!Object<string, !Component>}
     * @protected
     */
    this.components_ = {};
  }

  /**
   * Creates a child component and renders it inside the specified parent.
   * @param {string} ref The component ref.
   * @param {string} name The component name.
   * @param {!Object} data The component config data.
   * @param {Element} parent The component's parent element.
   * @protected
   */
  createComponent_(ref, name, data, parent) {
    var ConstructorFn = ComponentRegistry.getConstructor(name);
    this.components_[ref] = new ConstructorFn(data).render(parent.parentNode, parent);
    parent.parentNode.removeChild(parent);
  }

  /**
   * Gets all the extracted components.
   * @return {!Array<!Component>}
   */
  getComponents() {
    return this.components_;
  }

  /**
   * Extracts a component from the given element.
   * @param {!Element} element Element that represents a component that should
   *   be extracted.
   * @param {!Object} data Creation data for the component to be extracted.
   * @protected
   */
  extractComponent_(element, data) {
    if (this.components_[data.ref]) {
      this.updateComponent_(data.ref, data.data, element);
    } else {
      this.createComponent_(data.ref, data.name, data.data, element);
    }
  }

  /**
   * Extracts components from the given element.
   * @param {!Element} element
   * @param {!Object<string, !Object>} componentData An object with creation
   *   data for components that may be found inside the element, indexed by
   *   their ref strings.
   * @return {!Object<string, !Object>} The original `componentData` object.
   */
  extractComponents(element, componentData) {
    if (element.hasAttribute && element.hasAttribute('data-component')) {
      var ref = element.getAttribute('data-ref');
      var data = componentData[ref];
      if (data) {
        this.extractComponent_(element, data);
      }
    }

    return componentData;
  }

  /**
   * Updates a child component's data and parent.
   * @param {string} ref The component's ref.
   * @param {!Object} data The component's data.
   * @param {Element} parent The component's parent element.
   * @protected
   */
  updateComponent_(ref, data, parent) {
    var component = this.components_[ref];
    parent.parentNode.insertBefore(component.element, parent);
    parent.parentNode.removeChild(parent);
    component.setAttrs(data);
  }
}

export default ComponentCollector;
