## Object Validator Pro (OVP)

[< Index](index.md)

### Installation
Ovp can be used directly in browsers or imported using node package managers in your project.


#### Browser
Using **Browser** (If you must!), 

[Bundle.run](https://bundle.run) 
provides a great **CDN** service that makes OVP work better and smoothly on any browser.

```html
<script src="https://bundle.run/object-validator-pro"></script>
```
Bundle.run sets `window['objectValidatorPro']`;

```javascript
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
import {valdate, validateAsync, Validator} from "object-validator-pro";
```


[How it works >](how_it_works.md)