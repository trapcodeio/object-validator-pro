// require all needed lodash
let _ = {};
_.extend = require('lodash/extend');
_.startCase = require('lodash/startCase');
_.set = require('lodash/set');
_.get = require('lodash/get');
_.has = require('lodash/has');
_.unset = require('lodash/unset');

let defaultValidators = require('./validators');
let errorMessages = require('./errors');
const strToObj = require('./StringToObject');

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
        // console.log([param, msg]);
    }
};

/**
 * ObjectOnValidation
 * Handles object being validated.
 */
class ObjectOnValidation {
    constructor(data, param) {
        this.___data = data;
        this.path = param;
        return this;
    }

    /**
     * Get path of object or return
     * @method
     * @param path
     * @param $default
     * @return {*}
     */
    get(path, $default = undefined) {
        return _.get(this.___data, path, $default);
    }

    /**
     * Has path in object
     * @method
     * @param path
     * @return {boolean}
     */
    has(path) {
        return _.has(this.___data, path);
    }

    /**
     * Set value to path of object
     * @method
     * @param path
     * @param value
     * @return {object}
     */
    set(path, value) {
        return _.set(this.___data, path, value);
    }

    /**
     * Set value to this param path
     * @methods
     * @param value
     * @return {*}
     */
    setThis(value) {
        return this.set(this.path, value);
    }

    /**
     * Unset a path in object
     * @method
     * @param path
     * @return {boolean}
     */
    unset(path) {
        return _.unset(this.___data, path);
    }


    /**
     * Unset this path in object
     * @method
     * @return {boolean}
     */
    unsetThis() {
        return _.unset(this.___data, this.path);
    }
}

ObjectOnValidation.prototype.___data = {};
ObjectOnValidation.prototype.path = '';


/**
 * ObjectValidator Class
 * @class
 * */
class ObjectValidator {
    /**
     * @constructor
     * @return {ObjectValidator}
     * */
    constructor($object, $data) {
        let {handlers, validators, errors} = $data;

        this.defaultEventHandlers = _.extend({}, ObjectValidatorFunctions, handlers);
        this.validators = _.extend({}, defaultValidators, validators);
        this.errors = _.extend({}, errorMessages, errors);

        return this.setObject($object);
    }

    static get config() {
        return config;
    }

    /**
     * Set Validator Rules
     *
     * Converts text rules to object.
     *
     * @param {object} validateWith
     * @return {ObjectValidator}
     */
    rules(validateWith) {
        let objectKeys = Object.keys(validateWith);

        for (let i = 0; i < objectKeys.length; i++) {
            const objectKey = objectKeys[i];
            if(typeof validateWith[objectKey] === "string"){
                validateWith[objectKey] = strToObj(validateWith[objectKey])
            }
        }
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

        this.functions = _.extend({}, this.defaultEventHandlers, functions);
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
            this.functions = this.defaultEventHandlers;
        }

        let functions = this.functions;


        if (validateWith.hasOwnProperty(config.rulesWildcard)) {
            const wildcardRules = validateWith[config.rulesWildcard];
            delete validateWith[config.rulesWildcard];

            let objectKeys = Object.keys(validateWith);
            let newValidateWith = {};


            for (let i = 0; i < objectKeys.length; i++) {
                let objectKey = objectKeys[i];
                if (objectKey !== '*') {
                    newValidateWith[objectKey] = _.extend({}, wildcardRules, validateWith[objectKey])
                }
            }

            // Redeclare Super Validators
            if (typeof validateWith['*'] !== undefined)
                newValidateWith['*'] = validateWith['*'];

            validateWith = newValidateWith;
        }

        if (validateWith.hasOwnProperty(config.wildcard)) {
            let objectKeys = Object.keys($object);

            let newValidateWith = {};

            for (let i = 0; i < objectKeys.length; i++) {
                let objectKey = objectKeys[i];
                if (typeof validateWith[objectKey] === 'undefined') {
                    newValidateWith[objectKey] = validateWith[config.wildcard];
                } else {
                    newValidateWith[objectKey] = _.extend({}, validateWith[config.wildcard], validateWith[objectKey])
                }

            }

            validateWith = _.extend({}, validateWith, newValidateWith);
            delete validateWith[config.wildcard];

        }

        return {functions, validateWith}
    }

    /**
     * Run Validation Object
     * @return {boolean}
     * @protected
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

            if (_.has($object, param)) {
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


                        if (this.validators.hasOwnProperty(rule)) {
                            isValid = this.___validationIsValid(rule, param, options);

                            if (isValid === false) {
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
        let value = _.get($object, param);

        const oov = new ObjectOnValidation($object, param);

        if (validatorExtenders.hasOwnProperty(rule)) {
            isValid = validatorExtenders[rule](this.validators[rule], value, options, oov);
        } else {
            isValid = this.validators[rule](value, options, oov);
        }

        return isValid;
    }


    ___runOnEachError(functions, rules, rule, param, options) {
        if (functions.hasOwnProperty('onEachError')) {
            let name = _.startCase(param);

            if (rules.hasOwnProperty('name')) {
                name = rules.name;
            }


            let msg = this.___parseMessage(rule, name, options);
            functions.onEachError(param, msg);
        }
    }

    ___parseMessage($rule, $name, $option) {
        let msg = this.errors.default;

        if (this.errors.hasOwnProperty($rule)) {
            msg = this.errors[$rule];
        }

        msg = msg.replace(':param', $name);

        if (typeof $option != 'function') {
            msg = msg.replace(':option', $option);
        }

        return msg;
    }
}

ObjectValidator.prototype.data = {};
ObjectValidator.prototype.validateWith = {};
ObjectValidator.prototype.functions = undefined;

// Imported via constructor
ObjectValidator.prototype.defaultEventHandlers = {};
ObjectValidator.prototype.validators = {};
ObjectValidator.prototype.errors = {};


module.exports = {_, ObjectValidator};
