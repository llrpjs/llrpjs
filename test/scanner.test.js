const expect = require('chai').expect;
const Scanner = require('../src/scanner');

const READER_EVENT_NOTIFICATION_BUF='04 3f 00 00 00 20 00 00 00 00 00 f6 00 16 00 80 00 0c 00 04 2b 19 23 a0 1b da 01 00 00 06 00 00'
const ADD_ROSPEC_BUF='04 14 00 00 00 c6 00 00 00 67 00 b1 00 bc 00 00 00 01 00 00 00 b2 00 1d 00 b3 00 10 03 00 b5 00 0b 00 01 80 00 00 00 00 00 b6 00 09 00 00 00 00 00 00 b7 00 2b 00 01 00 02 00 b8 00 09 01 00 00 ea 60 00 ba 00 1a 00 01 01 00 de 00 13 00 00 01 4a 00 0d 00 01 4f 00 08 00 00 00 00 00 b7 00 2b 00 01 00 03 00 b8 00 09 01 00 00 ea 60 00 ba 00 1a 00 01 01 00 de 00 13 00 00 01 4a 00 0d 00 01 4f 00 08 00 00 00 00 00 b7 00 2d 00 02 00 02 00 03 00 b8 00 09 01 00 00 ea 60 00 ba 00 1a 00 01 01 00 de 00 13 00 00 01 4a 00 0d 00 01 4f 00 08 00 00 00 00 00 ed 00 12 01 00 00 00 ee 00 0b ff c0 01 5c 00 05 c0'
const BAD_VERSION='08 3f 00 00 00 20 00 00 00 00 00 f6 00 16 00 80 00 0c 00 04 2b 19 23 a0 1b da 01 00 00 06 00 00'
const LENGTH_TOO_SMALL='04 3f 00 00 00 09 00 00 00 00 00 f6 00 16 00 80 00 0c 00 04 2b 19 23 a0 1b da 01 00 00 06 00 00'


describe(`scanner.js`, ()=>{
    describe(`hasNext`, ()=>{
        it(`should return false`, ()=>{
            let s = new Scanner();
            expect(s.hasNext()).to.equal(false);
            s.add(Buffer.from('short buf'));
            expect(s.hasNext()).to.equal(false);
        });

        it(`should return true`, ()=>{
            let s = new Scanner();
            s.add(Buffer.from('long enough buffer'));
            expect(s.hasNext()).to.equal(true);
        });
    });

    describe(`nextMsg`, ()=>{
        it(`should return full message buffer`, ()=>{
            let s = new Scanner();
            let buf = Buffer.from(READER_EVENT_NOTIFICATION_BUF.replace(/ /g, ''), 'hex');
            s.add(buf);
            let result = s.nextMsg();
            expect(result).to.deep.equal(buf);
        });

        it(`should return nothing`, ()=>{
            let s = new Scanner();
            let buf = Buffer.from(READER_EVENT_NOTIFICATION_BUF.replace(/ /g, ''), 'hex');
            s.add(buf.slice(0, buf.length - 2));
            let result = s.nextMsg();
            expect(result).to.equal(undefined);
        });

        describe(`add on two stages`, ()=>{
            it(`should return full message buffer`, ()=>{
                let s = new Scanner();
                let buf = Buffer.from(READER_EVENT_NOTIFICATION_BUF.replace(/ /g, ''), 'hex');
                s.add(buf.slice(0, buf.length - 10));
                let result = s.nextMsg();
                expect(result).to.equal(undefined);

                s.add(buf.slice(buf.length - 10));
                result = s.nextMsg();
                expect(result).to.deep.equal(buf);
            });
        });

        describe(`add on 3 stages with 2 consecutive messages`, ()=>{
            it(`should return two msg buffers`, ()=>{
                let buf1 = Buffer.from(READER_EVENT_NOTIFICATION_BUF.replace(/ /g, ''), 'hex');
                let buf2 = Buffer.from(ADD_ROSPEC_BUF.replace(/ /g, ''), 'hex');

                let msg = READER_EVENT_NOTIFICATION_BUF + ADD_ROSPEC_BUF;
                let buf = Buffer.from(msg.replace(/ /g, ''), 'hex');    // emulating network buffers

                let s = new Scanner();
                s.add(buf.slice(0, 16));       // add first 16 bytes
                let res1 = s.nextMsg();
                s.add(buf.slice(16, 48));       // next 32 bytes covers the first message and part of the next
                let res2 = s.nextMsg();            
                s.add(buf.slice(48));           // add the rest of the bytes
                let res3 = s.nextMsg();

                expect(res1).to.equal(undefined) &&
                expect(res2).to.deep.equal(buf1) &&
                expect(res3).to.deep.equal(buf2);

            });
        });

        describe(`errors`, ()=>{
            it(`should throw error on bad version`, ()=>{
                let s = new Scanner();
                s.add(Buffer.from(BAD_VERSION.replace(/ /g, ''), 'hex'));
                expect(s.nextMsg.bind(s)).to.throw(`bad header - unsupported version 2`);
            });

            it(`should throw message length too small`, ()=>{
                let s = new Scanner();
                s.add(Buffer.from(LENGTH_TOO_SMALL.replace(/ /g, ''), 'hex'));
                expect(s.nextMsg.bind(s)).to.throw(`bad header - message length too small 9`);
            });
        });

    });

})