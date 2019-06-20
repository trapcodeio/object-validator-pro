const stringToObject = (str) => {
    /**
     * Find key or !key
     * @type {RegExp}
     */
    const onlyKey = new RegExp(/([!a-zA-Z_*0-9]+)/g);

    /**
     * Find key:name
     * @type {RegExp}
     */
    const keyColumnVal = new RegExp(/([a-zA-Z_*0-9]+:[a-zA-Z_0-9]+)/g);

    /**
     * Find key:"string"
     * @type {RegExp}
     */
    const keyColumnValStringDoubleQuotes = new RegExp(/([a-zA-Z_*0-9]+:"[^"]+")/g);

    /**
     * Find key:'string'
     * @type {RegExp}
     */
    const keyColumnValStringSingleQuotes = new RegExp(/([a-zA-Z_*0-9]+:'[^']+')/g);

    /**
     * Find key:`string`
     * @type {RegExp}
     */
    const keyColumnValStringGraveAccent = new RegExp(/([a-zA-Z_*0-9]+:`[^`]+`)/g);


    let s = str.split('|');

    const keyColumnValObj = {};
    for (let i = 0; i < s.length; i++) {
        const pair = s[i];

        if (pair.match(keyColumnValStringSingleQuotes) || pair.match(keyColumnValStringDoubleQuotes) || pair.match(keyColumnValStringGraveAccent)) {
            let [key, ...value] = pair.split(":");

            value = value.join(':');
            value = value.substr(1);
            value = value.substr(0, value.length - 1);

            keyColumnValObj[key] = value;
        } else if (pair.match(keyColumnVal)) {
            let [key, value] = pair.split(":");

            if (!isNaN(Number(value))) {
                value = Number(value);
            }

            keyColumnValObj[key] = value;
        } else if (pair.match(onlyKey)) {
            /**
             * If key is like "key|" or "!key|"
             * ==> {key: true} or {key: false}
             */
            let key = pair;
            let value = true;

            // if !key set value to false
            if (key.substr(0, 1) === '!') {
                key = key.substr(1);
                value = false;
            }

            keyColumnValObj[key] = value;
        }

    }

    return keyColumnValObj;
};

module.exports = stringToObject;
