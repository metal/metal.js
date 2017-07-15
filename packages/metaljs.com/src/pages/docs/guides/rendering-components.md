---
title: "Rendering Components"
description: ""
layout: "guide"
weight: 140
---

<article>

The [quick start tutorial](/docs) explains how to create and render a new
component. In its examples components are always being appended directly to the
document's body though, but what's usually necessary is to render in a specific
position.

</article>

<article id="replacing_an_existing_element">

## [Replacing an Existing Element](#replacing_an_existing_element)

If you wish your component to replace an existing element on the DOM, you just
need to pass it (or a selector for it) as the `element` property of the
constructor configuration, like this:

```javascript
// Passsing the element itself
new Modal({element: elementToReplace});

// Passing a selector to the element
new Modal({element: '#elementToReplace'});
```

</article>

<article id="specifying_the_parent">

## [Specifying the Parent](#specifying_the_parent)

You can also specify the parent element that should receive the component's
contents via the second constructor param, like this:

```javascript
// Passing the element itself
new Modal(data, parentElement);

// Passing a selector to the element
new Modal(data, '#parentElement');
```

</article>