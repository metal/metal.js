---
title: "Progressive Enhancement"
description: ""
layout: "guide"
weight: 200
---

<article id="progressive_enhancement">

## [Progressive Enhancement](#progressive_enhancement)

[Progressive enhancement](http://en.wikipedia.org/wiki/Progressive_enhancement){sp}
is a feature that is very important for a lot of people. Knowing about this,
{sp}**Metal.js** is prepared to deal with content that already comes rendered from
the server. Since Metal.js components use
{sp}[Incremental DOM](http://google.github.io/incremental-dom) by default,
rendering on an element with existing content will reuse it instead of
repainting everything.

It's important to note that building components with Soy also helps with
progressive enhancement in another way: by providing a faithful template that
can be run by the server without having to duplicate the rendering code or run
JavaScript at all.

</article>