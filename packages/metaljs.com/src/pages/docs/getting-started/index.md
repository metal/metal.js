---
title: "Quick Start"
description: ""
layout: "guide"
icon: "flash"
weight: 1
hidden: true
---

<article id="getting_started">

## [Getting Started](#getting_started)

There are many different ways to build components using Metal.js. You can use
the built-in integrations with
{sp}[Soy](http://developers.google.com/closure/templates/) or
{sp}[JSX](https://facebook.github.io/jsx/) templates, or even build your own
template abstraction on top of Metal.js and use it instead. You can build the
ES6 code using **Babel**, **Traceur** or any other transpiler. You can test
using **Karma**, **Jasmine** or any other test framework, and can use any
directory structure for your project. To sum it up, you can customize
everything to your own needs. The world is your oyster.

This guide will focus on a quick and easy way to get started with Metal.js.
But if you are excited to try it out as soon as possible you can just play
around with this [JSFiddle](https://jsfiddle.net/metaljs/y1tqa7vz/).

</article>

<article id="boilerplate">

## [Boilerplate](#boilerplate)

You can organize your **Metal.js** project in any way you want, but to start
out we recommend using the [Yeoman Generator](/docs/guides/yeoman-generator.html){sp}
we've created, which prepares both the project structure as well as a basic
development workflow for you.

You can use it if you wish, but to makes things even simpler we're
providing a zip with the boilerplate that the generator would create for
this tutorial, so you can just download it here:

<a href="/downloads/boilerplate.zip" class="btn btn-accent" data-senna-off="true">Download Metal.js Boilerplate (with Soy)</a>

<a href="/downloads/boilerplate-jsx.zip" class="btn btn-accent" data-senna-off="true">Download Metal.js Boilerplate (with JSX)</a>

Note that this zip you've downloaded contains not only the starting
boilerplate, but also a folder for each step of this tutorial guide, so that
you can either code along with us or just check out the final code for each
step.

Now that you have the boilerplate, you just need to:

<ol>
<li>

Install [npm](https://nodejs.org) v3.0.0 or newer (if you don't have it yet).

</li>
<li>

**For Soy users only**: Install
{sp}[Java](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html){sp}
version 8 or newer (if you don't have it yet).

</li>
<li>

Enter the `1. Hello World/` folder in your terminal and install its npm
dependencies, by typing:

```shell
[sudo] npm install
```

</li>
</ol>

Once the dependency installation ends, you'll get a directory tree similar
to this:

```
├── demos
│   └── index.html
├── node_modules
├── package.json
├── src
│   ├── Modal.js
│   ├── Modal.soy // Only if Soy was chosen
│   └── modal.scss
└── test
    └── Modal.js
```

</article>

<article id="build">

## [Build](#build)

If you open the generated **src/Modal.js** file you may notice that it's using
{sp}[ ES6](https://babeljs.io/docs/learn-es2015/) syntax:

```javascript
class Modal extends ...
```

That means that it'll need to go through a build process, since browsers
haven't fully implemented all ES6 features yet.

**generator-metal** already prepares some useful scripts that you can use,
including a build script. By default, this script will build everything into
global variables. To use it, simply type:

```shell
npm run build
```

</article>

<article id="demo_page">

## [Demo Page](#demo_page)

Now that the code was built, just open the generated `demos/index.html` file on
your browser. It should display a nice **Hello World** message, like this:

![Hello World screenshot](../../images/docs/hello_world.png)

If you look at the contents of `demos/index.html`, you'll see how the component
is being rendered. In this example, it's simply being instantiated directly by
calling `new metal.Modal();`.

By default this will append the component to the document's body. If you want
though, you can specify where it should be rendered. Check the guide about
{sp}[rendering components](/docs/guides/rendering-components.html) to find out
how.

</article>

<article id="hello_world">

## [Hello World](#hello_world)

As you've noticed, the generated project automatically renders
{sp}**Hello World** for you. Curious to see how that's done? It's simple, just
take a look at the generated template:

```soy
// src/Modal.soy

&#123;namespace Modal&#125;

/**
 * This renders the component's whole content.
 * Note: has to be called ".render".
 */
&#123;template .render&#125;
    <div>Hello World</div>
&#123;/template&#125;
```
```jsx
// src/Modal.js

import JSXComponent from 'metal-jsx';

class Modal extends JSXComponent {
    render() {
        return <div>Hello World</div>;
    }
}

export default Modal;
```

You can replace the default content with any other to change what your
component renders. Just make sure to build the code again after making your
changes.

</article>

<article id="next_steps">

## [Next Steps](#next_steps)

Now that you have gone through running a simple **Hello World** component,
let's actually turn it into a **Modal**.

**[↪ Tutorial: Modal](/docs/getting-started/modal.html)**
</article>