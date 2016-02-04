# Metal.js

[![Build Status](http://img.shields.io/travis/metal/metal.js/master.svg?style=flat)](https://travis-ci.org/metal/metal.js)
[![Dependencies Status](http://img.shields.io/david/metal/metal.js.svg?style=flat)](https://david-dm.org/metal/metal.js#info=dependencies)
[![DevDependencies Status](http://img.shields.io/david/dev/metal/metal.js.svg?style=flat)](https://david-dm.org/metal/metal.js#info=devDependencies)

Metal.js is a JavaScript library for building UI components in a solid, flexible way.

Even though it's powerful, Metal.js is very small, being only around 9kb after compressed with gzip. It's also really well tested, currently with 99% coverage of unit tests, besides having great performance.

* [Official website](http://metaljs.com)
* [Documentation](https://github.com/metal/metal.js/wiki)

## Install

Install via [npm](https://www.npmjs.com/), or [download as a zip](https://github.com/metal/metal.js/archive/master.zip):

```
npm install metal
```

## Usage

With the code already available, you can use Metal.js by just importing the desired module on your js file and calling what you wish on it. For example:

```js
import core from './node_modules/metal/src/core';

// You can now call any function from Metal.js's core module.
core.isString('Hello World');
```

Note that Metal.js is written in [ES6](https://babeljs.io/docs/learn-es6/) (a.k.a ECMAScript 2015), so you can also use ES6 on your code like we did on the example. Since ES6 isn't fully implemented on browsers yet though, either a polyfill or a build process is necessary before using Metal.js on a website.

## Tools

Metal.js comes together with a set of [gulp](http://gulpjs.com) tasks designed to help develop with it. To learn more about them and use them, take a look at [gulp-metal](https://github.com/metal/gulp-metal).

## Browser Support

[![Sauce Test Status](https://saucelabs.com/browser-matrix/alloyui.svg)](https://travis-ci.org/metal/metal.js)

## License

[BSD License](https://github.com/metal/metal.js/blob/master/LICENSE.md) © Liferay, Inc.
