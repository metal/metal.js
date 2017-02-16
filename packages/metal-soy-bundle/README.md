metal-soy-bundle
===================================

A bundle containing all the closure dependencies required by soy files compiled to incremental-dom.

Note that this bundle was built by hand, and some features were deliberately removed to make the resulting bundle smaller, like escaping (which shouldn't be necessary for incremental dom anyway) and bidi directives (which will be added back soon).
