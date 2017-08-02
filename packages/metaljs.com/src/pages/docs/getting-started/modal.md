---
title: "Tutorial: Modal"
description: ""
layout: "guide"
weight: 100
---

<article>

In the [previous section](/docs/getting-started/) you learned how to build a
simple project using Metal.js that just renders **Hello World** on the screen.
Let's enhance what we already have to render a modal dialog instead.

</article>

<article id="rendering">

## [Rendering](#rendering)

Our generated project already includes
{sp}[Bootstrap's CSS](http://getbootstrap.com/), so let's use its markup for our
modal. Let's update the component's template to do that then:


```soy
// src/Modal.soy

&#123;namespace Modal&#125;

/**
 * This renders the component's whole content.
 * Note: has to be called ".render".
 */
&#123;template .render&#125;
    {@param body: string}
    {@param header: string}

    <div class="modal show">
        <div class="modal-dialog">
            <div class="modal-content">
                <header class="modal-header">
                    <button type="button" class="close">
                        <span>×</span>
                    </button>
                    <h4>{$header}</h4>
                </header>
                <section class="modal-body">
                    {$body}
                </section>
                <footer class="modal-footer">
                    <button type="button" class="btn btn-primary">OK</button>
                </footer>
            </div>
        </div>
    </div>
&#123;/template&#125;
```
```jsx
// src/Modal.js

import JSXComponent from 'metal-jsx';

class Modal extends JSXComponent {
    /**
     * Renders the component's content.
     * Note that data can be accessed via the `props` property.
     */
    render() {
        return <div class="modal show">
            <div class="modal-dialog">
                <div class="modal-content">
                    <header class="modal-header">
                        <button type="button" class="close">
                            <span>×</span>
                        </button>
                        <h4>{this.props.header}</h4>
                    </header>
                    <section class="modal-body">
                        {this.props.body}
                    </section>
                    <footer class="modal-footer">
                        <button type="button" class="btn btn-primary">OK</button>
                    </footer>
                </div>
            </div>
        </div>;
    }
}

export default Modal;
```

</article>

<article id="passing_data">

## [Passing Data](#passing_data)

Note that the template is accessing data to determine the content of the
modal's `header` and `body`. How can the component receive this data
though?

One way is through the component's constructor. When creating component
instances directly, you can pass them a data object as its first param. So
let's update our demo to pass it some data:

```javascript
new metal.Modal({
    header: 'My Modal',
    body: 'Built using Metal.js'
});
```

</article>

<article id="run_the_demo">

## [Run the Demo](#run_the_demo)

Now compile your code with `npm run build` and open the demo on a browser, and
you should be seeing this:

![Modal screenshot](../../images/docs/modal.png)

</article>

<article id="next_steps">

## [Next Steps](#next_steps)

We've taken care of the rendering, but you'll notice that clicking the **x**{sp}
button doesn't do anything yet though. Let's make that work.

**[↪ Tutorial: Modal - Events](/docs/getting-started/modal_events.html)**

</article>