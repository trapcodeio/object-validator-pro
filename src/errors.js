const errors = {
    default: ':param returned :false',
    must: ':param is required.',
    typeOf: ':param is not typeOf :option',
    min: ':param is too small. (Min. :option)',
    max: ':param is too big. (Max. :option)',
    minLength: ':param is too short. (Min. :option characters)',
    maxLength: ':param is too long. (Max. :option characters)',
    selectMin: 'Select at-least :option :param.',
    selectMax: 'Select at-most :option :param.',
};

module.exports = errors;