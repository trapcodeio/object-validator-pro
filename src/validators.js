let validators = {
    must(value) {
        if (typeof value === "undefined") {
            return false;
        } else if (typeof value === 'string' || Array.isArray(value)) {
            return value.length > 0
        }

        return true;
    },

    typeOf(value, option) {
        return typeof value === option;
    },

    min(value, option) {
        value = parseFloat(value);
        option = parseFloat(option);
        return value >= option;
    },

    max(value, option) {
        value = parseFloat(value);
        option = parseFloat(option);
        return value <= option;
    },

    minLength(value, option) {
        value = validators._trimIfString_(value);
        return value.length >= option;
    },

    maxLength(value, option) {
        value = validators._trimIfString_(value);
        return value.length <= option;
    },

    selectMin(value, option) {
        return validators.minLength(value, option)
    },

    _trimIfString_(value) {
        return typeof value === 'string' ? value.trim() : value
    }
};


module.exports = validators;
