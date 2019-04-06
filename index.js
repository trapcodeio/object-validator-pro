let {_, ObjectValidator} = require('./src/ObjectValidator');
let Validator = require('./src/Validator');


/**
 * Extends ObjectValidator to create an async validation.
 * @name AsyncObjectValidator
 * @extends ObjectValidator
 */
class AsyncObjectValidator extends ObjectValidator {
    constructor(...args) {
        super(...args);
    }

    /**
     * @return {Promise<boolean>}
     * @private
     */
    async ___runAsyncValidation() {
        let {functions, validateWith} = this.beforeValidation();
        let $object = this.data;

        // Run before validation function
        // if(functions.hasOwnProperty('beforeValidation'))
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

                if (rules.hasOwnProperty(ObjectValidator.config.skip)) {
                    skipThis = rules[ObjectValidator.config.skip];

                    if (typeof skipThis === 'function') {
                        skipThis = skipThis($object[param])
                    }

                    delete rules[ObjectValidator.config.skip]
                }


                if (!skipThis) {

                    for (let ii = 0; ii < rulesKeys.length; ii++) {
                        let rule = rulesKeys[ii];
                        let options = rules[rule];
                        let isValid;

                        if (this.validators.hasOwnProperty(rule)) {
                            isValid = this.___validationIsValid(rule, param, options);


                            // check if promise!
                            if (typeof isValid === 'object' && typeof isValid.then === 'function') {
                                isValid = await isValid;
                            }


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
}

/**
 * OVP Engine
 * @name OVP
 * @class
 */
class OVP {
    constructor() {
        this.validatorEngine = Validator(this)
    }

    /**
     * @constructor
     * @param {string|object} name
     * @param {function} validator
     * @param {*} error
     * @return {Validator}
     */
    addValidator(name, validator = null, error = '') {
        return new this.validatorEngine(name, validator, error);
    }


    /**
     * Add Bulk Validators
     * @param name
     * @param validator
     * @param error
     */
    makeValidator(name, validator, error = null) {
        return this.validatorEngine.make(name, validator, error);
    }

    /**
     * Add Bulk Validators
     * @param {array} validators
     */
    addBulk(validators) {
        return this.validatorEngine.addBulk(validators);
    }

    /**
     * ShortHand Validator Function
     * @name validate
     * @param {object} $object - Object to be validator
     * @param {object} $rules - Rules for validation
     * @param {boolean|Object|Function} $returnValidator - Should return validator.
     * @param {boolean} $runAsyncValidation - Use AsyncObjectValidator instead
     * @return {boolean|ObjectValidator}
     */
    validate($object, $rules, $returnValidator = false, $runAsyncValidation = false) {
        let ValidatorClass = ObjectValidator;
        if ($runAsyncValidation === true) {
            ValidatorClass = AsyncObjectValidator;
        }

        let validator = new ValidatorClass($object, {
            handlers: this.eventHandlers,
            errors: this.validatorErrors,
            validators: this.validators,
        }).rules($rules);

        if (typeof $returnValidator === 'boolean' && !$returnValidator) {
            return validator.validate();
        } else if (typeof $returnValidator === 'object' || typeof $returnValidator === 'function') {
            return validator.then($returnValidator).validate()
        }

        return validator;
    }

    /**
     * Run validations with async functions
     * @return {boolean|ObjectValidator}
     * @param $object
     * @param $rules
     * @param $returnValidator
     */
    validateAsync($object, $rules, $returnValidator = false) {
        return this.validate($object, $rules, $returnValidator, true);
    }

    /**
     * Set event handlers
     * @param {string} key
     * @param {function} value
     */
    setEventHandler(key, value) {
        if (typeof key === 'object') {
            const functions = key;
            const keys = Object.keys(functions);
            for (let i = 0; i < keys.length; i++) {
                let _function = keys[i];
                this.setEventHandler(_function, functions[_function]);
            }
        } else {
            this.eventHandlers[key] = value
        }
    }
}

OVP.prototype.eventHandlers = {};
OVP.prototype.validators = {};
OVP.prototype.validatorErrors = {};
OVP.prototype.validatorEngine = () => {
};

/**
 * @type {OVP}
 */
module.exports = OVP;