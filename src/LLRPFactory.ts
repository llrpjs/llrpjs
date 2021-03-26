import { LLRPMessage as _LLRPMessage } from "./LLRPMessage";
import { LLRPParameter as _LLRPParameter } from "./LLRPParameter";
import { LLRPReader as _LLRPReader, LLRPReaderNativeEvents } from "./reader/reader";
import { Id, LLRPUserData, SubTypeRefDefinition, TypeDefinition, FieldDefinition, GetDataType, GetDataTypeFromFieldType, LLRPAllTypeDefinitions, LLRPMessageI, LLRPParameterI } from "./types";

/** Extract all type names */
type LLRPAllNames<AD extends LLRPAllTypeDefinitions, K extends keyof AD = keyof AD> = K;
type LLRPMessageNames<AD extends LLRPAllTypeDefinitions, K extends keyof AD = keyof AD> = Extract<AD[K], { isMessage: true }>['name'];
type LLRPParamNames<AD extends LLRPAllTypeDefinitions, K extends keyof AD = keyof AD> = Extract<Exclude<AD[K], { typeNum: -1 }>, { isMessage: false }>['name'];
type LLRPChoiceNames<AD extends LLRPAllTypeDefinitions, K extends keyof AD = keyof AD> = Extract<AD[K], { typeNum: -1 }>['name']

/** Type descriptor attribute extractors */
type GetFieldDescriptors<TD extends TypeDefinition> = TD['fieldDescriptors'][number];
type GetSubTypeRefs<TD extends TypeDefinition> = TD['subTypeRefs'][number];
type GetChoiceRefNames<Ref extends SubTypeRefDefinition> = Ref['choices'][number];

/** Top-level class constructor argument types */
type GetMessageCtrArgs<T extends LLRPUserData,
    M extends LLRPMessageI<T> = LLRPMessageI<T>> =
    Partial<Pick<M, "id">> & Pick<M, "data">;

type GetParamCtrArgs<T extends LLRPUserData,
    P extends LLRPParameterI<T> = LLRPParameterI<T>> = Pick<P, "data">;

/** Top-level class types */
type GetMessageClassType<
    AD extends LLRPAllTypeDefinitions,
    N extends keyof AD = keyof AD,
    TD extends AD[N] = AD[N],
    Data extends GetDataType<AD, TD> = GetDataType<AD, TD>,
    M extends _LLRPMessage<Data> = _LLRPMessage<Data>,
    FD extends GetFieldDescriptors<TD> = GetFieldDescriptors<TD>
    > =
    new (args?: Id<GetMessageCtrArgs<Data>>) => M
        & GetFieldSettersGetters<Exclude<FD, { type: "reserved" }>>
        & GetAllSubParamSettersGetters<AD, GetSubTypeRefs<TD>>;

type GetParamClassType<
    AD extends LLRPAllTypeDefinitions,
    N extends keyof AD = keyof AD,
    TD extends AD[N] = AD[N],
    Data extends GetDataType<AD, TD> = GetDataType<AD, TD>,
    P extends _LLRPParameter<Data> = _LLRPParameter<Data>,
    FD extends GetFieldDescriptors<TD> = GetFieldDescriptors<TD>
    > =
    new (args?: Id<GetParamCtrArgs<Data>>) => P
        & GetFieldSettersGetters<Exclude<FD, { type: "reserved" }>>
        & GetAllSubParamSettersGetters<AD, GetSubTypeRefs<TD>>;

type GetClassType<
    AD extends LLRPAllTypeDefinitions,
    N extends keyof AD = keyof AD,
    TD extends AD[N] = AD[N]
    > =
    TD extends { isMessage: true } ? GetMessageClassType<AD, N> : GetParamClassType<AD, N>;


// Field setters/getters tools
type Trim<T, S extends string> = T extends `${S}${infer U}` ? Trim<U, S> : T extends `${S}${infer U}` ? Trim<U, S> : T;

