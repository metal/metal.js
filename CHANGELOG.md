# Change Log

## [Unreleased](https://github.com/metal/metal.js/tree/HEAD)

[Full Changelog](https://github.com/metal/metal.js/compare/v2.16.3...HEAD)

**Closed issues:**

- IncrementalDOMRenderer render function can fall when a component created from a different version is passed [\#349](https://github.com/metal/metal.js/issues/349)
- goog.soy.data.SanitizedCss is not included in soy-bundle [\#324](https://github.com/metal/metal.js/issues/324)

**Merged pull requests:**

- Updates CHANGELOG for v2.16.3 [\#354](https://github.com/metal/metal.js/pull/354) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Update google-closure soy/data.js \(f7e0f45\) | Fixes \#324 [\#353](https://github.com/metal/metal.js/pull/353) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Excludes wedeploy branch from travis [\#352](https://github.com/metal/metal.js/pull/352) ([jbalsas](https://github.com/jbalsas))
- Replace instanceof check with check for COMPONENT\_FLAG | Fixes \#349 [\#350](https://github.com/metal/metal.js/pull/350) ([Robert-Frampton](https://github.com/Robert-Frampton))

## [v2.16.3](https://github.com/metal/metal.js/tree/v2.16.3) (2018-01-23)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.16.2...v2.16.3)

**Closed issues:**

- Use gh-pages for `demos` for metal-\* components [\#133](https://github.com/metal/metal.js/issues/133)

**Merged pull requests:**

- release/v2.16.3 [\#344](https://github.com/metal/metal.js/pull/344) ([Robert-Frampton](https://github.com/Robert-Frampton))
- If a valid id is passed to portalElement and the element is not found, create an element with that id [\#341](https://github.com/metal/metal.js/pull/341) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Removing unecessary karma-mocha repetition on karma.conf.js [\#340](https://github.com/metal/metal.js/pull/340) ([diegonvs](https://github.com/diegonvs))

## [v2.16.2](https://github.com/metal/metal.js/tree/v2.16.2) (2018-01-18)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.16.1...v2.16.2)

**Merged pull requests:**

- Import should be relative [\#343](https://github.com/metal/metal.js/pull/343) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Import should be relative [\#342](https://github.com/metal/metal.js/pull/342) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Merge pull request \#91 from Robert-Frampton/portal [\#339](https://github.com/metal/metal.js/pull/339) ([jbalsas](https://github.com/jbalsas))

## [v2.16.1](https://github.com/metal/metal.js/tree/v2.16.1) (2018-01-17)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.16.0...v2.16.1)

**Merged pull requests:**

- Updates CHANGELOG for v2.16.0 [\#338](https://github.com/metal/metal.js/pull/338) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Use globally defined setImmediate on server side for test suites like jest that have mock timers [\#337](https://github.com/metal/metal.js/pull/337) ([Robert-Frampton](https://github.com/Robert-Frampton))

## [v2.16.0](https://github.com/metal/metal.js/tree/v2.16.0) (2018-01-12)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.15.1...v2.16.0)

**Implemented enhancements:**

- Add support for Portals [\#330](https://github.com/metal/metal.js/issues/330)

**Closed issues:**

- Add .editorconfig [\#327](https://github.com/metal/metal.js/issues/327)

**Merged pull requests:**

- Updates CHANGELOG for v2.15.1 [\#336](https://github.com/metal/metal.js/pull/336) ([Robert-Frampton](https://github.com/Robert-Frampton))
- No longer use global setImmediate function due to performance issues [\#335](https://github.com/metal/metal.js/pull/335) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Adding credit to saucelabs in README [\#334](https://github.com/metal/metal.js/pull/334) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Adds a range validator [\#333](https://github.com/metal/metal.js/pull/333) ([julien](https://github.com/julien))
- Updating copyright year [\#332](https://github.com/metal/metal.js/pull/332) ([diegonvs](https://github.com/diegonvs))
- Skip portal rendering during SSR [\#331](https://github.com/metal/metal.js/pull/331) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Adds Fragment component [\#329](https://github.com/metal/metal.js/pull/329) ([bryceosterhaus](https://github.com/bryceosterhaus))
- Adds .editorconfig to the project [\#328](https://github.com/metal/metal.js/pull/328) ([pragmaticivan](https://github.com/pragmaticivan))

## [v2.15.1](https://github.com/metal/metal.js/tree/v2.15.1) (2017-12-04)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.15.0...v2.15.1)

**Implemented enhancements:**

- domData set [\#295](https://github.com/metal/metal.js/issues/295)
- Improve error message on validators [\#279](https://github.com/metal/metal.js/issues/279)

**Closed issues:**

- SSR breaks when `ref` is omitted from child component [\#323](https://github.com/metal/metal.js/issues/323)
- Provide events for all lifecycle methods on Component [\#300](https://github.com/metal/metal.js/issues/300)

**Merged pull requests:**

- release/v2.15.1 [\#325](https://github.com/metal/metal.js/pull/325) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Simplify isomorphic test fixtures [\#322](https://github.com/metal/metal.js/pull/322) ([Robert-Frampton](https://github.com/Robert-Frampton))

## [v2.15.0](https://github.com/metal/metal.js/tree/v2.15.0) (2017-12-01)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.14.1...v2.15.0)

**Implemented enhancements:**

- metal-dom prepend [\#296](https://github.com/metal/metal.js/issues/296)

**Closed issues:**

- Config.required\(\) is mutating the object [\#310](https://github.com/metal/metal.js/issues/310)
- \[metal-events\] Document process to emit events [\#308](https://github.com/metal/metal.js/issues/308)
- Default state values are not set by using WebComponents [\#305](https://github.com/metal/metal.js/issues/305)
- Updating NestedComponents via refs is not working [\#301](https://github.com/metal/metal.js/issues/301)
- Gulp watch doesn't working [\#286](https://github.com/metal/metal.js/issues/286)

**Merged pull requests:**

- release/v2.15.0 [\#320](https://github.com/metal/metal.js/pull/320) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Allow falsy values for domData.get [\#319](https://github.com/metal/metal.js/pull/319) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Add links to metaljs.com from package readme files [\#316](https://github.com/metal/metal.js/pull/316) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Add tests for error messages returned by arrayOf and shapeOf [\#315](https://github.com/metal/metal.js/pull/315) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Fixes saucelabs testname [\#314](https://github.com/metal/metal.js/pull/314) ([jbalsas](https://github.com/jbalsas))
- Fixing test:coverage script [\#313](https://github.com/metal/metal.js/pull/313) ([diegonvs](https://github.com/diegonvs))
- Split large test up into smaller parts, remove redundant section [\#312](https://github.com/metal/metal.js/pull/312) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Method calls to Config helpers should return new objects to avoid unintended mutation [\#311](https://github.com/metal/metal.js/pull/311) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Default STATE values should be preserved when rendering web components. Fixes \#305 [\#309](https://github.com/metal/metal.js/pull/309) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Run test:saucelabs script on CI [\#307](https://github.com/metal/metal.js/pull/307) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Emit "disposed" event on Component dispose [\#299](https://github.com/metal/metal.js/pull/299) ([p2kmgcl](https://github.com/p2kmgcl))

## [v2.14.1](https://github.com/metal/metal.js/tree/v2.14.1) (2017-11-15)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.14.0...v2.14.1)

**Merged pull requests:**

- Allow for parent element to be used in server side environments if document is defined as it is when using JSDom [\#298](https://github.com/metal/metal.js/pull/298) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Adds lint-staged configuration [\#293](https://github.com/metal/metal.js/pull/293) ([jbalsas](https://github.com/jbalsas))
- Update slack channel [\#290](https://github.com/metal/metal.js/pull/290) ([bryceosterhaus](https://github.com/bryceosterhaus))

## [v2.14.0](https://github.com/metal/metal.js/tree/v2.14.0) (2017-11-02)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.13.2...v2.14.0)

**Implemented enhancements:**

- metal-soy-bundle shouldn't be so fragile [\#273](https://github.com/metal/metal.js/issues/273)
- Support for OOTB isomorphic rendering [\#267](https://github.com/metal/metal.js/issues/267)
- Improving Metal.js Lifecycle and Compatiblilty [\#255](https://github.com/metal/metal.js/issues/255)

**Fixed bugs:**

- Multiple levels of Class inheritance when extending State causes static hint configuration issues [\#287](https://github.com/metal/metal.js/issues/287)
- hasClassWithNative\_ throws an error when trying to check for several classes [\#209](https://github.com/metal/metal.js/issues/209)

**Closed issues:**

- Change assert function for correct test cases [\#277](https://github.com/metal/metal.js/issues/277)
- Automate creation of CustomElements [\#268](https://github.com/metal/metal.js/issues/268)
- Default values being overwritten by an undefined value. \[metal-jsx\] [\#259](https://github.com/metal/metal.js/issues/259)
- Improve error message when using `oneOf` validation [\#254](https://github.com/metal/metal.js/issues/254)
- Multiple declarations of "goog.string" with webpack and Soy [\#251](https://github.com/metal/metal.js/issues/251)
- Repo Proposal: creating a metal-jsx-extras repository [\#239](https://github.com/metal/metal.js/issues/239)

**Merged pull requests:**

- Adds auto-generated initial CHANGELOG.md using https://github.com/skywinder/github-changelog-generator [\#289](https://github.com/metal/metal.js/pull/289) ([jbalsas](https://github.com/jbalsas))
- Ensure that STATE configuration from static hints are properly configured with multiple levels of class inheritance [\#288](https://github.com/metal/metal.js/pull/288) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Rename willRender to willUpdate since it's related to shouldUpdate and move implementation to renderer [\#285](https://github.com/metal/metal.js/pull/285) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Revert "Merge pull request \#275 from Robert-Frampton/metal-soy-bundle" [\#280](https://github.com/metal/metal.js/pull/280) ([jbalsas](https://github.com/jbalsas))
- Updating tests on validators using assert.isTrue\(\) to verify correct cases [\#278](https://github.com/metal/metal.js/pull/278) ([diegonvs](https://github.com/diegonvs))
- hasInitialValue\_ should return false if value is undefined, but validators should run regardless. Fixes \#259 [\#276](https://github.com/metal/metal.js/pull/276) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Check to see if bundle has been loaded already. Fixes \#273 [\#275](https://github.com/metal/metal.js/pull/275) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Export HTMLParser rather than attaching to window [\#274](https://github.com/metal/metal.js/pull/274) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Improve error message when using `oneOf` validation. Fixes \#254 [\#272](https://github.com/metal/metal.js/pull/272) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Add forceUpdate method to Component [\#271](https://github.com/metal/metal.js/pull/271) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Add tests for server side rendering of Soy and JSX components [\#269](https://github.com/metal/metal.js/pull/269) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Don't attempt to create element in Node.js environment [\#266](https://github.com/metal/metal.js/pull/266) ([Robert-Frampton](https://github.com/Robert-Frampton))
- importing metal-dom shouldn't immediately throw errors when running in Node.js environment [\#264](https://github.com/metal/metal.js/pull/264) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Update lerna to v2.2.0 [\#263](https://github.com/metal/metal.js/pull/263) ([Robert-Frampton](https://github.com/Robert-Frampton))
- metal-web-component [\#261](https://github.com/metal/metal.js/pull/261) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Adds `writeOnce` method to state Config utils [\#256](https://github.com/metal/metal.js/pull/256) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Fix travis-ci url in readme [\#252](https://github.com/metal/metal.js/pull/252) ([renatorib](https://github.com/renatorib))
- Issue/209 [\#231](https://github.com/metal/metal.js/pull/231) ([p2kmgcl](https://github.com/p2kmgcl))

## [v2.13.2](https://github.com/metal/metal.js/tree/v2.13.2) (2017-06-27)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.13.1...v2.13.2)

**Closed issues:**

- Unable to run tests [\#247](https://github.com/metal/metal.js/issues/247)
- Rename metal-incremental-dom/src/intercept [\#228](https://github.com/metal/metal.js/issues/228)
- Use higher-level classes [\#91](https://github.com/metal/metal.js/issues/91)

## [v2.13.1](https://github.com/metal/metal.js/tree/v2.13.1) (2017-06-09)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.13.0...v2.13.1)

## [v2.13.0](https://github.com/metal/metal.js/tree/v2.13.0) (2017-06-09)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.12.1...v2.13.0)

**Merged pull requests:**

- Consolidates incremental-dom usage in just one module [\#246](https://github.com/metal/metal.js/pull/246) ([jbalsas](https://github.com/jbalsas))

## [v2.12.1](https://github.com/metal/metal.js/tree/v2.12.1) (2017-06-07)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.12.0...v2.12.1)

## [v2.12.0](https://github.com/metal/metal.js/tree/v2.12.0) (2017-06-07)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.11.1...v2.12.0)

## [v2.11.1](https://github.com/metal/metal.js/tree/v2.11.1) (2017-06-07)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.11.0...v2.11.1)

**Closed issues:**

- Circular dependency introduced with DangerouslySetHTML  [\#244](https://github.com/metal/metal.js/issues/244)

**Merged pull requests:**

- Fixes circular dependency introduced with DangerouslySetHTML [\#245](https://github.com/metal/metal.js/pull/245) ([pragmaticivan](https://github.com/pragmaticivan))

## [v2.11.0](https://github.com/metal/metal.js/tree/v2.11.0) (2017-06-06)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.10.0...v2.11.0)

**Implemented enhancements:**

- Add a way to render html strings inside element in jsx components [\#127](https://github.com/metal/metal.js/issues/127)

**Fixed bugs:**

- Config.instanceOf is not validating [\#227](https://github.com/metal/metal.js/issues/227)

**Closed issues:**

- Nested component tutorial issue [\#238](https://github.com/metal/metal.js/issues/238)
- Error building JSX "1. Hello World" example [\#232](https://github.com/metal/metal.js/issues/232)
- Feature Proposal: otherProps [\#205](https://github.com/metal/metal.js/issues/205)

**Merged pull requests:**

- Add otherProps util and DangerouslySetHTML component [\#242](https://github.com/metal/metal.js/pull/242) ([bryceosterhaus](https://github.com/bryceosterhaus))
- Rename IncrementalDomAop.js to incremental-dom-aop.js [\#237](https://github.com/metal/metal.js/pull/237) ([Robert-Frampton](https://github.com/Robert-Frampton))
- Rename intercept.js [\#236](https://github.com/metal/metal.js/pull/236) ([jbalsas](https://github.com/jbalsas))
- Refactors for issue \#227 and pr https://github.com/metal/metal.js/pull/233 [\#234](https://github.com/metal/metal.js/pull/234) ([bryceosterhaus](https://github.com/bryceosterhaus))
- Fix for \#227 [\#233](https://github.com/metal/metal.js/pull/233) ([bryceosterhaus](https://github.com/bryceosterhaus))

## [v2.10.0](https://github.com/metal/metal.js/tree/v2.10.0) (2017-04-27)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.9.1...v2.10.0)

## [v2.9.1](https://github.com/metal/metal.js/tree/v2.9.1) (2017-04-27)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.9.0...v2.9.1)

## [v2.9.0](https://github.com/metal/metal.js/tree/v2.9.0) (2017-04-24)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.8.0...v2.9.0)

**Fixed bugs:**

- Listener attributes not rendered properly [\#222](https://github.com/metal/metal.js/issues/222)

**Closed issues:**

- \<!DOCTYPE html\> can not be parsed by soy [\#219](https://github.com/metal/metal.js/issues/219)
- Update the custom mouse events handler to use Metal contains\(\) implementation [\#212](https://github.com/metal/metal.js/issues/212)
- For certain child components, triggering an onChange and updating redux and/or state does not re-render [\#206](https://github.com/metal/metal.js/issues/206)

**Merged pull requests:**

- Adds valueFn as a Config method [\#226](https://github.com/metal/metal.js/pull/226) ([mthadley](https://github.com/mthadley))
- Adds support for SoyToIncrDomSrcCompiler from https://github.com/goog… [\#225](https://github.com/metal/metal.js/pull/225) ([jbalsas](https://github.com/jbalsas))
- Sets its name inside the listener function. Fixes \#222 [\#223](https://github.com/metal/metal.js/pull/223) ([fernandosouza](https://github.com/fernandosouza))
- Improve metal-soy-bundle build [\#221](https://github.com/metal/metal.js/pull/221) ([jbalsas](https://github.com/jbalsas))
- Adds link to metal-devtools chrome extension in README [\#220](https://github.com/metal/metal.js/pull/220) ([bryceosterhaus](https://github.com/bryceosterhaus))
- Uses contains method of metal-dom module. Closes \#212 [\#216](https://github.com/metal/metal.js/pull/216) ([fernandosouza](https://github.com/fernandosouza))

## [v2.8.0](https://github.com/metal/metal.js/tree/v2.8.0) (2017-03-03)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.7.0...v2.8.0)

**Merged pull requests:**

- Adds metal-assertions module to packages [\#215](https://github.com/metal/metal.js/pull/215) ([julien](https://github.com/julien))

## [v2.7.0](https://github.com/metal/metal.js/tree/v2.7.0) (2017-03-03)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.6.6...v2.7.0)

## [v2.6.6](https://github.com/metal/metal.js/tree/v2.6.6) (2017-03-02)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.6.5...v2.6.6)

## [v2.6.5](https://github.com/metal/metal.js/tree/v2.6.5) (2017-03-02)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.6.4...v2.6.5)

## [v2.6.4](https://github.com/metal/metal.js/tree/v2.6.4) (2017-02-16)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.6.3...v2.6.4)

**Merged pull requests:**

- Adds metal-soy-bundle to packages [\#211](https://github.com/metal/metal.js/pull/211) ([julien](https://github.com/julien))
- Exports Config from metal-soy [\#208](https://github.com/metal/metal.js/pull/208) ([mthadley](https://github.com/mthadley))
- Adds `internal` method to Config [\#207](https://github.com/metal/metal.js/pull/207) ([mthadley](https://github.com/mthadley))
- Check for document fragments in toElement [\#204](https://github.com/metal/metal.js/pull/204) ([julien](https://github.com/julien))
- Makes array.equal a little bit faster in case both arrays point to the same reference [\#203](https://github.com/metal/metal.js/pull/203) ([brunobasto](https://github.com/brunobasto))
- Remove useless line in the tests: [\#201](https://github.com/metal/metal.js/pull/201) ([yuchi](https://github.com/yuchi))

## [v2.6.3](https://github.com/metal/metal.js/tree/v2.6.3) (2017-01-18)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.6.2...v2.6.3)

**Closed issues:**

- Compatibility mode does no longer work for Soy [\#199](https://github.com/metal/metal.js/issues/199)

**Merged pull requests:**

- Rename singleton as soyRenderer\_ and add RENDERER\_NAME property [\#200](https://github.com/metal/metal.js/pull/200) ([jbalsas](https://github.com/jbalsas))

## [v2.6.2](https://github.com/metal/metal.js/tree/v2.6.2) (2017-01-17)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.6.1...v2.6.2)

**Merged pull requests:**

- Move hook to 'renderComponent' [\#198](https://github.com/metal/metal.js/pull/198) ([bryceosterhaus](https://github.com/bryceosterhaus))

## [v2.6.1](https://github.com/metal/metal.js/tree/v2.6.1) (2017-01-06)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.6.0...v2.6.1)

**Implemented enhancements:**

- Try saucelabs in travis with encrypted access key again [\#172](https://github.com/metal/metal.js/issues/172)

**Closed issues:**

- Add Metal.js to list of incremental dom known libraries [\#173](https://github.com/metal/metal.js/issues/173)

**Merged pull requests:**

- Adds hook for devtools extension [\#194](https://github.com/metal/metal.js/pull/194) ([bryceosterhaus](https://github.com/bryceosterhaus))
- Reverting commit [\#192](https://github.com/metal/metal.js/pull/192) ([fernandosouza](https://github.com/fernandosouza))
- Updates Android 4.4 emulator [\#191](https://github.com/metal/metal.js/pull/191) ([fernandosouza](https://github.com/fernandosouza))
- Add lint rule for semicolons [\#190](https://github.com/metal/metal.js/pull/190) ([bryceosterhaus](https://github.com/bryceosterhaus))
- Adds jwt secure key [\#189](https://github.com/metal/metal.js/pull/189) ([fernandosouza](https://github.com/fernandosouza))

## [v2.6.0](https://github.com/metal/metal.js/tree/v2.6.0) (2016-12-30)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.19...v2.6.0)

**Implemented enhancements:**

- Adds Node.js support [\#188](https://github.com/metal/metal.js/issues/188)

## [v2.5.19](https://github.com/metal/metal.js/tree/v2.5.19) (2016-12-22)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.18...v2.5.19)

**Merged pull requests:**

- Uses window from metal globals [\#186](https://github.com/metal/metal.js/pull/186) ([pragmaticivan](https://github.com/pragmaticivan))

## [v2.5.18](https://github.com/metal/metal.js/tree/v2.5.18) (2016-12-22)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.17...v2.5.18)

**Implemented enhancements:**

- Add link to slack channel to README.md [\#183](https://github.com/metal/metal.js/issues/183)

**Merged pull requests:**

- Adds link to slack channel to README.md [\#184](https://github.com/metal/metal.js/pull/184) ([pragmaticivan](https://github.com/pragmaticivan))

## [v2.5.17](https://github.com/metal/metal.js/tree/v2.5.17) (2016-12-17)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.16...v2.5.17)

**Implemented enhancements:**

- Pure Components [\#125](https://github.com/metal/metal.js/issues/125)
- Animations with Metal [\#120](https://github.com/metal/metal.js/issues/120)

**Closed issues:**

- Feature request: Add a `willRender` method to \(Soy\)Components [\#178](https://github.com/metal/metal.js/issues/178)

**Merged pull requests:**

- Implement "prepareStateForRender" — Fixes \#178 [\#181](https://github.com/metal/metal.js/pull/181) ([yuchi](https://github.com/yuchi))

## [v2.5.16](https://github.com/metal/metal.js/tree/v2.5.16) (2016-12-14)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.15...v2.5.16)

**Implemented enhancements:**

- Suggestion. Could we have a keyCode map? [\#168](https://github.com/metal/metal.js/issues/168)

## [v2.5.15](https://github.com/metal/metal.js/tree/v2.5.15) (2016-12-09)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.14...v2.5.15)

## [v2.5.14](https://github.com/metal/metal.js/tree/v2.5.14) (2016-12-07)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.13...v2.5.14)

## [v2.5.13](https://github.com/metal/metal.js/tree/v2.5.13) (2016-11-28)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.12...v2.5.13)

## [v2.5.12](https://github.com/metal/metal.js/tree/v2.5.12) (2016-11-25)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.11...v2.5.12)

## [v2.5.11](https://github.com/metal/metal.js/tree/v2.5.11) (2016-11-23)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.10...v2.5.11)

## [v2.5.10](https://github.com/metal/metal.js/tree/v2.5.10) (2016-11-21)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.9...v2.5.10)

## [v2.5.9](https://github.com/metal/metal.js/tree/v2.5.9) (2016-11-18)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.8...v2.5.9)

## [v2.5.8](https://github.com/metal/metal.js/tree/v2.5.8) (2016-11-17)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.7...v2.5.8)

## [v2.5.7](https://github.com/metal/metal.js/tree/v2.5.7) (2016-11-16)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.6...v2.5.7)

## [v2.5.6](https://github.com/metal/metal.js/tree/v2.5.6) (2016-11-14)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.5...v2.5.6)

## [v2.5.5](https://github.com/metal/metal.js/tree/v2.5.5) (2016-11-11)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.4...v2.5.5)

## [v2.5.4](https://github.com/metal/metal.js/tree/v2.5.4) (2016-11-10)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.3...v2.5.4)

**Merged pull requests:**

- Fixes gulp tasks for tests [\#171](https://github.com/metal/metal.js/pull/171) ([mairatma](https://github.com/mairatma))

## [v2.5.3](https://github.com/metal/metal.js/tree/v2.5.3) (2016-11-09)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.2...v2.5.3)

## [v2.5.2](https://github.com/metal/metal.js/tree/v2.5.2) (2016-11-07)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.5...v2.5.2)

**Closed issues:**

- Loss of component state when re-rendering sibling component in metal soy. [\#169](https://github.com/metal/metal.js/issues/169)

## [v1.0.5](https://github.com/metal/metal.js/tree/v1.0.5) (2016-10-28)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.1...v1.0.5)

## [v2.5.1](https://github.com/metal/metal.js/tree/v2.5.1) (2016-10-28)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.5.0...v2.5.1)

**Merged pull requests:**

- Adds back iphone to the list of browsers to be tested in ci [\#167](https://github.com/metal/metal.js/pull/167) ([mairatma](https://github.com/mairatma))

## [v2.5.0](https://github.com/metal/metal.js/tree/v2.5.0) (2016-10-24)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.4.7...v2.5.0)

**Fixed bugs:**

- Event delegation should skip "disabled" elements [\#134](https://github.com/metal/metal.js/issues/134)

**Closed issues:**

- Metal is using a deprecated Web API [\#162](https://github.com/metal/metal.js/issues/162)

## [v2.4.7](https://github.com/metal/metal.js/tree/v2.4.7) (2016-10-05)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.4.6...v2.4.7)

**Merged pull requests:**

- Improves tests cases to follow Firefox's behaviours [\#165](https://github.com/metal/metal.js/pull/165) ([fernandosouza](https://github.com/fernandosouza))
- Checks if an element is able to trigger an attached delegate click event - Fixes \#134 [\#157](https://github.com/metal/metal.js/pull/157) ([fernandosouza](https://github.com/fernandosouza))

## [v2.4.6](https://github.com/metal/metal.js/tree/v2.4.6) (2016-09-23)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.4.5...v2.4.6)

## [v2.4.5](https://github.com/metal/metal.js/tree/v2.4.5) (2016-09-21)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.4.4...v2.4.5)

**Implemented enhancements:**

- Allow setting metal compatibility mode via a global variable [\#159](https://github.com/metal/metal.js/issues/159)

**Fixed bugs:**

- Child components can steal their parent's ref. [\#158](https://github.com/metal/metal.js/issues/158)

## [v2.4.4](https://github.com/metal/metal.js/tree/v2.4.4) (2016-09-20)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.4.3...v2.4.4)

**Closed issues:**

- Backward compatibility strategy [\#138](https://github.com/metal/metal.js/issues/138)

**Merged pull requests:**

- Removes newline in error message [\#156](https://github.com/metal/metal.js/pull/156) ([mthadley](https://github.com/mthadley))

## [v2.4.3](https://github.com/metal/metal.js/tree/v2.4.3) (2016-09-14)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.4.2...v2.4.3)

**Fixed bugs:**

- "Cannot read property 'startSkipUpdates' of null"  [\#155](https://github.com/metal/metal.js/issues/155)

## [v2.4.2](https://github.com/metal/metal.js/tree/v2.4.2) (2016-09-01)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.4.1...v2.4.2)

## [v2.4.1](https://github.com/metal/metal.js/tree/v2.4.1) (2016-09-01)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.4.0...v2.4.1)

**Implemented enhancements:**

- Metal incorrectly handles reuse of elements when conditionally rendering [\#147](https://github.com/metal/metal.js/issues/147)

## [v2.4.0](https://github.com/metal/metal.js/tree/v2.4.0) (2016-08-31)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.3.1...v2.4.0)

**Implemented enhancements:**

- Store references to nodes that use the "ref" attribute [\#154](https://github.com/metal/metal.js/issues/154)

## [v2.3.1](https://github.com/metal/metal.js/tree/v2.3.1) (2016-08-31)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.3.0...v2.3.1)

## [v2.3.0](https://github.com/metal/metal.js/tree/v2.3.0) (2016-08-31)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.2.6...v2.3.0)

**Closed issues:**

- Try https://github.com/babel/babili instead of uglify [\#153](https://github.com/metal/metal.js/issues/153)

## [v2.2.6](https://github.com/metal/metal.js/tree/v2.2.6) (2016-08-29)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.2.5...v2.2.6)

**Fixed bugs:**

- `onClick` event fires for both left and right click in firefox [\#152](https://github.com/metal/metal.js/issues/152)
- Component will not render a prop as a class that has the same string in elementClasses [\#151](https://github.com/metal/metal.js/issues/151)

## [v2.2.5](https://github.com/metal/metal.js/tree/v2.2.5) (2016-08-12)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.2.4...v2.2.5)

**Implemented enhancements:**

- Add custom errors for common use cases of using a component after being disposed [\#150](https://github.com/metal/metal.js/issues/150)

## [v2.2.4](https://github.com/metal/metal.js/tree/v2.2.4) (2016-08-08)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.2.3...v2.2.4)

**Fixed bugs:**

- Unexpected behavior when modifying the config and props of children. [\#149](https://github.com/metal/metal.js/issues/149)

## [v2.2.3](https://github.com/metal/metal.js/tree/v2.2.3) (2016-08-08)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.2.2...v2.2.3)

**Fixed bugs:**

- Grandchild component with ref throwing error when conditionally rendered. [\#145](https://github.com/metal/metal.js/issues/145)
- Validators not always running when expected. [\#139](https://github.com/metal/metal.js/issues/139)

## [v2.2.2](https://github.com/metal/metal.js/tree/v2.2.2) (2016-08-04)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.2.1...v2.2.2)

**Closed issues:**

- sync\[attribute\] Methods not working [\#146](https://github.com/metal/metal.js/issues/146)

## [v2.2.1](https://github.com/metal/metal.js/tree/v2.2.1) (2016-08-03)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.2.0...v2.2.1)

**Implemented enhancements:**

- Rename children data from `config` to `props` for jsx components [\#137](https://github.com/metal/metal.js/issues/137)

## [v2.2.0](https://github.com/metal/metal.js/tree/v2.2.0) (2016-08-03)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.1.3...v2.2.0)

**Implemented enhancements:**

- Have validators reflect that values are optional by default. [\#140](https://github.com/metal/metal.js/issues/140)

**Fixed bugs:**

- Component data being reused when it shouldn't.  [\#143](https://github.com/metal/metal.js/issues/143)

## [v2.1.3](https://github.com/metal/metal.js/tree/v2.1.3) (2016-08-02)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.1.2...v2.1.3)

## [v2.1.2](https://github.com/metal/metal.js/tree/v2.1.2) (2016-08-02)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.1.1...v2.1.2)

**Fixed bugs:**

- Error being thrown when conditionally rendering components [\#142](https://github.com/metal/metal.js/issues/142)
- Validators no longer print the name of their component. [\#141](https://github.com/metal/metal.js/issues/141)

## [v2.1.1](https://github.com/metal/metal.js/tree/v2.1.1) (2016-07-29)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.1.0...v2.1.1)

## [v2.1.0](https://github.com/metal/metal.js/tree/v2.1.0) (2016-07-29)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.0.4...v2.1.0)

**Implemented enhancements:**

- Sugar api for state/props configuration boilerplate [\#136](https://github.com/metal/metal.js/issues/136)

## [v2.0.4](https://github.com/metal/metal.js/tree/v2.0.4) (2016-07-27)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.0.3...v2.0.4)

## [v2.0.3](https://github.com/metal/metal.js/tree/v2.0.3) (2016-07-26)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.0.2...v2.0.3)

## [v2.0.2](https://github.com/metal/metal.js/tree/v2.0.2) (2016-07-25)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.0.1...v2.0.2)

## [v2.0.1](https://github.com/metal/metal.js/tree/v2.0.1) (2016-07-25)
[Full Changelog](https://github.com/metal/metal.js/compare/v2.0.0...v2.0.1)

**Closed issues:**

- Writing Maintainable Components, Best Practices. [\#131](https://github.com/metal/metal.js/issues/131)
- ref vs key [\#129](https://github.com/metal/metal.js/issues/129)

## [v2.0.0](https://github.com/metal/metal.js/tree/v2.0.0) (2016-07-22)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.4...v2.0.0)

## [v1.0.4](https://github.com/metal/metal.js/tree/v1.0.4) (2016-07-22)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.3...v1.0.4)

**Closed issues:**

- FYI: Moving to github.com/metal/metal [\#132](https://github.com/metal/metal.js/issues/132)

## [v1.0.3](https://github.com/metal/metal.js/tree/v1.0.3) (2016-07-18)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.2...v1.0.3)

## [v1.0.2](https://github.com/metal/metal.js/tree/v1.0.2) (2016-07-14)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.1...v1.0.2)

## [v1.0.1](https://github.com/metal/metal.js/tree/v1.0.1) (2016-07-11)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0...v1.0.1)

## [v1.0.0](https://github.com/metal/metal.js/tree/v1.0.0) (2016-07-05)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-rc.4...v1.0.0)

**Implemented enhancements:**

- Pre-compiling metal imports [\#109](https://github.com/metal/metal.js/issues/109)
- Stop using `class` for ‘singletons’ [\#87](https://github.com/metal/metal.js/issues/87)
- Adds support for building modules to UMD syntax [\#79](https://github.com/metal/metal.js/issues/79)
- Adds support for updating component without surfaces [\#78](https://github.com/metal/metal.js/issues/78)

**Closed issues:**

- Update docs to use "on\[EventName\]" instead of "data-on\[eventname\]" [\#126](https://github.com/metal/metal.js/issues/126)
- Change event attributes to `on\[EventName\]` instead of `data-on\[eventname\]` [\#124](https://github.com/metal/metal.js/issues/124)
- Problem with data from a component being sent to another [\#123](https://github.com/metal/metal.js/issues/123)
- Updating a template from within itself can break things [\#94](https://github.com/metal/metal.js/issues/94)
- Document the relationship with AUI \(if any\) [\#90](https://github.com/metal/metal.js/issues/90)
- Add performance comparison with Angular [\#83](https://github.com/metal/metal.js/issues/83)
- Describe why is this better than an existing solution [\#81](https://github.com/metal/metal.js/issues/81)
- Is .ATTRS really necessary? [\#80](https://github.com/metal/metal.js/issues/80)
- Documentation [\#74](https://github.com/metal/metal.js/issues/74)

## [v1.0.0-rc.4](https://github.com/metal/metal.js/tree/v1.0.0-rc.4) (2016-06-09)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-rc.3...v1.0.0-rc.4)

## [v1.0.0-rc.3](https://github.com/metal/metal.js/tree/v1.0.0-rc.3) (2016-06-09)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-rc.2...v1.0.0-rc.3)

**Implemented enhancements:**

- Create bridge between Metal.js and React components [\#119](https://github.com/metal/metal.js/issues/119)
- Automatically make "this.config.children" accessible directly on "this.children". [\#118](https://github.com/metal/metal.js/issues/118)
- PropTypes and Prop Validation with JSX [\#111](https://github.com/metal/metal.js/issues/111)
- Functional components in metal.js [\#105](https://github.com/metal/metal.js/issues/105)

**Fixed bugs:**

- Returning an array with an empty string in JSX results in js error [\#117](https://github.com/metal/metal.js/issues/117)
- Attached and detached events not firing when expected when conditionally rendering JSX children. [\#115](https://github.com/metal/metal.js/issues/115)
- Error building "1. Hello World" example [\#114](https://github.com/metal/metal.js/issues/114)
- SVG support for metal-jsx? [\#113](https://github.com/metal/metal.js/issues/113)
- Not using keys with JSX Metal Components produces strange behavior [\#107](https://github.com/metal/metal.js/issues/107)

**Closed issues:**

- Render children without a wrapping element [\#122](https://github.com/metal/metal.js/issues/122)
- Stop using "key" for component references [\#121](https://github.com/metal/metal.js/issues/121)
- Class constructor is run after render method on component [\#116](https://github.com/metal/metal.js/issues/116)
- Add guide to explain how to attach component to a specific element [\#112](https://github.com/metal/metal.js/issues/112)
- Rendering a metal component appends component to node rather than replacing node [\#110](https://github.com/metal/metal.js/issues/110)
- Metal Lifecycle Method equivalent of componentWillReceiveProps\(\) [\#106](https://github.com/metal/metal.js/issues/106)
- Make components render by default [\#92](https://github.com/metal/metal.js/issues/92)

## [v1.0.0-rc.2](https://github.com/metal/metal.js/tree/v1.0.0-rc.2) (2016-04-28)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-rc.1...v1.0.0-rc.2)

## [v1.0.0-rc.1](https://github.com/metal/metal.js/tree/v1.0.0-rc.1) (2016-04-01)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-rc...v1.0.0-rc.1)

## [v1.0.0-rc](https://github.com/metal/metal.js/tree/v1.0.0-rc) (2016-03-09)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-alpha.5...v1.0.0-rc)

## [v1.0.0-alpha.5](https://github.com/metal/metal.js/tree/v1.0.0-alpha.5) (2016-02-04)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-alpha.4...v1.0.0-alpha.5)

**Closed issues:**

- Soy Component render mutates dom nodes [\#104](https://github.com/metal/metal.js/issues/104)

**Merged pull requests:**

- Revert "Improving core.UID\_PROPERTY uniqueness." [\#103](https://github.com/metal/metal.js/pull/103) ([henvic](https://github.com/henvic))
- Making the async module Node compatible. [\#102](https://github.com/metal/metal.js/pull/102) ([henvic](https://github.com/henvic))

## [v1.0.0-alpha.4](https://github.com/metal/metal.js/tree/v1.0.0-alpha.4) (2015-11-05)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-alpha.3...v1.0.0-alpha.4)

**Merged pull requests:**

- Reduces required boilerplate for creating soy components [\#100](https://github.com/metal/metal.js/pull/100) ([mairatma](https://github.com/mairatma))

## [v1.0.0-alpha.3](https://github.com/metal/metal.js/tree/v1.0.0-alpha.3) (2015-07-14)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-alpha.2...v1.0.0-alpha.3)

## [v1.0.0-alpha.2](https://github.com/metal/metal.js/tree/v1.0.0-alpha.2) (2015-07-14)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-alpha.1...v1.0.0-alpha.2)

## [v1.0.0-alpha.1](https://github.com/metal/metal.js/tree/v1.0.0-alpha.1) (2015-07-07)
[Full Changelog](https://github.com/metal/metal.js/compare/v1.0.0-alpha...v1.0.0-alpha.1)

## [v1.0.0-alpha](https://github.com/metal/metal.js/tree/v1.0.0-alpha) (2015-06-09)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.3.1...v1.0.0-alpha)

## [v0.3.1](https://github.com/metal/metal.js/tree/v0.3.1) (2015-06-09)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.3.0...v0.3.1)

## [v0.3.0](https://github.com/metal/metal.js/tree/v0.3.0) (2015-06-07)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.2.1...v0.3.0)

## [v0.2.1](https://github.com/metal/metal.js/tree/v0.2.1) (2015-06-03)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.2.0...v0.2.1)

## [v0.2.0](https://github.com/metal/metal.js/tree/v0.2.0) (2015-06-03)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.1.7...v0.2.0)

**Closed issues:**

- Create logo [\#93](https://github.com/metal/metal.js/issues/93)

## [v0.1.7](https://github.com/metal/metal.js/tree/v0.1.7) (2015-06-01)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.1.6...v0.1.7)

**Implemented enhancements:**

- Add toogleClasses method [\#97](https://github.com/metal/metal.js/issues/97)
- Travis does not connect to SauceLabs [\#96](https://github.com/metal/metal.js/issues/96)
- Add/Remove classes methods expect array instead string [\#95](https://github.com/metal/metal.js/issues/95)

**Closed issues:**

- Add instructions on using components from npm/bower [\#89](https://github.com/metal/metal.js/issues/89)
- Write a step-by-step tutorial on creating a Component [\#88](https://github.com/metal/metal.js/issues/88)

## [v0.1.6](https://github.com/metal/metal.js/tree/v0.1.6) (2015-05-11)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.1.5...v0.1.6)

## [v0.1.5](https://github.com/metal/metal.js/tree/v0.1.5) (2015-05-06)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.1.4...v0.1.5)

## [v0.1.4](https://github.com/metal/metal.js/tree/v0.1.4) (2015-04-23)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.1.3...v0.1.4)

**Closed issues:**

- Solidify proper project name [\#85](https://github.com/metal/metal.js/issues/85)

**Merged pull requests:**

- Replace Metal with Metal.js for \#85. [\#86](https://github.com/metal/metal.js/pull/86) ([blzaugg](https://github.com/blzaugg))
- Update README.md [\#84](https://github.com/metal/metal.js/pull/84) ([blzaugg](https://github.com/blzaugg))

## [v0.1.3](https://github.com/metal/metal.js/tree/v0.1.3) (2015-04-08)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.1.2...v0.1.3)

## [v0.1.2](https://github.com/metal/metal.js/tree/v0.1.2) (2015-04-08)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.1.1...v0.1.2)

**Closed issues:**

- Add section about Tooling [\#82](https://github.com/metal/metal.js/issues/82)

## [v0.1.1](https://github.com/metal/metal.js/tree/v0.1.1) (2015-04-06)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.1.0...v0.1.1)

**Implemented enhancements:**

- Creates yeoman generator [\#76](https://github.com/metal/metal.js/issues/76)

## [v0.1.0](https://github.com/metal/metal.js/tree/v0.1.0) (2015-04-02)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.0.2...v0.1.0)

**Implemented enhancements:**

- Organizes build tasks [\#77](https://github.com/metal/metal.js/issues/77)
- Fixes tests on all browsers [\#75](https://github.com/metal/metal.js/issues/75)
- Creates boilerplate [\#73](https://github.com/metal/metal.js/issues/73)

**Closed issues:**

- Adds Liferay services API [\#39](https://github.com/metal/metal.js/issues/39)

## [v0.0.2](https://github.com/metal/metal.js/tree/v0.0.2) (2015-03-31)
[Full Changelog](https://github.com/metal/metal.js/compare/v0.0.1...v0.0.2)

## [v0.0.1](https://github.com/metal/metal.js/tree/v0.0.1) (2015-03-31)
**Closed issues:**

- Adds Db timeout support for performed actions [\#37](https://github.com/metal/metal.js/issues/37)
- Adds temporaty promise polyfill [\#36](https://github.com/metal/metal.js/issues/36)
- Evaluates the complexity and maintainability of code [\#35](https://github.com/metal/metal.js/issues/35)
- Add test for lfr.rbind method [\#34](https://github.com/metal/metal.js/issues/34)
- Adds tests for database mechanism [\#32](https://github.com/metal/metal.js/issues/32)
- Adds tests to array.js functions [\#30](https://github.com/metal/metal.js/issues/30)
- Adds auto source formatting on test files [\#29](https://github.com/metal/metal.js/issues/29)
- Add tests to DB implementation [\#27](https://github.com/metal/metal.js/issues/27)
- Adds Liferay database mechanism [\#26](https://github.com/metal/metal.js/issues/26)
- Adds database implementation [\#20](https://github.com/metal/metal.js/issues/20)
- Adds Storage utility [\#19](https://github.com/metal/metal.js/issues/19)
- Adds tests to Transport [\#18](https://github.com/metal/metal.js/issues/18)
- Fixes wildcard ordering problem on EventEmitter [\#17](https://github.com/metal/metal.js/issues/17)
- Adds optional event facade on EventEmitter [\#16](https://github.com/metal/metal.js/issues/16)
- Allows listening to multiple events on same addEventListener call [\#15](https://github.com/metal/metal.js/issues/15)
- Adds tests to lfr.js functions [\#12](https://github.com/metal/metal.js/issues/12)
- Adds WebSocketTransport [\#10](https://github.com/metal/metal.js/issues/10)
- Adds array utilities namespace [\#9](https://github.com/metal/metal.js/issues/9)
- Converts tests to use Mocha instead of nodeunit [\#8](https://github.com/metal/metal.js/issues/8)
- Adds Disposable abstract class [\#6](https://github.com/metal/metal.js/issues/6)
- Adds EventHandler [\#5](https://github.com/metal/metal.js/issues/5)
- Adds support for namespaces/wildcards on EventEmitter [\#4](https://github.com/metal/metal.js/issues/4)

**Merged pull requests:**

- Stops using DomVisitor for collecting components on SoyComponent [\#71](https://github.com/metal/metal.js/pull/71) ([mairatma](https://github.com/mairatma))
- Makes decorate lifecycle work with nested components [\#70](https://github.com/metal/metal.js/pull/70) ([mairatma](https://github.com/mairatma))
- Allows all params passed to a component deltemplate to have subcomponents [\#69](https://github.com/metal/metal.js/pull/69) ([mairatma](https://github.com/mairatma))
- Adds surfaces automatically from templates info for SoyComponent [\#68](https://github.com/metal/metal.js/pull/68) ([mairatma](https://github.com/mairatma))
- Allows passing down children components through soy template [\#66](https://github.com/metal/metal.js/pull/66) ([mairatma](https://github.com/mairatma))
- Execute tests via Travis on Node 0.12 only [\#65](https://github.com/metal/metal.js/pull/65) ([ipeychev](https://github.com/ipeychev))
- Convert source files to use ES6 classes [\#59](https://github.com/metal/metal.js/pull/59) ([ipeychev](https://github.com/ipeychev))
- Attach provided events via delegate in Soy [\#58](https://github.com/metal/metal.js/pull/58) ([mairatma](https://github.com/mairatma))
- Replaces rimraf with del [\#57](https://github.com/metal/metal.js/pull/57) ([mairatma](https://github.com/mairatma))
- Changes src files to use import [\#56](https://github.com/metal/metal.js/pull/56) ([mairatma](https://github.com/mairatma))
- Changes tests to use karma instead of mocha [\#55](https://github.com/metal/metal.js/pull/55) ([mairatma](https://github.com/mairatma))
- Creates SoyComponent for better integration between Component and soy templates [\#54](https://github.com/metal/metal.js/pull/54) ([mairatma](https://github.com/mairatma))
- Allows listening to the element through Component's on/delegate functions [\#53](https://github.com/metal/metal.js/pull/53) ([mairatma](https://github.com/mairatma))
- Improves function for collecting super class values [\#52](https://github.com/metal/metal.js/pull/52) ([mairatma](https://github.com/mairatma))
- Adds function for listening to events via delegate [\#49](https://github.com/metal/metal.js/pull/49) ([mairatma](https://github.com/mairatma))
- Documents all the Attribute configuration options [\#48](https://github.com/metal/metal.js/pull/48) ([mairatma](https://github.com/mairatma))
- Makes WebChannel emit all events its transport emits [\#45](https://github.com/metal/metal.js/pull/45) ([mairatma](https://github.com/mairatma))
- Passes success and error handlers on each transport request [\#43](https://github.com/metal/metal.js/pull/43) ([mairatma](https://github.com/mairatma))
- Sends batch attribute change event [\#42](https://github.com/metal/metal.js/pull/42) ([mairatma](https://github.com/mairatma))
- Merges WebChannel and WebChannelTransport [\#40](https://github.com/metal/metal.js/pull/40) ([mairatma](https://github.com/mairatma))
- Add tests for Db, DbMechanism and HttpDbMechanism [\#33](https://github.com/metal/metal.js/pull/33) ([ipeychev](https://github.com/ipeychev))
- Adds optional event facade on EventEmitter - Fixes \#16 [\#21](https://github.com/metal/metal.js/pull/21) ([mairatma](https://github.com/mairatma))
- Converts tests to use Mocha instead of nodeunit - Fixes \#8 [\#11](https://github.com/metal/metal.js/pull/11) ([mairatma](https://github.com/mairatma))
- Adds support for namespaces/wildcards on EventEmitter - Fixes \#4 [\#7](https://github.com/metal/metal.js/pull/7) ([mairatma](https://github.com/mairatma))
- Adding eventemitter2 apis [\#1](https://github.com/metal/metal.js/pull/1) ([mairatma](https://github.com/mairatma))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*