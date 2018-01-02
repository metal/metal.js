---
title: "Adding Todos"
description: "Foo bar."
parentId: "tutorial-todo-soy"
layout: "tutorial"
time: 90
weight: 8
---

## {$page.title}

You almost have a fully functioning Todo App! The only missing feature is the
ability to add new todos to the list. This is where the `TodoForm` component
comes into play.

First, go ahead and add a couple of event listeners: one for the form
submission (onsubmit) and one for when the input value changes (onkeyup):

```text/javascript
// TodoForm.js

class TodoForm extends Component {
	handleSubmit(event) {
		// Prevent default browser functionality
		event.preventDefault();
	}

	handleChange(event) {
	}
}
```
```soy
&#123;namespace TodoForm&#125;

/**
 * This renders the component's whole content.
 */
&#123;template .render&#125;
	<form class="todo-form" data-onsubmit="handleSubmit">
		<label for="title">
			Todo <input data-onkeyup="handleChange" name="title" />
		</label>
		<button type="submit">Add</button>
	</form>
&#123;/template&#125;
```

Now you can use the `value` property from STATE to keep track of the changes
made to the input value. This makes the input a **controlled input**, where the
value of the input is controlled by the state of the component. In other words, 
when the value of the state changes, it automatically changes the value in the 
input as well, keeping the two in sync.

```text/javascript
// TodoForm.js

class TodoForm extends Component {
	...

	handleChange(event) {
		this.value = event.target.value;
	}
}
```
```soy
&#123;namespace TodoForm&#125;

/**
 * This renders the component's whole content.
 */
&#123;template .render&#125;
	{@param? value: string}

	<form class="todo-form" data-onsubmit="handleSubmit">
		<label for="title">
			Todo <input data-onkeyup="handleChange" name="title" value="{$value}" />
		</label>
		<button type="submit">Add</button>
	</form>
&#123;/template&#125;
```

The value of `this.value` will now match the value in the input.

You can also emit a custom event when the form is submitted, similarly to
what `TodoItem` does to notify the parent component that something happened:

```text/javascript
// TodoForm.js

class TodoForm extends Component {
	...

	handleSubmit(event) {
		event.preventDefault();

		if (this.value) {
			this.emit('todoAdd', {
				title: this.value
			});

			// Clears the input value
			this.value = '';
		}
	}
}
```

Then in the `TodoApp` component, you can listen to this event and add a new
todo:

```text/javascript
// TodoApp.js

class TodoApp extends Component {
	addTodo(title) {
		// Creates a new array with all of the elements
		// from the previous array, with the newly added item
		this.todos = [...this.todos, {
			done: false,
			title
		}];
	}

	handleTodoAdd(event) {
		this.addTodo(event.title);
	}

	...
}
```
```soy
&#123;namespace TodoApp&#125;

/**
 * This renders the component's whole content.
 */
&#123;template .render&#125;
	{@param? handleTodoAdd: ?}
	{@param? handleTodoClick: ?}
	{@param? todos: ?}

	<div class="todo-app">
		...

		{call TodoForm.render}
			{param events: ['todoAdd' : $handleTodoAdd] /}
		{/call}
	</div>
&#123;/template&#125;
```

Now when you add some text to the input and submit the form, a new todo is 
automatically added to the list.

That's it! You've successfully created a simple Todo App with Metal.js. Now that
you are comfortable with the basics, check out the guides for more advanced
documentation.

![Finished GIF](/images/tutorials/todo-app/finished_todo_anim.gif "Finished GIF")
