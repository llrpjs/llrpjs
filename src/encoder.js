const debug = require('debug')('llrpjs:encoder');
const MgBuf = require('./managed-buffer');
const {isEmpty, groupBy,
    groupByFirstKey, isParamWrapper, filter} = require('./tools');
const parsers = require('./parsers');


function Encoder(llrpdef, options) {
    if (!(this instanceof Encoder)) return new Encoder(...arguments);

    let defaultOpt = {
        format: {
            "u64": "iso-8601",
            "u96": "hex"
        },
        bufSize : 128 * 1024                // default LTK buf size
    };
    this.opt = {...defaultOpt, ...options};

    this.llrpdef = llrpdef;

    this.msgDefByName = groupBy(llrpdef.messageDefinitions, "name");
    this.paramDefByName = groupBy(llrpdef.parameterDefinitions, "name");
    this.choiceDefByName = groupBy(llrpdef.choiceDefinitions, "name");
    this.enumDefByName = groupBy(llrpdef.enumerationDefinitions, "name");

    this.mBuf = new MgBuf(Buffer.alloc(this.opt.bufSize));
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

    this.mBuf.idx.incByte = 10;                         // jump to payload (body) location
    this.definition.call(this, message.MessageBody, def);     // process body content and fill the buffer

    let msgLength = this.mBuf.idx.byte;
    this.mBuf.idx.byte = 0;

    this.mBuf.set_u16((1 << 10) | Number(def.typeNum));       // rsvd, version and type

    this.mBuf.set_u32(msgLength);

    this.mBuf.set_u32(Number(message.MessageID));

    // reset for next message
    this.mBuf.idx.byte = 0;

    return this.mBuf.buffer.slice(0, msgLength);
};

/**
 * 
 * @param {!object} element 
 * @param {!object} def 
 */

Encoder.prototype.definition = function (element, def) {
    for (let i in def.body) {
        let defRef = def.body[i];
        let node = defRef.node;
        let encoder = this._getPropertyEncoder.call(this, node);
        if (node == "choice") {
            // needs further processing to filter the target attribute, let the choice encoder decide;
            encoder.call(this, element, defRef);
        } else if (node == "parameter") {
            let name = defRef.type;
            let filtered = filter(element, name);
            if (isEmpty(filtered)) continue;        // optional parameter
            encoder.call(this, filtered, defRef);
        } else if (node == "field") {
            let name = defRef.name;
            let filtered = filter(element, name);
            encoder.call(this, filtered, defRef);
        } else if (node == "reserved") {
            encoder.call(this, defRef);
        }
    }
    return;
}

/**
 * Takes parameter object and its definition reference and returns an equivalent llrp-encoded buffer.
 * Note: if parameter and definition aren't matching (as in case of optional parameters that
 *  weren't present in the ccontaining message), it returns null
 * 
 * @param {!object} parameter    parameter object
 * @param {!object} defRef       the parameter's definition reference object
 */
Encoder.prototype.parameter = function (parameter, defRef) {
    let name = defRef.type;
    let def = this.paramDefByName[name];
    let typeNum = Number(def.typeNum);

    if (Array.isArray(parameter[name])) {
        let prevByte = this.mBuf.idx.byte;
        for (let i in parameter[name]) {
            let subElement = parameter[name][i];
            this.parameter.call(this, {
                [name]: subElement
            }, defRef);
            
        }
        let newByte = this.mBuf.idx.byte;
        return this.mBuf.buffer.slice(prevByte, newByte);
    }

    if (isParamWrapper(def, defRef)) {
        // if the passed field isn't wrapped already, wrap it.
        if (!parameter[name][name]) {
            parameter = {
                [name]: parameter
            }
        }
    }

    // preserve location
    let prevByte = this.mBuf.idx.byte;
    let prevBit = this.mBuf.idx.bit;
    if (typeNum > 127) {
        // TLV

        this.mBuf.idx.incByte = 4;                          // rsvd + type + length = 4 bytes
        this.definition.call(this, parameter[name], def);

        // preserve new location
        let newByte = this.mBuf.idx.byte;
        let newBit = this.mBuf.idx.bit;

        // got back to param header and write rsvd, type, and length
        this.mBuf.idx.byte = prevByte;
        this.mBuf.idx.bit = prevBit;
        this.mBuf.set_u16(0x3ff & typeNum);

        let length = newByte - prevByte;
        if (length > 65535) {
            throw new Error(`parameter payload buffer is too large`);
        }
        this.mBuf.set_u16(length);

        // restore the new location
        this.mBuf.idx.byte = newByte;
        this.mBuf.idx.bit = newBit;
    } else {
        // TV
        this.mBuf.set_u8((1 << 7) | (0x7ff & typeNum));
        this.definition.call(this, parameter[name], def);
    }

    let newByte = this.mBuf.idx.byte;
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

Encoder.prototype.choice = function (element, defRef) {
    let paramName = Object.keys(element)[0];

    return this.parameter.call(this, element, {
        node: "parameter",
        type: paramName,
        repeat: defRef.repeat
    });
}

/**
 * Takes field object and its definition object and writes value to buffer accordingly
 * 
 * @param {!number|!BigInteger} obj         field value (can be of type Number or BigInt)
 * @param {!object} def                     field definition object
 * @returns {!Buffer}                       buffer with llrp field
 */
Encoder.prototype.field = function (obj, def) {
    /**
     * 1. is this an enum? if yes, translate it
     * 2. is this a formatted field? if yes, parse it
     * 3. calculate required buffer size
     * 4. encode it
     */
    let prevByte = this.mBuf.idx.byte;

    let fieldValue = obj[def.name];
    if (def.enumeration) {
        let enumDef = this.enumDefByName[def.enumeration];
        if (!enumDef)
            throw new Error(`unknown enum ${def.enumeration}`);
        let enumDefByName = groupBy(enumDef.entry, "name");
        if (!enumDefByName[fieldValue])
            throw new Error(`unknown ${def.enumeration} enum entry ${fieldValue}`);
        fieldValue = enumDefByName[fieldValue].value;
    }
    if (def.format) {
        let parser = this._getFieldParser(def.type);
        fieldValue = parser(fieldValue, def.format);
    }

    let fieldOps = this._getFieldOps.call(this, def.type);
    if (!fieldOps) throw new Error(`no fieldOps for type ${def.type}`);

    fieldOps(fieldValue);   // write value to buffer

    // return for testing
    let newByte = this.mBuf.idx.byte;
    return this.mBuf.buffer.slice(prevByte, newByte);
};

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
    return parsers[type] || parsers.no_parser;
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