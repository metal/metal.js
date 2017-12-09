---
title: "Dependencies"
description: "Installing dependencies of Metal.js."
buttonTitle: "I installed the dependencies"
parentId: "tutorial-todo-jsx"
layout: "tutorial"
time: 90
weight: 2
---

## {$page.title}

In order to follow along with this tutorial, you'll need [Git](https://git-scm.com/), and
a recent version of [Node.js/npm](https://nodejs.org/).

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

The boilerplate that you will be building off of is located in the **src/jsx** directory.
You can also view the finished product in the **src/jsx/final** directory.

### Building

In order to test drive the boilerplate located in the **src/jsx** directory,
you'll need to run the provided build script:

```text/x-sh
npm run build:jsx
```

This will run babel + webpack to transpile and bundle the JavaScript into
something consumable by web browsers.

Everything you'll be writing in this tutorial will be using ES6 syntax, if
you're unfamiliar with it, take a look at [this guide](https://babeljs.io/learn-es2015/) first.

To build the finished product, run the following script:

```text/x-sh
npm run build:jsx:final
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
