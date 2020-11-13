const debug = require('debug')('llrpjs:encoder');
const MgBuf = require('./managed-buffer');
const {isEmpty, groupBy,
    groupByFirstKey, isParamWrapper, filter} = require('./tools');
const parsers = require('./field-parsers');

const llrpdef = require('../definitions/core/llrp-1x0-def.json');

const MSG_HEADER_SIZE = 10;
const TLV_HEADER_SIZE = 4;
const TV_HEADER_SIZE = 1;

function Encoder(options) {
    if (!(this instanceof Encoder)) return new Encoder(...arguments);

    let defaultOpt = {
        format: {
            "u64": "iso-8601",
            "u96": "hex"
        },
        bufSize : 128 * 1024,                // default LTK buf size
        iso8601FullPrecision: false
    };
    this.opt = {...defaultOpt, ...options};

    this.llrpdef = llrpdef;

    this.msgDefByName = groupBy(llrpdef.messageDefinitions, "name");
    this.paramDefByName = groupBy(llrpdef.parameterDefinitions, "name");
    this.choiceDefByName = groupBy(llrpdef.choiceDefinitions, "name");
    this.enumDefByName = groupBy(llrpdef.enumerationDefinitions, "name");

    this.mBuf = new MgBuf(Buffer.alloc(this.opt.bufSize));
    this._consumed = [];
};

/**
 * Takes message object that's compliant with llrpjs.def.json and returns a llrp-encoded buffer
 * 
 * @param {!object} message  message object
 * @returns {?Buffer}        llrp buffer
 */
Encoder.prototype.message = function (message) {
    let def = this.msgDefByName[message.MessageType];
    if (!def)
        throw new Error(`unknown message type ${message.MessageType}`);

    this.mBuf.idx.incByte = MSG_HEADER_SIZE;                         // jump to payload (body) location
    this.body.call(this, def, message.MessageBody);     // process body content and fill the buffer

    let msgLength = this.mBuf.idx.byte;
    this.mBuf.idx.byte = 0;
    this.mBuf.idx.bit = 0;

    this.header.call(this, Number(def.typeNum), Number(message.MessageID), msgLength);

    // reset for next message
    this.mBuf.idx.byte = 0;

    let msgBuffer = Buffer.alloc(msgLength);
    this.mBuf.buffer.copy(msgBuffer, 0, 0, msgLength);
    return msgBuffer;
};

Encoder.prototype.header = function (typeNum, msgId, length) {
    this.mBuf.set_u16((1 << 10) | typeNum);       // rsvd, version and type

    this.mBuf.set_u32(length);

    this.mBuf.set_u32(msgId);

    return this.mBuf.buffer;
}

Encoder.prototype.body = function (def, data) {
    let prevByte = this.mBuf.idx.byte;
    for (let defRef of def.body) {
        let encoder = this._getPropertyEncoder(defRef.node);
        encoder.call(this, defRef, data, def);
    }
    let newByte = this.mBuf.idx.byte;
    return this.mBuf.buffer.slice(prevByte, newByte);
}

Encoder.prototype.paramHeader = function (typeNum, length) {
    // preserve location
    let prevByte = this.mBuf.idx.byte;
    if (typeNum > 127) {
        // TLV
        debug(`TLV`);
        this.mBuf.set_u16(0x3ff & typeNum);
        if (length > 65535) {
            throw new Error(`parameter payload buffer is too large`);
        }
        this.mBuf.set_u16(length);
    } else {
        // TV
        debug(`TV`);
        this.mBuf.set_u8((1 << 7) | (0x7ff & typeNum));
    }
    let newByte = this.mBuf.idx.byte;
    return this.mBuf.buffer.slice(prevByte, newByte);
}

/**
 * Takes parameter object and its definition reference and returns an equivalent llrp-encoded buffer.
 * Note: if parameter and definition aren't matching (as in case of optional parameters that
 *  weren't present in the ccontaining message), it returns null
 * 
 * @param {!object} parameter    parameter object
 * @param {!object} defRef       the parameter's definition reference object
 */
