---
title: "Event Listeners"
description: "Foo bar."
buttonTitle: "I added the event listeners"
parentId: "tutorial-todo-soy"
layout: "tutorial"
time: 90
weight: 6
---

## {$page.title}

Now you should have a static list of todo items. What now? Remember the end goal
is to be able to click the todos to mark them as completed, so let's start
with adding a click event listener to the list items:

```javascript
// TodoItem.js

class TodoItem extends Component {
	...

	handleClick(event) {
		alert(this.todo.title);
	}
}
```
```soy
&#123;namespace TodoItem&#125;

/**
 * This renders the component's whole content.
 */
&#123;template .render&#125;
	{@param todo: ?}

	{let $elementClasses kind="text"}
		todo-item
		{if $todo.done}
			{sp}todo-item-done
		{/if}
	{/let}

	<li
		class="{$elementClasses}"
		// Passing the method name from the TodoItem class
		data-onclick="handleClick"
	>
		{$todo.title}
	</li>
&#123;/template&#125;
```

Notice that only the method name is passed to the `data-onclick` property. Metal
automatically checks to see if the Component has that method.

Now you should see an alert with the title of the clicked todo. Next you must
notify `TodoApp` that a todo was marked as completed so that it can update the
data. This can be done by emitting a custom event with the info needed to make
the change. In this case we'll use the index value from STATE:

```text/javascript
// TodoItem.js

class TodoItem extends Component {
	...

	handleClick(event) {
		this.emit('todoClick', {
			index: this.index
		});
	}
}
```

Now that the `TodoItem` is emitting an event, you must add a listener from the
parent component `TodoApp`. You can accomplish this by creating a function
reference. This is simply a Soy `param` that refers to the method you want to
use as the callback.

```text/javascript
// TodoApp.js

class TodoApp extends Component {
	...

	handleTodoClick(event) {
		alert(event.index);
	}
}
```
```soy
&#123;namespace TodoApp&#125;

/**
 * This renders the component's whole content.
 */
&#123;template .render&#125;
	// Function reference
	{@param? handleTodoClick: ?}
	{@param? todos: ?}

	<div class="todo-app">
		<ul>
			{foreach $todo in $todos}
				{call TodoItem.render}
					// Adds the listener for the todoClick event
					{param events: ['todoClick' : $handleTodoClick] /}
					{param index: index($todo) /}
					{param todo: $todo /}
				{/call}
			{/foreach}
		</ul>
	</div>
&#123;/template&#125;
```

At this point you should have an event handler that fires every time a todo
item is clicked. Next you will use this data to update the state in `TodoApp`.

### Alternative to custom events

Alternatively, you can pass functions from parents to children to achieve
similar functionality. To do this, a child must declare a STATE property to
house the function from the parent:

```javascript
class Parent extends Component {
	handleChange(event) {
		// Logic
	}
}

class Child extends Component {
	someMethod() {
		this.onChange({
			// Payload
		});
	}
}

Child.STATE = {
	onChange: {
	}
}
```
```soy
&#123;namespace Parent}
	{@param? handleChange: ?}

	{call Child.render}
		{param onChange: $handleChange /}
	{/call}
&#123;/samespace}
```
