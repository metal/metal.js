---
title: "Before We Start"
description: "Explanation of what Metal.js is intended for, and what you'll make in this tutorial."
buttonTitle: "Let's get started"
parentId: "tutorial-todo-soy"
layout: "tutorial"
time: 90
weight: 1
---

## {$page.title}

Before we actually make anything, let's discuss what Metal.js is, and what it's
intended for.

### Data flow

If you're familiar with React, you'll feel right at home. Metal.js is a
foundation for creating UI components that automatically respond to data when
it's updated. In other words, it's a framework for creating one-way data binding
components.

This is different than frameworks like Angular, which provide a two-way data
binding solution.

### Templating

Metal.js is template agnostic, and comes with out of the box support for two
templating languages, Soy (Google Closure) and JSX (React).

When the data being passed to your component changes, your component's template
will be used to rerender just the parts of your component that need to be
updated. Therefore, you don't need to worry about manual DOM manipulation.

Behind the scenes Metal.js is using Google's [Incremental DOM](https://google.github.io/incremental-dom) for
updating DOM elements.

### What are we making?

In this tutorial we'll be making a simple Todo App that let's you mark items as
completed, and add new items to the list. If you would like to see the finished
product check out the [metal-tutorial-todo](https://github.com/metal/metal-tutorial-todo) repository.

![Finished Todo App](/images/tutorials/todo-app/finished_todo_app.png "Finished Todo App")
