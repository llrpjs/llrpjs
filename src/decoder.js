const debug = require('debug')('llrpjs:Decoder');
const MgBuf = require('./managed-buffer');
const formatters = require('./formatters');

function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
}

function groupBy (array, key) {
    return array.reduce((obj, item) => {
        return {
            ...obj,
            [item[key]]: item,
        };
    }, {});
};

/*
 turns this:
    [
        { AISpec: { a: 1, b: 2 } },
        { AISpec: { c: 3, d: 4 } },
        { RFSurvey: { e: 1 } }
    ]
 into this:
    {
        AISpec: [
            { a: 1, b: 2 },
            { c: 3, d: 4 }
        ],
        RFSurvey: { e: 1 }
    }
*/
function groupByFirstKey (array) {
    // collect first-keys
    let fKeys = [...new Set(array.map(x=>Object.keys(x)[0]))];
    // some map/reduce magic
    return fKeys.map(key=>{
                let result = array.reduce((rv, x)=>{
                    x[key]?(rv[key] = rv[key] || []).push(x[key]):rv;
                    return rv;
                }, {});
                // if one-item array per key, return its item
                return result[key].length > 1?result:{[key]:result[key][0]};
            }).reduce((obj, item)=>{
                return {
                    ...obj,
                    ...item
                }
            }, {});
}

function Decoder(llrpdef, options) {
    if (!(this instanceof Decoder)) return new Decoder(...arguments);

    let defaultOpt = {
        format: {
            "u64": "iso-8601",
            "u96": "hex"
        }
    };
    this.opt = {...defaultOpt, ...options};

    this.llrpdef = llrpdef;

    this.msgDefByTypeNum = groupBy(llrpdef.messageDefinitions, "typeNum");
    this.paramDefByTypeNum = groupBy(llrpdef.parameterDefinitions, "typeNum");
    this.paramDefByName = groupBy(llrpdef.parameterDefinitions, "name");
    this.choiceDefByName = groupBy(llrpdef.choiceDefinitions, "name");
    this.enumDefByName = groupBy(llrpdef.enumerationDefinitions, "name");

    this.mBuf = null;
}
/**
 * 1) read the message header and extract type
 * 2) get the definition from type
 * 3) iterate through the fields, parameters, choices, etcs
 * 4) for fields and enumurations, just read them from buffer and return their values
 * 5) in parameters and choices, get their definitions and iterate through their content similarly
 */

Decoder.prototype.message = function (buf) {
    this.buf = buf;
    let msg = {};
    this.mBuf = new MgBuf(buf);

    let typeNum = this.mBuf.get_u16();
    let version = (typeNum >>> 10) & 0x03;
    typeNum &= 0x3ff;

    if (version != 1)
        throw new Error(`unsupported version`);

    let length = this.mBuf.get_u32();
    if (length < 10)
        throw new Error(`message length too small`);

    if (length > buf.length)
        throw new Error(`buffer length too small`);

    let def = this.msgDefByTypeNum[typeNum];
    if (!def)
        throw new Error(`unknown type`);

    msg["MessageType"] = def["name"];
    let messageID = this.mBuf.get_u32();
    msg["MessageID"] = messageID;
    debug(`msgType: ${msg['MessageType']} - msgLen ${length}`);

    let body;
    //TODO: custom message: check if we have a definition for it, if not use the generic one
    body = this.definition.call(this, def.body);
    msg["MessageBody"] = body;
    debug('finished');
    return msg;
}

Decoder.prototype.definition = function (def) {
    let body = {}
    for (let i in def) {
        if (!this.mBuf.idx.bitsLeft)
            break;
        let defRef = def[i];
        let node = defRef.node;
        let decoder = this._getPropertyDecoder.call(this, node);
        let result = {};
        debug(node);
        if (["parameter", "choice"].includes(node)) {
            let resArray = [];
            let repeat = defRef.repeat;
            while (true) {
                if (this.mBuf.idx.bitsLeft < 8)
                    break;

                let resItem = decoder.call(this, defRef);

                if (isEmpty(resItem))
                    break;
                resArray.push(resItem);

                if (repeat.endsWith("1"))   // max one occurence allowed
                    break;
            }
            result = groupByFirstKey(resArray);
        } else {
            result = decoder.call(this, defRef);
        }

        body = {...body, ...result};
    }
    return body;
}

Decoder.prototype.field = function (def) {
    let fieldOps = this._getFieldOps.call(this, def.type);
    let result = {};
    let fieldValue = fieldOps();
    if (def.enumeration) {
        // process enum
        let enumDef = this.enumDefByName[def.enumeration];
        if (!enumDef)
            throw new Error(`unknown enum ${def.enumeration}`);
        let enumDefByValue = groupBy(enumDef.entry, "value");
        if (!enumDefByValue[fieldValue])
            throw new Error(`unknown ${def.enumeration} enum entry ${fieldValue}`);
        fieldValue = enumDefByValue[fieldValue].name;
    }

    if (def.hasOwnProperty("format")) {
        let fieldFormatter = this._getFieldFormatter(def.type);
        fieldValue = fieldFormatter(fieldValue, def.format);
    }
    debug(`field: ${def.name} - ${def.type}`);
    result[def.name] = fieldValue;
    return result;
}

