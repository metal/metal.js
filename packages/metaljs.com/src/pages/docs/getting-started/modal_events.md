---
title: "Tutorial: Modal - Events"
description: ""
layout: "progress"
weight: 200
---

<article>

In the [previous section](/docs/getting-started/modal.html) we've created a
component that renders a **Modal**. Its close button doesn't do anything yet
though. This section will teach you how to handle DOM events on your components.

</article>

<article id="inline_listeners_via_function_name">

## [Inline Listeners - via Function Name](#inline_listeners_via_function_name)

You can add DOM event listeners easily through your templates, like this:

```text/html
<button onClick="close" type="button" class="close">
```

The above code declares that whenever the **x** button is clicked, the
{sp}`close` function from the component should be called.

</article>

<article id="inline_listeners_via_function_reference">

## [Inline Listeners - via Function Reference](#inline_listeners_via_function_reference)

If you prefer though, you can also pass the actual function reference (instead
of just its name) as an inline listener.

```soy
// src/Modal.soy

/**
 * In the "render" template, Soy params that match a
 * component's function name will be that function
 * (automatically bound to the component instance).
 * @param close
 */
&#123;template .render&#125;
    // ...
    <button onClick="{$close}" type="button" class="close">
    // ...
&#123;/template&#125;
```
```jsx
// src/Modal.js

<button onClick={this.close.bind(this)} type="button" class="close">
```

That will work exactly the same way as the previous example.

</article>

<article id="listener_implementation">

## [Listener Implementation](#listener_implementation)

All you need to do now is to implement the `close` function in your
{sp}`src/Modal.js` file:

```javascript
close() {
    this.dispose();
}
```

All components have this `dispose` function, which basically destroys it and
removes its content from the DOM. Check the guide about
{sp}[Lifecycle functions](/docs/guides/component-lifecycle.html) for more
details.

</article>

<article id="run_the_demo">

## [Run the Demo](#run_the_demo)

Now compile your code with `npm run build` and open the demo on a browser.
Clicking the **x** button will close the modal as expected.

For more details on inline listeners check
{sp}[this guide](/docs/guides/inline-events.html).

</article>

<article id="next_steps">

## [Next Steps](#next_steps)

Our modal now properly closes itself when the **x** button is clicked.
To do this we're disposing of it completely though, so we'll need to create a
new Modal instance whenever we need to show it again.

Ideally, instead of disposing it, we should just hide it instead, while also
having a way to show it back. The next section will explain how to do this by
having data changes update the modal accordingly.

**[↪ Tutorial: Modal - Updates](/docs/getting-started/modal_updates.html)**

</article>