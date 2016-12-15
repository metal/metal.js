# Contributing Guidelines

If you wish to contribute to Metal.js these guidelines will be important for
you. They cover instructions for setup, information on how the repository is
organized, as well as contribution requirements.

## Setup

You can find instructions on how to setup the Metal.js repo locally
[here](README.md#setup).

## Repo organization

This main Metal.js repository contains multiple packages, which are considered
the core modules. They're published separately in npm, as developers are not
required to use all of them on their projects, but at the same time they
interact a lot with each other and new features or even improvements often
require changes on more than one of these modules, which is hard to do and
test when code is split in separate repos.

That's why we've decided to use [LernaJS](https://lernajs.io/) to manage the
repo. It's perfect for this use case and it's been used by
[projects like Babel and React](https://lernajs.io/#users).

The repo is divided into packages, which are:
* [metal](http://npmjs.com/package/metal)
* [metal-component](http://npmjs.com/package/metal-component)
* [metal-dom](http://npmjs.com/package/metal-dom)
* [metal-events](http://npmjs.com/package/metal-events)
* [metal-incremental-dom](http://npmjs.com/package/metal-incremental-dom)
* [metal-jsx](http://npmjs.com/package/metal-jsx)
* [metal-soy](http://npmjs.com/package/metal-soy)
* [metal-state](http://npmjs.com/package/metal-state)

Each package has its own package.json and is set up so that it provides two
types of entry points: one for commonjs usage (**main**) and another for ES6
modules (**jsnext:main**). Check out metal-dom's
[package.json](packages/metal-dom/package.json#L11) file as an example.

## Contributing requirements

### Tests

Any change (be it an improvement, a new feature or a bug fix) needs to include
a test, and all tests from the repo need to be passing. To run the tests you
can use our gulp tasks:

* `gulp test` Runs all tests once
* `gulp test:coverage` Runs all tests once and shows a summary coverage
report.
* `gulp test:coverage:open` Runs all tests once and opens a detailed coverage
report in the browser.
* `gulp test:watch` Runs all tests and listens for changes, rerunning them
automatically.

### Lint

Lint errors need to be fixed. To lint the code just run: `gulp lint`.

### JS Docs

All methods should be documented, following [google's format](https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler).

## Publishing Metal.js

Collaborators with publish permissions should follow the following steps:

1. Make sure that the [CI tests](https://travis-ci.org/metal/metal.js/builds)
are passing.
2. Run `lerna publish`.
3. Edit the release in [github](https://github.com/metal/metal.js/releases) with
details about what has changed.
