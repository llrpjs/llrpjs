
import {LLRPCoreMessages} from "./LLRPCoreMessage"
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

c.encode();

console.log(c);