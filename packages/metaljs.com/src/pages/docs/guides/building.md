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

<article id="gulp_metal">

## [gulp-metal](#gulp_metal)

What this package offers is a a bunch of [gulp](http://gulpjs.com/) tasks.
There are tasks that can handle not only building JavaScript, as well as Soy
compilation, testing, linting and many other things.

The [tutorials](/docs/getting-started/) we've provided are all using it, though
indirectly, through some npm scripts. To learn how to use **gulp-metal**{sp}
directly take a look at its [npm page](http://www.npmjs.com/package/gulp-metal).

</article>

<article id="metal_cli">

## [metal-cli](#metal_cli)

If you're not a fan of **gulp** you can still use
{sp}[metal-cli](http://www.npmjs.com/package/metal-cli), which offers almost
the same tools, but through the command line.

</article>

<article id="examples_using_other_tools">

## [Examples Using Other Tools](#examples_using_other_tools)

As was mentioned before, using **gulp-metal** or **metal-cli** is not required.
You can use your favorite build tool with **Metal.js** as well.

We've created a Github repository full of different examples on how to work
with **Metal.js**, and among other things it has a bunch of examples showing
how to use different build tools.
{sp}[Check it out](http://github.com/metal/metal-examples), and feel free to
create an issue or send a pull request for other tools that it may be missing.

</article>