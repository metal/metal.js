---
title: "Alias"
description: ""
layout: "guide"
weight: 100
---

<article>

A straightforward way to import npm dependencies into your module is to use
their relative paths, like we do for any other code. For example:

```javascript
import core from '../node_modules/metal/src/core';
```

Having to supply the relative path to node_modules is not cool though and,
besides that, it may cause problems when a module doing that is imported later
as an npm dependency of another project, since the paths will change.

Knowing that, Metal.js allows importing npm dependencies like you would from a
regular node module, just by referencing their names. Note that this will only
work when using Metal.js's [build tools](/docs/guides/building.html) or adding
a similar logic to your build process yourself (though we provide a
{sp}[babel preset](https://npmjs.com/package/babel-preset-metal) with this logic
that you can use separately too).

With aliases, the previous example can be rewritten like this:

```javascript
import core from 'metal';
```

</article>