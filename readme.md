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

##### Simple Form Data Validation
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

 Array[0]: Failed Object key, Array[1]: Error message.
 
To check if `*` (wildcard) affected `data.username`, it should return an error when username is not a `string`
 
```javascript
data.username = ['an array instead of a string'];

check = validate(data, rules);

// returns: false
// log: [ 'username', 'Username is not typeOf string' ]
```

##### Overriding default onEachError function
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
#### Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

#### License
[MIT](https://choosealicense.com/licenses/mit/)