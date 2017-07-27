---
title: "Inline Events"
description: ""
layout: "guide"
weight: 150
---

<article>

Another feature Metal.js has that can be very useful is the ability to declare
events inside templates, directly on the desired element. Besides being simple
and intuitive, this feature allows Metal.js to handle attaching events itself,
and so this can be done in the best way possible, with
{sp}[delegates](https://learn.jquery.com/events/event-delegation/) for example,
without the user having worry about that at all. These events are also
automatically detached when the component is disposed.

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
 * In the "render" template, soy params that match a
 * component's function name will be that function
 * (automatically bound to the component instance).
 * @param close
 */
&#123;template .render&#125;
  // ...
  <button onClick="{$close}" type="button" class="close">
  // ...
&#123;/template}
```
```jsx
// src/Modal.js

<button onClick={this.close.bind(this)} type="button" class="close">
```

That will work exactly the same way as the previous example.

</article>

<article id="inline_listeners_nested_components">

## [Inline Listeners - Nested Components](#inline_listeners_nested_components)

When using [nested components](/docs/guides/nested-components.html) it's also
possible to inline events by using the **events** property:

```soy
// src/Modal.soy

{call Button.render}
  {param events: ['click': ['selector': 'button', 'fn': 'close']] /}
  {param label: 'Ok' /}
{/call}
```
```jsx
// src/Modal.js

var events = {click: {
  selector: 'button',
  fn: 'close'
}};

<Button events={events} label="Ok" />
```

This will cause the `close` function from the sub component to be called
whenever a click event triggers for the elements that match the given selector.

In case you want to listen to the event with a function from the parent
component, just pass the function reference instead of a string, like this:

```soy
// src/Modal.soy

{call Button.render}
  {param events: ['click': ['selector': 'button', 'fn': $close]] /}
  {param label: 'Ok' /}
{/call}
```
```jsx
// src/Modal.js

var events = {click: {
  selector: 'button',
  fn: this.close.bind(this)
}};

<Button events={events} label="Ok" />
```

Besides DOM events, you can also listen to custom events from the sub component in this same way:

```soy
// src/Modal.soy

{call Button.render}
  {param events: ['labelChanged': $handleLabelChanged] /}
  {param label: 'Ok' /}
{/call}
```
```jsx
// src/Modal.js

var events = {labelChanged: this.handleLabelChanged.bind(this)};

<Button events={events} label="Ok" />
```

</article>

<article id="inline_listeners_alternative_usage">

## [Inline Listeners - Alternative Usage](#inline_listeners_alternative_usage)

Besides the `on[EventName]` format you can also use `data-on[eventname]` for
adding inline listeners. For example:

```text/html
<button data-onclick="close" type="button" class="close">
```

Note that this format is supported mainly to enable doing
{sp}[progressive enhancement](/docs/guides/progressive-enhancement.html), when
running Soy templates via Java for example. When templates using the
{sp}`on[EventName]` format run in Java they will output elements with these as
actual attributes, which can cause errors in the browser. In JavaScript these
are used as element properties instead, so this problem doesn't occur.

So feel free to use the format you like best, or that better fits your needs.

</article>