
import { LLRPBuffer } from "./buffer/buffer";
import {LLRPCoreMessages, LLRPCoreParameters} from "./LLRPCore"
import { TypeRegistry } from "./type-registry";

TypeRegistry.getInstance().build();

let a = new LLRPCoreMessages.ERROR_MESSAGE({
    data: {
        LLRPStatus: {
            StatusCode: "M_Success",
            ErrorDescription: "hello"
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
                    DurationTrigger: 100
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
        ]
    }
});

const p = d.setROSpecID(0x321);

console.log(p);

console.log(d.encode());