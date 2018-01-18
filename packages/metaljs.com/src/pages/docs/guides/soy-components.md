---
title: "Soy Components"
description: ""
layout: "guide"
weight: 180
---

<article>

For a full tutorial on how to build components using Soy templates, make sure
to go through the [Todo App tutorial](/docs/tutorials/tutorial-todo-soy/before-we-start.html).

This guide will explain some details about the integration between **Metal.js**{sp}
components and [Soy templates](http://developers.google.com/closure/templates/).

Note that **Metal.js** is template agnostic, so it's not necessary to use Soy
at all. That said, we already provide a very good integration between Metal.js
components and Soy, so if you like this template language you should give it a
try.

</article>

<article id="soy_register">

## [Soy.register](#soy_register)

The only thing you need to do to use Soy templates in your **Metal.js**{sp}
component is to call `Soy.register`, passing it your component class and the
Soy templates you're going to use, like this:

```javascript
import templates from './MyComponent.soy';
import Component from 'metal-component';
import Soy from 'metal-soy';

class MyComponent extends Component {
}

Soy.register(MyComponent, templates);

export default MyComponent;
```

By default, **Metal.js** will use the Soy template called **render** as the
entry point for rendering. But you can tell us to use a different one if you
prefer by passing the name as the last param to the `Soy.register` call, like
this:

```javascript
Soy.register(MyComponent, templates, 'templateName');
```

</article>

<article id="template_file">

## [Template File](#template_file)

Make sure that your Soy file has the entry point template (**render** by
default), otherwise nothing will be rendered.

This main template will receive as data a combination of:

- [State data](/docs/guides/state.html)
- [Configuration data](/docs/guides/state.html#configuring_state) (accessed through `this.config`)
- [Component functions](/docs/guides/inline-events.html#inline_listeners_via_function_reference)

Note that by default all params declared on the component's main Soy template
are automatically configured as state properties as well, but without any
special configurations (like initial value or validators). If they're
{sp}[manually defined](/docs/guides/state.html) through the `STATE` property
they will retain the setup specified there though.

Any params passed to the component but not directly declared on its main Soy
template will be treated as basic configuration data, meaning that changes to
them will not automatically rerender the component. They can still be passed
down to other templates using `data="all"`, as well be accessed via the
`config` property in the JavaScript file.

```javascript
// Contains all the data received by the component.
this.config
```

</article>

<article id="soy_compilation">

## [Soy Compilation](#soy_compilation)

For the integration between **Metal.js** and **soy** to work, the Soy files
need to be compiled via one of our available build tools. That's because they
don't just compile the code, but also add some information that help with the
integration (like export declarations).

The available build tools that correctly compile Soy for **Metal.js** are:

- [gulp-metal](http://npmjs.com/package/gulp-metal) (already included when creating project via [generator-metal](/docs/guides/yeoman-generator.html)).
- [metal-cli](http://npmjs.com/package/metal-cli)
- [metal-tools-soy](http://npmjs.com/package/metal-tools-soy)

</article>