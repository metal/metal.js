---
title: "Yeoman Generator"
description: ""
layout: "guide"
weight: 210
---

<article id="yeoman_generator">

## [Yeoman Generator](#yeoman_generator)

You can organize your **Metal.js** project in any way you want, but to start
out we recommend using the
{sp}[Yeoman generator](http://npmjs.com/package/generator-metal) we've created,
which prepares both the project structure as well as a basic development
workflow for you.

To use it:

- Install [npm](https://nodejs.org) v3.0.0 or newer (if you don't have it yet)
- Install **Yeoman** and **generator-metal**: `[sudo] npm i -g yo generator-metal`
- Open the folder that you want to use on your terminal and type: `yo metal`
- Answer the generator prompts: ![Generator prompts](../../images/docs/prompts.png)
- Wait for the generator to finish fetching dependencies

After those steps you'll get a directory tree similar to this:

```
└── metal-modal
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

`generator-metal` will already include some npm scripts to help you build and
test your code, as well as many gulp tasks via
{sp}[gulp-metal](/docs/guides/building.html#gulp_metal).

</article>