type GetFieldSettersGetters<FD extends FieldDefinition> = {
    [x in `set${FD['name']}`]: (v: GetDataTypeFromFieldType<Extract<FD, { name: Trim<x, "set"> }>>) => void;
} & {
        [x in `get${FD['name']}`]: () => GetDataTypeFromFieldType<Extract<FD, { name: Trim<x, "get"> }>>;
    };

// Sub-type setters/getters tools
type GetAllSubParamSettersGetters<AD extends LLRPAllTypeDefinitions, Ref extends SubTypeRefDefinition> =
    GetOnceSettersGetters<AD, Extract<Ref, { repeat: "0-1" | "1" }>> &
    GetManySettersGetters<AD, Extract<Ref, { repeat: "0-N" | "1-N" }>>;

type GetOnceSettersGetters<AD extends LLRPAllTypeDefinitions, Ref extends SubTypeRefDefinition,
    choiceRef extends Exclude<Ref, { td: LLRPParamNames<AD> }> = Exclude<Ref, { td: LLRPParamNames<AD> }>,
    normalRef extends Exclude<Ref, { td: LLRPChoiceNames<AD> }> = Exclude<Ref, { td: LLRPChoiceNames<AD> }>> =
    {
        [x in `set${choiceRef['td']}`]: SubChoiceSetter<AD, GetChoiceRefNames<Extract<choiceRef, { td: Trim<x, "set"> }>>>
    } & {
        [x in `set${normalRef['td']}`]: SubParameterSetter<AD, Extract<Ref, { td: Trim<x, "set"> }>['td']>
    } & {
        [x in `get${choiceRef['td']}`]: SubChoiceGetter<AD, GetChoiceRefNames<Extract<choiceRef, { td: Trim<x, "get"> }>>>
    } & {
        [x in `get${normalRef['td']}`]: SubParameterGetter<AD, Extract<Ref, { td: Trim<x, "get"> }>['td']>
    };

type GetManySettersGetters<AD extends LLRPAllTypeDefinitions, Ref extends SubTypeRefDefinition,
    choiceRef extends Exclude<Ref, { td: LLRPParamNames<AD> }> = Exclude<Ref, { td: LLRPParamNames<AD> }>,
    normalRef extends Exclude<Ref, { td: LLRPChoiceNames<AD> }> = Exclude<Ref, { td: LLRPChoiceNames<AD> }>> =
    {
        [x in `add${choiceRef['td']}`]: SubChoiceSetter<AD, GetChoiceRefNames<Extract<choiceRef, { td: Trim<x, "add"> }>>>
    } & {
        [x in `add${normalRef['td']}`]: SubParameterSetter<AD, Extract<Ref, { td: Trim<x, "add"> }>['td']>
    } & {
        [x in `get${choiceRef['td']}`]: SubChoiceManyGetter<AD, GetChoiceRefNames<Extract<choiceRef, { td: Trim<x, "get"> }>>>
    } & {
        [x in `get${normalRef['td']}`]: SubParamManyGetter<AD, Extract<Ref, { td: Trim<x, "get"> }>['td']>
    }

type SubParameterSetter<AD extends LLRPAllTypeDefinitions, N extends keyof AD> = <U>(this: U, p: InstanceType<GetParamClassType<AD, N>>) => U;
type SubParameterGetter<AD extends LLRPAllTypeDefinitions, N extends keyof AD> = <U>(this: U) => InstanceType<GetParamClassType<AD, N>> | null;
type SubChoiceSetter<AD extends LLRPAllTypeDefinitions, N extends keyof AD> = <U>(this: U, p: GetLLRPParameterUnion<AD, N>) => U;
type SubChoiceGetter<AD extends LLRPAllTypeDefinitions, N extends keyof AD> = <U>(this: U) => GetLLRPParameterUnion<AD, N> | null;

