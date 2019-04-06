## Object Validator Pro (OVP)
[Github](https://github.com/trapcodeio/object-validator-pro/) 
|
[Npm](https://www.npmjs.com/package/object-validator-pro)
|
[Yarn](https://yarn.pm/object-validator-pro)

#### What is OVP?
Object-Validator-Pro provides a very simple API for developers to make both **Sync** and **Async** validations on any javascript object.

To Use OVP efficiently, you need to understand how it validates each key in any given object against its rules.
Unlike other validation libraries, OVP is best for your **custom validation rules**.

You can create your own validation library out of OVP and use them in as many projects as you want.

**You set your rules just the way you understand them.**


#### Get Started.

* [Installation](installation.md#installation)
    + [Browser](installation.md#browser)
    + [Package Managers](installation.md#package-manager)
    + [What is Returned](installation.md#what-is-returned)
* [How it Works](how_it_works.md)
* [Default Validators](rules/index.md)
* [Helpers](rule_helpers.md)
    + [Super Keys](rule_helpers.md#super-keys)
    + [Super Validators](rule_helpers.md#super-validators)
    + [Validation Event Handlers](rule_helpers.md#validation-events)
* [Validators](validators.md)
    + [Create new validator](validators.md#how-to-create-a-validator)
    + [Create async validator](validators.md#async-validators)
    + [Adding Bulk Validators](validators.md#adding-bulk-validators)
    + [Modify validators](validators.md#modifying-validators)
* Classes
    + [ObjectOnValidation](classes/object_on_validation.md)


#### After Installation
```javascript
const ObjectValidator = require('object-validator-pro');
const ovp = new ObjectValidator();

// log errors when they occur.
ovp.setEventHandler('onEachError', (path, message) => {
    console.log([path, message])
})
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


let check = ovp.validate(data, rules);

if (!check) {
    // do something
}

// returns: false
// log: [ 'password', 'Password is too short. (Min. 10 characters)' ]

// if rules has an Async validator use

ovp.validateAsync(data, rules).then((isValid) => {
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

check = ovp.validate(data, rules);

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
ovp.addValidator('urlIsOnline', async (url) => {
    try{
        await axios.get(url);
        return true;
    }catch(e){
        return false;
    }
}, 'Url is not online!');


// if any of your rules contain an async validator,
// You use the validateAsync function instead of validate, returns Promise<boolean>
// You can use await or Promise.then((result){})

let first = await ovp.validateAsync(asyncTestData, asyncTestRules);
console.log(first);
// logs: true

asyncTestData.url = 'https://some-website-that-does-not-exists-2019.com';

let second = await ovp.validateAsync(asyncTestData, asyncTestRules);
console.log(second);
// log: ["url", "Url is not online!"]
// log: false
```

#### Super Rules Example
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
    address: { typeOf: 'string', must: true, minLength: 10 },
    name: { typeOf: 'string' },
    mobile: { typeOf: 'string' } 
};

// name and mobile was automatically added because * wildcard exists.
// If * is removed and ** still exists, will result to:

wildcardTestRules = { 
    address: { must: true, minLength: 10 } 
}
```

value of `*` is added to all **object keys**, while value of `**` is added to all **defined** rules.

Notice that `wildcardTestRules.address` rules comes first when transformed before the other keys of the object.
This is because **defined** rules runs before `*` wildcard added rules.


 
#### Contributing
Pull requests are VERY welcomed. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

#### License
[MIT](https://choosealicense.com/licenses/mit/)