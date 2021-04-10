import { LLRPDef as LLRPCoreDef } from "./def";
import { LLRPTypedMessage } from "./typed/message";
import { LLRPTypedParameter } from "./typed/parameter";
import { LLRPClassRegistry } from "./registry/class-registry";
import { TypeRegistry } from "./registry/type-registry";
import { GetDataType, LLRPAllTypeDefinitions, LLRPMessageNames, LLRPParamNames } from "./types";
import { LLRPClientOfDef } from "./net/client";
import { LLRPServerOfDef } from "./net/server";

import EventEmitter from "events";

function LLRPFactory<AD extends LLRPAllTypeDefinitions>(Def: AD) {
    TypeRegistry.getInstance().enrollCoreDefinitions(Def).build();
    const CR = LLRPClassRegistry.getInstance(Def).enrollCoreDefinitions(Def).build();
    
    const LLRPCoreMessages = CR.getCoreMessageClasses();
    const LLRPCoreParameters = CR.getCoreParamClasses();
    const LLRPCore = { ...LLRPCoreMessages, ...LLRPCoreParameters };
    
    const LLRPMessage = LLRPTypedMessage.ofDef(Def);
    const LLRPParameter = LLRPTypedParameter.ofDef(Def);
    
    const LLRPClient = LLRPClientOfDef(Def);
    const LLRPServer = LLRPServerOfDef(Def);
    return {
        LLRPMessage,
        LLRPParameter,
        LLRPClient,
        LLRPServer,
        LLRPCore
    };
}

export type GetLLRPDataTypes<
    AD extends LLRPAllTypeDefinitions,
    K extends LLRPMessageNames<AD> | LLRPParamNames<AD> = LLRPMessageNames<AD> | LLRPParamNames<AD>
> = {
    [ x in K ]: GetDataType<AD, AD[x]>
};

export {
    LLRPCoreDef,
    LLRPFactory
}