Encoder.prototype.parameter = function (defRef, data) {
    let name = defRef.type;
    let repeat = defRef.repeat;
    let def = this.paramDefByName[name];
    let typeNum = Number(def.typeNum);
    let value = data[name];

    if (this._consumed.includes(value)) {
        debug(`already encoded - ${name}`);
        return Buffer.alloc(0);
    }


    debug(`parameter - ${name}`);

    // check if parameter satisfies the reference
    if (value == undefined) {
        // not found, is it required anyway?!
        if (repeat.startsWith("0")) {
            debug(`optional parameter ${name} not found`);
            return Buffer.alloc(0);
        }
        else throw new Error(`missing parameter ${name} - required ${repeat} times in ${def.name}`);
    }

    // if we have multiple instances, iterate them
    if (Array.isArray(value)) {
        let prevByte = this.mBuf.idx.byte;
        for (let subElement of value) {
            this.parameter.call(this, defRef, {
                [name]: subElement
            });
        }
        let newByte = this.mBuf.idx.byte;
        return this.mBuf.buffer.slice(prevByte, newByte);
    }

    // is this a wrapped field? get it to form
    if (isParamWrapper(def)) {
        // if the passed field isn't wrapped already, wrap it.
        if (value[name] == undefined) {
            value = {
                [name]: value
            }
        }
    }

    // preserve location
    let prevByte = this.mBuf.idx.byte;
    // encode payload
    this.mBuf.idx.incByte = typeNum > 127? TLV_HEADER_SIZE: TV_HEADER_SIZE;
    this.body.call(this, def, value);
    let newByte = this.mBuf.idx.byte;
    // prepare to write header
    let length = newByte - prevByte;
    this.mBuf.idx.byte = prevByte;
    // write header
    this.paramHeader.call(this, typeNum, length);
    // restore index
    this.mBuf.idx.byte = newByte;

    // to avoid duplicated Custom parameter encodings
    this._consumed.push(data[defRef.type]);

    return this.mBuf.buffer.slice(prevByte, newByte);
};

/**
 * Takes a parameter object and a choice definition reference, finds the parameter definition and diverts
 *  routine to the parameter encoder
 * 
 * @param {!object} parameter       parameter object
 * @param {!object} defRef          choice reference object
 * @returns {Buffer}                llrp buffer
 */

Encoder.prototype.choice = function (defRef, data, parentDef) {
    // Note: element is unfiltered, we need to iterate for all matches
    let choiceName = defRef.type;
    let choiceDef = this.choiceDefByName[choiceName];
    let repeat = defRef.repeat;
    let parentParamTypes = parentDef?parentDef.body.filter(dRef=>dRef.node =="parameter")
        .map(dRef=>dRef.type):[];

    debug(`choice - ${choiceName}`);

    let paramDefRefList = choiceDef.body.filter(dRef=>(dRef.type in data) && !parentParamTypes.includes(dRef.type));
    if (paramDefRefList.length < 1) {
        // no parameter of this choice found in our data, is this required anyway?
        if (repeat.startsWith("0")) {
            debug(`optional choice ${choiceName} not found`);
            return Buffer.alloc(0);
        }
        else throw new Error(`missing parameter(s) of required choice ${name}`);
    } else if (paramDefRefList.length > 1) {
        if (!repeat.endsWith("N")) throw new Error(`only one choice instance is allowed, passed: ${paramDefRefList.map(ref=>ref.type)}`);
    }

    // iterate in parameter references in this choice
    let prevByte = this.mBuf.idx.byte;
    for (let _defRef of paramDefRefList) {
        this.parameter.call(this, {
            ..._defRef,
            repeat: "0-N"
        }, data);
    }

    let newByte = this.mBuf.idx.byte;
    return this.mBuf.buffer.slice(prevByte, newByte);
}

/**
 * Takes field object and its definition object and writes value to buffer accordingly
 * 
 * @param {!number|!BigInteger} obj         field value (can be of type Number or BigInt)
 * @param {!object} def                     field definition object
 * @returns {!Buffer}                       buffer with llrp field
 */
