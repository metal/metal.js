---
title: "Web Components"
description: "Using metal components as web components (custom elements)."
layout: "guide"
weight: 230
---

<article id="web_components">

## [Web Components](#web_components)

Metal components are generally invoked in one of three ways:

- JavaScript

```javascript
new metal.MyComponent({
	title: 'Hello, World!'
}, '#element');
```

- Soy

```soy
{call MyComponent.render}
	{param title: "Hello, World!" /}
{/call}
```

- JSX

```jsx
<MyComponent title="Hello, World" />
```

However, with the help of the [metal-web-component](https://www.npmjs.com/package/metal-web-component) package, Metal components can be invoked as [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements) in
plain HTML.

```xml
<my-component title="Hello, World"></my-component>
```

</article>

<article id="install">

## [Install](#install)

First you must install the `metal-web-component` package:

```bash
npm i --save metal-web-component
```

Currently, web components don't work on every browser, so a polyfill must be
used. Include the [webcomponents-lite polyfill](https://www.webcomponents.org/polyfills) if
you intend to use web components on Firefox, Edge, or IE11.

</article>

<article id="define_web_components">

## [Define web components](#define_web_components)

This package exposes a single helper function that can be used to wrap any Metal
component in a web component. It receives two arguments: the tag name you want
the web component to receive, and the constructor of the Metal component:

```javascript
import JSXComponent from 'metal-jsx';
import defineWebComponent from 'metal-web-component';

class MyComponent extends JSXComponent {
	render() {
		return <h1>{this.props.message}</h1>
	}
}

MyComponent.PROPS = {
	message: {
		value: ''
	}
};

defineWebComponent('my-component', MyComponent);
```

Now that the web component is defined, it can be invoked in plain html:

```xml
<my-component message="This is a web component"></my-component>
```

This results in the following HTML on the page:

```xml
<h1>This is a web component</h1>
```

If you would like the component's markup to be rendered using the Shadow DOM,
simply set the `useshadowdom` attribute to `true` when calling the web component:

```xml
<my-component message="This is a web component" useshadowdom="true"></my-component>
```

This means that any styling on the page will not cascade to your component's
markup. See [MDN's documentation](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM) for more info.

</article>