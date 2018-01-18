---
title: "Performance"
description: ""
layout: "guide"
weight: 230
---

<article id="performance">

## [Performance](#performance)

**Metal.js** was built from the first with performance in mind. We've run
performance tests to compare it with other libraries and got really good
results that show the benefits of using it.

In one of the tests we made, we built a simple list widget on three different
libraries: **Metal.js**, **YUI** and **React**. We then measured the time it
took to render those widgets with 1000 items each on three different situations:

- **First Render -** Creating and rendering the list for the first time, on a blank element.
- **Decorate -** Creating and decorating a list that was previously rendered on the DOM.
- **Update -** Changing the contents of the first item of the list, causing a rerender.

The chart below shows the results we obtained on Chrome (the higher the bar,
the faster it runs):

![Performance Test - List](../../images/docs/perf.png)

</article>