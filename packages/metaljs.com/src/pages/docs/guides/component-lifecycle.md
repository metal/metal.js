---
title: "Component Lifecycle"
description: ""
layout: "guide"
weight: 130
---

<article>

Components built with Metal.js provide lifecycle methods that can be called
when needed. The following example lists all available lifecycle methods, in
the order in which they're called

```javascript
class MyComponent extends Component {
    /**
     * Called when the component is first created,
     * but before it's first rendered.
     */
    created() {
    }

    /**
     * Called whenever the component is rendered.
     */
    rendered() {
    }

    /**
     * Called when the component is attached to the
     * DOM. The component will automatically be
     * attached when first rendered, but can also
     * be attached (without rerendering the
     * component) by calling the `attach` method
     * directly. This is a good place to attach event
     * listeners, since the component is available
     * in the page.
     */
    attached() {
    }

    /**
     * Called when the component is detached from the
     * DOM. The component will automatically be
     * detached when disposed, but can also be
     * detached (without disposing the component)
     * by calling the `detach` method directly. This
     * is a good place to detach event listeners,
     * since the component is not available in the
     * page anymore.
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
}
```

</article>