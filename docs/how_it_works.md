[< Installation](installation.md)

-----

### How it Works
Before you dive into the **core**, lets tell you the basics.

The `validate` function expects min: 2 and max: 3 arguments

```
let isValid = validate(objectToValidate, Rules, yesFunctionOrObject?);
```

`objectToValidate`: The object to validate.

`rules`: Rules ovp understands and uses to validate for you.

`yesFunctionOrObject`: Accepts a function or an object of events. 
For the basics we will talk about this later.

```javascript
// lets create an object
let ourObject = {
    email: '',
    name: 'Object Validator',
    age: 10,
    hobbies: ['eat', 'code', 'sleep'],
    website: {
        name: 'My Website',
        url: 'some-blog-in-3030.com'
    }
};
```

Lets set some rules.
OVP loops through these rules and passes the value of the key in the object being validated.

```javascript
// Rules are structured like
{
    objectKey: objectOfValidatorsToValidateWith
}
```

OVP comes out of the box with only [8 validators](rules/index.md) we think you will find useful. They can be overwritten too if you want.

```javascript
// Rule to check only email, name and age
let rule = {
    email: {typeOf: 'string', minLength: 5},
    name: {must: true, minLength: 5},
    age: {min: 13, max: 80}
};


let isValid = validate(ourObject, rule);
console.log(isValid);
```

In your log you should see
```
[ 'email', 'Email is too small. (Min. 5)' ]
false
```

The first log is an array logged by OVP's default `onEachError` function. 

`Array[0]`: Failed Object key, 

`Array[1]`: Parsed error message.

**Surprised?** Yes! OVP supports error messages.

The second log `false` is the value of `isValid` because validation failed.

lets modify `ourObject`
```javascript
// Assuming...
ourObject.email = ['an array instead of a string'];

// Rerun validation
let isValid = validate(ourObject, rule);
console.log(isValid);
```
```
// logs
[ 'email', 'Email is not typeOf string' ]
false
```

From the error message above you can tell that the `typeOf: 'string'` rule stopped the validation because `typeof ourObject.email !== 'string'` :)
```javascript
// Assuming...
ourObject.email = 'user@example.com';

// Rerun validation
let isValid = validate(ourObject, rule);
console.log(isValid);
```
```
// logs
[ 'age', 'Age is too small. (Min. 13)' ]
false
```

`ourObject.email` passed all its validators: `{typeOf: 'string', minLength: 5}`, then moves to `ourObject.age` after `ourObject.name` passed all its rules.

```javascript
// Assuming...
ourObject.age = 30;

// Rerun validation
let isValid = validate(ourObject, rule);
console.log(isValid);
// logs
true
```

Remember `validate` function accepts 3 arguments.
You can pass a `yes` callback function to run once all validation are successful.

```javascript
// Rerun validation
let isValid = validate(ourObject, rule, (object) => {
    console.log(object.hobbies);
});
console.log(isValid);
```
```
// logs
[ 'eat', 'code', 'sleep' ]
true
```

The `yes` callback function is called and validate function also returns `true`.
The object being validated is also sent to the callback function.

We hope you understand the basics of how it works now.
You can play with `ourObject` to go against the rules to see how OVP reacts.

Lets dive into the amazing part of using OVP.

-----
[Creating/Modifying Validators >](validators.md)