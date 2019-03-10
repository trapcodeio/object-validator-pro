const {validate, Validator} = require('./src/ObjectValidator');

new Validator('email', (value) => {
    return value.includes('@');
}, 'email is not correct!');

new Validator('email').error('Email is not correct ooo!').add();

new Validator({
    name: 'hasComma',
    error: ':param has no comma!',
    validator(value) {
        return value.includes(',');
    }
});

let $object = {
    email: "skygmail.com",
    username: "sky",
    password: "123456",
};

let $rules = {
    '***': {hasComma: true},
    email: {email: true},
    username: {minLength: 4}
};

let v = validate($object, $rules);
console.log(v);



