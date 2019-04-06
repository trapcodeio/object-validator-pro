[< Index](index.md) 

-----

### Installation
OVP can be used **directly** in browsers or **imported** using node package managers.

#### Browser
Using **Direct** browser script tag (If you must!), 

[Bundle.run](https://bundle.run) 
provides a great **CDN** service that serves you a minified version of OVP.

```html
<script src="https://bundle.run/object-validator-pro"></script>
```

```javascript
// Bundle.run sets `window['objectValidatorPro']`;
const ovp = new window['objectValidatorPro'];
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
const OVP = require("object-validator-pro");
```

**OR**

```javascript
import OVP from "object-validator-pro";
```


#### What is Returned?
OVP returns object `OVP` class.

The `OVP` class includes 3 important functions

| Function | Description |
| -------- | ----------- |
| `validate`  | Function to run validations on an object with rules, returns `boolean` |
| `validateAsync`  | Function to run Async validations using `await`, returns `Promise<boolean>` |
| `addValidator`  | Create/Add your custom validators. |

-----
[How it works >](how_it_works.md)