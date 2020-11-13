const debug = require('debug')('llrpjs:decoder');
const MgBuf = require('./managed-buffer');
const formatters = require('./field-formatters');
const {groupBy, isParamWrapper, merge} = require('./tools');

const llrpdef = require('../definitions/core/llrp-1x0-def.json');

function Decoder(options) {
    if (!(this instanceof Decoder)) return new Decoder(...arguments);

    let defaultOpt = {
        format: {
            "u64": "iso-8601",
            "u96": "hex"
        },
        wrapperParam: true,
        iso8601FullPrecision: false
    };
    this.opt = {...defaultOpt, ...options};

    this.llrpdef = llrpdef;

    this.msgDefByTypeNum = groupBy(llrpdef.messageDefinitions, "typeNum");
    this.paramDefByTypeNum = groupBy(llrpdef.parameterDefinitions, "typeNum");
    this.paramDefByName = groupBy(llrpdef.parameterDefinitions, "name");
    this.choiceDefByName = groupBy(llrpdef.choiceDefinitions, "name");
    this.enumDefByName = groupBy(llrpdef.enumerationDefinitions, "name");

    this.mBuf = new MgBuf(Buffer.alloc(0));     // starting off with empty buffer
}

Decoder.prototype.addBuffer = function (buf) {
    this.mBuf.buffer = Buffer.concat([this.mBuf.buffer, buf]);
    this.mBuf.idx._bufLength = this.mBuf.buffer.length;
    return this.mBuf.buffer.length;
}

Decoder.prototype.flushBuffer = function (buf) {
    this.mBuf = new MgBuf(Buffer.alloc(0));      // start off fresh
    return 0;
}


Decoder.prototype.message = function () {
    let header = this.header.call(this);

    debug(`msgType: ${header.def.name} - msgLen ${header.length}`);

    //TODO: custom message: check if we have a definition for it, if not use the generic one
    let body = this.body.call(this, header);
    debug('finished');
    return {
        MessageID: header.msgID,
        MessageType: header.def.name,
        MessageBody: body
    };
}

Decoder.prototype.header = function () {
    let typeNum = this.mBuf.get_u16();
    let version = (typeNum >>> 10) & 0x03;
    typeNum &= 0x3ff;

    if (version != 1)
        throw new Error(`unsupported version`);

    let length = this.mBuf.get_u32();
    if (length < 10)
        throw new Error(`message length too small`);

    if (length > this.mBuf.buffer.length)
        throw new Error(`buffer length too small`);

    let def = this.msgDefByTypeNum[typeNum];
    if (!def)
        throw new Error(`unknown message type ${typeNum}`);

    let messageID = this.mBuf.get_u32();

    return {
        def: def,
        msgID: messageID,
        length: length - 10
    };
}

Decoder.prototype.paramHeader = function () {
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
    // find param definition
    let def = this.paramDefByTypeNum[type.toString()];
    if (def == undefined) throw new Error(`unknown parameter type ${type}`);
    debug(`typeNum ${type} - name ${def.name} - paramLen ${length}`);

    return {
        def: def,
        length: length?length - 4:0
    };
}

Decoder.prototype.body = function (header) {
    let result = {};
    let def = header.def;
    let start = this.mBuf.idx.byte;

    // check if we have fields/enums/reserved
    for (let simpleDef of def.body.filter(defItem=>["field", "reserved"].includes(defItem.node))) {
        let decoder = this._getPropertyDecoder(simpleDef.node);
        result = {...result ,...decoder.call(this, simpleDef, start + header.length)};
    }

    // sub-parameters prospection
    debug(`${this.mBuf.idx.byte} - ${start + header.length}`);
    while (this.mBuf.idx.byte < start + header.length) {
        let subParam = this.parameter.call(this);
        // is sub-parameter allowed in this result according to the parent definition?
        this._isParamAllowed.call(this, subParam.header.def.name, def, result);
        // if we already have an instance, make it an array and push the new one
        result = merge(result, subParam.body);
    }
    return result;
}

