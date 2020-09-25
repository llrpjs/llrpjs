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
        }
    };
    this.opt = {...defaultOpt, ...options};

    this.llrpdef = llrpdef;

    this.msgDefByName = groupBy(llrpdef.messageDefinitions, "name");
    this.paramDefByName = groupBy(llrpdef.parameterDefinitions, "name");
    this.choiceDefByName = groupBy(llrpdef.choiceDefinitions, "name");
    this.enumDefByName = groupBy(llrpdef.enumerationDefinitions, "name");

    this.mBuf = new MgBuf(Buffer.alloc(128*1024));          // default LTK buf size
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
    
    let bodyBuf = this.definition.call(message.MessageBody, def);     // process body content and fill the buffer

    let mBuf = new MgBuf(Buffer.alloc(10));

    mBuf.set_u16((1 << 10) | Number(message.MessageType));       // rsvd, version and type

    mBuf.set_u32(10 + bodyBuf.length);             // set length to zero for now till we figure out the total length.

    mBuf.set_u32(Number(message.MessageID));

    let hdrBuf = mBuf.buffer;

    return Buffer.concat([hdrBuf, bodyBuf]);
};

/**
 * 
 * @param {!object} element 
 * @param {!object} def 
 * @returns {?Buffer}
 */

Encoder.prototype.definition = function (element, def) {
    let result = [];
    for (let i in def.body) {
        let defRef = def.body[i];
        let node = defRef.node;
        let name = defRef.name;
        let encoder = this._getPropertyEncoder.call(this, node);
        let subElement = element[name];
        if (!subElement) continue;              // optional? should I care?!
        let buf;
        if (node == "choice") {
            // needs further processing to filter the target attribute, let the choice encoder decide;
            buf = encoder.call(this, element, defRef);
        } else{
            let filtered = filter(element, name);
            if (!filtered) continue;
            buf = encoder.call(this, filtered, defRef);
        }
        if (!buf) continue;
        result.push(buf);
    }
    return Buffer.concat(result);
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
    let name = defRef.name;
    let def = this.paramDefByName[name];
    let typeNum = Number(def.typeNum);

    let bodyBuf = this.definition.call(this, parameter[name], def);

    let mBuf;
    if (typeNum > 127) {
        // TLV
        if (bodyBuf.length > 2**16 - 1) {
            throw new Error(`parameter payload buffer is too large`);
        }

        mBuf = new MgBuf(Buffer.alloc(4));

        mBuf.set_u16(0x3ff & typeNum);
        mBuf.set_u16(4 + bodyBuf.length);
    } else {
        // TV
        mBuf = new MgBuf(Buffer.alloc(1));

        mBuf.set_u8((1 << 7) | (0x7ff & typeNum));
    }

    let hdrBuf = mBuf.buffer;

    return Buffer.concat([hdrBuf, bodyBuf]);
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
    let choiceName = defRef.name;
    let choiceDef = this.choiceDefByName[choiceName];

    let choiceDefArr = choiceDef.body.filter(x=>x.type == element[x.type]);
    let result = [];
    for (let def in choiceDefArr) {
        let paramName = def.type;
        let filtered = filter(element, paramName)
        result.push(this.definition.call(this, filtered, {
            node: "parameter",
            type: paramName,
            repeat: defRef.repeat
        }));
    }

    return result.length? Buffer.concat(result) : null;
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

    let bufSize = this._getBufSize.call(this, def.type, fieldValue);
    let mBuf = new MgBuf(Buffer.alloc(bufSize));
    let fieldOps = this._getFieldOps.call(this, mBuf, def.type);
    if (!fieldOps) throw new Error(`no fieldOps for type ${def.type}`);

    fieldOps(fieldValue);   // write value to buffer
    return mBuf.buffer;
};

/**
 * Takes "reserved" definition object and writes reserved (zero) bits to buffer
 * 
 * @param {!object} def         reserved definition object
 */
Encoder.prototype.reserved = function (def) {
    let bitCount = def.bitCount;
    let bufSize = Math.ceil(bitCount / 8);
    let mBuf = new MgBuf(Buffer.alloc(bufSize));

    mBuf.set_reserved(bitCount);
    return mBuf.buffer;
};

Encoder.prototype._getPropertyEncoder = function (node) {
    return {
        "field": this.field.bind(this),
        "reserved": this.reserved.bind(this),
        "parameter": this.parameter.bind(this),
        "choice": this.choice.bind(this)
    }[node]  || (()=>{throw new Error(`no encoder for node ${node}`)});
}

Encoder.prototype._getFieldOps = function (mBuf, type) {
    return {
        "u1": mBuf.set_u1.bind(mBuf),
        "u2": mBuf.set_u2.bind(mBuf),
  
        "u1v": mBuf.set_u1v.bind(mBuf),
  
        "u8": mBuf.set_u8.bind(mBuf),
        "s8": mBuf.set_s8.bind(mBuf),
        "u8v": mBuf.set_u8v.bind(mBuf),
        "s8v": mBuf.set_s8v.bind(mBuf),
  
        "utf8v": mBuf.set_utf8v.bind(mBuf),
  
        "u16": mBuf.set_u16.bind(mBuf),
        "s16": mBuf.set_s16.bind(mBuf),
        "u16v": mBuf.set_u16v.bind(mBuf),
        "s16v": mBuf.set_s16v.bind(mBuf),
  
        "u32": mBuf.set_u32.bind(mBuf),
        "s32": mBuf.set_s32.bind(mBuf),
        "u32v": mBuf.set_u32v.bind(mBuf),
        "s32v": mBuf.set_s32v.bind(mBuf),
  
        "u64": mBuf.set_u64.bind(mBuf),
        "s64": mBuf.set_s64.bind(mBuf),
        "u64v": mBuf.set_u64v.bind(mBuf),
        "s64v": mBuf.set_s64v.bind(mBuf),
  
        "u96": mBuf.set_u96.bind(mBuf),
  
        "bytesToEnd": mBuf.set_bytesToEnd.bind(mBuf)
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