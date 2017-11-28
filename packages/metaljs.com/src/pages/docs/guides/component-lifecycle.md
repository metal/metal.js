---
title: "Component Lifecycle"
description: ""
layout: "guide"
weight: 130
---

<article id="component_lifecycle">

## [Component Lifecycle](#component_lifecycle)

You can take advantage of several lifecycle methods that Metal.js components 
provide. The example below lists the available lifecycle methods in the order in 
which they're called:

```javascript
class MyComponent extends Component {
    /**
     * Called when the component is first created,
     * but before it's first rendered.
     */
    created() {
    }

    /**
     * Called when the component is rendered.
     * @param {boolean} firstRender Flag indicating if
     * this is the component's first render.
     */
    rendered(firstRender) {
    }

    /**
     * Called just before the component attaches to
     * the DOM.
     */
    willAttach() {
    }

    /**
     * Called when the component is attached to the
     * DOM. The component automatically attaches
     * when it is first rendered, but it can also
     * be attached (without rerendering the
     * component) by calling the `attach` method
     * directly. This is a good place to attach event
     * listeners, since the component is available
     * in the page.
     */
    attached() {
    }

    /**
     * Only applicable for Soy components.
     *
     * Called just before state data is passed to
     * the component's renderer.
     * @param {!object} changes object literal with
     * info on state changes.
     */
    willReceiveState(changes) {
    }

    /**
     * Only applicable for JSX components.
     *
     * Called just before props data is passed to
     * the component's renderer.
     * @param {!object} propsChanges object literal
     * with info on props changes.
     */
    willReceiveProps(propsChanges) {
    }

    /**
     * Called just before the renderer is about to
     * rerender the component. If it returns false
     * it will not rerender.
     * @param {!object} changes object literal with
     * info on state changes.
     * @param {?object} propsChanges object literal
     * with info on props changes.
     * Note: `propsChanges` is only applicable for
     * JSX components.
     */
    shouldUpdate(changes, propsChanges) {
        return true;
    }

    /**
     * Called just before the component rerenders.
     * @param {!object} changes object literal with
     * info on state changes.
     * @param {?object} propsChanges object literal
     * with info on props changes.
     * Note: `propsChanges` is only applicable for
     * JSX components.
     */
    willUpdate(changes, propsChanges) {
    }

    /**
     * Called just before the component detaches
     * from the DOM.
     */
    willDetach() {
    }

    /**
     * Called when the component is detached from the
     * DOM. The component is automatically detached
     * when disposed, but it can also be detached
     * (without disposing the component) by calling
     * the `detach` method directly. This is a good
     * place to detach event listeners, since the
     * component is not available in the page anymore.
     */
    detached() {
    }

    /**
     * Called when the component is disposed. This
     * should contain any necessary cleanup, like
     * detaching any remaining events and disposing
     * of sub components and local variables.
     */
    disposed() {
    }

    /**
     * Called just before the component renders.
     * This takes the component state as an argument
     * and lets you massage the data before it is
     * passed down to the template.
     * This is only applicable for Soy Components.
     */
    prepareStateForRender(states) {
        return Object.assign({}, states);
    }
}
```

</article>

<article id="will_receive_state">

## [willReceiveState - Soy](#will_receive_state)

The `willReceiveState` lifecycle method lets you hook into the Soy component's 
state lifecycle. See the example component below:

```javascript
import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './MySoyComponent.soy';

class MySoyComponent extends Component {
    willReceiveState(changes) {
        if (changes.foo && changes.foo.newVal !== changes.foo.prevVal) {
            // This is available in the next render
            this.bar = 'bar1';
        }
    }
}

MySoyComponent.STATE = {
    foo: {
        value: 'foo'
    },

    bar: {
        value: 'bar'
    }
};

Soy.register(MySoyComponent, templates);
export default MySoyComponent;
```
```soy
&#123;namespace MySoyComponent&#125;

/**
 *
 */
&#123;template. render&#125;
    {@param foo: string}
    {@param bar: string}

    <div>{$foo}:{$bar}</div>
&#123;/template&#125;
```

If we render this component and change the value of the `foo` state, the
`willReceiveState` method fires before the component renders, which lets us 
set state values to pass to the next render.

```javascript
import MySoyComponent from './MySoyComponent';

const component = new MySoyComponnet();

component.foo = 'foo1';

component.once('rendered', function() {
    console.log(component.element.innerHTML);

    // component.element.innerHTML === 'foo1:bar1';
});
```

</article>

<article id="will_receive_props">

## [willReceiveProps - JSX](#will_receive_props)

The `willReceiveProps` lifecycle method lets you hook into the props
lifecycle of JSX components. Let's take the following JSX component for example:

```javascript
import JSXComponent from 'metal-jsx';

class MyJSXComponent extends JSXComponent {
    render() {
        return <div>{this.props.foo}:{this.state.bar}</div>
    }

    willReceiveProps(changes) {
        if (changes.foo && changes.foo.newVal !== changes.foo.prevVal) {
            // This is available in the next render
            this.state.bar = 'bar1';
        }
    }
}

MyJSXComponent.STATE = {
    bar: {
        value: 'bar'
    }
};

MyJSXComponent.PROPS = {
    foo: {
        value: 'foo'
    }
};

export default MyJSXComponent;
```

If we render this component and change the value of the `foo` prop, the
`willReceiveProps` method fires before the component renders, which lets us 
set the value of internal state values to pass to the next render:

```javascript
import MyJSXComponent from './MyJSXComponent';

const component = new MyJSXComponent();

component.props.foo = 'foo1';

component.once('rendered', function() {
    console.log(component.element.innerHTML);

    // component.element.innerHTML === 'foo1:bar1';
});
```

</article>