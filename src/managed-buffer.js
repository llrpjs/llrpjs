let debug = require('debug')('llrpjs:mbuffer')


function assertAvail(idx, bitCount=0, byteCount=0) {
    let totalBits = bitCount + byteCount * 8;
    debug(`${totalBits} - ${idx.bitsLeft}`);
    if (totalBits > idx.bitsLeft)
        throw new Error('attempt to read beyond buffer limit');
}

function ManagedBuffer (buf) {
    if (!(this instanceof ManagedBuffer)) return new ManagedBuffer(...arguments);

    this.buffer = buf;
    this.bitResidue = 0;
    this.idx = {
        _bufLength: buf.byteLength,
        _bit: 0,
        _byte: 0,
        get bit() {return this._bit;},
        get byte() {return this._byte;},
        get incBit() {
            this._bit++;
            if (this._bit >= 8) {
                this._bit = 0;
                this.incByte;
            }
        },
        set incBit (n) {
            this.incByte = Math.floor(n / 8);
            this._bit += n % 8;
            if (this._bit >= 8) {
                this._bit = 0;
                this.incByte;
            }
        },
        get incByte() {
            this._byte++;
        },
        set incByte(n) {
            this._byte += n;
        },
        get bitsLeft() {
            return this._bufLength * 8 - this._byte * 8 - this._bit;
        },
        get bytesLeft() {
            return this._bufLength - this._byte;
        }
    }

}

ManagedBuffer.prototype.get_u1 = function () {
    assertAvail(this.idx, 1);
    let result = this.buffer.readUInt8(this.idx.byte) >>> (8 - (this.idx.bit + 1));
    result &= 0x01;
    this.idx.incBit;
    return result;
};

ManagedBuffer.prototype.get_u1v = function () {
    let bitCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < bitCount; i++)
        result.push(this.get_u1.call(this));
    return result;
}

ManagedBuffer.prototype.get_u2 = function () {
    // Big-Endian
    return this.get_u1.call(this) * 2 + this.get_u1.call(this);
}

ManagedBuffer.prototype.get_u8 = function () {
    assertAvail(this.idx, 0, 1);
    let result = this.buffer.readUInt8(this.idx.byte);
    this.idx.incByte;
    return result;
}

ManagedBuffer.prototype.get_s8 = function () {
    assertAvail(this.idx, 0, 1);
    let result = this.buffer.readInt8(this.idx.byte);
    this.idx.incByte;
    return result;
}

ManagedBuffer.prototype.get_u8v = function () {
    assertAvail(this.idx, 0, 2);
    let byteCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < byteCount; i++)
        result.push(this.get_u8.call(this));
    return result;
}

ManagedBuffer.prototype.get_s8v = function () {
    assertAvail(this.idx, 0, 2);
    let byteCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < byteCount; i++)
        result.push(this.get_s8.call(this));
    return result;
}

ManagedBuffer.prototype.get_utf8v = function () {
    assertAvail(this.idx, 0, 2);
    let byteCount = this.get_u16.call(this);
    assertAvail(this.idx, 0, byteCount);
    let buf = this.buffer.slice(this.idx.byte, this.idx.byte + byteCount);
    this.idx.incByte = byteCount;
    return buf.toString('utf8');
}

ManagedBuffer.prototype.get_u16 = function () {
    assertAvail(this.idx, 0, 2);
    let result = this.buffer.readUInt16BE(this.idx.byte);
    this.idx.incByte = 2;
    return result;
}

ManagedBuffer.prototype.get_s16 = function () {
    assertAvail(this.idx, 0, 2);
    let result = this.buffer.readInt16BE(this.idx.byte);
    this.idx.incByte = 2;
    return result;
}

ManagedBuffer.prototype.get_u16v = function () {
    let wordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < wordCount; i++)
        result.push(this.get_u16.call(this));
    return result;
}

