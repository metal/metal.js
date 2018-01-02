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

To follow along with this tutorial, you'll need [Git](https://git-scm.com/) and
a recent version of [Node.js/npm](https://nodejs.org/). You'll also need the 
[Java Runtime Environment](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html) (JRE)
installed to compile the `.soy` files.

### Todo Boilerplate

Start by cloning the boilerplate repository:

```text/x-sh
git clone https://github.com/metal/metal-tutorial-todo.git
```

Then navigate to the root of the project in your terminal and install the local
npm dependencies:

```text/x-sh
cd metal-tutorial-todo && npm install
```

The boilerplate that you'll build on is located in the **src/soy** directory. 
You can also view the finished product in the **src/soy/final** directory.

### Building

To test drive the boilerplate located in the **src/soy** directory, run the 
build script shown below:

```text/x-sh
npm run build:soy
```

This runs babel + webpack to transpile and bundle the JavaScript into something 
consumable by web browsers.

This tutorial uses ES6 syntax; if you're unfamiliar with it, check out 
[this guide](https://babeljs.io/learn-es2015/) first.

To build the finished product, run the following script:

```text/x-sh
npm run build:soy:final
```

### Demo

Now that you've built the project, go ahead and open the demo page located at 
`demos/index.html`.

If you check the file you'll see that the component is already being invoked:

```text/xml
<script type="text/javascript">
	new metal.TodoApp();
</script>
```

When you invoke a component this way, it is rendered to the `body` element.
