const {validate, Validator} = require("./index");

let data = {
    username: 'NodeJs',
    password: '123456'
};

let rules = {
    // "*" sets validation for all data keys, more like a wildcard
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
// validate logs array onEachError with first element as the form key that failed and the second the error message.


data.username = ['an array instead of a string'];
validate(data, rules);
// returns: false
// log: [ 'username', 'Username is not typeOf string' ]


/*Override default onEachError function*/
Validator.overrideDefaultFunction('onEachError', (param, msg) => {
    console.log('===> ', '{' + param + '}', msg)
});

validate(data, rules);
// returns: false
// log: ===> {username} Username is not typeOf string

validate(data, rules, {
    onEachError(param, msg) {
        console.log('Custom onEach Error ===> ', '{' + param + '}', msg)
    }
});
// returns: false
// Custom onEach Error ===>  {username} Username is not typeOf string

data.username = 'NodeJs';
validate(data, rules);
// returns: false
// log: {password} Password is too short. (Min. 10 characters)

data = {
    username: 'NodeJs',
    password: '12345688777'
};
console.log(validate(data, rules));