const Ajv = require('ajv');
const schema = require('../definitions/core/llrp-1x0.schema.json');

/**
 * Validator class
 * 
 * @param {object} options ajv options object
 */
function Validator(options = {}) {
    if (!(this instanceof Validator)) return new Validator(...arguments);

    defaultOptions = {
        schemaId: '$id',
        jsonPointers: true,
        useDefaults: false,
        allErrors: true
    };

    this.schema = schema;

    this.opt = { ...defaultOptions, ...options };
    this.ajv = new Ajv(this.opt);
    this._validate = this.ajv.compile(schema);
};

/**
 * message validation function
 * @param {!object} msg LLRP json message
 * @returns {boolean} returns true if valid, false if invalid
 */
Validator.prototype.message = function (msg) {
    let valid = this._validate(msg);
    if (!valid) {
        for (let error of this._validate.errors) {
            error.dataPath = error.dataPath ? error.dataPath : "/";
        }
    }
    return valid;
};

/**
 * gets all Ajv errors
 * 
 * @returns {object[]}  returns an array of ajv error objects
 */
Validator.prototype.getAllErrors = function () {
    return this._validate.errors?this._validate.errors:[];
};

/**
 * gets filtered output dropping unnecessary oneOf/anyOf/if errors
 * 
 * @returns {object[]}  returns an array of filtered ajv error objects
 */
Validator.prototype.getErrors = function () {
    return this._validate.errors?
        this._validate.errors.filter(error=>!['oneOf', 'anyOf', 'if'].includes(error.keyword)):[];
};

/**
 * returns an array of filtered error messages (no oneOf/anyOf/if messages)
 * 
 * @returns {string[]}  an array of error messages
 */
Validator.prototype.getHumanErrors = function() {
    return this.getErrors.call(this)
            .map(error=>{
                if(error.keyword == 'enum')
                    return `${error.dataPath} ${error.message} (${error.params.allowedValues.join(', ')})`;
                else
                    return `${error.dataPath} ${error.message}`;
            });
};

module.exports = Validator;