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
        }s
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
        if(option==='array')
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
        if (typeof value === 'string') return validators.minLength(value, option);
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
        if (typeof value === 'string') return validators.maxLength(value, option);
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
