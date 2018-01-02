---
title: "Rendering Data"
description: "Foo bar."
buttonTitle: "I rendered the todo items"
parentId: "tutorial-todo-soy"
layout: "tutorial"
time: 90
weight: 5
---

## {$page.title}

First, let's prepare the `TodoItem` for consuming the data passed from 
`TodoApp`:

```soy
&#123;namespace TodoItem&#125;

/**
 * This renders the component's whole content.
 */
&#123;template .render&#125;
	{@param todo: ?}

	{let $elementClasses kind="text"}
		todo-item
		// Conditionally adding the 'todo-item-done' class if
		// the todo is done
		{if $todo.done}
			{sp}todo-item-done
		{/if}
	{/let}

	<li
		class="{$elementClasses}"
	>
		{$todo.title}
	</li>
&#123;/template&#125;
```

Now that you have some data that needs rendering and the `TodoItem` is ready to
consume it, you need to iterate over the todos and pass them to the child
components:

```soy
&#123;namespace TodoApp&#125;

/**
 * This renders the component's whole content.
 */
&#123;template .render&#125;
	{@param? todos: ?}

	<div class="todo-app">
		<ul>
			{foreach $todo in $todos}
				{call TodoItem.render}
					{param index: index($todo) /}
					{param todo: $todo /}
				{/call}
			{/foreach}
		</ul>
	</div>
&#123;/template&#125;
```

This results in the following markup:

```text/xml
<div class="todo-app">
	<ul>
		<li class="todo-item">Todo 1</li>
		<li class="todo-item">Todo 2</li>
	</ul>
</div>
```
