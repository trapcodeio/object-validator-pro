const _ = require('lodash');
let validators = require('./validators');
let errorMessages = require('./errors');

let validatorExtenders = {};


let ObjectValidatorFunctions = {
    /**
     * After Every Validation
     */
    yes() {
    },

    /**
     * Before Validation Function
     */
    beforeValidation() {
    },

    /**
     * Callback on each error
     * @param {string} param
     * @param {string} msg
     */
    onEachError(param, msg) {
        console.log([param, msg])
    }
};


let ObjectValidatorEngine = {
    /**
     * Parse Error Messages
     * @param $rule
     * @param $name
     * @param $option
     * @return {string}
     */
    parseMessage($rule, $name, $option) {
        let msg = errorMessages.default;

        if (errorMessages.hasOwnProperty($rule)) {
            msg = errorMessages[$rule];
        }

        msg = msg.replace(':param', $name);

        if (typeof $option != 'function') {
            msg = msg.replace(':option', $option);
        }

        return msg;
    }
};

const ObjectValidatorEditor = {
    /**
     * Add Validators
     * @param {{name: String, validator: Function}[]} $validators - Array of custom validators.
     * @param {string} $validators[].name - The error of this validator.
     * @param {string} $validators[].error - The error of this validator.
     * @param {string} $validators[].validator - The error of this validator.
     * @param {string} $validators[].extendValidator - The error of this validator.
     */

    addValidators($validators) {
        if (!Array.isArray($validators) && typeof $validators === 'object') {
            $validators = [$validators];
        }

        for (let i = 0; i < $validators.length; i++) {
            let validator = $validators[i];

            if (validator.hasOwnProperty('error') && validator.error.length) {
                errorMessages[validator.name] = validator.error
            }

            if (validator.hasOwnProperty('extendValidator') &&
                validators.hasOwnProperty(validator.name)) {
                validatorExtenders[validator.name] = validator.extendValidator;
            } else if (validator.hasOwnProperty('validator')) {
                validators[validator.name] = validator.validator;
            }
        }
    },

    /**
     * Override Validator Default Function
     * @param {string} key
     * @param {function} value
     */

    overrideDefaultFunction(key, value) {
        if (ObjectValidatorFunctions.hasOwnProperty(key)) {
            ObjectValidatorFunctions[key] = value
        }
    },

    /**
     * Override Validator Default Functions
     * @param {array} functions
     */
    overrideDefaultFunctions(functions) {
        let keys = Object.keys(functions);
        for (let i = 0; i < keys.length; i++) {
            let _function = keys[i];
            ObjectValidatorEditor.overrideDefaultFunction(_function, functions[_function]);
        }
    }
};

/**
 * ObjectValidator Class
 * @class
 * */

class ObjectValidator {
    /**
     * @constructor
     * @return {ObjectValidator}
     * */

    constructor($object) {
        return this.setObject($object);
    }

    /**
     * Set Validator Rules
     * @param {object} validateWith
     * @return {ObjectValidator}
     */

    rules(validateWith) {
        this.validateWith = validateWith;
        return this;
    }

    /**
     * Set Validator Object
     * @param {object} $object
     * @return {ObjectValidator}
     */

    setObject($object) {
        this.data = $object;
        return this;
    }


    /**
     * Set Validation Functions
     * @param {object} functions
     * @return {ObjectValidator}
     */

    then(functions) {
        this.functions = _.merge(ObjectValidatorFunctions, functions);
        return this;
    }

    /**
     * Validate Object
     * @param functions
     * @return {boolean}
     */

    validate(functions = null) {
        if (functions !== null) {
            return this.then(functions).validate();
        }

        return this.runValidation();
    }

    /**
     * Run Validation Object
     * @return {boolean}
     */

    runValidation() {
        let vm;
        let $object = this.data;
        let validateWith = this.validateWith;
        let functions = this.functions || ObjectValidatorFunctions;

        // Set Found Error to stop once true. One Error at a time.
        let foundError = false;
        vm = this;


        if (validateWith.hasOwnProperty('***')) {
            const objectKeys = Object.keys($object);
            for (let i = 0; i < objectKeys.length; i++) {
                const objectKey = objectKeys[i];

                if (typeof validateWith[objectKey] === 'undefined') {
                    validateWith[objectKey] = validateWith['***'];
                } else {
                    validateWith[objectKey] = _.extend({}, validateWith['***'], validateWith[objectKey])
                }

            }
            delete validateWith['***'];
        }


        // Run before validation function
        functions.beforeValidation();

        const validateWithKeys = Object.keys(validateWith);

        for (let i = 0; i < validateWithKeys.length; i++) {
            let param = validateWithKeys[i];

            if ($object.hasOwnProperty(param)) {
                let rules = validateWith[param];
                const rulesKeys = Object.keys(rules);


                for (let ii = 0; ii < rulesKeys.length; ii++) {
                    let rule = rulesKeys[ii];
                    let options = rules[rule];
                    let isValid, msg, checkThis;


                    checkThis = true;

                    if (rules.hasOwnProperty('if')) {
                        checkThis = rules['if'];

                        if (typeof checkThis == 'function') {
                            checkThis = checkThis($object[param])
                        }
                    }


                    if (checkThis && validators.hasOwnProperty(rule)) {
                        if (validatorExtenders.hasOwnProperty(rule)) {
                            isValid = validatorExtenders[rule](validators[rule], $object[param], options);
                        } else {
                            isValid = validators[rule]($object[param], options);
                        }


                        if (!isValid) {
                            foundError = true;
                            if (functions.hasOwnProperty('onEachError')) {
                                if (!rules.hasOwnProperty('name')) {
                                    rules['name'] = _.startCase(param)
                                }
                                msg = ObjectValidatorEngine.parseMessage(rule, rules.name, options);
                                functions.onEachError(param, msg);
                            }

                            return false;
                        }
                    }
                }

                if (foundError) {
                    return false;
                }
            }
        }

        if (functions.hasOwnProperty('yes')) {
            functions.yes($object);
        }

        return true;
    }
}

ObjectValidator.prototype.data = {};
ObjectValidator.prototype.validateWith = [];
ObjectValidator.prototype.functions = undefined;

/**
 * ShortHand Validator Function
 * @function
 * @param {object} $object - Object to be validator
 * @param {object} $rules - Rules for validation
 * @param {boolean} [$returnValidator=false] - Should return validator.
 * @return {boolean|ObjectValidator}
 */

const validate = function ($object, $rules, $returnValidator = false) {
    const validator = new ObjectValidator($object).rules($rules);
    if (!$returnValidator) {
        return validator.validate();
    }
    return validator;
};

/**
 * Validator Class
 * @class
 * @property {Object} $data - Object containing validator options
 */

class Validator {
    /**
     * @constructor
     * @param name
     * @param validator
     * @param error
     * @return {Validator}
     */

    constructor(name, validator = null, error = null) {
        this.$data.name = name;
        if (typeof validator === 'function') this.$data.validator = validator;
        if (typeof error === 'string') this.$data.error = error;

        return this;
    }

    validator(validator) {
        this.$data.validator = validator;
    }

    error(error) {
        this.$data.error = error;
    }

    set(key, value) {
        this.$data[key] = value;
    }

    listen() {
        ObjectValidatorEditor.addValidators([
            this.$data
        ]);
    }
}

Validator.prototype.$data = {
    name: '',
    error: '',
    validator: '',
    extendValidator: null
};

module.exports = {validate, ObjectValidator, ObjectValidatorEditor, Validator};