type SubParamManyGetter<AD extends LLRPAllTypeDefinitions, N extends keyof AD> = <U>(this: U) => GetLLRPParameterUnion<AD, N> | GetLLRPParameterUnion<AD, N>[];
type SubChoiceManyGetter<AD extends LLRPAllTypeDefinitions, N extends keyof AD> = <U>(this: U) => GetLLRPParameterUnion<AD, N> | GetLLRPParameterUnion<AD, N>[];


type GetLLRPParameterUnion<AD extends LLRPAllTypeDefinitions, N extends keyof AD> = {
    [x in N]: InstanceType<GetParamClassType<AD, Extract<N, x>>>
}[N];

/** Typable message class */

class LLRPMessage extends _LLRPMessage<LLRPUserData> {
    static ofType<
        U extends typeof _LLRPMessage,
        AD extends LLRPAllTypeDefinitions,
        N extends keyof AD,
        TD extends AD[N],
        Data extends GetDataType<AD, TD>>(this: U, Def: AD, td: TD) {
        class LLRPTypedMessage extends _LLRPMessage<Data> {
            static _def = Def;
            constructor(args?: GetMessageCtrArgs<Data>) {
                super({ data: {}, ...args, ...{ type: td['name'] } });
            }
        }
        // Fields
        for (let fd of td.fieldDescriptors) {
            if (fd.type === "reserved") continue;
            LLRPTypedMessage.prototype[`set${fd.name}`] = function <T extends LLRPTypedMessage>(this: T, v: any) {
                this.setField(fd.name, v);
                return this;
            }
            LLRPTypedMessage.prototype[`get${fd.name}`] = function <T extends LLRPTypedMessage>(this: T) {
                return this.getField(fd.name);
            }
        }
        // Sub-parameters
        for (let tRef of td.subTypeRefs) {
            const { td: name, repeat } = tRef;
            if (repeat === "0-1" || repeat === "1") {
                LLRPTypedMessage.prototype[`set${name}`] = function <T extends LLRPTypedMessage>(this: T, p: _LLRPParameter<LLRPUserData>) {
                    this.setSubParameter(name, p);
                    return this;
                }
            } else {
                LLRPTypedMessage.prototype[`add${name}`] = function <T extends LLRPTypedMessage>(this: T, p: _LLRPParameter<LLRPUserData>) {
                    this.addSubParameter(name, p);
                    return this;
                }
            }

            LLRPTypedMessage.prototype[`get${name}`] = function <T extends LLRPTypedMessage>(this: T) {
                const subP = this.getSubParameter(name);
                if (!subP) return null;
                if (Array.isArray(subP)) {
                    return subP// as InstanceType<GetParamClassType<AD, typeof name>>[]
                }
                return subP// as InstanceType<GetParamClassType<AD, typeof name>>;
            }
        }
        return LLRPTypedMessage;
    }
}

/** Typable parameter class */

class LLRPParameter extends _LLRPParameter<LLRPUserData> {
    static ofType<
        U extends typeof _LLRPParameter,
        AD extends LLRPAllTypeDefinitions,
        N extends keyof AD,
        TD extends AD[N],
        Data extends GetDataType<AD, TD>>(this: U, Def: AD, td: TD) {
        class LLRPTypedParameter extends _LLRPParameter<Data> {
            static _def = Def;
            constructor(args?: GetParamCtrArgs<Data>) {
                super({ data: {}, ...args, ...{ type: td['name'] } });
            }
        }
        // Fields
        for (let fd of td.fieldDescriptors) {
            if (fd.type === "reserved") continue;
            LLRPTypedParameter.prototype[`set${fd.name}`] = function <T extends LLRPTypedParameter>(this: T, v: any) {
                return this.setField(fd.name, v);
            }
            LLRPTypedParameter.prototype[`get${fd.name}`] = function <T extends LLRPTypedParameter>(this: T) {
                return this.getField(fd.name);
            }
        }
        // Sub-parameters
        for (let tRef of td.subTypeRefs) {
            const { td: name, repeat } = tRef;
            if (repeat === "0-1" || repeat === "1") {
                LLRPTypedParameter.prototype[`set${name}`] = function <T extends LLRPTypedParameter>(this: T, p: _LLRPParameter<LLRPUserData>) {
                    this.setSubParameter(name, p);
                    return this;
                }
            } else {
                LLRPTypedParameter.prototype[`add${name}`] = function <T extends LLRPTypedParameter>(this: T, p: _LLRPParameter<LLRPUserData>) {
                    this.addSubParameter(name, p);
                    return this;
                }
            }

            LLRPTypedParameter.prototype[`get${name}`] = function <T extends LLRPTypedParameter>(this: T) {
                const subP = this.getSubParameter(name);
                if (!subP) return null;
                if (Array.isArray(subP)) {
                    return subP// as InstanceType<GetParamClassType<AD, typeof name>>[]
                }
                return subP// as InstanceType<GetParamClassType<AD, typeof name>>;
            }
        }
        return LLRPTypedParameter;
    }
}

