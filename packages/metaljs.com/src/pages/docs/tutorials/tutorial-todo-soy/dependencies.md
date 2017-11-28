---
title: "Dependencies"
description: "Installing dependencies of Metal.js."
buttonTitle: "I installed the dependencies"
parentId: "tutorial-todo-soy"
layout: "tutorial"
time: 90
weight: 2
---

## {$page.title}

In order to follow along with this tutorial, you'll need [Git](https://git-scm.com/), and
a recent version of [Node.js/npm](https://nodejs.org/).

In addition, you'll need the [Java Runtime Environment](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html) (JRE)
installed in order to compile the `.soy` files.

### Todo Boilerplate

Start by cloning the boilerplate respository.

```text/x-sh
git clone https://github.com/metal/metal-tutorial-todo.git
```

Then navigate to the root of the project in your terminal and install the local
npm dependencies.

```text/x-sh
cd metal-tutorial-todo && npm install
```

The boilerplate that you will be building off of is located in the **src/soy** directory.
You can also view the finished product in the **src/soy/final** directory.

### Building

In order to test drive the boilerplate located in the **src/soy** directory,
you'll need to run the provided build script:

```text/x-sh
npm run build:soy
```

This will run babel + webpack to transpile and bundle the JavaScript into
something consumable by web browsers.

Everything you'll be writing in this tutorial will be using ES6 syntax, if
you're unfamiliar with it, take a look at [this guide](#) first.

To build the finished product, run the following script:

```text/x-sh
npm run build:soy:final
```

### Demo

Now that you've built the project, go ahead and open the demo page located
at `demos/index.html`.

If you take a look at the file you'll see that the component is already being
invoked.

```text/xml
<script type="text/javascript">
	new metal.TodoApp();
</script>
```

When invoking a component this way, the component is rendered to the `body` element.
