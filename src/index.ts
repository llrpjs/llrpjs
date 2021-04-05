import { LLRPDef as LLRPCoreDef } from "./def";
import { LLRPTypedMessage } from "./typed/message";
import { LLRPTypedParameter } from "./typed/parameter";
import { LLRPClassRegistry } from "./registry/class-registry";
import { TypeRegistry } from "./registry/type-registry";
import { GetDataType, LLRPAllTypeDefinitions, LLRPMessageNames, LLRPParamNames } from "./types";
import { LLRPClientOfDef } from "./net/client";
import { LLRPServerOfDef } from "./net/server";


TypeRegistry.getInstance().enrollCoreDefinitions(LLRPCoreDef).build();
const CR = LLRPClassRegistry.getInstance(LLRPCoreDef).enrollCoreDefinitions(LLRPCoreDef).build();

const LLRPCoreMessages = CR.getCoreMessageClasses();
const LLRPCoreParameters = CR.getCoreParamClasses();
const LLRPCore = { ...LLRPCoreMessages, ...LLRPCoreParameters };

const LLRPMessage = LLRPTypedMessage.ofDef(LLRPCoreDef);
const LLRPParameter = LLRPTypedParameter.ofDef(LLRPCoreDef);

const LLRPClient = LLRPClientOfDef(LLRPCoreDef);
const LLRPServer = LLRPServerOfDef(LLRPCoreDef);

type GetAllDataTypes<
    AD extends LLRPAllTypeDefinitions,
    K extends LLRPMessageNames<AD> | LLRPParamNames<AD> = LLRPMessageNames<AD> | LLRPParamNames<AD>
> = {
    [ x in K ]: GetDataType<AD, AD[x]>
};

export type LLRPCoreDataTypes = GetAllDataTypes<typeof LLRPCoreDef>;

export {
    LLRPCoreDef,
    LLRPCore,
    LLRPMessage,
    LLRPParameter,
    LLRPClient,
    LLRPServer
}
