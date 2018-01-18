---
title: "Isomorphic Rendering"
description: "Server side rendering of Metal.js components."
layout: "guide"
weight: 240
---

<article id="server_rendering">

## [Server Side Rendering](#server_rendering)

In most cases Metal components will be rendered client side. Let's take the
following component for example:

```jsx
import JSXComponent from 'metal-jsx';

class MyComponent extends JSXComponent {
	render() {
		return <div>{this.props.message}</div>
	}
}

MyComponent.PROPS = {
	message: {
		value: ''
	}
};

export default MyComponent;
```

After transpiling/bundling this component, it can be invoked in client side
JavaScript:

```javascript
const component = new metal.MyComponent({
	message: 'Hello, World!'
});

// component.element.innerHTML === '<div>Hello, World!</div>'
```

Rendering a component this way requires DOM manipulation, and the existence of
various global variables/utilities that are provided by web browsers. Therefore 
there is no way to render the HTML of this component in a Node.js
environment without the help of libraries, such as `JSDom`, that emulate client
functionality.

However, thanks to the `Component.renderToString` method, out of the box server
side rendering of Metal components is possible in Node.js environments:

```javascript
const Component = require('metal-component').Component;
const MyComponent = require('./MyComponent').MyComponent;

const htmlString = Component.renderToString(MyComponent, {
	message: 'Hello, World!'
});

// htmlString === '<div>Hello, World!</div>'
```

Now all of your custom Metal components can be rendered directly to HTML on the
server.

</article>