class LLRPReader<
    AD extends LLRPAllTypeDefinitions,
    N extends LLRPMessageNames<AD> = LLRPMessageNames<AD>,
    L extends LLRPReaderNativeEvents = LLRPReaderNativeEvents,
    MD extends { [x in LLRPMessageNames<AD>]: InstanceType<GetMessageClassType<AD, x>> } = { [x in LLRPMessageNames<AD>]: InstanceType<GetMessageClassType<AD, x>> },
    > extends _LLRPReader {

    on<E extends L>(event: E, listener: (msg: LLRPMessage) => void): this;
    on<E extends N>(event: E, listener: (msg: MD[E]) => void): this;

    on<E extends N | L>(event: E, listener: (msg: any) => void) {
        this._ee.on(event, listener);
        return this;
    }

    off<E extends N | L>(event: E, listener: (msg: E extends L ? LLRPMessage : MD[E]) => void) {
        this._ee.off(event, listener);
        return this;
    }

    once<E extends N | L>(event: E, listener: (msg: E extends L ? LLRPMessage : MD[E]) => void) {
        this._ee.once(event, listener);
        return this;
    }

    removeListener<E extends N | L>(event: E, listener: (msg: E extends L ? LLRPMessage : MD[E]) => void) {
        this._ee.removeListener(event, listener);
        return this;
    }

    removeAllListeners(event?: N | L) {
        this._ee.removeAllListeners(event);
        return this;
    }
}

export function LLRPMessageFactory<AD extends LLRPAllTypeDefinitions>(Def: AD) {
    const results = {} as { [x in LLRPMessageNames<AD>]: GetMessageClassType<AD, x> };
    for (let name in Def) {
        const td = Def[name];
        if (td.isMessage)
            results[name as any] = LLRPMessage.ofType(Def, td);
    }
    return results;
}

export function LLRPParameterFactory<AD extends LLRPAllTypeDefinitions>(Def: AD) {
    const results = {} as { [x in LLRPParamNames<AD>]: GetParamClassType<AD, x> };
    for (let name in Def) {
        const td = Def[name];
        if (!td.isMessage && td.typeNum >= 0)
            results[name as any] = LLRPParameter.ofType(Def, td);
    }
    return results;
}

export function LLRPAllFactory<AD extends LLRPAllTypeDefinitions>(Def: AD) {
    const results = {} as { [x in Exclude<LLRPAllNames<AD>, LLRPChoiceNames<AD>>]: GetClassType<AD, x> };
    for (let name in Def) {
        const td = Def[name];
        if (td.isMessage) {
            results[name as any] = LLRPMessage.ofType(Def, td);
        } else if (td.typeNum >= 0) {
            results[name as any] = LLRPParameter.ofType(Def, td);
        }
    }
    return results;
}

export function LLRPReaderFactory<AD extends LLRPAllTypeDefinitions>(Def: AD) {
    return class LLRPTypedReader extends LLRPReader<AD> {};
}