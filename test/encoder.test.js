const expect = require('chai').expect;
const Encoder = require('../src/encoder');
const {groupBy} = require('../src/tools');
const llrpdef = require('../generated/llrpjs.def.json');
const Decoder = require('../src/decoder');
const paramDefByName = groupBy(llrpdef.parameterDefinitions, "name");

describe(`encoder.js`, ()=>{
    describe(`field`, ()=>{
        describe(`simple`, ()=>{
            it(`should encode integer into buffer`, ()=>{
                let e = new Encoder(llrpdef);
                let def = paramDefByName["ROSpec"].body[0];

                expect(e.field({ ROSpecID: 0x01234567 }, def))
                    .to.deep.equal(Buffer.from('01234567', 'hex'));
            });
        });

        describe(`formatted`, ()=>{
            it(`should encode string into buffer`, ()=>{
                let e = new Encoder(llrpdef);
                let def = paramDefByName["ReaderExceptionEvent"].body[0];

                expect(e.field( { "Message" : "Node.js rocks!" }, def))
                    .to.deep.equal(Buffer.from(`000e4e6f64652e6a7320726f636b7321`, 'hex'));   // 2-bytes length + payload
            });

            it(`should encode hex string into buffer`, ()=>{
                let e = new Encoder(llrpdef);
                let def = paramDefByName["Identification"].body[1];

                expect(e.field({ ReaderID: "0123456789ABCDEF" }, def))
                    .to.deep.equal(Buffer.from(`00080123456789ABCDEF`, `hex`)); // 2-bytes length + payload
            });

            it(`should encode Datetime into buffer`, ()=>{
                let e = new Encoder(llrpdef);
                let def = paramDefByName["UTCTimestamp"].body[0]; // timestamp

                expect(e.field({
                    Microseconds: new Date("2020-09-06T18:13:13.000Z")
                }, def)).to.deep.equal(Buffer.from(`0005aea90e1c6040`, 'hex'));
            });
        });

        describe(`enum`, ()=>{
            it(`should encode buffer`, ()=>{
                let e = new Encoder(llrpdef);
                let def = paramDefByName["ROSpec"].body[2];         // CurrentState field

                expect(e.field({ CurrentState: "Active"}, def))
                    .to.deep.equal(Buffer.from('02', 'hex'));
            });
        });

        describe(`errors`, ()=>{
            //TODO: write these after you finish up error codes
        });
    });

    describe(`parameter`, ()=>{
        describe(`TV`, ()=>{
            it(`should return TV param encoded buffer`, ()=>{
                let e = Encoder(llrpdef);
                let defRef = paramDefByName["TagReportData"].body[11];     // TagSeenCount

                expect(e.parameter({
                        TagSeenCount: {
                            TagCount: 0xabcd
                        }
                    }, defRef)).to.deep.equal(Buffer.from(`88abcd`, `hex`));   // [1] [0001000] [1010 1011 1100 1101]
            });
        });

        describe(`TLV`, ()=>{
            it(`should return TLV param encoded buffer`, ()=>{
                let e = Encoder(llrpdef);
                let defRef = paramDefByName["ReaderEventNotificationData"].body[11];

                expect(e.parameter({ ConnectionCloseEvent : {} }, defRef))
                    .to.deep.equal(Buffer.from(`01010004`, 'hex'));        // Simplest TLV parameter: ConnectionCloseEvent
            });
        });

        describe(`wrapper`, ()=>{
            describe(`wrapped field`, ()=>{
                it(`should return TV encoded buffer`, ()=>{
                    let e = Encoder(llrpdef);
                    let defRef = paramDefByName.ReaderExceptionEvent.body[6];

                    expect(e.parameter({
                        OpSpecID: {
                            OpSpecID: 0xabcd
                        }
                    }, defRef)).to.deep.equal(Buffer.from(`91abcd`, 'hex'));
                });
            });

            describe(`unwrapped field`, ()=>{
                it(`should return TV encoded buffer`, ()=>{
                    let e = Encoder(llrpdef);
                    let defRef = paramDefByName.ReaderExceptionEvent.body[6];
                    
                    expect(e.parameter({ OpSpecID: 0xabcd }, defRef))
                        .to.deep.equal(Buffer.from(`91abcd`, 'hex'));
                });
            });
        });
    });

    describe(`choice`, ()=>{
        it(`should return encoded parameter buffer`, ()=>{
            let e = new Encoder(llrpdef);
            let defRef = paramDefByName.FrequencyRSSILevelEntry.body[4];

            expect(e.choice({
                Uptime: {
                    Microseconds: 0x1234567890abcdefn
                }
            }, defRef)).to.deep.equal(Buffer.from(`0081000c1234567890abcdef`, 'hex'));

        });
    });

    describe(`message`, ()=>{
        it(`should return encoded message buffer`, ()=>{
            let e = new Encoder(llrpdef);
            expect(e.message({
                MessageID: 0xabcd,
                MessageType: "KEEPALIVE",
                MessageBody: {}
            })).to.deep.equal(Buffer.from(`043e0000000a0000abcd`, 'hex'));
        });
    });
});