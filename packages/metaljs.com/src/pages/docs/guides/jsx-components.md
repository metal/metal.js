---
title: "JSX Components"
description: ""
layout: "guide"
weight: 190
---

<article>

For a practical tutorial on how to build components using JSX templates, make
sure to go through the [Todo App tutorial](/docs/tutorials/tutorial-todo-jsx/before-we-start.html).

This guide will explain some details about the integration between
{sp}**Metal.js** components and [JSX templates](https://facebook.github.io/jsx/).

Note that **Metal.js** is template agnostic, so it's not necessary to use JSX
at all. That said, we already provide a very good integration between metal
components and JSX, so if you like using it you should give it a try.

</article>

<article id="jsxcomponent">

## [JSXComponent](#jsxcomponent)

The only thing you need to do to use JSX in your **Metal.js** component is to
extend from **JSXComponent**, like this:

```javascript
import JSXComponent from 'metal-jsx';

class MyComponent extends JSXComponent {
}

export default MyComponent;
```

</article>

<article id="render_function">

## [`render` Function](#render_function)

Now that we've extended from **JSXComponent** we can use jsx in the `render`{sp}
method to specify what our component should render.

```jsx
import JSXComponent from 'metal-jsx';

class MyComponent extends JSXComponent {
    render() {
        return (
            <div>
                Hello {this.state.name}
                Hello {this.props.location}
            </div>;
        );
    }
}

MyComponent.PROPS = {
    location: {
        validator: core.isString,
        value: 'Mars'
    }
};

MyComponent.STATE = {
    name: {
        validator: core.isString,
        value: 'World'
    }
};

export default MyComponent;
```

Note that your component can have two different types of data:
{sp}[state](/docs/guides/state.html) and [props](/docs/guides/state.html#configuring_state).
The main difference is that props is accessed via `this.props` and will be the
original data received from parent components or the constructor. State is
accessed from `this.state` though, like `this.state.name` in the previous
example, and can be configured to use validators, setters, initial values and
other features. Check out the guide about [state](/docs/guides/state.html) to
learn more about this.

</article>

<article id="children_props">

## [Children Props](#children_props)

Whenever content is passed inside a component's jsx tag, it will be received
through the `children` props property. That way the component can decide if
this content will be rendered at all, and where exactly it should go.

For example, imagine a simple list component that receives its items as
its content, like this:

```jsx
<List>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</List>
```

This could be implemented by using the `children` props:

```jsx
class List extends JSXComponent {
    render() {
        return <ul>{this.props.children}</ul>
    }
}
```

If you inspect `this.props.children` you'll notice that it's an array of
objects. That gives you a lot of power when handling your component's contents.
 For example, you can choose to render only part of your children, like this:

```jsx
// Renders only the second item.
return <ul>{this.props.children[1]}</ul>
```

Or even change the data that they should receive before being rendered:

```jsx
// Forces all items to use the 'my-list-item-class' CSS class.
this.props.children.forEach(child => {
    child.class = 'my-list-item-class';
};

return <ul>{this.props.children}</ul>
```

</article>

<article id="functional_components">

## [Functional Components](#functional_components)

Sometimes you'll create very simple components, that have no other behavior
besides rendering their own contents. In this case you can drop using classes,
and instead create simple functions that just render the contents instead.

For example, let's create a simple **Button** component as a function:

```jsx
/**
 * Functional components receive the configuration
 * object as the first param.
 */
var Button = ({ cssClass, label }) => {
    return <button type="button" class={cssClass}>{label}</button>;
};
```

You can then use it from parent components in the same way that you'd use a
component class, for example:

```jsx
<Button class="btn btn-primary" label="OK" />
```

</article>

<article id="rendering_jsx_components">

## [Rendering JSX Components](#rendering_jsx_components)

JSX components can either be rendered in the
{sp}[usual way](rendering-components.html), or via the `JSXComponent.render`{sp}
function, like this:

```jsx
class Button extends JSXComponent {
    render() {
        // Your render logic
    }
}

JSXComponent.render(Button, {label: 'OK'}, parent);
```

You can also pass a functional component to it:

```jsx
var Button = props => {
    // Your render logic
};

JSXComponent.render(Button, {label: 'OK'}, parent);
```

Or even render directly via JSX:

```jsx
JSXComponent.render(<Button label="OK" />, parent);
```

</article>

<article id="jsx_compilation">

## [JSX Compilation](#jsx_compilation)

For the integration between **Metal.js** and **JSX** to work, the JSX code
needs to be compiled via a babel plugin called
{sp}[babel-plugin-incremental-dom](http://npmjs.com/package/babel-plugin-incremental-dom).
Using it directly means you'd need to configure it manually though, so we also
provide a [babel preset](http://npmjs.com/package/babel-preset-metal-jsx) that
you can use instead.

</article>

<article id="helpers">

## [Helpers](#helpers)

There are a few additional helpers we also provide for JSX.

#### `this.otherProps()`

Used for passing non-named props directly through to the child component.

```javascript
import JSXComponent, {Config} from 'metal-jsx';

class MyComponent extends JSXComponent {
    render() {
        return (
            <div>
                <ChildComponent {...this.otherProps()} />
            </div>
        )
    }
}

MyComponent.PROPS = {
    foo: Config.string()
}

// baz will be passed directly to ChildComponent
<MyComponent foo="bar" baz="qux" />
```

#### `<DangerouslySetHTML />`

Component used for rendering a string as HTML.

```javascript
import JSXComponent, {DangerouslySetHTML} from 'metal-jsx';

class MyComponent extends JSXComponent {
    render() {
        return (
            <DangerouslySetHTML
                content="<h1>Hello World</h1>"
                tag="div"
            />
        )
    }
}

// renders
<div>
    <h1>
        Hello World
    </h1>
</div>
```

#### `<Fragment />`

Component used to return an array of elements.

```javascript
import JSXComponent, {Fragment} from 'metal-jsx';

class MyComponent extends JSXComponent {
    render() {
        return (
            <form>
                {['foo', 'bar', 'baz'].map(
                    name => (
                        <Fragment key={name}>
                            <label for={name}>Input {name}</label>
                            <input name={name} />
                        </Fragment>
                    )
                )}
            </form>
        )
    }
}

// renders
<form>
    <label for="foo">Input foo</label>
    <input name="foo" />

    <label for="bar">Input bar</label>
    <input name="bar" />

    <label for="baz">Input baz</label>
    <input name="baz" />
</form>
```

</article>