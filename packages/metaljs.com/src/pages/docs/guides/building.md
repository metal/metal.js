---
title: "Building"
description: ""
layout: "guide"
weight: 220
---

<article>

As we mentioned before, **Metal.js** components are written in ES6, which means
that we need a transpiling process before using it on a website.

This can be done via any tools that you prefer, like
{sp}[webpack](http://webpack.github.io/) or [browserify](http://browserify.org/),
but we've also published a few tools of our own, which focuses on **Metal.js**{sp}
projects, which we'll talk about here.

</article>

<article id="metal-tools-soy">

## [metal-tools-soy](#metal-tools-soy)

This tool is required when building Metal.js components that use Soy. It takes
the `.soy` files in your project and transpiles them to JavaScript that can then
be imported in your component js files.

It's suggested to run this tool as a CLI, but it can also be run
programmatically if necessary.

Take a look at the project's [documentation](https://www.npmjs.com/package/metal-tools-soy) for
more information.

If you are using webpack to bundle your Metal.js components, you can optionally
use the [metal-soy-loader](https://www.npmjs.com/package/metal-soy-loader) which
conveniently wraps metal-tools-soy for use with webpack.

</article>

<article id="babel-preset-metal-jsx">

## [babel-preset-metal-jsx](#babel-preset-metal-jsx)

When building Metal.js JSX components, it is necessary to transpile the JSX to
JavaScript. The [babel-preset-metal-jsx](https://www.npmjs.com/package/babel-preset-metal-jsx) package
takes care of importing the necessary babel plugins that allow for this
transpilation.

</article>

<article id="examples">

## [Examples](#examples)

To see examples of these tools in action, check out
the [Yeoman Generator](https://www.npmjs.com/package/generator-metal). The
boilerplate it generates for both Soy and JSX components implement these tools
out of the box.

</article>
