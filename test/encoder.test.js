const expect = require('chai').expect;
const Encoder = require('../src/encoder');
const {groupBy} = require('../src/tools');
const llrpdef = require('../definitions/core/llrp-1x0-def.json');
const Decoder = require('../src/decoder');
const msgDefByName = groupBy(llrpdef.messageDefinitions, "name");
const paramDefByName = groupBy(llrpdef.parameterDefinitions, "name");

describe(`encoder.js`, ()=>{
    describe(`field`, ()=>{
        describe(`simple`, ()=>{
            it(`should encode integer into buffer`, ()=>{
                let e = new Encoder();
                let def = paramDefByName["ROSpec"].body[0];

                expect(e.field(def, { ROSpecID: 0x01234567 }))
                    .to.deep.equal(Buffer.from('01234567', 'hex'));
            });
        });

        describe(`formatted`, ()=>{
            it(`should encode string into buffer`, ()=>{
                let e = new Encoder();
                let def = paramDefByName["ReaderExceptionEvent"].body[0];

                expect(e.field(def, { "Message" : "Node.js rocks!" }))
                    .to.deep.equal(Buffer.from(`000e4e6f64652e6a7320726f636b7321`, 'hex'));   // 2-bytes length + payload
            });

            it(`should encode hex string into buffer`, ()=>{
                let e = new Encoder();
                let def = paramDefByName["Identification"].body[1];

                expect(e.field(def, { ReaderID: "0123456789ABCDEF" }))
                    .to.deep.equal(Buffer.from(`00080123456789ABCDEF`, `hex`)); // 2-bytes length + payload
            });

            it(`should encode Datetime into buffer`, ()=>{
                let e = new Encoder();
                let def = paramDefByName["UTCTimestamp"].body[0]; // timestamp

                expect(e.field(def, {
                    Microseconds: new Date("2020-09-06T18:13:13.000Z")
                })).to.deep.equal(Buffer.from(`0005aea90e1c6040`, 'hex'));
            });
        });

        describe(`bytesToEnd`, ()=>{
            it(`should encode hex string into buffer`, ()=>{
                let e = new Encoder();
                let def = paramDefByName.Custom.body[2];

                expect(e.field(def, {
                    "Data": "08127583F85EAFE0815883A8A8"
                })).to.deep.equal(Buffer.from(`08127583F85EAFE0815883A8A8`, `hex`));
            });
        });

        describe(`enum`, ()=>{
            it(`should encode simple enum`, ()=>{
                let e = new Encoder();
                let def = paramDefByName["ROSpec"].body[2];         // CurrentState field

                expect(e.field(def, { CurrentState: "Active"}))
                    .to.deep.equal(Buffer.from('02', 'hex'));
            });

            it(`should encode vector enum`, ()=>{
                let e = new Encoder();
                let def = paramDefByName.PerAntennaAirProtocol.body[1];
                
                expect(e.field(def, {
                    "ProtocolID": [ "Unspecified", "EPCGlobalClass1Gen2" ]
                })).to.deep.equal(Buffer.from(`00020001`, 'hex'));
            });
        });

        describe(`errors`, ()=>{
            //TODO: write these after you finish up error codes
        });
    });

    describe(`parameter`, ()=>{
        describe(`TV`, ()=>{
            it(`should return TV param encoded buffer`, ()=>{
                let e = Encoder();
                let defRef = paramDefByName["TagReportData"].body[11];     // TagSeenCount

                expect(e.parameter(defRef, {
                        TagSeenCount: {
                            TagCount: 0xabcd
                        }
                    })).to.deep.equal(Buffer.from(`88abcd`, `hex`));   // [1] [0001000] [1010 1011 1100 1101]
            });
        });

        describe(`TLV`, ()=>{
            it(`should return TLV param encoded buffer`, ()=>{
                let e = Encoder();
                let defRef = paramDefByName["ReaderEventNotificationData"].body[11];

                expect(e.parameter(defRef, { ConnectionCloseEvent : {} }))
                    .to.deep.equal(Buffer.from(`01010004`, 'hex'));        // Simplest TLV parameter: ConnectionCloseEvent
            });

            it(`should return nested parameter`, ()=>{
                let e = new Encoder();

                let defRef = msgDefByName.RO_ACCESS_REPORT.body[0];
                expect(e.parameter(defRef, {
                    "TagReportData": {
                        "EPCData": {
                            "EPC": "54"
                        }
                    }
                })).to.deep.equal(Buffer.from(`00f0000b00f10007000854`, `hex`));
            });

        });

        describe(`wrapper`, ()=>{
            describe(`wrapped field`, ()=>{
                it(`should return TV encoded buffer`, ()=>{
                    let e = Encoder();
                    let defRef = paramDefByName.ReaderExceptionEvent.body[6];

                    expect(e.parameter(defRef, {
                        OpSpecID: {
                            OpSpecID: 0xabcd
                        }
                    })).to.deep.equal(Buffer.from(`91abcd`, 'hex'));
                });
            });

            describe(`unwrapped field`, ()=>{
                it(`should return TV encoded buffer`, ()=>{
                    let e = Encoder();
                    let defRef = paramDefByName.ReaderExceptionEvent.body[6];
                    
                    expect(e.parameter(defRef, { OpSpecID: 0xabcd }))
                        .to.deep.equal(Buffer.from(`91abcd`, 'hex'));
                });
            });
        });
    });

    describe(`choice`, ()=>{
        it(`should return encoded parameter buffer`, ()=>{
            let e = new Encoder();
            let defRef = paramDefByName.FrequencyRSSILevelEntry.body[4];

            expect(e.choice(defRef, {
                Uptime: {
                    Microseconds: 0x1234567890abcdefn
                }
            })).to.deep.equal(Buffer.from(`0081000c1234567890abcdef`, 'hex'));

        });

        it(`should return buffer with multiple parameters`, ()=>{
            let e = new Encoder();
            let defRef = paramDefByName.ROSpec.body[4];
            let data = {
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
            };

            expect(e.choice(defRef, data)).to.satisfy(result=>{
                    return [
                        Buffer.from(`00bb001b734e064df86722c4811800bc000d01eaaaf69d6ad84375`, `hex`),
                        Buffer.from(`00b7001800011e0200b800090021ad2c9b00ba0007000101`, 'hex'),
                        Buffer.from(`00b700180001f62f00b80009001bfac6c400ba0007000101`, 'hex')
                    ].every(x=>result.includes(x));
            });
        });
    });

    describe(`message`, ()=>{
        it(`should return encoded message buffer`, ()=>{
            let e = new Encoder();
            expect(e.message({
                MessageID: 0xabcd,
                MessageType: "KEEPALIVE",
                MessageBody: {}
            })).to.deep.equal(Buffer.from(`043e0000000a0000abcd`, 'hex'));
        });

        it(`should return buffer of two encoded messages`, () => {
            let e = new Encoder();
            let msg1 = {
                "MessageType": "CLOSE_CONNECTION",
                "MessageID": 3233857728,
                "MessageBody": {}
            };
            let msg2 = {
                "MessageType": "CLOSE_CONNECTION_RESPONSE",
                "MessageID": 3233857728,
                "MessageBody": {
                    "LLRPStatus": {
                        "StatusCode": "M_Success",
                        "ErrorDescription": ""
                    }
                }
            };

            let buf1 = e.message(msg1);
            let buf2 = e.message(msg2);
            expect(Buffer.concat([buf1, buf2]))
                .to.deep.equal(Buffer.from("040e0000000ac0c0c0c0040400000012c0c0c0c0011f000800000000", 'hex'));
        });
    });
});