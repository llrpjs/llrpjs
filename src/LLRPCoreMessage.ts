import * as Def from "./def-td";
import { LLRPMessageI } from "./element/message";

import { LLRPMessage } from "./LLRPMessage";
import { EnumEntry, ExpandRecursively, GetFieldFormatValue, GetFieldRawValue, LLRPUserData, TypeDefinition } from "./types";

class LLRPCoreMessage extends LLRPMessage<LLRPUserData> {
    static ofType<U extends typeof LLRPMessage, TD extends TypeDefinition<N>, N extends Def.LLRPMessageNames>(this: U, td: TD) {
        class LLRPTypedMessage extends LLRPMessage<Def.GetDataTypeByName<typeof td['name']>> {
            constructor(args?: GetCtrArgs<Def.GetDataTypeByName<typeof td['name']>>) {
                super({ ...args, ...{ type: td['name']} });
            }
        }
        // TODO: add setters/getters dynamically?
        // you add the methods dynamically here
        for (let fd of td.fieldDescriptors) {
            LLRPTypedMessage.prototype[`set${fd.name}`] = function<T extends LLRPTypedMessage>(this: T, v: any) {
                return this.origin.setField(fd.name, v);
            }
            LLRPTypedMessage.prototype[`get${fd.name}`] = function<T extends LLRPTypedMessage>(this: T) {
                return this.origin.getField(fd.name);
            }
        }
        return LLRPTypedMessage;
    }
}

export const LLRPCoreMessages = (()=>{
    let result = {} as {[K in Def.LLRPMessageNames]: any};
    for (let name of Def.LLRPDefinition.LLRPMessageNames) {
        const td = Def.LLRPDefinition.LLRPTypeDefinitions[name];
        result[name] = LLRPCoreMessage.ofType(td);
    }
    return result as { [K in Def.LLRPMessageNames]: GetClassType<K> }; // TODO: you need to type these for setters and getters
})();

const LLRPTypeDefinitions = Def.LLRPDefinition.LLRPTypeDefinitions;

// Type helpers
type GetFieldDescriptors<T extends Def.LLRPMessageNames> = typeof LLRPTypeDefinitions[T]['fieldDescriptors'][number];
type GetSubTypeRefs<T extends Def.LLRPMessageNames> = typeof LLRPTypeDefinitions[T]['subTypeRefs'][number];

type GetCtrArgs<T extends LLRPUserData,
    M extends LLRPMessageI<T> = LLRPMessageI<T>> =
    Partial<Pick<M, "id">> & Pick<M, "data">;

type GetClassType<T extends Def.LLRPMessageNames,
    M extends LLRPMessage<Def.GetDataTypeByName<T>> = LLRPMessage<Def.GetDataTypeByName<T>>,
    FD extends GetFieldDescriptors<T> = GetFieldDescriptors<T>
    > =
    new (args?: ExpandRecursively<GetCtrArgs<Def.GetDataTypeByName<T>>>) => M & GetFieldSettersGetters<FD>;


// Field Setters/Getters tools
type GetFieldSettersGetters<FD extends GetFieldDescriptors<Def.LLRPMessageNames>> = {
    [x in `set${FD['name']}`]: (v: GetFieldValue<Extract<FD, {name: Trim<x, "set">}>>) => void;
} & {
    [x in `get${FD['name']}`]: () => GetFieldValue<Extract<FD, {name: Trim<x, "get">}>>;
};

type GetFieldValue<FD extends GetFieldDescriptors<Def.LLRPMessageNames>> = ExpandRecursively<
    | GetFieldRawValue<FD['type']>
    | GetFieldFormatValue<FD['format']>
    | GetEnum<FD>
>;

type GetEnum<FD extends GetFieldDescriptors<Def.LLRPMessageNames>> = FD['enumTable'][number]['name'] | FD['enumTable'][number]['value'];

type Trim<T, S extends string> = T extends `${S}${infer U}` ? Trim<U, S> : T extends `${S}${infer U}` ? Trim<U, S> : T;

// Sub-type Setters/Getters tools
// type GetSubParamSettersGetters<Ref extends GetSubTypeRefs<Def.LLRPMessageNames>> =
//     Ref['repeat'] extends "0_N" ? "0_N" :
//     Ref['repeat'] extends "1_N" ? "1_N" :
//     Ref['repeat'] extends "0" ? "0" :
//     Ref['repeat'] extends "1" ? "1" :
//     never;

// type T = GetSubParamSettersGetters<GetSubTypeRefs<"ADD_ROSPEC">>