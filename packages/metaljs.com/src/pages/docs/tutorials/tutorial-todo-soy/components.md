---
title: "Components"
description: "asdf"
buttonTitle: "Next"
parentId: "tutorial-todo-soy"
layout: "tutorial"
time: 90
weight: 3
---

## {$page.title}

In the `metal-tutorial-todo` boilerplate, there are already three components defined
to help get you started. Each component is defined as an ES6 class that extends
from Metal's `Component` class.

```text/javascript
class TodoApp extends Component {
}
```

Each component registers a Soy template to be used for rendering the component's
HTML. This is done by the `Soy.register` method.

```text/javascript
import templates from './TodoApp.soy.js';
import Component from 'metal-component';
import Soy from 'metal-soy';

class TodoApp extends Component {
}
Soy.register(TodoApp, templates);

```

The `TodoApp` component will be the root level component. It will handle storing
the todo data, and the rendering of the other two components.

The `TodoItem` component will render each item in the list of todos.

The `TodoItem` component will render a form for adding new todo items to the
list. It will consist of a text input and add button.

### Why more than one?

It might seem more trouble than it's worth splitting up the Todo App into
multiple components, but it's absolutely necessary when creating larger
applications. This tutorial aims to teach you how to handle nested components
for more complex use cases.
