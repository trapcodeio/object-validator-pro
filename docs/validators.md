[< Basics ](how_it_works.md) 

-----

### How to create a Validator
Creating powerful validators is very easy with OVP.

```javascript
// having imported {validate, Validator}
new Validator(name, validationFn, error);
```

| Argument          | Description |
| --------          | ----------- |
| `name`            | Name of the validator _e.g: `min` or `max` etc..._ |
| `validationFn`     | Function to handle validation. |
| `error`           | Error Message.|

The `error` message can parse two keywords if found.

`:param`: The key of the object being validated.

`:option`: The option passed to the validator in the rules object.

Your `validationFn` must return `true` or `false` and receives 3 arguments on validation. e.g

| Argument          | Description |
| --------          | ----------- |
| `val`            | Value of the key in the object being validated.|
| `opt`     | Option passed in the rule.|
| `obj`           | An `ObjectOnValidation` class to modify the current object being validated|

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
        url: 'some-blog-in-3030.com'
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


Lets a create validator that checks if `ourObject.hobbies` has an item "drink" and another validator that checks if `ourObject.website.url` has "http://"
```javascript
new Validator('NoDrinkInHobbies', (hobbies) => {
    if(hobbies.indexOf('drink') >= 0){
        return false;
    } else {
        return true;
    }
}, 'Drink found in :param');

new Validator('hasHttp', (url) => {
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
isValid = validate(ourObject, rule);
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

Sometimes not all validations requires program halt, some validations are for fixing things.

e.g  Instead of stopping the above process because `website.url` does not have "http://", why don't we add it ourselves?

```javascript
// lets add a different validator
new Validator('addProtocol', (url, protocol, obj) => {
    protocol = protocol + '://';
    if (url.substr(0, protocol.length) !== protocol)
        obj.setThis(protocol + url);
    return true;
});

validate(ourObject, {
    'website.url': { addProtocol: 'ftp' }
});
console.log(ourObject.website.url);
// logs: ftp://some-blog-in-3030.com

// Rerun with http instead
validate(ourObject, {
    'website.url': { addProtocol: 'http' }
});
console.log(ourObject.website.url);
// logs: http://some-blog-in-3030.com
```

Notice our new validator does not have an error? this is because we know this has no errors.
 
`obj.setThis`? this is a function in the [`ObjectOnValidation`](classes/object_on_validation.md) Class. `.setThis` sets the value of the current key we are validating.
i.e

```javascript
// this line
obj.setThis(protocol + url);

// is equivalent to
ourObject.website.url = protocol+url;

// can also be set like this
obj.set('website.url', protocol+url);

// any key of the obj can be modified or created using
obj.set(path, value);
```

Do see the [`ObjectOnValidation`](classes/object_on_validation.md) Class. It provides great helpers that assists with current object on validation modification.

#### Async Validators
Ovp handles async validators using the `validateAsync` function.

`validatorFn` must also have `async` before it to be treated as async.
All async validators are waited for and a `Promise<boolean>` is returned to you.

Lets check if `website.url` is a valid url using [`axios`](https://www.npmjs.com/package/axios).

```javascript
const axios = require('axios');

// lets add urlIsOnline Async validator.
new Validator('urlIsOnline', async (value) => {
    try{
        await axios.get(value);
        return true;
    }catch(e){
        return false;
    }
}, 'Url is not online!');

let asyncTestData: {
  url: 'some-blog-in-3030.com'  
};

let asyncRule = {
    'url': {addProtocol: 'https', 'urlIsOnline': true}
};

validateAsync(asyncTestData, asyncRule).then((isValid) => {
    // isValid is false;
});

// if you are in an async function you can use await instead
let isValid = await validateAsync(asyncTestData, asyncRule);
// isValid is false;
``` 

`UrlIsOnline` returned false because at the time of this documentation [https://some-blog-in-3030.com](https//some-blog-in-3030.com) is not online.

You should change the url to "google.com" and `urlIsOnline` will return `true`.

#### Adding Bulk Validators
You can set more than one custom validator using the `Validator.addBulk(arrayOfValidators)`

`Validator.make`: returns the object data of a validator, works just like the `new Validator` function but returns the validators data instead of setting them. 

See example below to see how it works.

```javascript
// Using Validator.make method
let emailValidator = Validator.make('isEmail', (email) => {
    return (typeof email === "string" && email.length>5 && email.includes('@'));
}, ':param does not look like an email');

let arrayOfValidators = [
    // Using Object Method
    {
        name: 'exact',
        error: ':param is not what we are expecting!',
        validator: (value, option) => {
            return value === option;
        }
    },

    // Using Object Method
    {
        name: 'strongPassword',
        error: ':param is not strong. no Capital letter found!',
        validator: (value) => {
            return value.toLowerCase() !== value;
        }
    },

    // Using Validator.make method Object from above
    emailValidator,
];

console.log(arrayOfValidators);

/*
returns: =====>
[ { name: 'exact',
    error: ':param is not what we are expecting!',
    validator: [Function: validator] },
  { name: 'strongPassword',
    error: ':param is not strong. no Capital letter found!',
    validator: [Function: validator] },
  { name: 'isEmail',
    error: ':param does not look like an email',
    validator: [Function] } ]
*/


Validator.addBulk(arrayOfValidators);
```

The data return by `emailValidator` in the console results is the same with the Objects manually declared in `arrayOfValidators` 
So you can populate `arrayOfValidators` any which way you find preferable.


#### Modifying Validators
Lets say for some reason you want to overwrite a validator that has been defined somewhere or somehow.

You can simply create a new validator with new function and error but same name. like below.
```javascript
// Old validator.
new Validator('checkName', () => {
    return true;
}, '1st Error message.');

// Overwrite using this.
new Validator('checkName', () => {
    return false;
}, 'Overwritten Error message.');
```

The above will work perfectly but OVP also includes an easy method to modify validators.

using `new Validator(name)` with only name as argument enables modification or creation using `.save()`  

```javascript
// Modify only validationFn
new Validator('checkName').validator(() => {
    return true;
}).save();

// Modify only error
new Validator('checkName').error('New Error Message.').save();
```

You can use any style you feel comfortable with.