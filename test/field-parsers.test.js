const expect = require('chai').expect;
const p = require('../src/field-parsers');

describe(`field-parsers.js`, ()=>{
    describe(`u1v`, ()=>{
        describe(`Hex`, ()=>{
            it(`should return bit array`, ()=>{
                let target = [0xa5];
                let hexString = "a5";
                expect(p.u1v(hexString, "Hex")).to.deep.equal(target);
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return the input`, ()=>{
                let string = "whatever";
                expect(p.u1v(string, "unknown format")).to.deep.equal(string);
            });
        });
    });

    describe(`utf8v`, ()=>{
        it(`should return UTF8 string`, ()=>{
            expect(p.utf8v("LLRPJS")).to.equal("LLRPJS");
        });
    });

    describe(`u8v`, ()=>{
        describe(`Hex`, ()=>{
            it(`should return hexstring`, ()=>{
                let target = [0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef];
                let hexString = "0123456789abcdef";

                expect(p.u8v(hexString, "Hex")).to.deep.equal(target);
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return the input`, ()=>{
                let string = "whatever";

                expect(p.u16v(string, "unknown format")).to.deep.equal(string);
            });
        });
    });

    describe(`u16v`, ()=>{
        describe('Hex', ()=>{
            it(`should return hexstring`, ()=>{
                let target = [0x0123, 0x4567, 0x89ab, 0xcdef];
                let hexString = "0123456789abcdef";

                expect(p.u16v(hexString, "Hex")).to.deep.equal(target);
            });
        });

        describe('unknown format', ()=>{
            it(`should return the input`, ()=>{
                let string = "whatever";

                expect(p.u16v(string, "unknown format")).to.deep.equal(string);
            });
        });
    });

    describe(`u64`, ()=>{
        describe('Datetime', ()=>{
            it(`should return Date object`, ()=>{
                let datetimeString = "2020-09-06T18:13:13.000Z";
                let datetime = new Date(datetimeString);

                expect(p.u64(datetimeString, "Datetime")).to.equal(0x0005aea90e1c6040n);
                expect(p.u64(datetime, "Datetime")).to.equal(0x0005aea90e1c6040n);
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return input`, ()=>{
                let obj = {};

                expect(p.u64(obj, "unknown format")).to.deep.equal(obj);
            });
        });
    });

    describe(`u96`, ()=>{
        describe(`Hex`, ()=>{
            it(`should return hexstring`, ()=>{
                let target = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
                let hexString = "000102030405060708090a0b";

                expect(p.u96(hexString, "Hex")).to.deep.equal(target);
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return input`, ()=>{
                let string = "whatever";
                expect(p.u96(string, "unknown format")).to.equal(string);
            });
        });
    });

    describe(`bytesToEnd`, ()=>{
        describe(`Hex`, ()=>{
            it(`should return hexstring`, ()=>{
                let target = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
                let hexString = "000102030405060708090a0b0c0d0e0f";

                expect(p.bytesToEnd(hexString, "Hex")).to.deep.equal(target);
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return input`, ()=>{
                let string = "whatever"
                expect(p.bytesToEnd("whatever", "unknown format")).to.equal(string);
            });
        });
    });

    describe(`nop`, ()=>{
        it(`should return input`, ()=>{
            let obj = {};
            expect(p.nop(obj, "whatever")).to.deep.equal(obj);
        });
    });
});