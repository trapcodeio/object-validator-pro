const {validate, Validator} = require('./src/ObjectValidator');

new Validator('email', function (value, option) {
    return value.includes('@')
}).listen();

let $object = {
    email: "sky@gmail.com",
    username: "sky",
    password: "123456",
};

let $rules = {
    email: {email: true},
    username: {minLength: 4}
};

let v = validate($object, $rules);
console.log(v);