ManagedBuffer.prototype.get_s16v = function () {
    let wordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < wordCount; i++)
        result.push(this.get_s16.call(this));
    return result;
}


ManagedBuffer.prototype.get_u32 = function () {
    assertAvail(this.idx, 0, 4);
    let result = this.buffer.readUInt32BE(this.idx.byte);
    this.idx.incByte = 4;
    return result;
}

ManagedBuffer.prototype.get_s32 = function () {
    assertAvail(this.idx, 0, 4);
    let result = this.buffer.readInt32BE(this.idx.byte);
    this.idx.incByte = 4;
    return result;
}

ManagedBuffer.prototype.get_u32v = function () {
    let dWordCount = this.get_u16.call(this);
    let byteCount = dWordCount * 4;
    let result = [];
    for (let i=0; i < dWordCount; i++)
        result.push(this.get_u32.call(this));
    return result;
}

ManagedBuffer.prototype.get_s32v = function () {
    let dWordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < dWordCount; i++)
        result.push(this.get_s32.call(this));
    return result;
}

ManagedBuffer.prototype.get_u64 = function () {
    assertAvail(this.idx, 0, 8);
    let result = this.buffer.readBigUInt64BE(this.idx.byte);
    this.idx.incByte = 8;
    return result;
}

ManagedBuffer.prototype.get_s64 = function () {
    assertAvail(this.idx, 0, 8);
    let result = this.buffer.readBigInt64BE(this.idx.byte);
    this.idx.incByte = 8;
    return result;
}

ManagedBuffer.prototype.get_u64v = function () {
    let qWordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < qWordCount; i++)
        result.push(this.get_u64.call(this));
    return result;
}

ManagedBuffer.prototype.get_s64v = function () {
    let qWordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < qWordCount; i++)
        result.push(this.get_s64.call(this));
    return result;
}

ManagedBuffer.prototype.get_u96 = function () {
    let byteCount = 12;
    let result = [];
    for (let i=0; i < byteCount; i++)
        result.push(this.get_u8.call(this));
    return result;
}

ManagedBuffer.prototype.get_bytesToEnd = function () {
    let result = [];
    let byteCount = this.idx.bytesLeft;
    for (let i=0; i < byteCount; i++)
        result.push(this.get_u8.call(this));
    return result;
}

ManagedBuffer.prototype.get_reserved = function (bitCount=0) {
    assertAvail(this.idx, bitCount);
    // Just step over it
    this.idx.incBit = bitCount;
}

// Setters
ManagedBuffer.prototype.set_u1 = function (value) {
    // safe to use with unsafely allocated buffers
    assertAvail(this.idx, 1);
    value &= 0x01;
    let mask = 1 << (8 - (this.idx.bit + 1));
    this.bitResidue = value ? this.bitResidue | mask: this.bitResidue & ~mask;
    if (this.idx.bit == 7) {
        this.buffer.writeUInt8(this.bitResidue, this.idx.byte);
        this.bitResidue = 0;
    }
    this.idx.incBit;
    return 1;
}

ManagedBuffer.prototype.set_u2 = function (value) {
    value &= 0x03;
    this.set_u1.call(this, (value & 0x02) >> 1);    //MSB
    this.set_u1.call(this, value & 0x01);           //LSB
    return 2;
}

ManagedBuffer.prototype.set_u1v = function (value) {
    let bitCount = value.length
    this.set_u16.call(this, bitCount);
    for (let i=0; i<bitCount; i++)
        this.set_u1.call(this, value[i]);
    return bitCount;
}

ManagedBuffer.prototype.set_u8 = function (value) {
    assertAvail(this.idx, 0, 1);
    this.buffer.writeUInt8(value, this.idx.byte);
    this.idx.incByte;
    return 1;
}

ManagedBuffer.prototype.set_s8 = function (value) {
    assertAvail(this.idx, 0, 1);
    this.buffer.writeInt8(value, this.idx.byte);
    this.idx.incByte;
    return 1;
}

