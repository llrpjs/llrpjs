"use-strict";

let debug = require('debug')('llrpjs:mbuffer')


/**
 * @fileOverview Read and write LTK data types from/to a buffer.
 * 
 * For more information on the LTK binary schema:
 *      {@link http://llrp.org/ltk/schema/core/encoding/binary/1.0/llrpdef.xsd}
 *
 * @author Haytham Halimeh <haytham.halimeh@gmail.com>
 * 
 */


/**
 *  Asserts availability of data to read from the buffer or space to write to.
 * 
 * @param  {Object} idx         mBuf index object
 * @param  {number} bitCount    bit count to access if any
 * @param  {number} byteCount   byte count to access if any
 */
function assertAvail(idx, bitCount=0, byteCount=0) {
    let totalBits = bitCount + byteCount * 8;
    debug(`${totalBits} - ${idx.bitsLeft}`);
    if (totalBits > idx.bitsLeft)
        throw new Error('attempt to read or write beyond buffer limit');
}

/**
 * Provides a set of buffer (binary) operations defined in the LTK project
 * 
 * @constructor
 * @param {Buffer}  buf node.js buffer
 */

function ManagedBuffer (buf) {
    if (!(this instanceof ManagedBuffer)) return new ManagedBuffer(...arguments);

    if (!buf) {
        buf = Buffer.alloc(128*1024);       // default LTK buffer size
    }

    this.buffer = buf;
    this.bitResidue = 0;
    this.idx = {
        _bufLength: buf.byteLength,
        _bit: 0,
        _byte: 0,
        get bit() {return this._bit;},
        get byte() {return this._byte;},
        set bit(value) {
            this._bit = value;
        },
        set byte(value) {
            this._byte = value;
        },
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

    Object.defineProperties(this, {
        length: {
            get: () => this.idx._bufLength
        }
    });
}

/**
 *  reads one bit off the current location
 * 
 * @return {!number}     returns 1 or 0
 */
ManagedBuffer.prototype.get_u1 = function () {
    assertAvail(this.idx, 1);
    let result = this.buffer.readUInt8(this.idx.byte) >>> (8 - (this.idx.bit + 1));
    result &= 0x01;
    this.idx.incBit;
    return result;
};
/**
 *  reads the number of bits from the first two bytes and reads off a series of payload bytes accordingly.
 *  Note that if number of bits is below 8, the result will be an array containing one full byte.
 * 
 * @return {number[]}      returns full-byte array
 */
ManagedBuffer.prototype.get_u1v = function () {
    let bitCount = this.get_u16.call(this);
    let byteCount = Math.floor((bitCount + 7)/ 8);
    let result = [];
    for (let i=0; i < byteCount; i++)
        result.push(this.get_u8.call(this));
    return result;
}
/**
 *  reads two bits off the current location
 * 
 * @return {!number}     returns a number between 0 and 3
 */
ManagedBuffer.prototype.get_u2 = function () {
    // Big-Endian
    return this.get_u1.call(this) * 2 + this.get_u1.call(this);
}
/**
 *  reads one byte off the current buffer location
 * 
 * @return {!number}     returns a number between 0 and 255
 */
ManagedBuffer.prototype.get_u8 = function () {
    assertAvail(this.idx, 0, 1);
    let result = this.buffer.readUInt8(this.idx.byte);
    this.idx.incByte;
    return result;
}
/**
 *  reads one signed byte off the current location
 * 
 * @return {!number}     returns a number between -128 and 127
 */
ManagedBuffer.prototype.get_s8 = function () {
    assertAvail(this.idx, 0, 1);
    let result = this.buffer.readInt8(this.idx.byte);
    this.idx.incByte;
    return result;
}
/**
 *  reads the number of elements from the first two bytes then gets a series of bytes accordingly
 * 
 * @return {number[]}      returns an array of unsigned bytes
 */
ManagedBuffer.prototype.get_u8v = function () {
    let byteCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < byteCount; i++)
        result.push(this.get_u8.call(this));
    return result;
}
/**
 *  reads the number of elements from the first two bytes then gets a series of signed bytes accordingly
 * 
 * @return {number[]}      returns an array of signed bytes
 */
ManagedBuffer.prototype.get_s8v = function () {
    let byteCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < byteCount; i++)
        result.push(this.get_s8.call(this));
    return result;
}
/**
 *  reads a UTF-8 string from the buffer with the length read in the first two bytes at the current buffer location
 * 
 * @return {String}     returns a UTF-8 string
 */
