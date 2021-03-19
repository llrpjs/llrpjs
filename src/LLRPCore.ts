import * as Def from "./def";
import { LLRPMessageI } from "./element/message";
import { LLRPParameterI } from "./element/parameter";

import { LLRPMessage } from "./LLRPMessage";
import { LLRPParameter } from "./LLRPParameter";
import { ExpandRecursively, GetFieldFormatValue, GetFieldRawValue, LLRPUserData, TypeDefinition } from "./types";

class LLRPCoreMessage extends LLRPMessage<LLRPUserData> {
    static ofType<U extends typeof LLRPMessage, TD extends TypeDefinition<N>, N extends Def.LLRPMessageNames>(this: U, td: TD) {
        class LLRPTypedMessage extends LLRPMessage<Def.GetDataTypeByName<typeof td['name']>> {
            constructor(args?: GetMessageCtrArgs<Def.GetDataTypeByName<typeof td['name']>>) {
                super({ ...args, ...{ type: td['name'] } });
            }
        }
        // TODO: add setters/getters dynamically?
        // you add the methods dynamically here
        for (let fd of td.fieldDescriptors) {
            if (fd.type === "reserved") continue;
            LLRPTypedMessage.prototype[`set${fd.name}`] = function <T extends LLRPTypedMessage>(this: T, v: any) {
                this.origin.setField(fd.name, v);
                return this;
            }
            LLRPTypedMessage.prototype[`get${fd.name}`] = function <T extends LLRPTypedMessage>(this: T) {
                return this.origin.getField(fd.name);
            }
        }

        for (let tRef of td.subTypeRefs) {
            const { td: name, repeat } = tRef;
            if (repeat === "0-1" || repeat === "1") {
                LLRPTypedMessage.prototype[`set${name}`] = function <T extends LLRPTypedMessage>(this: T, p: LLRPParameter<LLRPUserData>) {
                    this.origin.setSubElement(name, p.origin);
                    return this;
                }
            } else {
                LLRPTypedMessage.prototype[`add${name}`] = function <T extends LLRPTypedMessage>(this: T, p: LLRPParameter<LLRPUserData>) {
                    this.origin.addSubElement(name, p.origin);
                    return this;
                }
            }

            LLRPTypedMessage.prototype[`get${name}`] = function <T extends LLRPTypedMessage>(this: T) {
                const originP = this.origin.getSubElement(name);
                if (!originP) return null;
                // wrap it
                if (Array.isArray(originP)) {
                    return originP.map(p => {
                        const tDef = Def.LLRPDefinition.LLRPTypeDefinitions[p.getName()];
                        const LLRPTypedParameter = LLRPCoreParameter.ofType(tDef);

                        const param = new LLRPTypedParameter({data: p.getData()});
                        param.origin = p as typeof param.origin;
                        return param;
                    })
                }
                const tDef = Def.LLRPDefinition.LLRPTypeDefinitions[originP.getName()];
                const LLRPTypedParameter = LLRPCoreParameter.ofType(tDef);

                const param = new LLRPTypedParameter({data: originP.getData()});
                param.origin = originP as typeof param.origin;
                return param;
            }
        }
        return LLRPTypedMessage;
    }
}

