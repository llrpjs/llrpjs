const Ajv = require('ajv');
const { groupBy, isEmpty } = require('./tools');

const defSchemaPath = 'generated/def.schema.json';

const defSchema = require(`../${defSchemaPath}`);

function Validator(schema, options = {}) {
    if (!(this instanceof Validator)) return new Validator(...arguments);

    defaultOptions = {
        schemaId: '$id',
        jsonPointers: true,
        useDefaults: false,
        allErrors: true,
        verbose: false,
        coerceTypes: false
    };

    this.schema = schema;
    this.opt = { ...defaultOptions, ...options };
    this.ajv = new Ajv(this.opt);
};

Validator.prototype.init = function () {
    this.ajv.addSchema(defSchema, defSchemaPath);
};

Validator.prototype.message = function (msg) {
    let validate = this.ajv.getSchema(`${defSchemaPath}`);
    if (!validate(msg)) {
        return validate.errors.map(error => {
            error.dataPath = error.dataPath ? error.dataPath : "/";
            return error;
        });
    }
    return [];
    //    return this.body.call(this, msg);
};

Validator.prototype.body = function (msg) {
    let validate = this.ajv.getSchema(`${defSchemaPath}`);
    if (!validate(msg)) {
        return validate.errors.map(error => {
            error.dataPath = `/${error.dataPath}`;
            return error;
        });
    }
    return [];
};

(() => {
    const fs = require('fs');
    const msg1 = require('../test/examples/ADD_ROSPEC.json');
    const msg2 = {
            "MessageType": "SET_READER_CONFIG",
            "MessageID": 101,
            "MessageBody": {
                "ResetToFactoryDefault": "1"
            }
        };
    
    let validate = new Validator();
    validate.init();

    let errors = validate.message(msg1);

    console.log(getSignificantErrors(errors));
    console.log(getHumanErrors(errors));
})();


function getSignificantErrors(errors) {
    let result = [];
    let groupedByPath = groupBy(errors, "dataPath");
    for (let path in groupedByPath) {
        let pathError = groupedByPath[path];
        if (Array.isArray(pathError)) {
            // current path has more than one error
            result = result.concat(
                pathError.filter(error => !['oneOf', 'anyOf'].includes(error.keyword))
            );
        } else {
            // just a single error
            if (!['oneOf', 'anyOf', 'if', 'then'].includes(pathError.keyword)) {
                result.push(pathError);
            }
        }
    }
    return result;
}

function getHumanErrors(errors) {
    let result = [];
    aggregated = groupBy(errors, "dataPath");
    for (let path in aggregated) {
        let pathError = aggregated[path];
        if (Array.isArray(pathError)) {
            let oneOfErr = pathError.filter(error => ['oneOf', 'anyOf'].includes(error.keyword));
            let oringErr = pathError.filter(error => !['oneOf', 'anyOf'].includes(error.keyword));
            if (oneOfErr) {
                let errString = oringErr.reduce((acc, cur, idx, arr) => {
                    if (acc) {
                        acc = acc.concat(idx >= arr.length - 1 ? ` or ${cur.message}` : `, ${cur.message}`);
                    } else
                        acc = cur.message;
                    return acc;
                }, "");
                result.push(`${path} ${errString}`);
            } else {
                result.push(`${path} ${error.message}`);
            }
        } else {
            if (pathError.keyword == 'enum') {
                result.push(`${pathError.dataPath} ${pathError.message} (${pathError.params.allowedValues.join(', ')})`);
            } else if (['oneOf', 'anyOf', 'if', 'then'].includes(pathError.keyword)) {
                continue;
            } else
                result.push(`${pathError.dataPath} ${pathError.message}`);
        }
    }
    return result;
}