ManagedBuffer.prototype.get_utf8v = function () {
    assertAvail(this.idx, 0, 2);
    let byteCount = this.get_u16.call(this);
    assertAvail(this.idx, 0, byteCount);
    let buf = this.buffer.slice(this.idx.byte, this.idx.byte + byteCount);
    this.idx.incByte = byteCount;
    return buf.toString('utf8');
}
/**
 *  reads two bytes (Big-Endian) off the current location and returns a short integer
 * 
 * @return {!number}     returns a short integer
 */
ManagedBuffer.prototype.get_u16 = function () {
    assertAvail(this.idx, 0, 2);
    let result = this.buffer.readUInt16BE(this.idx.byte);
    this.idx.incByte = 2;
    return result;
}
/**
 *  reads two bytes (Big-Endian) off the current location and returns a signed short integer
 * 
 * @return {!number}     returns a signed short integer
 */
ManagedBuffer.prototype.get_s16 = function () {
    assertAvail(this.idx, 0, 2);
    let result = this.buffer.readInt16BE(this.idx.byte);
    this.idx.incByte = 2;
    return result;
}
/**
 *  reads a series of short integers (2 BE-bytes) off the buffer with length read from the first 2 bytes
 * 
 * @return {number[]}      returns an array of short integers
 */
ManagedBuffer.prototype.get_u16v = function () {
    let wordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < wordCount; i++)
        result.push(this.get_u16.call(this));
    return result;
}
/**
 *  reads a series of signed short ints (2-BE-bytes) off the buffer with length read from the first 2 bytes
 * 
 * @return {number[]}      returns an array of signed short integers
 */
ManagedBuffer.prototype.get_s16v = function () {
    let wordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < wordCount; i++)
        result.push(this.get_s16.call(this));
    return result;
}
/**
 *  reads 4 bytes (BE) off the current location
 * 
 * @return {!number}     returns an integer
 */
ManagedBuffer.prototype.get_u32 = function () {
    assertAvail(this.idx, 0, 4);
    let result = this.buffer.readUInt32BE(this.idx.byte);
    this.idx.incByte = 4;
    return result;
}
/**
 *  reads 4 bytes (BE) off the current location
 * 
 * @return {!number}     returns a signed integer
 */
ManagedBuffer.prototype.get_s32 = function () {
    assertAvail(this.idx, 0, 4);
    let result = this.buffer.readInt32BE(this.idx.byte);
    this.idx.incByte = 4;
    return result;
}
/**
 *  reads a series of 4-byte (BE) values and returns an array of integers with length set in the first 2 bytes
 * 
 * @return {number[]}      returns an array of integers
 */
ManagedBuffer.prototype.get_u32v = function () {
    let dWordCount = this.get_u16.call(this);
    let byteCount = dWordCount * 4;
    let result = [];
    for (let i=0; i < dWordCount; i++)
        result.push(this.get_u32.call(this));
    return result;
}
/**
 *  reads a series of 4-byte (BE) values and returns an array of signed integers with length set in the first 2 bytes
 * 
 * @return {number[]}      returns an array of signed integers
 */
ManagedBuffer.prototype.get_s32v = function () {
    let dWordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < dWordCount; i++)
        result.push(this.get_s32.call(this));
    return result;
}
/**
 *  reads an 8-byte (BE) value off the current location and returns a BigInt
 * 
 * @return {BigInt}     returns a BigInt
 */
ManagedBuffer.prototype.get_u64 = function () {
    assertAvail(this.idx, 0, 8);
    let result = this.buffer.readBigUInt64BE(this.idx.byte);
    this.idx.incByte = 8;
    return result;
}
/**
 *  reads an 8-byte (BE) value off the current location and returns a signed BigInt
 * 
 * @return {BigInt}     returns a signed BigInt
 */
ManagedBuffer.prototype.get_s64 = function () {
    assertAvail(this.idx, 0, 8);
    let result = this.buffer.readBigInt64BE(this.idx.byte);
    this.idx.incByte = 8;
    return result;
}
/**
 *  reads 8-bytes (BE) values and returns an array of BigInt with length set in the first 2 bytes
 * 
 * @return {BigInt}     returns an array of BigInt values
 */
ManagedBuffer.prototype.get_u64v = function () {
    let qWordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < qWordCount; i++)
        result.push(this.get_u64.call(this));
    return result;
}
/**
 *  reads 8-bytes (BE) values and returns an array of signed BigInt with length set in the first 2 bytes
 * 
 * @return {BigInt}     returns an array of signed BigInt values
 */
ManagedBuffer.prototype.get_s64v = function () {
    let qWordCount = this.get_u16.call(this);
    let result = [];
    for (let i=0; i < qWordCount; i++)
        result.push(this.get_s64.call(this));
    return result;
}
/**
 *  reads 12 bytes off the current location and returns an array of bytes
 * 
 * @return {number[]}     returns a 12-bytes array
 */
