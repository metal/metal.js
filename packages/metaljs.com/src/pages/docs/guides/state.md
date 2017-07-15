---
title: "State"
description: ""
layout: "guide"
weight: 110
---

<article>

The **State** class provides a way of defining state properties for the
classes that extend it, as well as watching these properties for value changes.

The **Component** class already extends from **State** by default, besides
automatically rerendering when there is a change.

If your class doesn't need to render anything it's best to extend from
{sp}**State** directly though. That way you'll have access to its features
without also inheriting logic you won't need.

</article>

<article id="configuring_state">

## [Configuring State](#configuring_state)

The following example is a class that extends directly from **State** and
defines a state property named `number` on itself:

```javascript
import core from 'metal';
import State from 'metal-state';

class Calculator extends State {
    /**
     * Coverts string numbers to the number type.
     */
    setNumber(val) {
        if (core.isString(val)) {
            val = parseInt(val, 10);
        }
        return val;
    }
}

Calculator.STATE = {
    number: {
        // Called whenever a new value is set. Useful when normalizing your
        // state data.
        setter: 'setNumber',

        // Accepts either number or string types. If the validator check fails,
        // the new value is discarded, and the current value kept.
        validator: val => core.isNumber(val) || core.isString(val),

        // Initial value
        value: 0
    }
}
```

If you're familiar with [YUI](http://yuilibrary.com/), you may recognize this
feature and notice that it's very similar to how attributes are defined there.
You basically just need to list all attributes you'll be using on the
{sp}**STATE** static variable (on YUI it would be on **ATTRS**), and provide
their configuration options, like initial value and validator. For a list of
all valid options, take a look at **State**'s
{sp}[docs](http://github.com/metal/metal-state/blob/c87ac15b8a9fa3ee64c421f22411f97cd376024a/src/State.js#L61).

</article>

<article id="accessing_and_updating_state">

## [Accessing and Updating State](#accessing_and_updating_state)

The constructor can receive a configuration object with initial values to use
for its state properties. You can access or change an object's state in the
same way you'd access or change any object property. Or you can also call the
{sp}`setState` function, which updates the properties specified by the given
object.

```javascript
var obj = new Calculator();
console.log(obj.number); // Prints 0

obj.number = '1';
console.log(obj.number); // Prints 1

obj.setState({number: 2});
console.log(obj.number); // Prints 2
```

You can also track state value changes by listening to the appropriate event.

```javascript
obj.on('numberChanged', function(event) {
    // event.prevVal has the previous value.
    // event.newVal has the new value.
});
```

To see all features of the **State** class take a look at its
{sp}[unit tests](https://github.com/metal/metal-state/blob/master/test/State.js).

</article>

<article id="configuration_data">

## [Configuration Data](#configuration_data)

Any data passed to the constructor that has not been configured as a state
property can still be accessed via `config`. Changes to these properties won't
be tracked, so it's usually intended for your component's options, which are
only set from the outside.

```javascript
var obj = new Calculator({
    number: 10,
    foo: 'foo'
});

console.log(obj.number); // Prints 2
console.log(obj.foo); // Prints undefined
console.log(obj.config.foo); // Prints 'foo'
```

</article>