class LLRPCoreParameter extends LLRPParameter<LLRPUserData> {
    static ofType<U extends typeof LLRPParameter, TD extends TypeDefinition<N>, N extends Def.LLRPParamNames>(this: U, td: TD) {
        class LLRPTypedParameter extends LLRPParameter<Def.GetDataTypeByName<typeof td['name']>> {
            constructor(args?: GetParamCtrArgs<Def.GetDataTypeByName<typeof td['name']>>) {
                super({ ...args, ...{ type: td['name'] } });
            }
        }
        // Fields
        for (let fd of td.fieldDescriptors) {
            if (fd.type === "reserved") continue;
            LLRPTypedParameter.prototype[`set${fd.name}`] = function <T extends LLRPTypedParameter>(this: T, v: any) {
                return this.origin.setField(fd.name, v);
            }
            LLRPTypedParameter.prototype[`get${fd.name}`] = function <T extends LLRPTypedParameter>(this: T) {
                return this.origin.getField(fd.name);
            }
        }
        // Sub-parameters
        for (let tRef of td.subTypeRefs) {
            const { td: name, repeat } = tRef;
            if (repeat === "0-1" || repeat === "1") {
                LLRPTypedParameter.prototype[`set${name}`] = function <T extends LLRPTypedParameter>(this: T, p: LLRPParameter<LLRPUserData>) {
                    this.origin.setSubElement(name, p.origin);
                    return this;
                }
            } else {
                LLRPTypedParameter.prototype[`add${name}`] = function <T extends LLRPTypedParameter>(this: T, p: LLRPParameter<LLRPUserData>) {
                    this.origin.addSubElement(name, p.origin);
                    return this;
                }
            }

            LLRPTypedParameter.prototype[`get${name}`] = function <T extends LLRPTypedParameter>(this: T) {
                const originP = this.origin.getSubElement(name);
                if (!originP) return null;
                // wrap it
                if (Array.isArray(originP)) {
                    return originP.map(p => {
                        const tDef = Def.LLRPDefinition.LLRPTypeDefinitions[p.getName()];
                        const LLRPTypedParameter = LLRPCoreParameter.ofType(tDef);

                        const param = new LLRPTypedParameter({data: p.getData()});
                        param.origin = p as typeof param.origin;
                        return param;
                    })
                }
                const tDef = Def.LLRPDefinition.LLRPTypeDefinitions[originP.getName()];
                const LLRPTypedParameter = LLRPCoreParameter.ofType(tDef);

                const param = new LLRPTypedParameter({data: originP.getData()});
                param.origin = originP as typeof param.origin;
                return param;
            }
        }
        return LLRPTypedParameter;
    }
}

export const LLRPCoreMessages = (() => {
    let result = {} as { [K in Def.LLRPMessageNames]: any };
    for (let name of Def.LLRPDefinition.LLRPMessageNames) {
        const td = Def.LLRPDefinition.LLRPTypeDefinitions[name];
        result[name] = LLRPCoreMessage.ofType(td);
    }
    return result as { [K in Def.LLRPMessageNames]: GetMessageClassType<K> }; // TODO: you need to type these for setters and getters
})();

export const LLRPCoreParameters = (() => {
    let result = {} as { [K in Def.LLRPParamNames]: any };
    for (let name of Def.LLRPDefinition.LLRPParamNames) {
        const td = Def.LLRPDefinition.LLRPTypeDefinitions[name];
        result[name] = LLRPCoreParameter.ofType(td);
    }
    return result as { [K in Def.LLRPParamNames]: GetParamClassType<K> };
})();

const LLRPTypeDefinitions = Def.LLRPDefinition.LLRPTypeDefinitions;

// Type helpers
type LLRPAllNames = Def.LLRPMessageNames | Def.LLRPParamNames;
type LLRPChoiceNames = Exclude<keyof typeof LLRPTypeDefinitions, LLRPAllNames>;
type GetFieldDescriptors<T extends LLRPAllNames> = typeof LLRPTypeDefinitions[T]['fieldDescriptors'][number];
type GetSubTypeRefs<T extends LLRPAllNames> = typeof LLRPTypeDefinitions[T]['subTypeRefs'][number];
type GetChoices<T extends GetSubTypeRefs<LLRPAllNames>> = T['choices'][number];

type GetMessageCtrArgs<T extends LLRPUserData,
    M extends LLRPMessageI<T> = LLRPMessageI<T>> =
    Partial<Pick<M, "id">> & Pick<M, "data">;

type GetParamCtrArgs<T extends LLRPUserData,
    P extends LLRPParameterI<T> = LLRPParameterI<T>> = Pick<P, "data">;

type GetMessageClassType<T extends Def.LLRPMessageNames,
    M extends LLRPMessage<Def.GetDataTypeByName<T>> = LLRPMessage<Def.GetDataTypeByName<T>>,
    FD extends GetFieldDescriptors<T> = GetFieldDescriptors<T>
    > =
    new (args?: ExpandRecursively<GetMessageCtrArgs<Def.GetDataTypeByName<T>>>) => M
    & GetFieldSettersGetters<FD>
    & GetAllSubParamSettersGetters<GetSubTypeRefs<T>>;

type GetParamClassType<T extends Def.LLRPParamNames,
    P extends LLRPParameter<Def.GetDataTypeByName<T>> = LLRPParameter<Def.GetDataTypeByName<T>>,
    FD extends GetFieldDescriptors<T> = GetFieldDescriptors<T>
    > =
    new (args?: ExpandRecursively<GetParamCtrArgs<Def.GetDataTypeByName<T>>>) => P
    & GetFieldSettersGetters<Exclude<FD, {type : "reserved"}>>
    & GetAllSubParamSettersGetters<GetSubTypeRefs<T>>;

