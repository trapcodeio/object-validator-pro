[< Basics ](how_it_works.md) 

-----

### How to create a Validator
Creating powerful validators is very easy with ovp.

```javascript
// having imported {validate, Validator}
new Validator(name, validationFn, error);
```

| Argument          | Description
| --------          | -----------
| `name`            | Name of the validator _e.g: `min` or `max   ` etc..._
| `validationFn`     | Function to handle validation.
| `error`           | Error Message.

`validationFn` expects gets 3 arguments on validation. e.g

```javascript
new Validator('myValidator', (val, opt, obj) => {
    console.log(val);
    console.log(opt);
    console.log(obj);
}, ':param failed myValidator');
```