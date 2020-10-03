const expect = require('chai').expect;
const Decoder = require('../src/decoder');
const MgBuf = require('../src/managed-buffer');
const {groupBy} = require('../src/tools');
const llrpdef = require('../generated/llrpjs.def.json');
const paramDefByName = groupBy(llrpdef.parameterDefinitions, "name");


describe(`decoder.js`, ()=>{
    describe(`addBuffer`, ()=>{
        it(`should add buffer`, ()=>{
            let testBuf = Buffer.from(`test buffer`);

            let d = new Decoder(llrpdef);
            d.addBuffer(testBuf);

            expect(d.mBuf.buffer).to.deep.equal(testBuf);
        });
    });

    describe(`flushBuffer`, ()=>{
        it(`should flush buffer`, ()=>{
            let d = new Decoder(llrpdef);
            d.addBuffer(Buffer.from('whatever'));
            d.flushBuffer();

            expect(d.mBuf.buffer).to.deep.equal(Buffer.alloc(0));   // empty buffer
        })
    })

    describe(`field`, ()=>{
        describe(`simple field`, ()=>{
            it(`should return field object`, ()=>{
                let d = new Decoder(llrpdef);
                d.addBuffer(Buffer.from(`01234567`, 'hex'));

                // test ROSpecID
                let fieldDef = paramDefByName.ROSpec.body[0];
                expect(d.field(fieldDef)).to.deep.equal({ ROSpecID: 0x01234567 });
            });
        });

        describe(`formatted field`, ()=>{
            it(`should return hex string`, ()=>{
                let d = new Decoder(llrpdef);
                d.addBuffer(Buffer.from(`00080123456789ABCDEF`, `hex`));    //2-byte length + payload bytes

                // test ReaderID
                let fieldDef = paramDefByName.Identification.body[1];
                expect(d.field(fieldDef)).to.deep.equal({ ReaderID: "0123456789ABCDEF" });
            });

            it(`should return datetime string`, ()=>{
                let d = new Decoder(llrpdef);
                d.addBuffer(Buffer.from(`0005aea90e1c6040`, 'hex'));        // Microseconds (field) from UTCTimestamp (parameter)

                let fieldDef = paramDefByName.UTCTimestamp.body[0];
                expect(d.field(fieldDef)).to.deep.equal({
                    Microseconds: new Date("2020-09-06T18:13:13.000Z")
                });
            });
        })
    });

    describe(`enumeration`, ()=>{
        it(`should return enum`, ()=>{
            let d = new Decoder(llrpdef);
            d.addBuffer(Buffer.from(`02`, 'hex'));  //(Active state)

            // test CurrentState
            let fieldDef = paramDefByName.ROSpec.body[2];
            expect(d.field(fieldDef)).to.deep.equal({ CurrentState: "Active" });
        });
    });

    describe(`parameter`, ()=>{
        describe(`TV`, ()=>{
            it(`should return simple parameter`, ()=>{
                let d = new Decoder(llrpdef);
                // [1] [0001000] [1010 1011 1100 1101]
                d.addBuffer(Buffer.from(`88abcd`, `hex`));        // random example (TagSeenCount)

                let paramDefRef = paramDefByName.TagReportData.body[11];
                expect(d.parameter(paramDefRef)).to.deep.equal({
                    TagSeenCount: {
                        TagCount: 0xabcd
                    }
                });
            });
        });

        describe(`TLV`, ()=>{
            it(`should return simple parameter`, ()=>{
                let d = new Decoder(llrpdef);
                d.addBuffer(Buffer.from(`01010004`, 'hex'));        // Simplest TLV parameter: ConnectionCloseEvent

                let paramDefRef = paramDefByName.ReaderEventNotificationData.body[11];
                expect(d.parameter(paramDefRef)).to.deep.equal({ ConnectionCloseEvent: {} });
            });
        });

        describe(`parameter wrapping a field`, ()=>{
            it(`should return wrapped field`, ()=>{
                let d = new Decoder(llrpdef, {wrapperParam: true});
                d.addBuffer(Buffer.from(`91abcd`, 'hex'));        // wrapped parameter

                let paramDefRef = paramDefByName.ReaderExceptionEvent.body[6];
                expect(d.parameter(paramDefRef)).to.deep.equal({
                    OpSpecID: {
                        OpSpecID: 0xabcd
                    }
                });
            });

            it(`should return unwrapped field`, ()=>{
                let d = new Decoder(llrpdef, {wrapperParam: false});
                d.addBuffer(Buffer.from(`91abcd`, 'hex'));        // wrapped parameter

                let paramDefRef = paramDefByName.ReaderExceptionEvent.body[6];
                expect(d.parameter(paramDefRef)).to.deep.equal({ OpSpecID: 0xabcd });
            });
        });
    });

    describe(`choice`, ()=>{
        it(`should return parameter`, ()=>{
            let d = new Decoder(llrpdef);
            d.addBuffer(Buffer.from(`0081000c1234567890abcdef`, 'hex'));

            let choiceDefRef = paramDefByName.FrequencyRSSILevelEntry.body[4];
            expect(d.choice(choiceDefRef)).to.deep.equal({
                Uptime: {
                    Microseconds: 0x1234567890abcdefn
                }
            });
        });
    });

    describe(`message`, ()=>{
        it(`should return KEEPALIVE message`, ()=>{
            let buf = Buffer.from(`043e0000000a0000abcd`, 'hex');
            let d = new Decoder(llrpdef);

            d.addBuffer(buf);

            expect(d.message()).to.deep.equal({
                MessageID: 0xabcd,
                MessageType: "KEEPALIVE",
                MessageBody: {}
            });
        });
    });
})