Decoder.prototype.parameter = function () {
    let paramHeader = this.paramHeader.call(this);
    let name = paramHeader.def.name;
    debug(`parameter - ${name}`);

    if (isParamWrapper(paramHeader.def) && (!this.opt.wrapperParam)) {
        // This parameter is a wrapper to a field, return the field directly
        return {
            name: name,
            body: this.body.call(this, paramHeader)
        };
    }

    return {
        header: paramHeader,
        body: {
            [name]: this.body.call(this, paramHeader)
        }
    };
}

Decoder.prototype.field = function (def, end=0) {
    let fieldOps = this._getFieldOps.call(this, def.type);
    if (!fieldOps) throw new Error(`no fieldOps for type ${def.type}`);
    let result = {};
    let fieldValue = fieldOps(end);
    if (def.enumeration) {
        fieldValue = this.enumeration.call(this, def, fieldValue);
    }

    if (def.hasOwnProperty("format")) {
        let fieldFormatter = this._getFieldFormatter(def.type);
        if (def.format == "Datetime")
            fieldValue = fieldFormatter(fieldValue, def.format, this.opt.iso8601FullPrecision);
        else
            fieldValue = fieldFormatter(fieldValue, def.format);
    }
    debug(`field: ${def.name} - ${def.type}`);
    result[def.name] = fieldValue;
    return result;
}

Decoder.prototype.reserved = function(def) {
    this.mBuf.get_reserved(Number(def.bitCount));
    return {};
}

Decoder.prototype._getPropertyDecoder = function (node) {
    return {
        "field": this.field.bind(this),
        "parameter": this.parameter.bind(this),
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
    return formatters[type] || formatters.nop;
}

Decoder.prototype._isParamAllowed = function (name, def, result) {
    let defRef = def.body.filter(dRef=>dRef.type==name)[0];
    if (!defRef) {
        // either it's a choice, or an unexpected type
        let choiceDefRef = def.body.filter(dRef=>{
            if (dRef.node != "choice") return false;
            let choiceDef = this.choiceDefByName[dRef.type];
            return choiceDef.body.filter(dRef=>dRef.type==name)[0]?true: false;
        })[0];

        if (!choiceDefRef) throw new Error(`unexpected type ${name} - no reference found in ${def.name}`);
        let repeat = choiceDefRef.repeat;
        let choiceDef = this.choiceDefByName[choiceDefRef.type];
        let choiceParamList = choiceDef.body.map(dRef=>dRef.type);
        let existingParamList = choiceParamList.filter(paramName=>result.hasOwnProperty(paramName));

        if (repeat.endsWith("1") && (existingParamList.length > 0)) {
            // (1) or (0-1) only one instance allowed
            throw new Error(`type ${name} is allowed only once in ${def.name}, one choice already exists`);
        }
    } else {
        let repeat = defRef.repeat;
        if (repeat.endsWith("1") && result.hasOwnProperty(name)) {
            // (1) or (0-1) only one instance allowed
            throw new Error(`type ${name} is allowed only once in ${def.name}`);
        }
    }
    return;
}

Decoder.prototype._resolveChoiceReferences = function (def) {
    return {
        ...def,
        body: def.body.reduce((acc, defRef)=>{
                if(defRef.node == "field") return acc;
                if(defRef.node == "choice") {
                    let resBody = this.choiceDefByName[defRef.type].body.map(_defRef=>{
                        _defRef.repeat = defRef.repeat;
                        return _defRef;
                    });
                    return acc?[...acc, ...resBody]:resBody;
                } else {
                    return acc?[...acc, defRef]: [];
                }
            }, [])
        };
}

Decoder.prototype.enumeration = function (def, data) {
    // process enum
    if (Array.isArray(data)) {
        return data.map(d=>{ return this.enumeration.call(this, def, d); });
    }
    debug(`enum - ${data}`);
    let enumDef = this.enumDefByName[def.enumeration];
    let entry = enumDef.entry.filter(entry=>entry.value == data)[0];
    if (entry == undefined)
        throw new Error(`unexpected enum entry ${fieldValue} for field ${def.name}`);
    return entry.name;
}

module.exports = Decoder;
