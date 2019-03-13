## Object-Validator-Pro

Object-Validator-Pro provides a very easy api for developers to make custom validations.

Also comes out of the box with 6 validators which can be overwritten easily.  

### Installation

Using **npm**

```bash
npm install object-validator-pro
```

Using **yarn**

```bash
yarn add object-validator-pro
```

### Usage
```javascript
const {validate, validateAsync, Validator} = require("object-validator-pro");
```

`vaidate`: Function to run validations, returns `boolean`

`validateAsync`: Function to run Async validations, returns `Promise<boolean>`

`new Validator`: to create/add your custom validators.


#### Simple Form Data Validation
```javascript
    // Object to validate
    let data = {
        username: 'NodeJs',
        password: '123456'
    };
    
    // "*" sets validation for all data keys, more like a wildcard.
    let rules = {
        "*": {
            typeOf: 'string',
            must: true
        },
        password: {minLength: 10}
    };
    
    
    let check = validate(data, rules);
    
    if (!check) {
        // do something
    }
    
    // returns: false
    // log: [ 'password', 'Password is too short. (Min. 10 characters)' ]
    
    // if rules has an Async validator use
    
    validateAsync(data, rules).then((isValid) => {
        // isValid holds the result: boolean;
    });
```

`check` returned false and `validate` function logs an array `on each error`,

 `Array[0]`: Failed Object key, `Array[1]`: Error message.
 
To check if `*` (wildcard) affected `data.username`, it should return an error when username is not a `string`
 
```javascript
data.username = ['an array instead of a string'];

check = validate(data, rules);

// returns: false
// log: [ 'username', 'Username is not typeOf string' ]
```

#### Super Rules
These are rules that are defined and should not be overwritten.

`*`: validates all object keys against every validator defined in its value.

`:skip`: accepts a `boolean` or a `function(value?)` that returns a `boolean`, 
if `false` that particular validation will be skipped!

#### Overriding default `onEachError` function
Default `onEachError` function can be overwritten and can also be set per validation. which ever you choose depending on the project.

``Validator.overrideDefaultFunction(key, function)``

`key`: Name of default function to override.

`function`: => Function to be replaced with. 

```javascript
Validator.overrideDefaultFunction('onEachError', (param, msg) => {
    console.log('===> ', '{' + param + '}', msg)
});

check = validate(data, rules);

// returns: false
// log: ===> {username} Username is not typeOf string

// Or set per validation

check = validate(data, rules, {
    onEachError(param, msg) {
        console.log('Custom onEach Error ===> ', '{' + param + '}', msg)
    }
});
// returns: false
// Custom onEach Error ===>  {username} Username is not typeOf string


// With custom onEachError results to default onEachError set above.

data.username = 'NodeJs';
check = validate(data, rules);

// returns: false
// log: {password} Password is too short. (Min. 10 characters)
```

Validator moves to password after username has been set to string and no longer has errors.

Now lets set proper data to return true.
```javascript
data = {
    username: 'NodeJs',
    password: '1234567890'
};

check = validate(data, rules, function ($data) {
    console.log($data);
    console.log('Yes i passed all!!');
});

// returns: true;
// log: { username: 'NodeJs', password: '1234567890' }
// log: Yes i passed all!!
```

When all validation functions are passed without errors you can set a callback function
as the third parameter of the `validate` function as seen above or an object containing a `yes` function as seen below.
The form being validated is also passed to your callback function.

```javascript
check = validate(data, rules, {
    yes ($data) {
        console.log($data);
        console.log('Yes i passed all!!');
    }
}); 
```
Works just like the direct function method and useful when setting other validation functions.

`validate` function 3rd parameter can accept an object of default functions just like this.
```javascript
let validatorOptions = {
   yes() {},

   beforeValidation() {
       return true;
   },

   onEachError(param, msg) {}
};

check = validate(data, rules, validatorOptions);
```

`yes`: will run when all validation is successful.

`beforeValidation`: Runs before validation, Stops validation if returns false.

`onEachError`: Callback on each error.


#### Adding New Validation

using the `new Validator(name, validationFn, error?)` syntax you can add or modify any validation function or error.
Lets add a new validation called `exact` that checks if the `data` key matches some other word.

`name`: Name of your new validator.

`validator`: The function that runs your validation (can be `async`)

`error`: Error message to show.


The `validator` is passed two arguments on validation


`value`: The value of the object key being validated i.e `data[value]`.

`option`: The value of the validation rule passed. 

```javascript
new Validator('exact', (value, option) => {
    console.log([value, option]);
    return false;
}, ':param does not match :option');

rules = {
    username: {minLength: 20, exact: 'goodString'}
};

validate(data, rules);

// returns: true
// log: [ 'NodeJs', 'goodString' ]
// log: [ 'username', 'Username does not match goodString' ]
```

From the results above you can see that `data.username` was checked with `exact` function added earlier.

Also you can notice the `:param` and `:option` in error message.

`:param` if found is replaced with the `key` of the data you are validating.

`:option` if found is replaced with the `value` of the validation rule passed. 

This enables you create nice custom errors for your validations out of the box.

lets modify errors of validations that exists already.

```javascript
new Validator('exact').error('Something Happened with: :param').save();

validate(data, rules);

// returns: false
// log: [ 'NodeJs', 'goodString' ]
// log: [ 'username', 'Something Happened with: Username' ]
```

#### Adding Bulk Validation
You can set more than one custom validators using the `Validator.addBulk(arrayOfValidators)`

`Validator.data`: returns object data of a validator, works just like the `new Validator` function but returns the validators data instead of setting them. 

See example below to see how it works.

```javascript
// Using Validator.data method
let emailValidator = Validator.data('isEmail', (value, option) => {
    return (typeof value === "string" && value.length>5 && value.includes('@'));
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

    // Using Validator.data method Object from above
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
```

The data return by `emailValidator` in the console results is an object that is the same with the Object declared in `arrayOfValidators` 
So you can populate `arrayOfValidators` anywhich way you find preferable.

```javascript
// Add to validators.
Validator.addBulk(arrayOfValidators);

data = {
    email: 'john@mywebsite.com',
    password: "123456",
};

rules = {
    "*": {typeOf: "string"},
    email: {
        isEmail: true,
        exact: 'admin@mywebsite.com'
    },
    password: {strongPassword: true}
};


validate(data, rules);
// returns: false
//log: [ 'email', 'Email is not what we are expecting!' ]
// because: our rule "exact" expects email to be exactly "admin@mywebsite.com"

data.email = "admin@mywebsite.com";

validate(data, rules);
// returns: false
//log [ 'password', 'Password is not strong. no Capital letter found!' ]
// because: our rule "strongPassword" requires password to have a capital letter


data.password = "HELLO123456";
validate(data, rules);
// returns: true
``` 

 
#### Contributing
Pull requests are VERY welcomed. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

#### License
[MIT](https://choosealicense.com/licenses/mit/)