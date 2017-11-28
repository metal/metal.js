---
title: "Components"
description: "asdf"
buttonTitle: "Next"
parentId: "tutorial-todo-jsx"
layout: "tutorial"
time: 90
weight: 3
---

## {$page.title}

In the `metal-tutorial-todo` boilerplate, there are already three components defined
to help get you started. Each component is defined as an ES6 class that extends
from Metal's `JSXComponent` class.

```text/jsx
class TodoApp extends JSXComponent {
}
```

Each component has a render function where the JSX template is defined. This
will create the HTML you see in the demo page.

```text/jsx
class TodoApp extends JSXComponent {
	return (
		<div>Hello, World</div>
	);
}
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
