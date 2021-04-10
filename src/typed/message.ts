
/** Typed/proxy message class */
import { AnyConstructor } from "../bryntum/chronograph/Mixin";
import { LLRPParameter as _LLRPParameter } from "../element/parameter";
import { LLRPMessage as _LLRPMessage } from "../element/message";
import { LLRPProxyParameter } from "../proxy/parameter";
import { LLRPTypedParameter } from "./parameter";
import { LLRPClassRegistry } from "../registry/class-registry";
import { LLRPProxyMessage } from "../proxy/message";
import { LLRPAllTypeDefinitions, LLRPMessageNames, GetDataType, GetDefFromRef, GetSubTypeRefs, LLRPParamNames, GetDataTypeFromFD, LLRPUserData, GetParamClassType, LLRPMessageI, GetTypedMessageCtrArgs, GetMessageClassType } from "../types";


export class LLRPTypedMessage<
    AD extends LLRPAllTypeDefinitions,
    N extends LLRPMessageNames<AD> = LLRPMessageNames<AD>,
    TD extends AD[N] = AD[N],
    DT extends GetDataType<AD, TD> = GetDataType<AD, TD>,
    RefTD extends GetDefFromRef<AD, GetSubTypeRefs<TD>> = GetDefFromRef<AD, GetSubTypeRefs<TD>>,
    RefChoices extends GetSubTypeRefs<TD>['choices'][number] = GetSubTypeRefs<TD>['choices'][number],
    RefNames extends LLRPParamNames<AD, RefTD['name'] | RefChoices> = LLRPParamNames<AD, RefTD['name'] | RefChoices>
    > extends LLRPProxyMessage<DT, N> {
    Def: AD;
    CR = LLRPClassRegistry.getInstance();

    static ofDef<AD extends LLRPAllTypeDefinitions>(Def: AD) {
        return class LLRPTypedMessage extends this<AD> {
            Def = Def;
            CR = LLRPClassRegistry.getInstance(Def);
        };
    }

    static ofType<
        AD extends LLRPAllTypeDefinitions,
        N extends LLRPMessageNames<AD>,
        TD extends AD[N] = AD[N],
        DT extends GetDataType<AD, TD> = GetDataType<AD, TD>,
        >(Def: AD, Name?: N) {

        class _LLRPTypedMessage extends this<AD, N, TD, DT> {
            static _def = Def;

            constructor(args?: GetTypedMessageCtrArgs<LLRPMessageI<DT, N>> | _LLRPMessage<DT, N> | Buffer) {
                if (args instanceof _LLRPMessage || args instanceof Buffer) {
                    super(args as any);
                } else {
                    super({ data: {}, ...args, ...{ type: Name } });
                }
            }
        }

        const td = Def[Name];
        // Fields
        for (let fd of td.fieldDescriptors) {
            if (fd.type === "reserved") continue;
            _LLRPTypedMessage.prototype[`set${fd.name}`] = function <T extends _LLRPTypedMessage>(this: T, v: any) {
                this.setField(fd.name, v);
                return this;
            }
            _LLRPTypedMessage.prototype[`get${fd.name}`] = function <T extends _LLRPTypedMessage>(this: T) {
                return this.getField(fd.name);
            }
        }
        // Sub-parameters
        for (let tRef of td.subTypeRefs) {
            const { td: name, repeat } = tRef;
            if (repeat === "0-1" || repeat === "1") {
                _LLRPTypedMessage.prototype[`set${name}`] = function <T extends _LLRPTypedMessage>(this: T, p: LLRPProxyParameter) {
                    this.setSubParameter(name as any, p);
                    return this;
                }
            } else {
                _LLRPTypedMessage.prototype[`add${name}`] = function <T extends _LLRPTypedMessage>(this: T, p: LLRPProxyParameter) {
                    this.addSubParameter(name as any, p);
                    return this;
                }
            }
            _LLRPTypedMessage.prototype[`get${name}`] = function <T extends _LLRPTypedMessage>(this: T) {
                const subP = this.getSubParameter(name as any);
                if (!subP) return null;
                if (Array.isArray(subP)) {
                    return subP
                }
                return subP
            }
        }
        return _LLRPTypedMessage as GetMessageClassType<
                AnyConstructor<LLRPTypedMessage<AD, N, TD, DT>>,
                AnyConstructor<LLRPProxyParameter>,
            AD, N, TD, DT>;
    }

    get hasResponse() {
        return !!this.origin.responseType;
    }

    getName() {
        return super.getName() as N;
    }

    getResponseName(): TD['responseType'] {
        return super.getResponseName();
    }

    setField<
        FN extends TD['fieldDescriptors'][number]['name'],
        FD extends Extract<TD['fieldDescriptors'][number], { name: FN }>,
        DT extends GetDataTypeFromFD<FD>[FN]
    >(name: FN, v: DT) {
        this.origin.setField(name, v);
        return this;
    }

    getField<
        FN extends TD['fieldDescriptors'][number]['name'],
        FD extends Extract<TD['fieldDescriptors'][number], { name: FN }>,
        DT extends GetDataTypeFromFD<FD>[FN]
    >(name: FN) {
        return this.origin.getField(name) as DT;
    }

    addSubParameter<
        subName extends RefNames,
        ParamClass extends GetParamClassType<AnyConstructor<LLRPProxyParameter<LLRPUserData>>, AD, subName>
    >(name: subName, p: InstanceType<ParamClass>) {
        this.origin.addSubElement(name, p.origin);
        return this;
    }

    setSubParameter<
        subName extends RefNames,
        ParamClass extends GetParamClassType<AnyConstructor<LLRPProxyParameter<LLRPUserData>>, AD, subName>
    >(name: subName, p: InstanceType<ParamClass>) {
        this.origin.setSubElement(name, p.origin);
        return this;
    }

    getSubParameter<
        subName extends RefNames,
        ParamClass extends GetParamClassType<AnyConstructor<LLRPProxyParameter<LLRPUserData>>, AD, subName>
    >(name: subName) {
        // this is to allow typed returns
        let TypedClass = this.CR.getCoreParameterClass(name) as AnyConstructor<LLRPTypedParameter<AD, subName>>;
        if (!TypedClass) {
            TypedClass = LLRPProxyParameter as any;
        }

        const originP = this.origin.getSubElement(name) as _LLRPParameter<LLRPUserData> | _LLRPParameter<LLRPUserData>[];
        if (!originP) return null;
        // wrap it
        if (Array.isArray(originP)) {
            return originP.map(p => new TypedClass(p) as InstanceType<ParamClass>);
        }
        return new TypedClass(originP) as InstanceType<ParamClass>;
    }

    setMessageType<n extends N>(v: n) {
        return super.setMessageType(v);
    }
}
