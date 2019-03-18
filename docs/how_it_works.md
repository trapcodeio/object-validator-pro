[< Installation](installation.md)
___

### How it Works
Before you dive into the **core** of ovp lets tell you the basics.

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
        url: 'https://some-blog.com'
    }
};
```

Now we have an object lets create some rules.

OVP loops through these rules and passes the value of the key in the object being validated.

```javascript
// Rules are structured like
{
    objectKey: objectOfRulesToValidateWith
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

The second log `false` is the value `isValid` because validation failed.

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

From the error message above you can tell that the `typeOf: 'string'` rule stopped the validation because `typeof ourObject.email !== 'string'`