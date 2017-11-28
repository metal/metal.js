---
title: "Configuring State"
description: "How to configure state and props for Metal.js components."
buttonTitle: "I configured the state"
parentId: "tutorial-todo-jsx"
layout: "tutorial"
time: 90
weight: 4
---

## {$page.title}

As previously mentioned, Metal components automatically respond to the data
passed to them and rerender. However, in order for a component to take advantage
of this behavior, it needs to be told what data to respond to. This is where
state comes in.

JSX components have two state managers, one for internal state (STATE), and one
for external properties that are passed down to it (PROPS).

Soy components on the other hand only have one state manager that is used for
both internal and external properties (STATE).

### Storing The Todos

Let's configure the `TodoApp` component to store an array of todos with a
default value.

```text/javascript
// TodoApp.js

class TodoApp extends JSXComponent {
	...
}

TodoApp.STATE = {
	todos: {
		// Default value
		value: [
			{
				done: false,
				title: 'Todo 1'
			},
			{
				done: false,
				title: 'Todo 2'
			}
		]
	}
};
```

Now that there is a default value set, you can access the value in the render
function using `this.state`.

```text/javascript
// TodoApp.js

class TodoApp extends JSXComponent {
	render() {
		return (
			<div>Todo: {this.state.todos[0].title}</div>
		);
	}
}
```

Which would result in the following markup.

```text/xml
<div>Todo: Todo 1</div>
```

Obviously this markup isn't very useful, we'll get to rendering the entire list
in a minute.

### Item

The `TodoItem` component will need two PROPS, one for keeping track of it's
index inside the list, and one for containing the todo data itself.

```text/jsx
// TodoItem.js

class TodoItem extends JSXComponent {
	...
}

TodoItem.PROPS = {
	index: {
		value: null
	},

	todo: {
		value: null
	}
};
```

Remember that PROPS are used for external data, or data that is passed to the
component from a parent. Therefore these values will be read-only for
the `TodoItem` component.

### Form

The `TodoForm` only needs one property that will only ever be set internally,
therefore it's set on `STATE`.

```text/jsx
// TodoForm.js

class TodoForm extends JSXComponent {
	...
}

TodoForm.STATE = {
	value: {
		value: ''
	}
};
```
