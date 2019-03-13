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
/**
* @const validate - Function to run validation
* @const Validator - Class to add new validators
*/

const {validate, Validator} = require("object-validator-pro");
```

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

`validator`: The function that runs your validation

`error`: Error message to show.

```javascript
new Validator('exact', (value, option) => {
    console.log([value, option]);
    return false;
}, ':param does not match :option');

rules = {
    username: {exact: 'goodString'}
};

validate(data, rules);

// returns: true
// log: [ 'NodeJs', 'goodString' ]
// log: [ 'username', 'Username does not match goodString' ]

```

From the results above you can see that `data.username` was checked with `exact` function added earlier.

Also you can notice the `:param` and `:option` in error message.

`:param` if found is replaced with the `key` of the data you are validating.

`:option` if found is replaced with the `value` of ' 
 
#### Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

#### License
[MIT](https://choosealicense.com/licenses/mit/)