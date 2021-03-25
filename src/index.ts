import { LLRPDef } from "./def";
import { LLRPMessageFactory, LLRPParameterFactory, LLRPFactory } from "./LLRPFactory";
import { LLRPMessage } from "./LLRPMessage";
import { LLRPParameter } from "./LLRPParameter";
import { LLRPReader } from "./reader/reader";
import { TypeRegistry as LLRPTypeRegistry } from "./type-registry";

const LLRPCoreMessages = LLRPMessageFactory(LLRPDef);
const LLRPCoreParameters = LLRPParameterFactory(LLRPDef);
const LLRPCore = LLRPFactory(LLRPDef);

LLRPTypeRegistry.getInstance()
    .enrollCoreDefinitions(LLRPDef)
    .build()

export {
    LLRPTypeRegistry,
    LLRPMessage,
    LLRPParameter,
    LLRPReader,
    LLRPCore,
    LLRPFactory
};