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

let check = false;

/*Override default onEachError function*/
Validator.overrideDefaultFunction('onEachError', (param, msg) => {
    console.log('===> ', '{' + param + '}', msg)
});


data = {
    username: 'NodeJs',
    password: '1234567890'
};

check = validate(data, rules, {
    yes () {
        console.log('Yes i passed all!!');
    }
});
// returns: true;
// log: Yes i passed all!!
