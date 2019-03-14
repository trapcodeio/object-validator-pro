let validators = {
    /**
     * @private
     * @param value
     * @return {boolean}
     */
    must(value) {
        if (typeof value === "undefined") {
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
        return typeof value === option;
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {boolean}
     */
    min(value, option) {
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
        value = validators._trimIfString_(value);
        return value.length >= option;
    },

    /**
     * @private
     * @param value
     * @param option
     * @return {boolean}
     */
    maxLength(value, option) {
        value = validators._trimIfString_(value);
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
     * @return {string}
     * @private
     */
    _trimIfString_(value) {
        return typeof value === 'string' ? value.trim() : value
    }
};


module.exports = validators;
