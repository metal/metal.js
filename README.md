# Metal.js

[![Build Status](https://img.shields.io/travis/metal/metal.js/master.svg?style=flat)](https://travis-ci.org/metal/metal.js)
Join #metal on our [Slack Channel](https://community.liferay.com/chat)

[![Build Status](https://saucelabs.com/browser-matrix/metal-js.svg)](https://saucelabs.com/beta/builds/a0b06f2845e541c78db25576f2ddc501)

Metal.js is a JavaScript library for building UI components in a solid, flexible way.

* [Official website](http://metaljs.com)

## Support and Project status

Metal.js is widely used and well maintained internally at Liferay but
does not currently have staffing to support the open source release. As such
this project is mostly _internal_ and support is _minimal_. For certain
issues, like build integration we are in an especially bad position to offer
support.

To get assistance you can use any of the following forums

1. Look through the [documentation](https://metaljs.com/).
2. File an [issue on GitHub](https://github.com/metal/metal.js/issues)

We will try our best, but keep in mind that given our support staffing, we may
not be able to help.

## Setup

1. Install NodeJS >= [v0.12.0](http://nodejs.org/dist/v0.12.0/), if you don't have it yet.

2. Install lerna global dependency:

  ```
  [sudo] npm install -g lerna@2.2.0
  ```

3. Run the bootstrap script to install local dependencies and link packages together:

  ```
  npm run lerna
  ```

4. Run tests:

  ```
  npm test
  ```

## Developer Tools for Metal.js
* [Chrome Extension](https://chrome.google.com/webstore/detail/metaljs-developer-tools/fagnjmppkokolnbloalifcmcooldhiik)

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)

## License

[BSD License](https://github.com/metal/metal.js/blob/master/LICENSE.md) © Liferay, Inc.
