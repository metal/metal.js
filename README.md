Metal.js
===============
[![Sauce Test Status](https://saucelabs.com/browser-matrix/alloyui.svg)](https://travis-ci.org/liferay/metal)

## About

MetalJS is a javascript library for building from simple widgets to full scale applications.

Even though it's powerful, MetalJS is very small, being only around 9Kb after compressed with gzip. It's also really well tested, currently with 99% coverage of unit tests.

## Architecture

MetalJS's main classes are [Attribute](#attribute) and **Component**. Component actually extends from Attribute, thus containing all its features. The main difference between the two is that Component's extra features are related to rendering. So you could just use Attribute directly if your module doesn't do any rendering. But if your module does need rendering logic though, then Component will work better for you.

One thing that can be really useful for a developer when building a component, is to separate the rendering logic from the business logic. This can be achieved on MetalJS by modules built on top of Component, that integrate with template engines. MetalJS already provides such an implementation for integration with [soy templates](http://developers.google.com/closure/templates), called [SoyComponent](#soycomponent).

<center>
![](http://f.cl.ly/items/1y1K2d1724253I372w2p/architecture.png)
</center>

## Setup

1. Install [Bower](http://bower.io/), if you don't have it yet.
2. Run `bower install metaljs`. The code will be available at `bower_components/metaljs`.

## Usage

With the code already available, you can use MetalJS by just importing the desired module on your js file and calling what you wish on it. For example:

```javascript
import core from 'bower_components/metaljs/src/core';

// You can now call any function from MetalJS's core module.
core.isString('Hello World');
```

Note that MetalJS is written in [ES6](https://babeljs.io/docs/learn-es6/), so you can also use ES6 on your code like we did on the example. Since ES6 isn't fully implemented on browsers yet though, either a polyfill or a build process is necessary before using MetalJS on a website. See the [Browser](#browser) section for more details.

## Attribute

The **Attribute** class provides a way of defining attributes for the classes that extend it, as well as watching these attributes for value changes.

The following example is a class that extends from Attribute and defines an attribute named `foo` on itself:

```javascript
class TestAttributes extends Attribute {
	constructor(opt_config) {
		super(opt_config);
	}
}

TestAttributes.ATTRS = {
	foo: {
		value: 'Initial value'
	}
}
```

If you're familiar with [YUI](http://yuilibrary.com/), you'll notice that this is very similar to how attributes are defined there. You basically just need to list all attributes you'll be using on the ATTRS static variable, and provide their configuration options, like initial value and validator. For a list of all valid options, take a look at Attribute's [docs](https://github.com/liferay/metal/blob/master/src/attribute/Attribute.js#L45).

You can access or change an object's attributes in the same way you'd access or change any object property.

```javascript
var obj = new TestAttributes();
console.log(obj.foo); // Prints 'Initial value'

obj.foo = 'New value';
console.log(obj.foo); // Prints 'New value'
```

You can also listen to attribute value changes by listening to the appropriate event.

```javascript
obj.on('fooChanged', function(event) {
	// event.prevVal has the previous value.
	// event.newVal has the new value.
});
```

To see all features of the Attribute class, take a look at its [unit tests](https://github.com/liferay/metal/blob/master/test/src/attribute/Attribute.js).

## SoyComponent

This section will explain how to build rich widgets on MetalJS, by taking advantage of the **SoyComponent** class. By using SoyComponent, you'll be able to easily separate business logic from rendering logic, as it provides an integration with [soy templates](http://developers.google.com/closure/templates).

Building a widget with SoyComponent is simple, you just need to create two files: one with your soy templates, and the other with your javascript logic.

So, for example, let's say we want to create a widget called **TestWidget**, that has a body and a footer with content. The javascript file would look like this:

```javascript
class TestWidget extends SoyComponent {
	constructor(opt_config) {
		super(opt_config);
	}
}

TestWidget.ATTRS = {
	bodyContent: {
		value: 'Initial body content.'
	},
	footerContent: {
		value: 'Initial footer content.'
	}
};
```

This file just defines a class named TestWidget, makes it extend from SoyComponent and defines two [attributes](#attribute). Now we just need a soy file for TestWidget's rendering logic. It would look like this:

```
{namespace Templates.TestWidget}

/**
 * This renders the component's whole content.
 */
{template .content}
	{delcall TestWidget.body data="all" /}
	{delcall TestWidget.footer data="all" /}
{/template}

/**
 * This renders the body part of the component.
 * @param bodyContent
 */
{template .body}
	<p>{$bodyContent}</p>
{/template}

/**
 * This renders the footer part of the component.
 * @param footerContent
 */
{template .footer}
	<footer>{$footerContent}</footer>
{/template}
```

Looking at that you can see that it's just a basic soy file that defines some templates. For this soy file to work well with SoyComponent its namespace just needs to be in the format: `Templates.{name of widget}`.

Note that, on the soy file, we have divided the main template into subtemplates, one for the body content and one for the footer. This is not necessary, but can be really helpful, as SoyComponent will handle these as special parts of the widget, automatically rerendering them when one of the attributes listed as params of a template changes. In TestWidget's case this means that whenever the value of the `bodyContent` attribute is changed, the `body` template will be called, and that part of the widget will be updated, even though there is no javascript code on TestWidget to handle this logic. The same goes for the `footerContent` attribute and the `footer` template.

SoyComponent's logic for updating the widget's contents automatically is very smart, so it won't cause a rerender unless it's necessary. So if a change causes a template to be called again, but the resulting html from the template is the same that was rendered for the last time, it will be ignored. This is done by compressing and caching the hash code of a template's results when it's called, and later using it to compare with new results to decide if a new content should be rendered or not.

Finally, to render an instance of TestWidget, just call `render`, passing any attribute values that you want to initialize:

```javascript
var testWidget = new TestWidget({headerContent: 'My Header'}).render(parentElement);
```

For a more complete and working example, take a look at the [metal-boilerplate](https://github.com/eduardolundgren/metal-boilerplate) repo. Among other things, it lists all optional lifecycle functions that can be implemented for SoyComponent.

## Nested Components
Since we want to be able to separate business logic from rendering, it'd be really useful to be able to reference components on the template files. That would make it easier to correctly place the child component at the right position inside the parent, and would make the template more complete so it would be able to render the whole component by itself (see [Decorate](#decorate)).

This can already be done with SoyComponent. For example, let's say we have the Modal and Button components, and the modal wants to render buttons on its footer. Inside **modal.soy** we'd see the following:

```
{template .footer}
	{delcall Button}
		{param id: 'ok' /}
		{param label: 'Ok' /}
	{/delcall}
	{delcall Button}
	{param id: 'cancel' /}
		{param label: 'Cancel' /}
	{/delcall}
{/template}
```

When Modal is rendered, the two specified buttons will be rendered as well. Also, the button instances can be accessed from the `components` property inside the modal instance, indexed by their ids:

```javascript
modal.components.ok // The instance for the 'Ok' button
modal.components.cancel // The instance for the 'Cancel' button
```

## Decorate

[Progressive enhancement](http://en.wikipedia.org/wiki/Progressive_enhancement) is a feature that is very important for a lot of people. Knowing about this, MetalJS is prepared to deal with content that already comes rendered from the server. In that case, instead of calling `render` the developer can call `decorate` instead. This will skip the rendering phase of the component, running only the code that enhances it with javascript behavior instead.

For SoyComponent, this means that the template won't be rendered, but the `attached` lifecycle method will still be called.

It's important to note that building components with SoyComponent also helps with progressive enhancement in another way: by providing a faithful template that can be run by the server without having to duplicate the rendering code or run javascript at all.

## Performance

TODO

## Browser

TODO
