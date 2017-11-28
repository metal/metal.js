---
title: "Configuring State"
description: "How to configure state and props for Metal.js components."
buttonTitle: "I configured the state"
parentId: "tutorial-todo-soy"
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

class TodoApp extends Component {
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

Now that there is a default value set, you can access the value in the Soy
template after defining it as a soy `param`.

```soy
&#123;namespace TodoApp&#125;

/**
 * This renders the component's whole content.
 */
&#123;template .render&#125;
	{@param? todos: ?}

	<div>Todo: {$todos[0].title}</div>
&#123;/template&#125;
```

Which would result in the following markup.

```text/xml
<div>Todo: Todo 1</div>
```

Obviously this markup isn't very useful, we'll get to rendering the entire list
in a minute.

### Item

The `TodoItem` component will need two properties defined in STATE, one for
keeping track of it's index inside the list, and one for containing the todo
data itself.

```text/javascript
// TodoItem.js

class TodoItem extends Component {
	...
}

TodoItem.STATE = {
	index: {
		value: null
	},

	todo: {
		value: null
	}
};
```

These STATE properties will act as read-only for the `TodoItem` component, as
the values will always be defined by the parent component and passed down.

Remember that PROPS are used for external data, or data that is passed to the
component from a parent. Therefore these values will be read-only for
the `TodoItem` component.

### Form

The `TodoForm` only needs one property that will eventually be used to keep
track of the value of it's input.

```text/javascript
// TodoForm.js

class TodoForm extends Component {
	...
}

TodoForm.STATE = {
	value: {
		value: ''
	}
};
```
