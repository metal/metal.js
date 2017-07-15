---
title: "Nested Components"
description: ""
layout: "guide"
weight: 160
---

<article>

The ability to reference components inside templates can be very useful. It
enables the developer to correctly place the child component at the right
position inside the parent in an intuitive way.

This can certainly be done with **Metal.js** components. For example, let's say
we've already built a simple component called **Button**.

Now we're building a **Modal** component, and we want it to render some buttons
inside the footer. In **Modal**'s template file we could do the following:

```soy
// src/Modal.soy

<div class="footer">
    {foreach $button in $buttons}
        {call Button.render}
            {param label: $button /}
        {/call}
    {/foreach}
</div>
```
```jsx
// src/Modal.js

var buttons = this.props.buttons.map(button => {
  return <Button label={button} />;
});

return <div class="footer">{buttons}</div>;
```

When Modal is rendered, the buttons also will be, at the specified position.
Besides this, **Button** components will be automatically instantiated for
these elements.

</article>

<article id="accessing_sub_component_instances">

## [Accessing Sub Component Instances](#accessing_sub_component_instances)

But what if we need to access the created instances? That's possible by using
{sp}**ref**. Let's add one to the previous example and see what happens:

```soy
// src/Modal.soy

{foreach $button as $buttons}
    {call Button.render}
        {param label: $button /}
        {param ref: 'button' + index($button) /}
    {/call}
{/foreach}
```
```jsx
// src/Modal.js

var buttons = this.props.buttons.map((button, index) => {
    return <Button label={button} ref={'button' + index} />;
});
```

Now you'll be able to access your sub components through your instance's `refs` property, like this:

```javascript
modal.refs.button0 // The instance for first button
modal.refs.button1 // The instance for second button
```

</article>