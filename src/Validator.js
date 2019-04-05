module.exports = function (ovp) {
    let addValidators = ($validators) => {
        if (!Array.isArray($validators) && typeof $validators === 'object') {
            $validators = [$validators];
        }

        for (let i = 0; i < $validators.length; i++) {
            let validator = $validators[i];

            if (validator.hasOwnProperty('error') && validator.error.length) {
                ovp.validatorErrors[validator.name] = validator.error
            }

            if (typeof validator['validator'] === 'function') {
                ovp.validators[validator.name] = validator.validator;
            }
        }
    };

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
        constructor(name, validator = null, error = '', save = true) {
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
            addValidators([
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
            addValidators(validators);
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
    }

    Validator.prototype.$data = {
        name: '',
        error: '',
        validator: null
    };

    Validator.prototype.autoSave = true;

    return Validator;
};