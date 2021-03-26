
import { LLRPAllFactory, LLRPMessageFactory, LLRPParameterFactory } from "../src/LLRPFactory";
import { TypeRegistry } from "../src/type-registry";
import {  LLRPDef } from "../src/def";

const LLRPCoreMessages = LLRPMessageFactory(LLRPDef);
const LLRPCoreParameters = LLRPParameterFactory(LLRPDef);
const LLRPCore = LLRPAllFactory(LLRPDef);

TypeRegistry.getInstance()
    .enrollCoreDefinitions(LLRPDef)
    .build();

let a = new LLRPCoreMessages.ERROR_MESSAGE({
    data: {
        LLRPStatus: {
            StatusCode: "M_Success",
            ErrorDescription: "hello",
            FieldError: {
                FieldNum: 10,
                ErrorCode: "M_ParameterError"
            },
            ParameterError: {
                ErrorCode: "M_ParameterError",
                ParameterType: 134
            }
        }
    }
});

let b = new LLRPCoreMessages.STOP_ROSPEC({
    id: 1,
    data: {
        ROSpecID: 123
    }
});

let c = new LLRPCoreMessages.GET_READER_CONFIG({
    id: 0,
    data: {
        AntennaID: 1,
        GPIPortNum: 1,
        GPOPortNum: 2,
        RequestedData: "All"
    }
});

let d = new LLRPCoreParameters.ROSpec({
    data: {
        ROSpecID: 0x123,
        Priority: 1,
        CurrentState: "Disabled",
        ROBoundarySpec: {
            ROSpecStartTrigger: {
                ROSpecStartTriggerType: "Null"
            },
            ROSpecStopTrigger: {
                ROSpecStopTriggerType: "Duration",
                DurationTriggerValue: 100,
            }
        },
        AISpec: [
            {
                AntennaIDs: [1,2,3,4],
                AISpecStopTrigger: {
                    AISpecStopTriggerType: "Null",
                    DurationTrigger: 1000
                },
                InventoryParameterSpec: {
                    InventoryParameterSpecID: 0x1234,
                    ProtocolID: "EPCGlobalClass1Gen2"
                }
            },
            {
                AntennaIDs: [1,2,3,4],
                AISpecStopTrigger: {
                    AISpecStopTriggerType: "Null",
                    DurationTrigger: 100
                },
                InventoryParameterSpec: {
                    InventoryParameterSpecID: 0x1234,
                    ProtocolID: "EPCGlobalClass1Gen2"
                }
            }
        ],
        ROReportSpec: {
            N: 1,
            ROReportTrigger: "Upon_N_Tags_Or_End_Of_ROSpec",
            TagReportContentSelector: {
                EnableAccessSpecID: true,
                EnableAntennaID: true,
                EnableChannelIndex: true,
                EnableFirstSeenTimestamp: true,
                EnableInventoryParameterSpecID: true,
                EnableLastSeenTimestamp: true,
                EnablePeakRSSI: true,
                EnableROSpecID: true,
                EnableSpecIndex: true,
                EnableTagSeenCount: true
            }
        }
    }
});

const p = d.getROSpecID();

const data = a.toLLRPData();

const z = new LLRPCoreMessages.ADD_ACCESSSPEC({
    data: {
        AccessSpec: {
            AntennaID: 1,
            ROSpecID: 1,
            CurrentState: "Disabled",
            AccessSpecID: 0x123,
            ProtocolID: "EPCGlobalClass1Gen2",
            AccessSpecStopTrigger: {
                AccessSpecStopTrigger: "Null",
                OperationCountValue: 10
            },
            AccessCommand: {
                C1G2TagSpec: {
                    C1G2TargetTag: [
                        {
                            MB: 3,
                            Pointer: 1,
                            TagMask: "1234566789789434",
                            TagData: "4387387387837387",
                            Match: true
                        },
                        {
                            MB: 2,
                            Pointer: 1,
                            TagMask: "114315715987193875",
                            TagData: "185163497619376471",
                            Match: false
                        }
                    ]
                },
                C1G2BlockErase: {
                    OpSpecID: 0x1234,
                    MB: 3,
                    AccessPassword: 123153315,
                    WordCount: 8,
                    WordPointer: 0
                }
            }
        }
    }
})

console.log(z.getAccessSpec());
//console.log(d.encode());
