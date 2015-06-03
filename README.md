# Metal.js

[![Build Status](http://img.shields.io/travis/metal/metal.js/master.svg?style=flat)](https://travis-ci.org/metal/metal.js)
[![Dependencies Status](http://img.shields.io/david/metal/metal.js.svg?style=flat)](https://david-dm.org/metal/metal.js#info=dependencies)
[![DevDependencies Status](http://img.shields.io/david/dev/metal/metal.js.svg?style=flat)](https://david-dm.org/metal/metal.js#info=devDependencies)

Metal.js is a JavaScript library for building from simple widgets to full scale applications.

Even though it's powerful, Metal.js is very small, being only around 9kb after compressed with gzip. It's also really well tested, currently with 99% coverage of unit tests, besides having great [performance](#performance).

## Architecture

Metal.js's main classes are [Attribute](#attribute) and **Component**. Component actually extends from Attribute, thus containing all its features. The main difference between the two is that Component's extra features are related to rendering. So you could just use Attribute directly if your module doesn't do any rendering. But if your module does need rendering logic though, then Component will work better for you.

One thing that can be really useful for a developer when building a component, is to separate the rendering logic from the business logic. This can be achieved on Metal.js by modules built on top of Component, that integrate with template engines. Metal.js already provides an implementation called [SoyComponent](#soycomponent) that integrates with [Soy Templates](http://developers.google.com/closure/templates), also referred to as Closure Templates.

![Architecture Chart](http://f.cl.ly/items/1y1K2d1724253I372w2p/architecture.png)

## Dependencies

* For build tooling, you'll need Node.js v0.10 or newer.
* For Soy templates compilation, you'll need Java SDK v1.7 or newer.

## Setup

1. Install [Bower](http://bower.io/), if you don't have it yet.
2. Run `bower install metal`. The code will be available at `bower_components/metal`.

## Usage

With the code already available, you can use Metal.js by just importing the desired module on your js file and calling what you wish on it. For example:

```js
import core from './bower_components/metal/src/core';

// You can now call any function from Metal.js's core module.
core.isString('Hello World');
```

Note that Metal.js is written in [ES6](https://babeljs.io/docs/learn-es6/) (a.k.a ECMAScript 2015), so you can also use ES6 on your code like we did on the example. Since ES6 isn't fully implemented on browsers yet though, either a polyfill or a build process is necessary before using Metal.js on a website. See the [Build Tasks](#build-tasks) section for more details.

## Alias

Having to supply the relative path to bower_components is not cool and, besides that, it may cause problems when a module doing that is imported later as a bower dependency of another project.

Knowing that, Metal.js allows the use of aliases to refer to bower dependencies. It basically allows importing dependencies by just using a prefix instead of the whole path to the bower folder location. Note that this will only work when using Metal.js's [build tools](#build-tasks) or adding a similar logic to your build process yourself (though we provide a [helper function](https://github.com/metal/metal.js/blob/master/tasks/lib/renameAlias.js) on Metal.js's npm package).

With aliases, the previous example can be rewritten like this:

```js
import core from 'bower:metal/src/core';
```

## Attribute

The **Attribute** class provides a way of defining attributes for the classes that extend it, as well as watching these attributes for value changes.

The following example is a class that extends from Attribute and defines an attribute named `foo` on itself:

```js
import Attribute from '../bower_components/metal/src/attribute/Attribute';

class MyAttributes extends Attribute {
	constructor(opt_config) {
		super(opt_config);
	}
}

MyAttributes.ATTRS = {
	foo: {
		value: 'Initial value'
	}
}
```

If you're familiar with [YUI](http://yuilibrary.com/), you'll notice that this is very similar to how attributes are defined there. You basically just need to list all attributes you'll be using on the ATTRS static variable, and provide their configuration options, like initial value and validator. For a list of all valid options, take a look at Attribute's [docs](https://github.com/metal/metal.js/blob/master/src/attribute/Attribute.js#L45).

You can access or change an object's attributes in the same way you'd access or change any object property.

```js
var obj = new MyAttributes();
console.log(obj.foo); // Prints 'Initial value'

obj.foo = 'New value';
console.log(obj.foo); // Prints 'New value'
```

You can also listen to attribute value changes by listening to the appropriate event.

```js
obj.on('fooChanged', function(event) {
	// event.prevVal has the previous value.
	// event.newVal has the new value.
});
```

To see all features of the Attribute class, take a look at its [unit tests](https://github.com/metal/metal.js/blob/master/test/src/attribute/Attribute.js).

## SoyComponent

This section will explain how to build rich widgets on Metal.js, by taking advantage of the **SoyComponent** class. By using SoyComponent, you'll be able to easily separate business logic from rendering logic, as it provides an integration with [soy templates](http://developers.google.com/closure/templates).

Building a widget with SoyComponent is simple, you just need to create two files: one with your soy templates, and the other with your JavaScript logic.

So, for example, let's say we want to create a widget called **MyWidget**, that has a body and a footer with content. The JavaScript file would look like this:

```js
import SoyComponent from '../bower_components/metal/src/soy/SoyComponent';
import from './myWidget.soy.js';

class MyWidget extends SoyComponent {
	constructor(opt_config) {
		super(opt_config);
	}
}

MyWidget.ATTRS = {
	bodyContent: {
		value: 'Initial body content.'
	},
	footerContent: {
		value: SoyComponent.sanitizeHtml('<footer>Initial footer content.</footer>')
	}
};
```

This file just defines a class named MyWidget, makes it extend from SoyComponent, imports the compiled soy templates and defines two [attributes](#attribute). Note that html strings need to be properly sanitized, otherwise they will be escaped by default before rendering.

Now we just need a soy file for MyWidget's rendering logic. It would look like this:

```
{namespace Templates.MyWidget}

/**
 * This renders the component's whole content.
 */
{template .content}
	{delcall MyWidget.body data="all" /}
	{delcall MyWidget.footer data="all" /}
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

Note that, on the soy file, we have divided the main template into subtemplates, one for the body content and one for the footer. This is not necessary, but can be really helpful, as SoyComponent will handle these as special parts of the widget, automatically rerendering them when one of the attributes listed as params of a template changes. In MyWidget's case this means that whenever the value of the `bodyContent` attribute is changed, the `body` template will be called, and that part of the widget will be updated, even though there is no JavaScript code on MyWidget to handle this logic. The same goes for the `footerContent` attribute and the `footer` template.

SoyComponent's logic for updating the widget's contents automatically is very smart, so it won't cause a rerender unless it's necessary. So if a change causes a template to be called again, but the resulting HTML from the template is the same that was rendered for the last time, it will be ignored. This is done by compressing and caching the hash code of a template's results when it's called, and later using it to compare with new results to decide if a new content should be rendered or not.

Finally, to render an instance of MyWidget, just call `render`, passing any attribute values that you want to initialize:

```js
new MyWidget({headerContent: 'My Header'}).render(parentElement);
```

For a more complete and working example, take a look at the [metal-boilerplate](https://github.com/metal/metal-boilerplate) repo. Among other things, it lists all optional lifecycle functions that can be implemented for SoyComponent.

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

```js
modal.components.ok // The instance for the 'Ok' button
modal.components.cancel // The instance for the 'Cancel' button
```

## Inline events
Another feature Metal.js has that can be very useful is the ability to declare events inside templates, directly on the desired element. Besides being simple and intuitive, this feature allows Metal.js to handle attaching events itself, and so this can be done in the best way possible, with [delegates](https://learn.jquery.com/events/event-delegation/) for example, without the user having worry about that at all.

By using SoyComponent, for example, you can add inline listeners like this:

```
{template .button}
	<button data-onclick="handleClick"></button>
{/template}
```

Then, you just need to define a `handleClick` method on your component, and it will be called whenever the event is triggered.

## Decorate

[Progressive enhancement](http://en.wikipedia.org/wiki/Progressive_enhancement) is a feature that is very important for a lot of people. Knowing about this, Metal.js is prepared to deal with content that already comes rendered from the server. In that case, instead of calling `render` the developer can call `decorate` instead. This will skip the rendering phase of the component, running only the code that enhances it with JavaScript behavior instead.

For SoyComponent, this means that the template won't be rendered, but the `attached` lifecycle method will still be called.

It's important to note that building components with SoyComponent also helps with progressive enhancement in another way: by providing a faithful template that can be run by the server without having to duplicate the rendering code or run JavaScript at all.

## Performance

Metal.js was built from the first with performance in mind. We've run performance tests to compare it with other libraries and got really good results that show the benefits of using it.

In one of the tests we made, we built a simple list widget on three different libraries: Metal.js, YUI and React. We then measured the time it took to render those widgets with 1000 items each on three different situations:

* **First Render** - Creating and rendering the list for the first time, on a blank element.
* **Decorate** - Creating and decorating a list that was previously rendered on the DOM.
* **Update** - Changing the contents of the first item of the list, causing a rerender.

The chart below shows the results we obtained on Safari:

![Performance Test - List](https://chart.googleapis.com/chart?cht=bvg&chd=t:7,12,7|9,63.5,54.4|11,12,12&chds=0,65&chs=500x200&chl=First%20Render|Decorate|Update&chco=4285F4,DB4437,F4B400&chbh=r,0.25,1.5&chdl=Metal|YUI|React&chxt=x,y,y&chxl=2:|%28ms%29|&chxr=1,0,65,10&chxp=2,50&chtt=Performance%20Test%20-%20List)

In this previous test, the list widget was built on all three libraries as a single component that renders each list item itself. We also did another similar test, with a list widget that was built using [nested components](#nested-components) instead, on which the list component renders other components that represent list items. Since YUI doesn't have this concept of nested components, this test was only done for Metal.js and React.

Once again, the chart below shows the results we obtained on Safari:

![Performance Test - List](https://chart.googleapis.com/chart?cht=bvg&chd=t:45,50,9|35,13,13.6&chds=0,50&chs=500x200&chl=First%20Render|Decorate|Update&chco=4285F4,F4B400&chbh=r,0.25,1.5&chdl=Metal|React&chxt=x,y,y&chxl=2:|%28ms%29|&chxr=1,0,50,10&chxp=2,50&chtt=Performance%20Test%20-%20List%20with%20nested%20components)

## Tools

Metal.js comes together with a set of [gulp](http://gulpjs.com) tasks designed to help develop with it. To use them, just install Metal.js through [npm](https://www.npmjs.com/package/metal) and register the tasks on your gulpfile like this:

```js
var metal = require('metal');
metal(options);
```

As you can see, the metal function receives an optional object to customize the registered functions. Each task has its own options, but the `taskPrefix` option affects all task, registering them all with the provided prefix before the original names.

After calling the metal function, several tasks will then be available to run on gulp. These can be broken in different categories, so we'll explain each separately.

### Build Tasks

As we've mentioned before, Metal.js is written in ES6. Since browsers don't yet implement ES6, the original code won't run on them. There are several different ways to solve this, such as adding a ES6 polyfill like [traceur](https://github.com/google/traceur-compiler). That means adding more code to the page though, as well as compiling the code at run time.

Another option is to previously build the ES6 files to ES5 equivalents. Again, there are lots of ways to do this, and lots of formats to build to. Metal.js provides a few tasks as build options that can be used out of the box.

#### `gulp build:globals`
Builds ES6 code to ES5, bundling all modules into a single file and publishing each to a global variable. The following options can be passed to the metal function for customizing this task:
* `buildDest` The directory where the final bundle file should be placed. Default: **build**.
* `bundleFileName` The name of the final bundle file. Default: **metal.js**.
* `buildSrc` The glob expression that defines which files should be built. Default: **src/\*\*/\*.js**.
* `globalName` The name of the global variable that should hold the exported values of the modules. Default: **metal**.

#### `gulp watch:globals`
Watches for changes on the source files, rebuilding the code to the globals format automatically when that happens.

### Test Tasks

Metal.js also provides gulp tasks to help with testing modules built with Metal.js. The tasks assume that tests are written in [karma](http://karma-runner.github.io/0.12/index.html), and so there should be a **karma.conf.js** file. A sample karma.conf.js file can be found at [metal-boilerplate](https://github.com/metal/metal-boilerplate/blob/master/karma.conf.js), which works well with Metal.js, including correct coverage reports.

#### `gulp test`
Runs all tests once.

#### `gulp test:coverage`
Runs all tests once and then opens the coverage html file on the default browser.

#### `gulp test:browsers`
Runs all tests once on the following browsers: Chrome, Firefox, Safari, IE9, IE10 and IE11.

#### `gulp test:saucelabs`
Runs all tests once on Saucelabs. Both username and access key need to be previously specified as environemnt variables for this to work. See [karma-sauce-launcher](https://github.com/karma-runner/karma-sauce-launcher) for more details.

#### `gulp test:watch`
Watches for changes to source files, rerunning tests automatically when that happens.

### Soy Tasks

Finally, Metal.js provides an important task for developing with SoyComponent. If your code is using it, you'll need this task for the templates to be correctly handled and integrated with your javascript file.

#### `gulp soy`
Generates some soy templates that are necessary for integration with the SoyComponent module, and compiles them to javascript. The following options can be passed to the metal function for customizing this task:

* `corePathFromSoy` The path from the soy files location to Metal.js's core module. Default: **metal/src**.
* `soyDest` The directory where the compiled soy files should be placed. Default: **src**.
* `soyGeneratedOutputGlob` The glob expression that defines which soy files should output their final generated version to the build directory. Default **\*.soy**.
* `soyGenerationGlob` The glob expression that defines which soy files should go through the template generation phase of the task. Default: **\*.soy**.
* `soySrc` The glob expression that defines the location of the soy files. Default: **src/\*\*/\*.soy**.

## Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/alloyui.svg)](https://travis-ci.org/metal/metal.js)
