---
title: "Importing a Third Party Component"
description: ""
layout: "guide"
weight: 170
---

<article>

There are now more libraries and frameworks available for front-end
development than ever before. It's not uncommon to have five or more of these
libraries involved in a single project. But keeping track of all these
libraries and making sure they're up-to-date can be tricky. To solve this we
can use npm, a package manager that makes it easy to manage all your
application's dependencies.

In this guide you are going to learn how to get up and running with npm.
You'll start by installing the npm command-line utility and then go on to
learn about the various commands that are available for managing Metal.js
components.

Lets get started!

</article>

<article id="installing_node_js_npm">

## [Installing Node.js/NPM](#installing_node_js_npm)

If you don't already have Node.js or npm installed, head over to the
{sp}[Node.js](https://nodejs.org/en/download/) website and download the
relevant copy of Node.js for your system. The npm program is included with the
install of Node.js.

Now that you have npm installed, we can start looking at the commands that are
used to manage packages.

</article>

<article id="finding_components">

## [Finding components](#finding_components)

There are two different ways that you can find npm packages. Either using the
online component directory, or using the command line utility.

To search for packages on the command line you use the search command. This
should be followed by your search query.

```shell
npm search <query>
```

For example to search for packages that contain the word ‘metal’ you could do
the following:

```shell
npm search metal
```

This command would return a whole bunch of results, with information about
each matched module so you can pick the one you wish.

</article>

<article id="installing_components">

## [Installing Components](#installing_components)

To add a new npm package to your project you use the install command. This
should be passed the name of the package you wish to install.

```shell
npm install <package>
```

In this example, we're going to install the `metal-position` component.

```shell
npm install metal-position
```

Installed packages will be placed in a `node_modules` directory. This is
created in the folder which the bower program was executed.

```
└── node_modules
    ├── metal
    ├── metal-position
```

</article>

<article id="importing_a_component">

## [Importing a Component](#importing_a_component)

With the code already available, let's create a `main.js` file that will
import the `metal-position` module. Note that we're using an
{sp}[alias](/docs/guides/alias.html) to easily import npm files.

```javascript
import position from 'metal-position';
```

This means that you can now call any function from that module, in this
example we'll get the viewport height.

```javascript
var viewportHeight = position.getClientHeight(window);

console.log(viewportHeight);
```

Metal.js components are written in ES6 (a.k.a ECMAScript 2015), so you can also
use ES6 on your code like we did on the example. Since ES6 isn't fully
implemented on browsers yet though, either a polyfill or a build process is
necessary before using Metal on a website.

</article>