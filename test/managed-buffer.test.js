const expect = require('chai').expect;
const MgBuf = require('../src/managed-buffer');

const BUFFER_SIZE = 128 * 1024;     // LTK default

function get2Comp(bits, n) {
    let max = 2**bits;
    return (n > (max)/2 - 1)?n-max:n;
}

function getRandomU8 (n) {
    return Array(n).join(0).split(0).map(()=>Math.floor(Math.random() * 256));
}

function uInt8ToIntNArray(buf, readMethod, n) {
    let byteJump = n / 8;
    let result = [];
    for (let i=0; i < (buf.length); i += byteJump) {
        result.push(readMethod(i));
    }
    return result;
}

let uInt8ToUint16Array = (int8Array)=>{ let buf = Buffer.from(int8Array); return uInt8ToIntNArray(buf, buf.readUInt16BE.bind(buf), 16) };
let uInt8ToInt16Array = (int8Array)=>{ let buf = Buffer.from(int8Array); return uInt8ToIntNArray(buf, buf.readInt16BE.bind(buf), 16) };
let uInt8ToUint32Array = (int8Array)=>{ let buf = Buffer.from(int8Array); return uInt8ToIntNArray(buf, buf.readUInt32BE.bind(buf), 32) };
let uInt8ToInt32Array = (int8Array)=>{ let buf = Buffer.from(int8Array); return uInt8ToIntNArray(buf, buf.readInt32BE.bind(buf), 32) };
let uInt8ToUint64Array = (int8Array)=>{ let buf = Buffer.from(int8Array); return uInt8ToIntNArray(buf, buf.readBigUInt64BE.bind(buf), 64) };
let uInt8ToInt64Array = (int8Array)=>{ let buf = Buffer.from(int8Array); return uInt8ToIntNArray(buf, buf.readBigInt64BE.bind(buf), 64) };

let u1u2rsvd_value = 0b10101100;    // u1, u2, and reserved
let u8_value = 0xab;                // u8
let s8_value = -35;                 // s8
let u16_value = [0xd4, 0x31];       // u16
let s16_value = [0xcf, 0xc7];       // s16
let u32_value = [                   // u32
    0x49, 0x96,
    0x02, 0xd2
];              
let s32_value = [                   // s32
    0xc5, 0x21,
    0x97, 0x4f
];
let u64_value = [                   // u64
    0x11, 0x22,
    0x10, 0xf4,
    0x7d, 0xe9,
    0x81, 0x15
];
let s64_value = [                   // s64
    0xee, 0xdd,
    0xef, 0x0b,
    0x82, 0x16,
    0x7e, 0xeb
];
let u96_value = [                   // u96
    0x01, 0x23,
    0x45, 0x67,
    0x89, 0xab,
    0xcd, 0xef,
    0x01, 0x23,
    0x45, 0x67
];
let u1v_value = [                   // u1v
    0x00, 0x10,
    0x00, 0xff
];
let u8v_value = [
    0x00, 0x04,
    0x12, 0x34,
    0x56, 0x78
];
let s8v_value = [
    0x00, 0x04,
    -127, -2,
    -76, 38
];
let u16v_value = [
    0x00, 0x04,
    ...u16_value,
    ...u16_value,
    ...u16_value,
    ...u16_value
];
let s16v_value = [
    0x00, 0x04,
    ...s16_value,
    ...s16_value,
    ...s16_value,
    ...s16_value
];

let u32v_value = [
    0x00, 0x04,
    ...u32_value,
    ...u32_value,
    ...u32_value,
    ...u32_value
];

let s32v_value = [
    0x00, 0x04,
    ...s32_value,
    ...s32_value,
    ...s32_value,
    ...s32_value
];

let u64v_value = [
    0x00, 0x04,
    ...u64_value,
    ...u64_value,
    ...u64_value,
    ...u64_value
];

let s64v_value = [
    0x00, 0x04,
    ...s64_value,
    ...s64_value,
    ...s64_value,
    ...s64_value
]

let bytesToEnd_value = getRandomU8(Math.floor(Math.random()*256));  // up to 256 of random bytes

expect_u16 = Buffer.from(u16_value).readUInt16BE(0);
expect_s16 = Buffer.from(s16_value).readInt16BE(0);
expect_u32 = Buffer.from(u32_value).readUInt32BE(0);
expect_s32 = Buffer.from(s32_value).readInt32BE(0);
expect_u64 = Buffer.from(u64_value).readBigUInt64BE(0);
expect_s64 = Buffer.from(s64_value).readBigInt64BE(0);