Encoder.prototype.field = function (def, data) {
    /**
     * 1. is this an enum? if yes, translate it
     * 2. is this a formatted field? if yes, parse it
     * 3. calculate required buffer size
     * 4. encode it
     */
    debug(`field - ${def.name}`);
    let prevByte = this.mBuf.idx.byte;

    let fieldValue = data[def.name];
    if (fieldValue == undefined) throw new Error(`missing field ${def.name}`);

    if (def.enumeration) {
        fieldValue = this.enumeration.call(this, def, fieldValue);
    }
    if (def.format) {
        let parser = this._getFieldParser(def.type);
        if (def.format == 'Datetime')
            fieldValue = parser(fieldValue, def.format, this.opt.iso8601FullPrecision);
        else
            fieldValue = parser(fieldValue, def.format);
    }

    let fieldOps = this._getFieldOps.call(this, def.type);
    if (!fieldOps) throw new Error(`no fieldOps for type ${def.type}`);

    debug(`${def.type}`);
    fieldOps(fieldValue);   // write value to buffer

    // return for testing
    let newByte = this.mBuf.idx.byte;
    return this.mBuf.buffer.slice(prevByte, newByte);
};

Encoder.prototype.enumeration = function (def, data) {
    if (Array.isArray(data)) {
        return data.map(d=>{ return this.enumeration.call(this, def, d) });
    }
    let enumDef = this.enumDefByName[def.enumeration];
    let entry = enumDef.entry.filter(entry=>(entry.name == data) || (entry.value == data))[0];
    if (entry == undefined)
        throw new Error(`unexpected enum entry name ${data} for field ${def.name}`);
    return Number(entry.value);
}

/**
 * Takes "reserved" definition object and writes reserved (zero) bits to buffer
 * 
 * @param {!object} def         reserved definition object
 */
Encoder.prototype.reserved = function (def) {
    let bitCount = Number(def.bitCount);
    this.mBuf.set_reserved(bitCount);
    return;
};

Encoder.prototype._getPropertyEncoder = function (node) {
    return {
        "field": this.field.bind(this),
        "reserved": this.reserved.bind(this),
        "parameter": this.parameter.bind(this),
        "choice": this.choice.bind(this)
    }[node]  || (()=>{throw new Error(`no encoder for node ${node}`)});
}

Encoder.prototype._getFieldOps = function (type) {
    return {
        "u1": this.mBuf.set_u1.bind(this.mBuf),
        "u2": this.mBuf.set_u2.bind(this.mBuf),
  
        "u1v": this.mBuf.set_u1v.bind(this.mBuf),
  
        "u8": this.mBuf.set_u8.bind(this.mBuf),
        "s8": this.mBuf.set_s8.bind(this.mBuf),
        "u8v": this.mBuf.set_u8v.bind(this.mBuf),
        "s8v": this.mBuf.set_s8v.bind(this.mBuf),
  
        "utf8v": this.mBuf.set_utf8v.bind(this.mBuf),
  
        "u16": this.mBuf.set_u16.bind(this.mBuf),
        "s16": this.mBuf.set_s16.bind(this.mBuf),
        "u16v": this.mBuf.set_u16v.bind(this.mBuf),
        "s16v": this.mBuf.set_s16v.bind(this.mBuf),
  
        "u32": this.mBuf.set_u32.bind(this.mBuf),
        "s32": this.mBuf.set_s32.bind(this.mBuf),
        "u32v": this.mBuf.set_u32v.bind(this.mBuf),
        "s32v": this.mBuf.set_s32v.bind(this.mBuf),
  
        "u64": this.mBuf.set_u64.bind(this.mBuf),
        "s64": this.mBuf.set_s64.bind(this.mBuf),
        "u64v": this.mBuf.set_u64v.bind(this.mBuf),
        "s64v": this.mBuf.set_s64v.bind(this.mBuf),
  
        "u96": this.mBuf.set_u96.bind(this.mBuf),
  
        "bytesToEnd": this.mBuf.set_bytesToEnd.bind(this.mBuf)
    }[type];
}

Encoder.prototype._getFieldParser = function(type) {
    return parsers[type] || parsers.nop;
}

Encoder.prototype._getBufSize = function (type, value) {
    let size;
    if ((type == "utf8v") || (type == "bytesToEnd")) {
        size = value.length;
    } else if (type.endsWith("v")) {
        let bitWidth = Number(type.match(/\d+/)[0]);
        size = Math.ceil(value.length * bitWidth / 8);
    } else {
        let bitWidth = Number(type.match(/\d+/)[0]);
        size = Math.ceil(bitWidth / 8);
    }
    return size;
}

module.exports = Encoder;