[< Installation](installation.md)
___

### How it Works
Before you dive into the **core** of ovp lets tell you the basics.

The `validate` function expects min: 2 and max: 3 arguments

```javascript
let isValid = validate(objectToValidate, Rules, yesFunctionOrObject?);
```

`objectToValidate`: The object to validate.

`rules`: Rules ovp understands and users to validate for you.

`yesFunctionOrObject`: Accepts a function or an object of events. 
For the basics we will talk about this later.