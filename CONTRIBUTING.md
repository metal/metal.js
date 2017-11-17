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
* [metal-assertions](http://npmjs.com/package/metal-assertions)
* [metal-component](http://npmjs.com/package/metal-component)
* [metal-dom](http://npmjs.com/package/metal-dom)
* [metal-events](http://npmjs.com/package/metal-events)
* [metal-incremental-dom](http://npmjs.com/package/metal-incremental-dom)
* [metal-jsx](http://npmjs.com/package/metal-jsx)
* [metal-soy](http://npmjs.com/package/metal-soy)
* [metal-soy-bundle](http://npmjs.com/package/metal-soy-bundle)
* [metal-state](http://npmjs.com/package/metal-state)
* [metal-web-component](http://npmjs.com/package/metal-web-component)

Each package has its own package.json and is set up so that it provides two
types of entry points: one for commonjs usage (**main**) and another for ES6
modules (**jsnext:main**). Check out metal-dom's
[package.json](packages/metal-dom/package.json#L11) file as an example.

## Pull requests & Github issues

* All pull requests should be sent to the `develop` branch, as the `master`
branch should always reflect the most recent release.
* Any merged changes will remain in the `develop` branch until the next
scheduled release.
* The only exception to this rule is for emergency hot fixes, in which case the
pull request can be sent to the `master` branch.
* A Github issue should also be created for any bug fix or feature, this helps
when generating the CHANGELOG.md file.

## Tests

Any change (be it an improvement, a new feature or a bug fix) needs to include
a test, and all tests from the repo need to be passing. To run the tests you
can use our npm script:

```
npm test
```

## Formatting

Run the format script to automatically format any changes:

```
npm run format
```

Once it's done formatting, run the lint script:

```
npm run lint
```

If there are any linting errors at this point, they must be addressed manually.

If you would like to see a list of our formatting standards check
out [our docs](https://hosting-liferayfrontendguidelines.wedeploy.io/).

## JS Docs

All methods should be documented, following [google's format](https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler).

# Releasing

Collaborators with publish permissions should follow these steps.

There are two different workflows for publishing this project, one for scheduled
releases, and one for emergency hot fixes.

## Scheduled release

1. Create a release branch from the updated `develop` branch

```
git checkout develop
git pull upstream develop
git checkout -b release/vX.X.X
```

2. Send release PR to `master`

3. Wait to see that all tests pass and then merge with merge commit

4. Checkout and pull `master` locally

```
git checkout master && git pull upstream master
```

5. Publish npm modules and push release tags

```
lerna publish (major/minor/patch accordingly)
```

6. Generate changelog

github_changelog_generator (https://github.com/skywinder/github-changelog-generator)

7. Commit changelog and push to `master`

```
git add CHANGELOG.md
git commit -m "Updates CHANGELOG for vX.X.X"
git push
```

8. Sync `develop` with `master`

```
git checkout develop
git merge master
```

9. Do GitHub release using the pushed vX.X.X tag and the appropriate portion of
CHANGELOG.md

## Hot fix

1. Create a feature branch from `master` (assuming hot fix has already been
merged)

```
git checkout master
git pull upstream master
git checkout -b feature/fix_foo
```

2. Send a fix PR to `master`

3. Follow steps 3-9 of a scheduled release