ManagedBuffer.prototype.set_u8v = function (value) {
    let byteCount = value.length;
    // write byte count, then the stream of bytes
    this.set_u16.call(this, byteCount);
    for (let i=0; i < byteCount; i++)
        this.set_u8.call(this, value[i]);
    return byteCount;
}

ManagedBuffer.prototype.set_s8v = function (value) {
    let byteCount = value.length;
    // write byte count, then the stream of bytes
    this.set_u16.call(this, byteCount);
    for (let i=0; i < byteCount; i++)
        this.set_s8.call(this, value[i]);
    return byteCount;
}

ManagedBuffer.prototype.set_utf8v = function (value) {
    let byteCount = value.length;
    this.set_u16.call(this, byteCount);
    assertAvail(this.idx, 0, byteCount);
    this.buffer.write(value, this.idx.byte, 'utf8');
    this.idx.incByte = byteCount;
    return byteCount;
}

ManagedBuffer.prototype.set_u16 = function (value) {
    let byteCount = 2;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeUInt16BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}

ManagedBuffer.prototype.set_s16 = function (value) {
    let byteCount = 2;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeInt16BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}

ManagedBuffer.prototype.set_u16v = function (value) {
    let wordCount = value.length;
    this.set_u16.call(this, value.length);
    for (let i=0; i < wordCount; i++)
        this.set_u16.call(this, value[i]);
    return wordCount;
}

ManagedBuffer.prototype.set_s16v = function (value) {
    let wordCount = value.length;
    this.set_u16.call(this, wordCount);
    for (let i=0; i < wordCount; i++)
        this.set_s16.call(this, value[i]);
    return wordCount;
}

ManagedBuffer.prototype.set_u32 = function (value) {
    let byteCount = 4;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeUInt32BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}

ManagedBuffer.prototype.set_s32 = function (value) {
    let byteCount = 4;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeInt32BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}

ManagedBuffer.prototype.set_u32v = function (value) {
    let dWordCount = value.length;
    this.set_u16.call(this, dWordCount);
    for (let i=0; i < dWordCount; i++)
        this.set_u32.call(this, value[i]);
    return dWordCount * 4;
}

ManagedBuffer.prototype.set_s32v = function (value) {
    let dWordCount = value.length;
    this.set_u16.call(this, dWordCount);
    for (let i=0; i < dWordCount; i++)
        this.set_s32.call(this, value[i]);
    return dWordCount * 4;
}

ManagedBuffer.prototype.set_u64 = function (value) {
    let byteCount = 8;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeBigUInt64BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}

ManagedBuffer.prototype.set_s64 = function (value) {
    let byteCount = 8;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeBigInt64BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}

ManagedBuffer.prototype.set_u64v = function (value) {
    let qWordCount = value.length;
    this.set_u16.call(this, qWordCount);
    for (let i=0; i < qWordCount; i++)
        this.set_u64.call(this, value[i]);
    return qWordCount * 8;
}

ManagedBuffer.prototype.set_s64v = function (value) {
    let qWordCount = value.length;
    this.set_u16.call(this, qWordCount);
    for (let i=0; i < qWordCount; i++)
        this.set_s64.call(this, value[i]);
    return qWordCount * 8;
}

ManagedBuffer.prototype.set_u96 = function (value) {
    // input should be array of Uint8
    let byteCount = 12;
    for (let i=0; i < byteCount; i++)
        this.set_u8.call(this, value[i]);
    return byteCount;
}

ManagedBuffer.prototype.set_bytesToEnd = function (value) {
    // input should be array of Uint8
    let byteCount = value.length;
    for (let i=0; i<byteCount; i++)
        this.set_u8.call(this, value[i]);
    return byteCount;
}

ManagedBuffer.prototype.set_reserved = function (bitCount=0) {
    for (let i=0; i<bitCount; i++)
        this.set_u1.call(this, 0);
}

module.exports = ManagedBuffer;