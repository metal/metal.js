metal-soy-bundle
===================================

A bundle containing all the closure dependencies required by soy files compiled to incremental-dom.

Note that this bundle was built by hand, and some features were deliberately removed to make the resulting bundle smaller, like escaping (which shouldn't be necessary for incremental dom anyway) and bidi directives (which will be added back soon).

## Build Process

There are two steps to generating the consumable `lib/bundle.js` file. The entire process is triggered by the `npm prepublish` script.

### Concatentation

The `gulp build` task first concatenates the files found in the `src/closure-library` and `src/closure-templates` directories into the `build/bundle.js` file.

### Transpilation

Once the source files have been concatenated, the generated `build/bundle.js` file is transpiled by the `npm compile` script and placed in the `lib` directory at `lib/bundle.js`. This file is the entry point for the `metal-soy-bundle` package.