Decoder.prototype.parameter = function (defRef) {
    let repeat = defRef.repeat;
    let startBit = this.mBuf.idx.bit;
    let startByte = this.mBuf.idx.byte;
    let type = this.mBuf.get_u8();
    let length = 0;
    if (type & 0x80) {
        // TV ... contains all fields no worries!
        type &= 0x7f;
    } else {
        // TLV
        type = ((type & 0x03) << 8) + this.mBuf.get_u8();
        length = this.mBuf.get_u16();
        if (length < 4) {
            throw new Error(`TLV parameter length is too short ${length}`);
        }
    }
    let def = this.paramDefByName[defRef.type]

    if (def.typeNum != type) {
        this.mBuf.idx.bit = startBit;
        this.mBuf.idx.byte = startByte;
        return {};
    }
    debug(`paramType ${defRef.type} - paramLen ${length}`);

    return { 
        [def.name]: this.definition.call(this, def.body)
    };
}

Decoder.prototype.choice = function (defRef) {
    // replace choice defRef with parameter defRef
    let startBit = this.mBuf.idx.bit;
    let startByte = this.mBuf.idx.byte;
    let type = this.mBuf.get_u8();
    let length = 0;
    if (type & 0x80) {
        // TV ... contains all fields no worries!
        type &= 0x7f;
    } else {
        // TLV
        type = ((type & 0x03) << 8) + this.mBuf.get_u8();
    }
    this.mBuf.idx.bit = startBit;
    this.mBuf.idx.byte = startByte;
    let paramDef = this.paramDefByTypeNum[type];
    if (!paramDef) {
        // well, that's probably not a parameter then
        return {};
    }
    let choiceDef = this.choiceDefByName[defRef.type];
    // check if it's really one of our parameters in the buffer
    if (!choiceDef.body.filter(x=>x.type == paramDef.name).length) {
        return {};
    }

    return this.parameter.call(this, {
        node: "parameter",
        type: paramDef.name,
        repeat: defRef.repeat
    });
}

Decoder.prototype.reserved = function(def) {
    this.mBuf.get_reserved(Number(def.bitCount));
    return {};
}

Decoder.prototype._getPropertyDecoder = function (node) {
    return {
        "field": this.field.bind(this),
        "parameter": this.parameter.bind(this),
        "choice": this.choice.bind(this),
        "reserved": this.reserved.bind(this)
    }[node] || (()=>{throw new Error(`no decoder for node ${node}`)});
}

Decoder.prototype._getFieldOps = function (type) {
    return {
        "u1": this.mBuf.get_u1.bind(this.mBuf),
        "u2": this.mBuf.get_u2.bind(this.mBuf),
  
        "u1v": this.mBuf.get_u1v.bind(this.mBuf),
  
        "u8": this.mBuf.get_u8.bind(this.mBuf),
        "s8": this.mBuf.get_s8.bind(this.mBuf),
        "u8v": this.mBuf.get_u8v.bind(this.mBuf),
        "s8v": this.mBuf.get_s8v.bind(this.mBuf),
  
        "utf8v": this.mBuf.get_utf8v.bind(this.mBuf),
  
        "u16": this.mBuf.get_u16.bind(this.mBuf),
        "s16": this.mBuf.get_s16.bind(this.mBuf),
        "u16v": this.mBuf.get_u16v.bind(this.mBuf),
        "s16v": this.mBuf.get_s16v.bind(this.mBuf),
  
        "u32": this.mBuf.get_u32.bind(this.mBuf),
        "s32": this.mBuf.get_s32.bind(this.mBuf),
        "u32v": this.mBuf.get_u32v.bind(this.mBuf),
        "s32v": this.mBuf.get_s32v.bind(this.mBuf),
  
        "u64": this.mBuf.get_u64.bind(this.mBuf),
        "s64": this.mBuf.get_s64.bind(this.mBuf),
        "u64v": this.mBuf.get_u64v.bind(this.mBuf),
        "s64v": this.mBuf.get_s64v.bind(this.mBuf),
  
        "u96": this.mBuf.get_u96.bind(this.mBuf),
  
        "bytesToEnd": this.mBuf.get_bytesToEnd.bind(this.mBuf)
    }[type];
}

Decoder.prototype._getFieldFormatter = function(type) {
    return formatters[type] || formatters.no_formatter;
}

module.exports = Decoder;