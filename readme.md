## Object-Validator-Pro

Object-Validator-Pro provides a very easy api for developers to make both **Sync** and **Async** custom validations.

Also comes with 8 validators out of the box which can be overwritten easily.  

For: **NodeJs** and **Browser** frontend.
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

`validateAsync`: Function to run Async validations using `await`, returns `Promise<boolean>`

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
        // returns: false
        // log: [ 'password', 'Password is too short. (Min. 10 characters)' ]
    });
```

`check` and `isValid` returned false,

`validate` and `validateAsync` function logs an array `onEachError`,

 `Array[0]`: Failed Object key, `Array[1]`: Error message.
 
To check if `*` (wildcard) rules affected `data.username`, it should return an error when username is not a `string`
 
```javascript
data.username = ['an array instead of a string'];

check = validate(data, rules);

// returns: false
// log: [ 'username', 'Username is not typeOf string' ]
```


#### Simple validateAsync Example
```javascript
const axios = require('axios');

let asyncTestData = {
    url: 'https://google.com',
};
    
let asyncTestRules = {
    url: {urlIsOnline: true}
};

// lets add urlIsOnline Async validator.
new Validator('urlIsOnline', async (value, option) => {
    try{
        await axios.get(value);
        return true;
    }catch(e){
        return false;
    }
}, 'Url is not online!');


// if any of your rules contain an async validator,
// You use the validateAsync function instead of validate, returns Promise<boolean>
// You can use await or Promise.then((result){})

let first = await validateAsync(asyncTestData, asyncTestRules);
console.log(first);
// logs: true

asyncTestData.url = 'https://some-website-that-does-not-exists-2019.com';

let second = await validateAsync(asyncTestData, asyncTestRules);
console.log(second);
// log: ["url", "Url is not online!"]
// log: false
```

#### Super Rules
`*`: (_wildcard_) validates all object keys against every validator defined in its value.

`**`: (_wildcard for validators_) validates all rules keys defined against every validator defined in its value.

```javascript
// assuming we have an object:
wildcardData = {
    name: 'wildcard',
    address: 'Drive 6, Astro world!',
    mobile: '+1336d373'
};

// With rules set with both wildcards:
wildcardTestRules = {
    '*': {typeOf: 'string'},
    '**': {must: true},

    address: {minLength: 10},
};

// the above will be transformed to this using wildcards
wildcardTestRules = {
    address: {must: true, typeOf: 'string', minLength: 10},
    name: {must: true, typeOf: 'string'},
    mobile: {must: true, typeOf: 'string'}
};

// name and mobile was automatically added because * wildcard exists.
// If * removed and ** still exists, will result to:

wildcardTestRules = { 
    address: { must: true, minLength: 10 } 
}
```
value of `*` is added to object keys, while value of `**` is added to all **defined** rules.

Notice that `wildcardTestRules.address` rules comes first when transformed before the other keys of the object.
This is because **defined** rules runs before `*` wildcard added rules.

#### Super Validators
`:skip`: accepts a `boolean` or a `function(value?)` that returns a `boolean`, 
if `false` that particular validation will be skipped!
```javascript
skipMobile= true;

rules = {
    mobile: {
        ':skip': skipMobile,
        'someMobileValidator': true,
    },
    username: {minLength: 10},
};

// mobile will not be validated because :skip is true
// :skip can also accept a function that returns a boolean

skipMobile = () => {
    // do some check
    return true;
};

// mobile will not be validated because :skip function returned true
```
#### Default Rules
These are default define rules with their errors messages.

`{must: true}`: _":param is required."_

`{typeOf: 'string'}`: _":param is not typeOf :option"_

`{min: 5}`: _":param is too small. (Min. :option)"_

`{max: 10}`: _":param is too big. (Max. :option)"_

`{minLength: 5}`: _":param is too short. (Min. :option characters)"_

`{maxLength: 10}`: _":param is too long. (Max. :option characters)"_,

`{selectMin: 5}`: _"Select at-least :option :param."_,

`{selectMax: 10}`: _"Select at-most :option :param."_,

#### Overriding default `onEachError` function
Default `onEachError` function can be overwritten and can also be set per validation. which ever you choose depending on the project.

``Validator.overrideDefaultFunction(key, function)``

`key`: Name of default function to override.

`function`: Function to be replaced with. 

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


// Without custom onEachError, it reverts back to default onEachError set above.

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

`validate` 3rd parameter can accept an `object` of default functions just like this.
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

`yes`: will run when all validation is successful. `check` will still return `boolean`.    

`beforeValidation`: Runs before validation, Stops validation if returns false.

`onEachError`: Callback on each error.


#### Adding New Validation

using the `new Validator(name, validationFn, error?)` syntax you can add or modify any validator or error.

Lets add a new validation called `exact` that checks if the `data` key matches some other word.

`name`: Name of your new validator.

`validator`: The function that runs your validation (can be `async` when using `validateAsync`)

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

`data.username` was checked with `exact` function added earlier.

Notice the `:param` and `:option` in error message?

`:param` if present is replaced with the `key` of the data you are validating.

`:option` if present is replaced with the `value` of the validation rule passed. 

This enables you create nice custom errors for your validations out of the box.

You can also modify an error of a validator that already exists.

```javascript
new Validator('exact').error('Something Happened with: :param').save();

validate(data, rules);

// returns: false
// log: [ 'NodeJs', 'goodString' ]
// log: [ 'username', 'Something Happened with: Username' ]
```

#### Adding Bulk Validation
You can set more than one custom validators using the `Validator.addBulk(arrayOfValidators)`

`Validator.make`: returns object data of a validator, works just like the `new Validator` function but returns the validators data instead of setting them. 

See example below to see how it works.

```javascript
// Using Validator.make method
let emailValidator = Validator.make('isEmail', (value, option) => {
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