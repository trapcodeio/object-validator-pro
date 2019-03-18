## Object Validator Pro (OVP)
[< Index](index.md)
___

### Installation
OVP can be used directly in browsers or imported using node package managers.


#### Browser
Using **Browser** (If you must!), 

[Bundle.run](https://bundle.run) 
provides a great **CDN** service that makes OVP work better and smoothly on any browser.

```html
<script src="https://bundle.run/object-validator-pro"></script>
```

```javascript
// Bundle.run sets `window['objectValidatorPro']`;
const {validate, validateAsync, Validator} = window['objectValidatorPro'];
```


#### Package Manager
Using **npm**

```bash
npm install object-validator-pro
```

Using **yarn**

```bash
yarn add object-validator-pro
```

After Installation you can **require** or **import** ovp into your script.
```javascript
const {validate, validateAsync, Validator} = require("object-validator-pro");
```

**OR**

```javascript
import {validate, validateAsync, Validator} from "object-validator-pro";
```


#### What is Returned?
OVP returns object `{validate, validateAsync, Validator}`

##### validate
Function to run validations, returns `boolean`

##### validateAsync
Function to run Async validations using `await`, returns `Promise<boolean>`

##### Validator
`new Validator` to create/add your custom validators.

`Validator` Also contains static helper objects.

___
[How it works >](how_it_works.md)