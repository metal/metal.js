---
title: "Updating State"
description: "Foo bar."
buttonTitle: "I updated the state"
parentId: "tutorial-todo-jsx"
layout: "tutorial"
time: 90
weight: 7
---

## {$page.title}

You are now ready to update the state in `TodoApp`. From the last step you added
an event listener.

```text/jsx
// TodoApp.js

class TodoApp extends JSXComponent {
	...

	handleTodoClick(event) {
		alert(event.index);
	}
}
```

Now all you need to do is update the state so that the template rerenders.

```text/jsx
// TodoApp.js

class TodoApp extends JSXComponent {
	...

	handleTodoClick(event) {
		this.toggleTodo(event.index);
	}

	toggleTodo(clickedIndex) {
		this.state.todos = this.state.todos.map((todo, index) => {
			if (clickedIndex === index) {
				todo.done = !todo.done;
			}
			return todo;
		});
	}
}
```

This will toggle the `done` property of the todo that was clicked. Simply
setting the `this.state.todos` property to a new array of todos will trigger a
rerender, passing the data to the child components. Now your markup should look
something like this.

```text/xml
<div class="todo-app">
	<ul>
		<li class="todo-item todo-item-done">Todo 1</li>
		<li class="todo-item">Todo 2</li>
	</ul>
</div>
```

![Completed Todo](/images/tutorials/todo-app/completed_todo.png "Completed Todo")