ManagedBuffer.prototype.get_u96 = function () {
    let byteCount = 12;
    let result = [];
    for (let i=0; i < byteCount; i++)
        result.push(this.get_u8.call(this));
    return result;
}
/**
 *  reads off all bytes left in the buffer
 * 
 * @return {number[]}     returns a byte array
 */
ManagedBuffer.prototype.get_bytesToEnd = function () {
    let result = [];
    let byteCount = this.idx.bytesLeft;
    for (let i=0; i < byteCount; i++)
        result.push(this.get_u8.call(this));
    return result;
}
/**
 *  skips over reserved bits in the buffer
 * 
 */
ManagedBuffer.prototype.get_reserved = function (bitCount=0) {
    assertAvail(this.idx, bitCount);
    // Just step over it
    this.idx.incBit = bitCount;
}

// Setters
/**
 * writes 1 bit to the residue byte. If ready, it flushes residue into buffer
 * 
 * @return {!number}     returns 1
 */
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
/**
 * writes 2 bits to the residue byte. If ready, it flushes residue into buffer
 * 
 * @return {!number}     returns 2
 */
ManagedBuffer.prototype.set_u2 = function (value) {
    value &= 0x03;
    this.set_u1.call(this, (value & 0x02) >> 1);    //MSB
    this.set_u1.call(this, value & 0x01);           //LSB
    return 2;
}
/**
 * writes N bits to the residue byte and flushes residue into buffer
 * 
 * @return {!number}     returns the number of bits written
 */
ManagedBuffer.prototype.set_u1v = function (value) {
    let bitCount = value.length * 8;
    let byteCount = Math.floor((bitCount + 7)/8);
    this.set_u16.call(this, bitCount);
    for (let i=0; i<byteCount; i++)
        this.set_u8.call(this, value[i]);
    return bitCount;
}
/**
 * writes a byte at the current location
 * 
 * @return {!number}     returns 1
 */
ManagedBuffer.prototype.set_u8 = function (value) {
    assertAvail(this.idx, 0, 1);
    this.buffer.writeUInt8(value, this.idx.byte);
    this.idx.incByte;
    return 1;
}
/**
 * writes a signed byte at the current location
 * 
 * @return {!number}     returns 1
 */
ManagedBuffer.prototype.set_s8 = function (value) {
    assertAvail(this.idx, 0, 1);
    this.buffer.writeInt8(value, this.idx.byte);
    this.idx.incByte;
    return 1;
}
/**
 * writes an array of bytes to buffer in length-value format
 * 
 * @return {!number}     returns the number of written bytes
 */
ManagedBuffer.prototype.set_u8v = function (value) {
    let byteCount = value.length;
    // write byte count, then the stream of bytes
    this.set_u16.call(this, byteCount);
    for (let i=0; i < byteCount; i++)
        this.set_u8.call(this, value[i]);
    return byteCount;
}
/**
 * writes an array of signed bytes to buffer in length-value format
 * 
 * @return {!number}     returns the number of written bytes
 */
ManagedBuffer.prototype.set_s8v = function (value) {
    let byteCount = value.length;
    // write byte count, then the stream of bytes
    this.set_u16.call(this, byteCount);
    for (let i=0; i < byteCount; i++)
        this.set_s8.call(this, value[i]);
    return byteCount;
}
/**
 * writes bytes of UTF-8 encoded string to buffer in length-value format
 * 
 * @return {!number}     returns the number of written bytes
 */
ManagedBuffer.prototype.set_utf8v = function (value) {
    let byteCount = value.length;
    this.set_u16.call(this, byteCount);
    assertAvail(this.idx, 0, byteCount);
    this.buffer.write(value, this.idx.byte, 'utf8');
    this.idx.incByte = byteCount;
    return byteCount;
}
/**
 * writes short integer at current location
 * 
 * @return {!number}     returns the number of written bytes
 */
ManagedBuffer.prototype.set_u16 = function (value) {
    let byteCount = 2;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeUInt16BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}
/**
 * writes signed short integer at current location
 * 
 * @return {!number}     returns the number of written bytes
 */
ManagedBuffer.prototype.set_s16 = function (value) {
    let byteCount = 2;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeInt16BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}
/**
 * writes an array of short integers to buffer in length-value format
 * 
 * @return {!number}     returns the number of written bytes
 */
