---
title: "Tutorial: Modal - Testing"
description: ""
layout: "guide"
weight: 500
---

<article>

In the [previous section](/docs/getting-started/modal_nested.html) we've
completed our **Modal** component. The last thing we'd like to show is how to
use the tools that **Metal.js** offers to help you test your code.

</article>

<article id="test_script">

## [Test Script](#test_script)

If you look at your `package.json` file you'll notice that it already
contains a test script that you can use:

```javascript
{
    "scripts": {
        "test": "gulp test"
    }
}
```

If you're building a project without the generator, you can still get
{sp}**Metal.js**'s test tools by using [gulp-metal](/docs/guides/building.html#gulp-metal).

</article>

<article id="adding_a_test">

## [Adding a Test](#adding_a_test)

Also note that your generated project directory also has a file called
{sp}`test/Modal.js`, with a failing assertion. As you can imagine, all you need
to do is add your tests to this file.

To illustrate this let's start by replacing the existing test with one that
checks that the given `body` data is being rendered correctly:

```javascript
import Modal from '../src/Modal';

describe('Modal', function() {
    it('should render the body', function() {
        var component = new Modal({
            body: 'Test Body'
        });

        var bodyElement = component.element.querySelector('.modal-body');

        assert.ok(bodyElement);
        assert.strictEqual('Test Body', bodyElement.textContent);
    });
});
```

</article>

<article id="running_the_tests">

## [Running the Tests](#running_the_tests)

To run our tests all you need to do is type `npm test` on your terminal.
You'll see something like this:

![Terminal screenshot](../../images/docs/test.png)

</article>

<article id="test_environment">

## [Test Environment](#test_environment)

This test file we wrote uses [Mocha](http://mochajs.org) and
{sp}[Chai](http://chaijs.com/) for describing tests, and
{sp}[Karma](http://karma-runner.github.io/0.12/index.html) as the test runner.
That's the default setup used by **gulp-metal**.

It's important to note that you don't have to use **gulp-metal** for you tests
though. It's just an easy way that's already provided for you, but you can
certainly setup your own environment if you wish.

</article>

<article id="next_steps">

## [Next steps](#next_steps)

You should now have a good knowledge of **Metal.js** basics. If you want to
dive into more details and advanced topics, go ahead and check some of our
guides.

</article>