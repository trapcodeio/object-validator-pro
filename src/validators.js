let validators = {
    /**
     * @private
     * @param value
     * @param option
     * @return {boolean}
     */
    must(value, option) {

        if (option === false) {
            return true;
        }

        if (typeof value === "undefined" || value === null) {
            return false;
        } else if (typeof value === 'string' || Array.isArray(value)) {
            return value.length > 0
        }

        return true;
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {boolean}
     */
    typeOf(value, option) {
        option = option.toLowerCase();
        if (option === 'array')
            return Array.isArray(value);
        return typeof value === option;
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {boolean}
     */
    exact(value, option) {
        return value === option;
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {boolean}
     */
    min(value, option) {
        if (typeof value === 'string' || !Array.isArray(value))
            return validators.minLength(value, option);

        if (isNaN(Number(value)))
            return false;

        value = parseFloat(value);
        option = parseFloat(option);
        return value >= option;
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {boolean}
     */
    max(value, option) {
        if (typeof value === 'string' || !Array.isArray(value))
            return validators.maxLength(value, option);

        if (isNaN(Number(value)))
            return false;

        value = parseFloat(value);
        option = parseFloat(option);
        return value <= option;
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {boolean}
     */
    minLength(value, option) {
        if (typeof value !== 'string' && !Array.isArray(value)) return false;

        value = validators.___trimIfString(value);
        return value.length >= option;
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {boolean}
     */
    maxLength(value, option) {
        if (typeof value !== 'string' && !Array.isArray(value)) return false;

        value = validators.___trimIfString(value);
        return value.length <= option;
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {*|boolean}
     */
    selectMin(value, option) {
        return validators.minLength(value, option)
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {*|boolean}
     */
    selectMax(value, option) {
        return validators.maxLength(value, option)
    },

    /**
     * @private
     * @param value
     * @return {string}
     * @private
     */
    ___trimIfString(value) {
        return typeof value === 'string' ? value.trim() : value
    }
};


module.exports = validators;
