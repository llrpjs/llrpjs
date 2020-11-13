const expect = require('chai').expect;
const Decoder = require('../src/decoder');
const MgBuf = require('../src/managed-buffer');
const {groupBy} = require('../src/tools');
const llrpdef = require('../definitions/core/llrp-1x0-def.json');
const msgDefByName = groupBy(llrpdef.messageDefinitions, "name");
const paramDefByName = groupBy(llrpdef.parameterDefinitions, "name");


describe(`decoder.js`, ()=>{
    describe(`addBuffer`, ()=>{
        it(`should add buffer`, ()=>{
            let testBuf = Buffer.from(`test buffer`);

            let d = new Decoder();
            d.addBuffer(testBuf);

            expect(d.mBuf.buffer).to.deep.equal(testBuf);
        });
    });

    describe(`flushBuffer`, ()=>{
        it(`should flush buffer`, ()=>{
            let d = new Decoder();
            d.addBuffer(Buffer.from('whatever'));
            d.flushBuffer();

            expect(d.mBuf.buffer).to.deep.equal(Buffer.alloc(0));   // empty buffer
        })
    })

    describe(`field`, ()=>{
        describe(`simple field`, ()=>{
            it(`should return field object`, ()=>{
                let d = new Decoder();
                d.addBuffer(Buffer.from(`01234567`, 'hex'));

                // test ROSpecID
                let fieldDef = paramDefByName.ROSpec.body[0];
                expect(d.field(fieldDef)).to.deep.equal({ ROSpecID: 0x01234567 });
            });
        });

        describe(`BigInt`, ()=>{
            it(`should return BigInt`, ()=>{
                let d = new Decoder();
                d.addBuffer(Buffer.from(`112210f47de98115`, 'hex'));

                let fieldDef = paramDefByName.Uptime.body[0];
                expect(d.field(fieldDef)).to.deep.equal({ Microseconds: 1234567890123456789n });
            });
        });

        describe(`formatted field`, ()=>{
            it(`should return hex string`, ()=>{
                let d = new Decoder();
                d.addBuffer(Buffer.from(`00080123456789ABCDEF`, `hex`));    //2-byte length + payload bytes

                // test ReaderID
                let fieldDef = paramDefByName.Identification.body[1];
                expect(d.field(fieldDef)).to.deep.equal({ ReaderID: "0123456789ABCDEF" });
            });

            it(`should return datetime string`, ()=>{
                let d = new Decoder();
                d.addBuffer(Buffer.from(`0005aea90e1c6040`, 'hex'));        // Microseconds (field) from UTCTimestamp (parameter)

                let fieldDef = paramDefByName.UTCTimestamp.body[0];
                expect(d.field(fieldDef)).to.deep.equal({
                    Microseconds: new Date("2020-09-06T18:13:13.000Z")
                });
            });
        })

        describe(`bytesToEnd`, ()=>{
            it(`should return a hexstring`, ()=>{
                let d = new Decoder();
                d.addBuffer(Buffer.from(`08127583F85EAFE0815883A8A8`, `hex`));

                let fieldDef = paramDefByName.Custom.body[2];
                expect(d.field(fieldDef, 13)).to.deep.equal({
                    "Data": "08127583F85EAFE0815883A8A8"
                });
            });
        });
    });

    describe(`enumeration`, ()=>{
        describe(`simple enum`, ()=>{
            it(`should return enum`, ()=>{
                let d = new Decoder();
                d.addBuffer(Buffer.from(`02`, 'hex'));  //(Active state)

                // test CurrentState
                let fieldDef = paramDefByName.ROSpec.body[2];
                expect(d.field(fieldDef)).to.deep.equal({ CurrentState: "Active" });
            });
        });

        describe(`vector enum`, ()=>{
            it(`should return array of enum`, ()=>{
                let d = new Decoder();
                d.addBuffer(Buffer.from(`00020001`, `hex`));
                let fieldDef = paramDefByName.PerAntennaAirProtocol.body[1];

                expect(d.field(fieldDef)).to.deep.equal({
                    "ProtocolID": [ "Unspecified", "EPCGlobalClass1Gen2" ]
                });
            });
        });
    });

    describe(`parameter`, ()=>{
        describe(`TV`, ()=>{
            it(`should return simple parameter`, ()=>{
                let d = new Decoder();
                // [1] [0001000] [1010 1011 1100 1101]
                d.addBuffer(Buffer.from(`88abcd`, `hex`));        // random example (TagSeenCount)

                expect(d.parameter().body).to.deep.equal({
                    TagSeenCount: {
                        TagCount: 0xabcd
                    }
                });
            });
        });

        describe(`TLV`, ()=>{
            it(`should return simple parameter`, ()=>{
                let d = new Decoder();
                d.addBuffer(Buffer.from(`01010004`, 'hex'));        // Simplest TLV parameter: ConnectionCloseEvent

                expect(d.parameter().body).to.deep.equal({ ConnectionCloseEvent: {} });
            });

            it(`should return nested parameter`, ()=>{
                let d = new Decoder();
                d.addBuffer(Buffer.from(`00f0000b00f10007000154`, `hex`));

                expect(d.parameter().body).to.deep.equal({
                    "TagReportData": {
                        "EPCData": {
                            "EPC": "54"
                        }
                    }
                });
            });
        });

        describe(`parameter wrapping a field`, ()=>{
            it(`should return wrapped field`, ()=>{
                let d = new Decoder({wrapperParam: true});
                d.addBuffer(Buffer.from(`91abcd`, 'hex'));        // wrapped parameter

                expect(d.parameter().body).to.deep.equal({
                    OpSpecID: {
                        OpSpecID: 0xabcd
                    }
                });
            });

            it(`should return unwrapped field`, ()=>{
                let d = new Decoder({wrapperParam: false});
                d.addBuffer(Buffer.from(`91abcd`, 'hex'));        // wrapped parameter

                expect(d.parameter().body).to.deep.equal({ OpSpecID: 0xabcd });
            });
        });
    });

    describe(`choice`, ()=>{
        it(`should return parameter`, ()=>{
            let d = new Decoder();
            d.addBuffer(Buffer.from(`0081000c1234567890abcdef`, 'hex'));

            expect(d.parameter().body).to.deep.equal({
                Uptime: {
                    Microseconds: 0x1234567890abcdefn
                }
            });
        });

        it(`should return multiple parameters`, ()=>{
            let d = new Decoder();
            d.addBuffer(Buffer.concat([
                    Buffer.from(`000000010000`, `hex`),
                    Buffer.from(`00bb001b734e064df86722c4811800bc000d01eaaaf69d6ad84375`, `hex`),
                    Buffer.from(`00b7001800011e0200b800090021ad2c9b00ba0007000101`, 'hex'),
                    Buffer.from(`00b700180001f62f00b80009001bfac6c400ba0007000101`, 'hex')
            ]));

            expect(d.body({
                def: paramDefByName.ROSpec,
                length: d.mBuf.buffer.length
            })).to.deep.equal({
                "ROSpecID": 1,
                "Priority": 0,
                "CurrentState": "Disabled",
                "RFSurveySpec": {
                    "AntennaID": 29518,
                    "StartFrequency": 105773159,
                    "EndFrequency": 583303448,
                    "RFSurveySpecStopTrigger": {
                      "StopTriggerType": "Duration",
                      "DurationPeriod": 3937072797,
                      "N": 1792557941
                    }
                },
                "AISpec": [
                    {
                      "AntennaIDs": [
                        7682
                      ],
                      "AISpecStopTrigger": {
                        "AISpecStopTriggerType": "Null",
                        "DurationTrigger": 564997275
                      },
                      "InventoryParameterSpec": {
                        "InventoryParameterSpecID": 1,
                        "ProtocolID": "EPCGlobalClass1Gen2"
                      }
                    },
                    {
                        "AntennaIDs": [
                          63023
                        ],
                        "AISpecStopTrigger": {
                          "AISpecStopTriggerType": "Null",
                          "DurationTrigger": 469419716
                        },
                        "InventoryParameterSpec": {
                          "InventoryParameterSpecID": 1,
                          "ProtocolID": "EPCGlobalClass1Gen2"
                        }
                    }
                  ]
            });
        });
    });

    describe(`message`, ()=>{
        it(`should return KEEPALIVE message`, ()=>{
            let buf = Buffer.from(`043e0000000a0000abcd`, 'hex');
            let d = new Decoder();

            d.addBuffer(buf);

            expect(d.message()).to.deep.equal({
                MessageID: 0xabcd,
                MessageType: "KEEPALIVE",
                MessageBody: {}
            });
        });
    });
})