const expect = require('chai').expect;
const f = require('../src/field-formatters');

describe('field-formatters.js', ()=>{
    describe(`u1v`, ()=>{
        describe(`Hex`, ()=>{
            it(`should return hexstring`, ()=>{
                let arr = [0xa5];
                let target = "a5";
                expect(f.u1v(arr, "Hex")).to.satisfy(input=> input == target || input == target.toUpperCase());
            });

            it(`should return right-padded hexstring`, ()=>{
                let arr = [0x04];
                let target = "04";
                expect(f.u1v(arr, "Hex")).to.satisfy(input=> input == target || input == target.toUpperCase());
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return the input`, ()=>{
                let arr = [1, 0, 1, 0, 0, 1, 0, 1];

                expect(f.u1v(arr, "unknown format")).to.deep.equal(arr);
            });
        });
    });

    describe(`utf8v`, ()=>{
        it(`should return UTF8 string`, ()=>{
            expect(f.utf8v(Buffer.from("LLRPJS"))).to.equal("LLRPJS");
        });
    });

    describe(`u8v`, ()=>{
        describe(`Hex`, ()=>{
            it(`should return hexstring`, ()=>{
                let arr = [0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef];
                let target = "0123456789abcdef";

                expect(f.u8v(arr, "Hex")).to.satisfy(input=> input == target || input == target.toUpperCase());
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return the input`, ()=>{
                let arr = [0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef];

                expect(f.u16v(arr, "unknown format")).to.deep.equal(arr);
            });
        });
    });

    describe(`u16v`, ()=>{
        describe('Hex', ()=>{
            it(`should return hexstring`, ()=>{
                let arr = [0x0123, 0x4567, 0x89ab, 0xcdef];
                let target = "0123456789abcdef";

                expect(f.u16v(arr, "Hex")).to.satisfy(input=> input == target || input == target.toUpperCase());
            });
        });

        describe('unknown format', ()=>{
            it(`should return the input`, ()=>{
                let arr = [0x0123, 0x4567, 0x89ab, 0xcdef];

                expect(f.u16v(arr, "unknown format")).to.deep.equal(arr);
            });
        });
    });

    describe(`u64`, ()=>{
        describe('Datetime', ()=>{
            it(`should return Date object`, ()=>{
                let microseconds = 0x0005aea90e1c6040n;

                expect(f.u64(microseconds, "Datetime")).to.deep.equal(new Date("2020-09-06T18:13:13.000Z"));
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return input`, ()=>{
                let microseconds = 0x0005aea90e1c6040n;

                expect(f.u64(microseconds, "unknown format")).to.equal(microseconds);
            });
        });
    });

    describe(`u96`, ()=>{
        describe(`Hex`, ()=>{
            it(`should return hexstring`, ()=>{
                let arr = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];         // it's not the formatter's job to guarantee input length
                let target = "000102030405060708090a0b";

                expect(f.u96(arr, "Hex")).to.satisfy(input=> input == target || input == target.toUpperCase());
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return input`, ()=>{
                let arr = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];
                expect(f.u96(arr, "unknown format")).to.deep.equal(arr);
            });
        });
    });

    describe(`bytesToEnd`, ()=>{
        describe(`Hex`, ()=>{
            it(`should return hexstring`, ()=>{
                let arr = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];
                let target = "000102030405060708090a0b0c0d0e0f";

                expect(f.bytesToEnd(arr, "Hex")).to.satisfy(input=> input == target || input == target.toUpperCase());
            });
        });

        describe(`unknown format`, ()=>{
            it(`should return input`, ()=>{
                let arr = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
                expect(f.bytesToEnd(arr, "unknown format")).to.deep.equal(arr);
            });
        });
    });

    describe(`nop`, ()=>{
        it(`should return input`, ()=>{
            let arr = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
            expect(f.nop(arr, "whatever")).to.deep.equal(arr);
        });
    });
});