// Field Setters/Getters tools
type GetFieldSettersGetters<FD extends GetFieldDescriptors<LLRPAllNames>> = {
    [x in `set${FD['name']}`]: (v: GetFieldValue<Extract<FD, { name: Trim<x, "set"> }>>) => void;
} & {
        [x in `get${FD['name']}`]: () => GetFieldValue<Extract<FD, { name: Trim<x, "get"> }>>;
    };

type GetFieldValue<FD extends GetFieldDescriptors<LLRPAllNames>> = ExpandRecursively<
    | GetFieldRawValue<FD['type']>
    | GetFieldFormatValue<FD['format']>
    | GetEnum<FD>
>;

type GetEnum<FD extends GetFieldDescriptors<LLRPAllNames>> = FD['enumTable'][number]['name'] | FD['enumTable'][number]['value'];

type Trim<T, S extends string> = T extends `${S}${infer U}` ? Trim<U, S> : T extends `${S}${infer U}` ? Trim<U, S> : T;

// Sub-type Setters/Getters tools
type GetAllSubParamSettersGetters<Ref extends GetSubTypeRefs<LLRPAllNames>> =
    GetOnceSettersGetters<Extract<Ref, { repeat: "0-1" | "1" }>> &
    GetManySettersGetters<Extract<Ref, { repeat: "0-N" | "1-N" }>>;

type GetOnceSettersGetters<Ref extends GetSubTypeRefs<LLRPAllNames>,
    choiceRef extends Exclude<Ref, { td: Def.LLRPParamNames }> = Exclude<Ref, { td: Def.LLRPParamNames }>,
    normalRef extends Exclude<Ref, { td: LLRPChoiceNames }> = Exclude<Ref, { td: LLRPChoiceNames }>> =
    {
        [x in `set${choiceRef['td']}`]: SubChoiceSetter<GetChoices<Extract<choiceRef, { td: Trim<x, "set"> }>>>
    } & {
        [x in `set${normalRef['td']}`]: SubParameterSetter<Extract<Ref, { td: Trim<x, "set"> }>['td']>
    } & {
        [x in `get${choiceRef['td']}`]: SubChoiceGetter<GetChoices<Extract<choiceRef, { td: Trim<x, "get"> }>>>
    } & {
        [x in `get${normalRef['td']}`]: SubParameterGetter<Extract<Ref, { td: Trim<x, "get"> }>['td']>
    };

type GetManySettersGetters<Ref extends GetSubTypeRefs<LLRPAllNames>,
    choiceRef extends Exclude<Ref, { td: Def.LLRPParamNames }> = Exclude<Ref, { td: Def.LLRPParamNames }>,
    normalRef extends Exclude<Ref, { td: LLRPChoiceNames }> = Exclude<Ref, { td: LLRPChoiceNames }>> =
    {
        [x in `add${choiceRef['td']}`]: SubChoiceSetter<GetChoices<Extract<choiceRef, { td: Trim<x, "add"> }>>>
    } & {
        [x in `add${normalRef['td']}`]: SubParameterSetter<Extract<Ref, { td: Trim<x, "add"> }>['td']>
    } & {
        [x in `get${choiceRef['td']}`]: SubChoiceManyGetter<GetChoices<Extract<choiceRef, { td: Trim<x, "get"> }>>>
    } & {
        [x in `get${normalRef['td']}`]: SubParamManyGetter<Extract<Ref, { td: Trim<x, "get"> }>['td']>
    }

type SubParameterSetter<T extends Def.LLRPParamNames> = <U>(this: U, p: InstanceType<GetParamClassType<T>> ) => U;
type SubParameterGetter<T extends Def.LLRPParamNames> = <U>(this: U) => InstanceType<GetParamClassType<T>> | null;
type SubChoiceSetter<T extends Def.LLRPParamNames> = <U>(this: U, p: GetLLRPParameterUnion<T>) => U;
type SubChoiceGetter<T extends Def.LLRPParamNames> = <U>(this: U) => GetLLRPParameterUnion<T> | null;

type SubParamManyGetter<T extends Def.LLRPParamNames> = <U>(this: U) => GetLLRPParameterUnion<T> | GetLLRPParameterUnion<T>[];
type SubChoiceManyGetter<T extends Def.LLRPParamNames> = <U>(this: U) => GetLLRPParameterUnion<T> | GetLLRPParameterUnion<T>[];


type GetLLRPParameterUnion<K extends Def.LLRPParamNames> = {
    [x in K]: InstanceType<GetParamClassType<Extract<K, x>>>
}[K];

