[< Basics ](how_it_works.md) 

-----

### How to create a Validator
Creating powerful validators is very easy with OVP.

```javascript
// having imported {validate, Validator}
new Validator(name, validationFn, error);
```
| Argument          | Description
| --------          | -----------
| `name`            | Name of the validator _e.g: `min` or `max   ` etc..._
| `validationFn`     | Function to handle validation.
| `error`           | Error Message.

Your `validationFn` receives 3 arguments on validation. e.g

| Argument          | Description
| --------          | -----------
| `val`            | Value of the key in the object being validated.
| `opt`     | Option passed in the rule.
| `obj`           | An `ObjectOnValidation` class to modify the current object being validated

```javascript
// First we create a validator named: MyValidator
new Validator('myValidator', (...args) => {
    console.log(args);
    return false;
}, ':param failed myValidator');
```
The above syntax creates a validator named `myValidator` and logs all the arguments it receives.
Now lets run some validation to see how this turns out.

```javascript
// An object to validate
let ourObject = {
    hobbies: ['eat', 'code', 'sleep'],
    website: {
        name: 'My Website',
        url: 'some-blog.com'
    }
};

// Rules to validate with
let rule = {
    hobbies: {myValidator: 'any'}
};


// Run Validation
let isValid = validate(ourObject, rule);
console.log(isValid);
```

```
// logs
[[ 'eat', 'code', 'sleep' ], 'any', ObjectOnValidation]
[ 'hobbies', 'Hobbies failed myValidator' ]
false
```

The log above explains that `val` argument in `validationFn` is the value of the key in the object we are validating i.e `ourObject.hobbies`.

`opt` is the value passed to `myValidator` rule i.e 'any', while `obj` is a helper class to modify the object we are validating.

##### More Examples
Lets a create validator that checks if `ourObject.hobbies` has an item "drink" and another validator that checks if `ourObject.website.url` has "http://"
```javascript
new Validator('NoDrinkInHobbies', (hobbies) => {
    if(hobbies.indexOf('drink') >= 0){
        return false;
    } else {
        return true;
    }
}, 'Drink found in :param');

new Validator('hasHttp', (url)=>{
    if(url.substr(0, 7) !== 'http://'){
        return false;
    } else {
        return true;
    }
}, ':param must start with http://');


// new rule
let rule = {
    hobbies: {NoDrinkInHobbies: true},
    'website.url': {hasHttp: true}
};

// Run Validation
let isValid = validate(ourObject, rule);
console.log(isValid);

// Assuming...
ourObject.hobbies = ['eat', 'code', 'sleep', 'drink'];

// Rerun Validation
isValid = validate(ourObject, rule);
console.log(isValid);
```
```
// Before Assumption
[ 'website.url', 'Website Url must start with http://' ]
false

// After Assumption
[ 'hobbies', 'Drink found in Hobbies' ]
false
```

In the first validation, `website.url` fails because `hasHttp` validator returned `false`.
After changing the value of `ourObject.hobbies` the second validation fails because `NoDrinkInHobbies` returned false.

 