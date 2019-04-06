[< Basics ](how_it_works.md) 

-----

### Rule/Schema Helpers
OVP includes smart helpers that makes your write less and do more when running validations.


#### Super Keys

| key   | Description   |
| ----  | -----------   |
| `*`   | (_wildcard_) validates all object keys against every validator defined in its value. |
|`**`   | (_wildcard for validators_) validates all defined keys against every validator defined in its value. |

```javascript
// assuming we have an object:
wildcardData = {
    name: 'wildcard',
    address: 'Drive 6, Astro world!',
    mobile: '+1336d373'
};

// With rules set:
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
// If * is removed and ** still exists, it will result to:

wildcardTestRules = { 
    address: { must: true, minLength: 10 } 
}

// {must: true} was automatically added to address.
```
value of `*` is added to all **object keys**, while value of `**` is added to all **defined** rules.

Notice that `wildcardTestRules.address` rules comes first when transformed before the other keys of the object.
This is because **defined** rules runs before `*` wildcard added rules.

#### Super Validators

| Name      | Description   |
| ----      | -----------   |
| `:skip`   | accepts a `boolean` or a `function(value?)` that returns a `boolean`, if `true` that particular validation will be skipped! |

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
// The current value its validating will be passed to that function also

skipMobile = (mobile) => {
    // skip if mobile is empty else run all the validation listed after me.
    return !mobile.length;
};

// mobile will be validated because :skip function returned false
```


### Validation Events

Every validation has 3 events that can possibly occur.

| Event     | Description           |
| -----     | ------------          |
| `yes`     | Occurs once! when all validation is successfully.
| `beforeValidation` | Occurs before validation, if `false` is returned in event handler the validation wont run.  
| `onEachError` | Occurs on each error.

The `onEachError` event has a default out of the box function that logs the error affected key and a parsed error message to the console. as seen in basic examples.

These events can be handled both globally and on each `validate` call.

Lets override the default `onEachError`. This can be done using `.setEventHandler(name, function)`

`name`: Name of default function to override.

`function`: Function to be replaced with. 

```javascript
ovp.setEventHandler('onEachError', (param, msg) => {
    console.log('===> ', '{' + param + '}', msg)
});

let data = {
    username: ['NodeJs'],
    password: '123456'
};

let rules = {
    "*": {
        typeOf: 'string',
        must: true
    },
    password: {minLength: 10}
};

let check = ovp.validate(data, rules);

// returns: false
// log: ===> {username} Username is not typeOf string
```

All validations will use default event handlers unless a custom error handler is not passed to `validate`

```javascript
// set custom handler per validation
check = ovp.validate(data, rules, {
    onEachError(param, msg) {
        console.log('Custom onEach Error ===> ', '{' + param + '}', msg)
    }
});
// returns: false
// Custom onEach Error ===>  {username} Username is not typeOf string


// Without custom onEachError, it reverts back to default onEachError set above.
// set username to string
data.username = 'NodeJs';

check = ovp.validate(data, rules);

// returns: false
// log: {password} Password is too short. (Min. 10 characters)
```

`validate` 3rd parameter can accept an `object` of event handlers functions just like this.

```javascript
let eventHandlers = {
   yes() {},

   beforeValidation() {
       return true;
   },

   onEachError(param, msg) {}
};

check = ovp.validate(data, rules, eventHandlers);
```

`yes`: will run when all validation is successful. `check` will still return `boolean`.



-----

[Creating/Modifying Validators >](validators.md)