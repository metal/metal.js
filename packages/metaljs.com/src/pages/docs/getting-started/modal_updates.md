---
title: "Tutorial: Modal - Updates"
description: ""
layout: "guide"
weight: 300
---

<article>

In the [previous section](/docs/getting-started/modal_events.html) we learned
how to add inline listeners, by making the **Modal**'s close button work.

We first implemented this feature by disposing of the entire **Modal**{sp}
instance when it was closed. It'd be best to have the modal just hide itself
so it could be shown again afterwards though.

</article>

<article id="state">

## [State](#state)

We've seen that it's possible to pass data to components via the constructor.
By default this kind of data is read-only for the component though, that is,
it can be received from the outside but not changed from the inside.

When you need to be able to change a component's data, as well as have that
change cause its HTML contents to update, you should indicate that it'll be
part of the component's state.

This can be done by using your component's `STATE` static variable, where you
an also configure state properties, specifying initial values and validators
for example.

So let's add a `shown` property to our **Modal** state, in **src/Modal.js**:

```javascript
Modal.STATE = {
    shown: {
        // The default value will be: `true`.
        value: true
    }
};
```

For more details about configuring state, check out
{sp}[this guide](/docs/guides/state.html).

</article>

<article id="updating_the_template">

## [Updating the Template](#updating_the_template)

Now we need to update our template to only show the modal when `shown` is true.

```soy
// src/Modal.soy

/**
 * State properties are passed to the "render" template in the same way as
 * config properties.
 */
&#123;template .render&#125;
    {@param shown: bool}

    <div class="modal {$shown ? 'show': ''}">
        ...
    </div>
&#123;/template&#125;
```
```jsx
// src/Modal.js

/**
 * State properties are accessed from `this.state`.
 */
render() {
    var cssClass = 'modal';

    if (this.state.shown) {
        cssClass += 'show';
    }

    return <div class={cssClass}>
        ...
    </div>;
}
```

</article>

<article id="updating_the_close_function">

## [Updating the `close` Function](#updating_the_close_function)

Now we can change our `close` function to just update the state property.

```soy
// src/Modal.soy

close() {
  this.shown = false;
}
```
```jsx
// src/Modal.js

close() {
  this.state.shown = false;
}
```

State changes are automatically detected by **Metal.js**, causing the component
to be rerendered. Since **Metal.js** uses
{sp}[Incremental DOM](http://google.github.io/incremental-dom/), rerendering
will cause minimal DOM updates. In this case, the `shown` CSS class will be
removed from the modal element.

</article>

<article id="run_the_demo">

## [Run the Demo](#run_the_demo)

Now compile your code with `npm run build` and open the demo on a browser.
Clicking the **x** button will close the modal as before, but inspecting the
DOM you'll notice that it's just hidden, not removed from the DOM.

</article>

<article id="playing_with_state_data">

## [Playing With State Data](#playing_with_state_data)

State data makes it very easy to update a component's contents. If you want to
quickly see it working you can make some experiments on your browser's
JavaScript console for example.

First let's hold the `Modal(jsx)` instance somewhere so we can access it:

```javascript
window.modal = new metal.Modal({
    header: 'My Modal',
    body: 'Built using Metal.js'
});
```

Now run the demo again, go to the browser's console and type:
{sp}`modal.shown = false`. You'll notice that the modal will be hidden as
expected. If you now type `modal.shown = true`, it will show up again.

If you want you can also turn `header` and `body` into state properties as
well. All you have to do is:

<ol>
<li>

Add them to `STATE`, like this:

```javascript
Modal.STATE = {
    body: {
        value: 'Default body'
    },
    header: {
        value: 'Default header'
    },
    shown: {
        value: true
    }
};
```

</li>
<li>

If you're using JSX templates, change the calls to `this.props` from `this`{sp}
instead. You will also need to change your config from
{sp}`Modal.STATE = {lb}...{rb}` to `Modal.PROPS = {lb}...{rb}` like this:

```jsx
render() {
    var cssClass = 'modal';
    
    if (this.props.shown) {
        cssClass += 'show';
    }
    
    return <div class={cssClass}>
        <div class="modal-dialog">
            <div class="modal-content">
                <header class="modal-header">
                    <button onClick={this.close.bind(this)} type="button" class="close">
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

Modal.PROPS = {
    body: {
        value: 'Default body'
    },
    header: {
        value: 'Default header'
    },
    shown: {
        value: true
    }
};
```

</li>
</ol>

Now if you type something like `modal.props.header = 'New Header'` on the
console, the contents will also be updated automatically.

</article>

<article id="next_steps">

## [Next Steps](#next_steps)

Our modal is working as expected now. But what if you want to split it into
multiple components? How would we use them together? Check it out in the next
section.

**[↪ Tutorial: Modal - Nested Components](/docs/getting-started/modal_nested.html)**

</article>