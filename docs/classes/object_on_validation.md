[< Validators ](../validators.md) 

-----

### ObjectOnValidation Class
This class holds the current object being validated and provides methods to modify it.
It also holds the path to the key that is currently being validated in `this.param`.

#### Properties
| Name      | Description   |
| --------- | ------------- |
| `param`   | path of the object key that is currently being validated |


#### Methods
| Name      | Args      | Description   |
| --------- | --------- | ------------- |
| `get`   | `(path, $default=undefined)` | get `path` of the object being validated, if not exists returns `$default` |
| `has`   | `(path)` | check if the object being validated has `path`, returns `boolean` |
| `set`   | `(path, value)` | set `value` of `path` in the object being validated.  |
| `setThis`   | `(value)` | sets `value` using `this.param` as `path` in the object being validated.  |
| `unset`   | `(path)` | unset `path` in the object being validated.  |


##### Usage
```javascript
new Validator('someValidator', (val, opt, obj)=>{
    // obj is an instance of ObjectOnValidation
})
```

-----

[< Validators ](../validators.md) 