ManagedBuffer.prototype.set_u16v = function (value) {
    let wordCount = value.length;
    this.set_u16.call(this, value.length);
    for (let i=0; i < wordCount; i++)
        this.set_u16.call(this, value[i]);
    return wordCount*2;
}
/**
 * writes an array of signed short integers to buffer in length-value format
 * 
 * @return {!number}     returns the number of written bytes
 */
ManagedBuffer.prototype.set_s16v = function (value) {
    let wordCount = value.length;
    this.set_u16.call(this, wordCount);
    for (let i=0; i < wordCount; i++)
        this.set_s16.call(this, value[i]);
    return wordCount*2;
}
/**
 * writes an integer at the current location
 * 
 * @return {!number}     returns number of written bytes
 */
ManagedBuffer.prototype.set_u32 = function (value) {
    let byteCount = 4;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeUInt32BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}
/**
 * writes a signed integer at the current location
 * 
 * @return {!number}     returns number of written bytes
 */
ManagedBuffer.prototype.set_s32 = function (value) {
    let byteCount = 4;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeInt32BE(value, this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}
/**
 * writes a series of integers in length-value format
 * 
 * @return {!number}     returns number of written bytes
 */
ManagedBuffer.prototype.set_u32v = function (value) {
    let dWordCount = value.length;
    this.set_u16.call(this, dWordCount);
    for (let i=0; i < dWordCount; i++)
        this.set_u32.call(this, value[i]);
    return dWordCount * 4;
}
/**
 * writes a series of signed integers in length-value format
 * 
 * @param   {!number} value  a signed integer
 * @return  {!number}        returns number of written bytes
 */
ManagedBuffer.prototype.set_s32v = function (value) {
    let dWordCount = value.length;
    this.set_u16.call(this, dWordCount);
    for (let i=0; i < dWordCount; i++)
        this.set_s32.call(this, value[i]);
    return dWordCount * 4;
}
/**
 * writes a long integer at the current location
 * 
 * @param   {BigInt} value  a BigInt
 * @return  {!number}        returns number of written bytes
 */
ManagedBuffer.prototype.set_u64 = function (value) {
    let byteCount = 8;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeBigUInt64BE(BigInt(value), this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}
/**
 * writes a signed long integer at the current location
 * 
 * @param   {BigInt} value  a BigInt
 * @return  {!number}        returns number of written bytes
 */
ManagedBuffer.prototype.set_s64 = function (value) {
    let byteCount = 8;
    assertAvail(this.idx, 0, byteCount);
    this.buffer.writeBigInt64BE(BigInt(value), this.idx.byte);
    this.idx.incByte = byteCount;
    return byteCount;
}
/**
 * writes a series of long integers in length-value format
 * 
 * @param   {number[]} value   long integers array
 * @return  {!number}        returns number of written bytes
 */
ManagedBuffer.prototype.set_u64v = function (value) {
    let qWordCount = value.length;
    this.set_u16.call(this, qWordCount);
    for (let i=0; i < qWordCount; i++)
        this.set_u64.call(this, value[i]);
    return qWordCount * 8;
}
/**
 * writes a series of signed long integers in length-value format
 * 
 * @param   {number[]} value   signed long integers array
 * @return  {!number}        returns number of written bytes
 */
ManagedBuffer.prototype.set_s64v = function (value) {
    let qWordCount = value.length;
    this.set_u16.call(this, qWordCount);
    for (let i=0; i < qWordCount; i++)
        this.set_s64.call(this, value[i]);
    return qWordCount * 8;
}
/**
 * writes 12-bytes at the current location
 * 
 * @param   {number[]} value   12-byte array
 * @return  {!number}        returns number of written bytes
 */
ManagedBuffer.prototype.set_u96 = function (value) {
    // input should be array of Uint8
    let byteCount = 12;
    for (let i=0; i < byteCount; i++)
        this.set_u8.call(this, value[i]);
    return byteCount;
}
/**
 * writes a series bytes at the current location
 * 
 * @param   {number[]} value   array of bytes
 * @return  {!number}        returns number of written bytes
 */
ManagedBuffer.prototype.set_bytesToEnd = function (value) {
    // input should be array of Uint8
    let byteCount = value.length;
    for (let i=0; i<byteCount; i++)
        this.set_u8.call(this, value[i]);
    return byteCount;
}
/**
 * writes 0 bits to residue and flushes it to buffer in bytes
 * 
 * @param   {!number}    bitCount    number of 0 bits to write
 * @return  {!number}                returns number of written bytes
 */
ManagedBuffer.prototype.set_reserved = function (bitCount=0) {
    for (let i=0; i<bitCount; i++)
        this.set_u1.call(this, 0);
}

module.exports = ManagedBuffer;