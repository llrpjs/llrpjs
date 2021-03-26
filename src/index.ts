import { LLRPDef } from "./def";
import { LLRPMessageFactory, LLRPParameterFactory, LLRPAllFactory, LLRPReaderFactory } from "./LLRPFactory";
import { LLRPMessage } from "./LLRPMessage";
import { LLRPParameter } from "./LLRPParameter";
import { TypeRegistry as LLRPTypeRegistry } from "./type-registry";
import { LLRPAllTypeDefinitions } from "./types";

function LLRPCustomFactory<AD extends LLRPAllTypeDefinitions>(customDef: AD) {
    const LLRPAllDef = {...LLRPDef, ...customDef};
    const LLRPCustomMessages = LLRPMessageFactory(customDef);
    const LLRPCustomParameters = LLRPParameterFactory(customDef);
    const LLRPCustom = LLRPAllFactory(customDef);

    const LLRPReader = LLRPReaderFactory(LLRPAllDef);

    LLRPTypeRegistry.getInstance()
        .enrollCoreDefinitions(LLRPDef)
        .enrollCustomDefinitions(customDef)
        .build()

    return {
        LLRPCustomMessages,
        LLRPCustomParameters,
        LLRPCustom,
        LLRPReader
    }
}

const LLRPCoreMessages = LLRPMessageFactory(LLRPDef);
const LLRPCoreParameters = LLRPParameterFactory(LLRPDef);
const LLRPCore = LLRPAllFactory(LLRPDef);

const LLRPReader = LLRPReaderFactory(LLRPDef);

LLRPTypeRegistry.getInstance()
    .enrollCoreDefinitions(LLRPDef)
    .build()

export {
    LLRPMessage,
    LLRPParameter,
    LLRPReader,
    LLRPCoreMessages,
    LLRPCoreParameters,
    LLRPCore,
    LLRPCustomFactory
};