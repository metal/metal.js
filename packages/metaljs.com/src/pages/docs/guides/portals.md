---
title: "Portals"
description: "How to render child components to a different part of the page."
layout: "guide"
weight: 195
---

<article id="portals">

## [Portals](#portals)

Normally when rendering child components, the generated markup is nested
exactly where the child component is. Take the following JSX snippet for
example.

```jsx
class Child extends JSXComponent {
	render() {
		return <div class="child"></div>;
	}
}

class Parent extends JSXComponent {
	render() {
		return <div class="parent">
			<Child />
		</div>
	}
}

// Resulting markup
<div class="parent"><div class="child"></div></div>
```

But what if you need to render the component elsewhere? Occasionally
it's necessary to render a child component outside the DOM hierarchy of
the parent component. This is where Portals come in.

```jsx
class Child extends JSXComponent {
	render() {
		return <div class="child"></div>;
	}
}

class Parent extends JSXComponent {
	render() {
		return <div class="parent">
			<Child portalElement={document.getElementById('target')} />
		</div>
	}
}
```

Now the markup of `Child` will be rendered to the `#target` element on the page,
but will still receive updates from any data being passed from `Parent`. It will
also be disposed and detached from the page along with it's parent.

This is especially useful when creating components such as modals, dropdowns,
tooltips, or any component that needs to always overlay other pieces of content.

</article>

<article id="config">

## [Configuration](#config)

The `portalElement` property can receive three different types of values:
DOM elements, string selectors, or a boolean.

DOM elements and string selectors will work as expected:

```jsx
<Child portalElement="#target" />

// Is the same as

<Child portalElement={document.getElementById('target')} />
```

Passing `true` will select the `body` element by default:

```jsx
<Child portalElement={true} />

// Is the same as

<Child portalElement={document.body} />
```

Passing `false` will disable the Portal and render the component inline as normal.

</article>

<article id="soy_example">

## [Soy example](#soy_example)

Portals are supported for Soy components as well. The `portalElement` receives
the same values as a JSX component. Here is a snippet where a selector is
passed.

```soy
&#123;namespace Parent&#125;

/**
 * This renders the component's whole content.
 */
&#123;template .render&#125;
	<div class="parent">
		{call Child.render}
			{param portalElement: "#target" /}
		{/call}
	</div>
&#123;/template&#125;
```

</article>

<article id="limitations">

## [Limitations](#limitation)

There are a couple of known limitations when using Portals.

### Parent element

The main limitation of `portalElement` is that it cannot be set to
the same element that houses the root level parent component.

```jsx
class Child extends JSXComponent {
	render() {
		return <div class="child"></div>;
	}
}

class Parent extends JSXComponent {
	render() {
		// Wrong: rendering Child to same element as parent
		return <div class="parent">
			<Child portalElement="#target" />
		</div>
	}
}

// Rendering Parent to the #target element
new Parent(null, '#target');
```

With this configuration, Incremental DOM will throw an error when the Parent
component attempts to remove the Child component from the page.

### Using elements rendered by parent

While it is recommended to not use elements created by Metal
components as a `portalElement`, it is possible with the right
configuration.

The limitation is that `portalElement` needs to be passed an element
that exists before the component is rendered. This may seem obvious but take
the following snippet as an example.

```jsx
class Child extends JSXComponent {
	render() {
		return <div class="child"></div>;
	}
}

class Parent extends JSXComponent {
	render() {
		// Rendering Child to element created by parent
		return <div class="parent">
			<div id="target"></div>

			<Child portalElement="#target" />
		</div>
	}
}
```

In this example `Child` will not render to the specified `portalElement`,
as the `#target` element will not exist at the time of rendering due to
how Incremental DOM creates elements.

The solution is to wrap the `Child` component in a conditional that will
only render it after some kind of user interaction, such as a click.

```jsx
class Child extends JSXComponent {
	render() {
		return <div class="child"></div>;
	}
}

class Parent extends JSXComponent {
	render() {
		return <div class="parent">
			<button
				data-onclick={() => {
					this.state.clicked = !this.state.clicked;
				}}
			>
				Toggle
			</button>

			<div id="target"></div>

			{this.state.clicked && <Child portalElement="#target" />}
		</div>
	}
}

Parent.STATE = {
	clicked: {
		value: false
	}
};
```

While this should work for the `Child` component's first render,
you will run into problems once the `Parent` component starts
updating. Portals need to be passed an element that is not
removed or modified in any way.

This can be accomplished by using a third Component that always
returns false in it's `shouldUpdate` lifecycle method, and using
it as the `portalElement` for the `Child` component.

```jsx
class Child extends JSXComponent {
	render() {
		return <div class="child"></div>;
	}
}

class Host extends JSXComponent {
	render() {
		return <div class="host"></div>;
	}

	shouldUpdate() {
		return false;
	}
}

class Parent extends JSXComponent {
	render() {
		return <div class="parent">
			<button
				data-onclick={() => {
					this.state.clicked = !this.state.clicked;
				}}
			>
				Toggle
			</button>

			<Host />

			{this.state.clicked && <Child portalElement="#host" />}
		</div>
	}
}

Parent.STATE = {
	clicked: {
		value: false
	}
};
```

Now we have a working example where `Child` is successfully rendered
to a `portalElement` that was also created by a Metal component.

</article>
