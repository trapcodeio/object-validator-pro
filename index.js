const _extend = require('lodash/extend');
const _startCase = require('lodash/startCase');

let validators = require('./src/validators');
let errorMessages = require('./src/errors');

let validatorExtenders = {};

const config = {
    wildcard: '*'
};


let ObjectValidatorFunctions = {
    /**
     * After Every Validation
     */
    yes() {
    },

    /**
     * Before Validation Function
     * @return {boolean}
     */
    beforeValidation() {
        return true;
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
        // console.log(arguments);
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
     * @param {string} $validators[].name - The name of this validator.
     * @param {string} $validators[].error - The error of this validator.
     * @param {string} $validators[].validator - The function of this validator.
     * @param {string} $validators[].extendValidator - The extension of this validator.
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
        if (typeof functions === 'function')
            functions = {yes: functions};

        this.functions = _extend({}, ObjectValidatorFunctions, functions);
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
    async runValidation() {
        let $object = this.data;
        let validateWith = this.validateWith;

        if (this.functions === undefined) {
            this.functions = ObjectValidatorFunctions;
        }

        let functions = this.functions;

        // Set Found Error to stop once true. One Error at a time.
        let foundError = false;

        if (validateWith.hasOwnProperty(config.wildcard)) {
            let objectKeys = Object.keys($object);
            let newValidateWith = {};

            for (let i = 0; i < objectKeys.length; i++) {
                let objectKey = objectKeys[i];
                if (typeof validateWith[objectKey] === 'undefined') {
                    newValidateWith[objectKey] = validateWith[config.wildcard];
                } else {
                    newValidateWith[objectKey] = _extend({}, validateWith[config.wildcard], validateWith[objectKey])
                }

            }

            validateWith = newValidateWith;
        }


        // Run before validation function
        const $beforeValidation = functions.beforeValidation();
        if ($beforeValidation === false) {
            return false;
        }

        const validateWithKeys = Object.keys(validateWith);

        for (let i = 0; i < validateWithKeys.length; i++) {
            let param = validateWithKeys[i];

            if ($object.hasOwnProperty(param)) {
                let rules = validateWith[param];
                let rulesKeys = Object.keys(rules);


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

                        // check if promise!
                       if( typeof  isValid === 'object' && typeof isValid.then === 'function'){
                           isValid = await  isValid;
                       }


                        if (!isValid) {
                            foundError = true;
                            if (functions.hasOwnProperty('onEachError')) {
                                let name = _startCase(param);
                                if (rules.hasOwnProperty('name')) {
                                    name = rules.name;
                                }


                                msg = ObjectValidatorEngine.parseMessage(rule, name, options);
                                functions.onEachError(param, msg);
                            }

                            return false;
                        }
                    }

                    if (foundError) {
                        return false;
                    }
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
 * @param {boolean|Object|Function} $returnValidator - Should return validator.
 * @return {boolean|ObjectValidator}
 */
const validate = function ($object, $rules, $returnValidator = false) {
    const validator = new ObjectValidator($object).rules($rules);

    if (typeof $returnValidator === 'boolean' && !$returnValidator) {
        return validator.validate();
    } else if (typeof $returnValidator === 'object' || typeof $returnValidator === 'function') {
        return validator.then($returnValidator).validate()
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
        if (typeof name === 'object') {
            this.$data = name;
            this.save();
        } else {
            this.$data.name = name;
            if (typeof validator === 'function') this.$data.validator = validator;
            if (typeof error === 'string') this.$data.error = error;

            if (validator !== null && error !== null) {
                this.save();
            }
        }

        return this;
    }

    /**
     * Set Validator
     * @param {function} validator
     */

    validator(validator) {
        this.$data.validator = validator;
        this.save();
    }

    /**
     * Set Validator Error
     * @param {string} error
     * @return {Validator}
     */
    error(error) {
        this.$data.error = error;
        return this;
    }

    /**
     * Set Validator Data
     * @param {string} key
     * @param {*} value
     * @return {Validator}
     */
    set(key, value) {
        this.$data[key] = value;
        return this;
    }

    /**
     * Add to validators
     */
    save() {
        ObjectValidatorEditor.addValidators([
            this.$data
        ]);
    }

    /**
     * Returns Validator $data
     * @return {object} Validator.$data
     */
    getData() {
        return this.$data;
    }

    static bulk(validators) {
        ObjectValidatorEditor.addValidators(validators);
    }

    /**
     * Override Validator Default Function
     * @param {string} key
     * @param {function} value
     */

    static overrideDefaultFunction(key, value) {
        if (ObjectValidatorFunctions.hasOwnProperty(key)) {
            ObjectValidatorFunctions[key] = value
        }
    }

    /**
     * Override Validator Default Functions
     * @param {object} functions
     */
    static overrideDefaultFunctions(functions) {
        let keys = Object.keys(functions);
        for (let i = 0; i < keys.length; i++) {
            let _function = keys[i];
            Validator.overrideDefaultFunction(_function, functions[_function]);
        }
    }
}

Validator.prototype.$data = {
    name: '',
    error: '',
    validator: null
};

module.exports = {validate, Validator};