describe('managed-buffer.js', ()=>{
    describe('getters', ()=>{

        describe('get_u1', ()=> {
            it('get_u1 should return 1 and 0', () => {
                let mBuf = new MgBuf(Buffer.from([u1u2rsvd_value]));
                expect(mBuf.get_u1()).to.equal(1);
                expect(mBuf.get_u1()).to.equal(0);
            })
        });

        describe('get_u2', ()=> {
            it('get_u2 should return 2 and 3', () => {
                let mBuf = new MgBuf(Buffer.from([u1u2rsvd_value]));
                expect(mBuf.get_u2()).to.equal(2);
                expect(mBuf.get_u2()).to.equal(2);
            });
        });

        describe('get_reserved', ()=> {

            it('get_reserved(14) should step over 14 bits', () => {
                let mBuf = new MgBuf(Buffer.from([u1u2rsvd_value, u1u2rsvd_value]));
                mBuf.get_reserved(14)
                expect(mBuf.idx.bit).to.equal(6)
                expect(mBuf.idx.byte).to.equal(1)
            })
        });

        describe('get_u8', () => {
            it(`should return ${u8v_value}`, () =>{
                let mBuf = new MgBuf(Buffer.from([u8_value]));
                expect(mBuf.get_u8()).to.equal(u8_value);
            })
        });

        describe('get_s8', () => {
            it(`should return ${s8_value}`, () => {
                let mBuf = new MgBuf(Buffer.from([s8_value]));
                expect(mBuf.get_s8()).to.equal(s8_value);
            });
        });

        describe('get_u16', () => {
            it(`should return ${expect_u16}`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...u16_value
                ]));
                expect(mBuf.get_u16()).to.equal(expect_u16);
            })
        });

        describe('get_s16', () => {
            it(`should return ${expect_s16}`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...s16_value
                ]));
                expect(mBuf.get_s16()).to.equal(expect_s16);
            })
        });

        describe('get_u32', () => {
            it(`should return ${expect_u32}`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...u32_value
                ]));
                expect(mBuf.get_u32()).to.equal(expect_u32);
            })
        });

        describe('get_s32', () => {
            it(`should return ${expect_s32}`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...s32_value
                ]));
                expect(mBuf.get_s32()).to.equal(expect_s32);
            })
        });

        describe('get_u64', () => {
            it(`should return ${expect_u64}`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...u64_value
                ]));
                expect(mBuf.get_u64()).to.equal(expect_u64);
            })
        });

        describe('get_s64', () => {
            it(`should return ${expect_s64}`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...s64_value
                ]));
                expect(mBuf.get_s64()).to.equal(expect_s64);
            })
        });

        describe('get_u96', () => {
            it(`should return ${u96_value}`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...u96_value
                ]));
                expect(mBuf.get_u96()).to.be.an('array').that.deep.equals(u96_value);
            })
        });

        describe('get_u1v', () => {
            it(`get_u1v should return bin array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...u1v_value
                ]));
                expect(mBuf.get_u1v()).to.be.an('array').that.deep.equals([
                    0x00,
                    0xff
                ]);

            });
        });

        describe('get_u8v', () => {
            it(`get_u8v should return byte array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...u8v_value
                ]));
                expect(mBuf.get_u8v()).to.be.an('array').that.deep.equals(u8v_value.slice(2));
            });
        });

        describe('get_s8v', () => {
            it(`get_s8v should return signed byte array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...s8v_value
                ]));
                expect(mBuf.get_s8v()).to.be.an('array').that.deep.equals(s8v_value.slice(2));
            });
        });

        describe('get_u16v', () => {
            it(`should return short array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...u16v_value
                ]));
                expect(mBuf.get_u16v()).to.be.an('array').that
                    .deep.equals(uInt8ToUint16Array(u16v_value.slice(2)));
            });
        });

        describe('get_s16v', () => {
            it(`should return signed short array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...s16v_value
                ]));
                expect(mBuf.get_s16v()).to.be.an('array').that
                    .deep.equals(uInt8ToInt16Array(s16v_value.slice(2)));
            });
        });

        describe('get_u32v', () => {
            it(`should return integer array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...u32v_value
                ]));
                expect(mBuf.get_u32v()).to.be.an('array').that
                    .deep.equals(uInt8ToUint32Array(u32v_value.slice(2)));
            });
        });

        describe('get_s32v', () => {
            it(`should return signed integer array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...s32v_value
                ]));
                expect(mBuf.get_s32v()).to.be.an('array').that
                    .deep.equals(uInt8ToInt32Array(s32v_value.slice(2)));
            });
        });

        describe('get_u64v', () => {
            it(`get_u64v should return BigInt array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...u64v_value
                ]));
                expect(mBuf.get_u64v()).to.be.an('array').that
                    .deep.equals(uInt8ToUint64Array(u64v_value.slice(2)));
            });
        });

        describe('get_s64v', () => {
            it(`should return signed BigInt array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...s64v_value
                ]));
                expect(mBuf.get_s64v()).to.be.an('array').that
                    .deep.equals(uInt8ToInt64Array(s64v_value.slice(2)));
            });
        });

        describe('get_bytesToEnd', () => {
            it(`should return all bytes in the buffer as byte array`, () => {
                let mBuf = new MgBuf(Buffer.from([
                    ...bytesToEnd_value
                ]));
                expect(mBuf.get_bytesToEnd()).to.be.an('array').that
                    .deep.equals(bytesToEnd_value);
            })
        });

        describe('any', () => {
            it('should throw error for reading beyond limits', ()=>{
                let mBuf = new MgBuf(Buffer.from([]));
                //TODO: specifiy Error
                expect(()=>{mBuf.get_reserved(1)}).to.throw();
            });
        });
    });

    describe('setters', ()=>{
        describe('set_u1', ()=>{

            it(`should write 1 to residue`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u1(1);
                expect(mBuf.bitResidue).to.equal(0x80);
            });

            it(`should write 0b101 to residue`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u1(1);
                mBuf.set_u1(0);
                mBuf.set_u1(1);
                expect(mBuf.bitResidue).to.equal(0xa0);
            });
        });

        describe('set_u2', ()=>{
            it(`should write 0b10 to residue`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u2(0b10);
                expect(mBuf.bitResidue).to.equal(0b10000000);
            });

            it(`should write 0b1011 to residue`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u2(0b10);
                mBuf.set_u2(0b11);
                expect(mBuf.bitResidue).to.equal(0b10110000);
            });

        });

        describe('set_reserved', ()=>{
            it(`should write 00`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.bitResidue = 0xff;
                mBuf.set_reserved(2);
                expect(mBuf.bitResidue).to.equal(0x3f);
            });
        });

        describe('flushing residue', ()=>{
            it(`should flush residue to buffer`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_reserved(7);
                mBuf.set_u1(1);
                expect(mBuf.buffer[0]).to.equal(1);
            });
        });

        describe('set_u8', ()=>{
            it(`should write ${u8_value}`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u8(u8_value);
                expect(mBuf.buffer[0]).to.equal(u8_value);
            });
        });

        describe('set_s8', ()=>{
            it(`should write ${s8_value}`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_s8(s8_value);
                expect(mBuf.buffer.readInt8(0)).to.equal(s8_value);
            });
        });

        describe('set_u16', ()=>{
            it(`should write ${expect_u16}`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u16(expect_u16);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(expect_u16);
            });
        });

        describe('set_u16', ()=>{
            it(`should write ${expect_s16}`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_s16(expect_s16);
                expect(mBuf.buffer.readInt16BE(0)).to.equal(expect_s16);
            });
        });

        describe('set_u32', ()=>{
            it(`should write ${expect_u32}`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u32(expect_u32);
                expect(mBuf.buffer.readUInt32BE(0)).to.equal(expect_u32);
            });
        });

        describe('set_s32', ()=>{
            it(`should write ${expect_s32}`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_s32(expect_s32);
                expect(mBuf.buffer.readInt32BE(0)).to.equal(expect_s32);
            });
        });

        describe('set_u64', ()=>{
            it(`should write ${expect_u64}`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u64(expect_u64);
                expect(mBuf.buffer.readBigUInt64BE(0)).to.equal(expect_u64);
            });
        });

        describe('set_s64', ()=>{
            it(`should write ${expect_s64}`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_s64(expect_s64);
                expect(mBuf.buffer.readBigInt64BE(0)).to.equal(expect_s64);
            });
        });

        describe('set_u96', ()=>{
            it(`should write ${u96_value}`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u96(u96_value);
                expect([...mBuf.buffer.slice(0,12)]).to.deep.equal(u96_value);
            });
        });

        describe('set_u1v', ()=>{
            it(`should write 16 bits`, ()=>{
                let value = [
                    0x00,
                    0xff
                ];
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                mBuf.set_u1v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(16);
                expect(mBuf.buffer.readUInt16BE(2)).to.equal(255);
            })
        });

        describe('set_u8v', ()=>{
            it(`should write 4 bytes`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = [1,2,3,4];
                let length = value.length;
                mBuf.set_u8v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(length);
                expect([...mBuf.buffer.slice(2,2 + length)]).to.deep.equals(value);
            })
        });

        describe('set_s8v', ()=>{
            it(`should write 4 signed bytes`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = [-17, -35, 15, -127];
                let length = value.length;
                mBuf.set_s8v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(length);
                expect([...mBuf.buffer.slice(2,2 + length)].map(get2Comp.bind(0,8))).to.deep.equals(value);
            })
        });

        describe('set_utf8v', ()=>{
            it(`should write "llrp.js test"`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = "llrp.js test";
                let length = value.length;
                mBuf.set_utf8v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(length);
                expect(mBuf.buffer.slice(2,2 + length).toString('utf8')).to.equal(value);
            })
        });


        describe('set_u16v', ()=>{
            it(`should write 4 short integers`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = [12345, 54321, 13579, 24681];
                let length = value.length;
                mBuf.set_u16v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(length);
                expect(uInt8ToUint16Array([...mBuf.buffer.slice(2, 2 + length*2)])).to.deep.equals(value);
            })
        });

        describe('set_s16v', ()=>{
            it(`should write 4 signed short integers`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = [-12345, 4321, -13579, -24681];
                let length = value.length
                mBuf.set_s16v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(length);
                expect(uInt8ToInt16Array([...mBuf.buffer.slice(2, 2 + length*2)])).to.deep.equals(value);
            })
        });

        describe('set_u32v', ()=>{
            it(`should write 4 integers`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = [0xabcdef12, 0xabcdef12, 0xabcdef12, 0xabcdef12];
                let length = value.length
                mBuf.set_u32v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(length);
                expect(uInt8ToUint32Array([...mBuf.buffer.slice(2, 2 + length*4)])).to.deep.equals(value);
            })
        });

        describe('set_s32v', ()=>{
            it(`should write 4 signed integers`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = [-123456789, -987654321, 123456789, 987654321];
                let length = value.length
                mBuf.set_s32v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(length);
                expect(uInt8ToInt32Array([...mBuf.buffer.slice(2, 2 + length*4)])).to.deep.equals(value);
            })
        });

        describe('set_u64v', ()=>{
            it(`should write 4 BigInts`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = [
                    1234567890123456789n,
                    1234567890123456789n,
                    1234567890123456789n,
                    1234567890123456789n
                ];
                let length = value.length
                mBuf.set_u64v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(length);
                expect(uInt8ToUint64Array([...mBuf.buffer.slice(2, 2 + length*8)])).to.deep.equals(value);
            })
        });

        describe('set_s64v', ()=>{
            it(`should write 4 signed BigInts`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = [
                    -1234567890123456789n,
                    1234567890123456789n,
                    -1234567890123456789n,
                    1234567890123456789n
                ];
                let length = value.length
                mBuf.set_s64v(value);
                expect(mBuf.buffer.readUInt16BE(0)).to.equal(length);
                expect(uInt8ToInt64Array([...mBuf.buffer.slice(2, 2 + length*8)])).to.deep.equals(value);
            })
        });

        describe('set_bytesToEnd', ()=>{
            it(`should write bytes`, ()=>{
                let mBuf = new MgBuf(Buffer.alloc(BUFFER_SIZE));
                let value = getRandomU8(256);

                mBuf.set_bytesToEnd(value);
                expect([...mBuf.buffer.slice(0, 256)]).to.deep.equals(value);
            })
        });

        describe('any', ()=>{
            it(`should throw error for writing beyond limits`, ()=>{
                let mBuf = new MgBuf(Buffer.from([]));
                expect(()=>{mBuf.set_reserved(1);}).to.throw();
            });
        });

    });

});

