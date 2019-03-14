const _extend = require('lodash/extend');
const _startCase = require('lodash/startCase');

let validators = require('./validators');
let errorMessages = require('./errors');
let validatorExtenders = {};

const config = {
    wildcard: '*',
    rulesWildcard: '**',
    skip: ':skip',
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

            if (typeof validator['extendValidator'] === 'function' && typeof validator['name'] === 'string') {
                validatorExtenders[validator.name] = validator.extendValidator;
            } else if (typeof validator['validator'] === 'function') {
                validators[validator.name] = validator.validator;
            }
        }

        return validators;
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

    static get config() {
        return config;
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
     * @return {boolean|Promise<boolean>}
     */
    validate(functions = null) {
        if (functions !== null) {
            return this.then(functions).validate();
        }

        if (typeof this.___runAsyncValidation === 'function') {
            return this.___runAsyncValidation();
        }
        return this.___runValidation();
    }

    beforeValidation() {
        let $object = this.data;
        let validateWith = this.validateWith;

        if (this.functions === undefined) {
            this.functions = ObjectValidatorFunctions;
        }

        let functions = this.functions;

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

            validateWith = _extend({}, validateWith, newValidateWith);
            delete validateWith[config.wildcard];

        }

        if (validateWith.hasOwnProperty(config.rulesWildcard)) {
            const wildcardRules = validateWith[config.rulesWildcard];
            delete validateWith[config.rulesWildcard];

            let objectKeys = Object.keys(validateWith);
            let newValidateWith = {};


            for (let i = 0; i < objectKeys.length; i++) {
                let objectKey = objectKeys[i];
                newValidateWith[objectKey] = _extend({}, wildcardRules, validateWith[objectKey])
            }

            validateWith = newValidateWith;
        }

        return {functions, validateWith}
    }

    /**
     * Run Validation Object
     * @return {boolean}
     * @private
     */
    ___runValidation() {
        let {functions, validateWith} = this.beforeValidation();
        let $object = this.data;

        // Run before validation function
        const $beforeValidation = functions.beforeValidation();
        if ($beforeValidation === false) {
            return false;
        }

        const validateWithKeys = Object.keys(validateWith);
        // Set Found Error to stop once true. One Error at a time.
        let foundError = false;

        for (let i = 0; i < validateWithKeys.length; i++) {
            let param = validateWithKeys[i];

            if ($object.hasOwnProperty(param)) {
                let rules = validateWith[param];
                let rulesKeys = Object.keys(rules);

                let skipThis = false;

                if (rules.hasOwnProperty(config.skip)) {
                    skipThis = rules[config.skip];

                    if (typeof skipThis === 'function') {
                        skipThis = skipThis($object[param])
                    }

                    delete rules[config.skip];
                }

                if (!skipThis) {
                    for (let ii = 0; ii < rulesKeys.length; ii++) {
                        let rule = rulesKeys[ii];
                        let options = rules[rule];
                        let isValid;


                        if (validators.hasOwnProperty(rule)) {
                            isValid = this.___validationIsValid(rule, param, options);

                            if (!isValid) {
                                foundError = true;
                                this.___runOnEachError(functions, rules, rule, param, options);
                                return false;
                            }
                        }

                        if (foundError) {
                            return false;
                        }
                    }
                }
            }
        }

        if (functions.hasOwnProperty('yes')) {
            functions.yes($object);
        }

        return true;
    }

    ___validationIsValid(rule, param, options) {
        let isValid = false;
        let $object = this.data;

        if (validatorExtenders.hasOwnProperty(rule)) {
            isValid = validatorExtenders[rule](validators[rule], $object[param], options);
        } else {
            isValid = validators[rule]($object[param], options);
        }

        return isValid;
    }

    /**
     * Internal Function
     * @param functions
     * @param rules
     * @param rule
     * @param param
     * @param options
     * @private
     */
    ___runOnEachError(functions, rules, rule, param, options) {
        if (functions.hasOwnProperty('onEachError')) {
            let name = _startCase(param);

            if (rules.hasOwnProperty('name')) {
                name = rules.name;
            }


            let msg = ObjectValidatorEngine.parseMessage(rule, name, options);
            functions.onEachError(param, msg);
        }
    }
}

ObjectValidator.prototype.data = {};
ObjectValidator.prototype.validateWith = {};
ObjectValidator.prototype.functions = undefined;

/**
 * Validator Class
 * @class
 * @property {Object} $data - Object containing validator options
 */
class Validator {
    /**
     * @constructor
     * @param {string|object} name
     * @param {function} validator
     * @param {*} error
     * @param {boolean} save
     * @return {Validator}
     */
    constructor(name, validator = null, error = null, save = true) {
        this.autoSave = save;

        if (typeof name === 'object') {
            this.$data = name;
            if (save) this.save();
        } else {
            this.$data.name = name;
            if (typeof validator === 'function') this.$data.validator = validator;
            if (typeof error === 'string') this.$data.error = error;

            if (validator !== null && error !== null) {
                if (save) this.save();
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

        if (this.autoSave) {
            return this.save();
        }

        return this;
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

    /**
     * Add Bulk Validators
     * @param {array} validators
     */
    static addBulk(validators) {
        ObjectValidatorEditor.addValidators(validators);
    }

    /**
     * Add Bulk Validators
     * @param name
     * @param validator
     * @param error
     */
    static make(name, validator, error = null) {
        return new Validator(name, validator, error, false).getData();
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
Validator.prototype.autoSave = true;

module.exports = {ObjectValidator, validators, validatorExtenders, Validator};