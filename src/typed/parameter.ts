import { AnyConstructor } from "../bryntum/chronograph/Mixin";
import { LLRPParameter as _LLRPParameter } from "../element/parameter";
import { LLRPProxyParameter } from "../proxy/parameter";
import { LLRPClassRegistry } from "../registry/class-registry";
import { GetDataType, GetDataTypeFromFD, GetDefFromRef, GetParamClassType, GetSubTypeRefs, GetTypedParamCtrArgs, Id, LLRPAllTypeDefinitions, LLRPParameterI, LLRPParamNames, LLRPUserData } from "../types";


export class LLRPTypedParameter<
    AD extends LLRPAllTypeDefinitions,
    N extends LLRPParamNames<AD> = LLRPParamNames<AD>,
    TD extends AD[N] = AD[N],
    DT extends GetDataType<AD, TD> = GetDataType<AD, TD>,
    RefTD extends GetDefFromRef<AD, GetSubTypeRefs<TD>> = GetDefFromRef<AD, GetSubTypeRefs<TD>>,
    RefChoices extends GetSubTypeRefs<TD>['choices'][number] = GetSubTypeRefs<TD>['choices'][number],
    RefNames extends LLRPParamNames<AD, RefTD['name'] | RefChoices> = LLRPParamNames<AD, RefTD['name'] | RefChoices>
    > extends LLRPProxyParameter<DT, N> {

    Def: AD;
    CR = LLRPClassRegistry.getInstance();

    static ofDef<AD extends LLRPAllTypeDefinitions>(Def: AD) {
        return class LLRPTypedParameter extends this<AD> {
            Def = Def;
            CR = LLRPClassRegistry.getInstance(Def);
        };
    }

    static ofType<
        AD extends LLRPAllTypeDefinitions,
        N extends LLRPParamNames<AD>,
        TD extends AD[N] = AD[N],
        DT extends GetDataType<AD, TD> = GetDataType<AD, TD>,
        >(Def: AD, Name?: N) {

        class _LLRPTypedParameter extends this<AD, N, TD, DT> {
            static _def = Def;

            constructor(args?: GetTypedParamCtrArgs<LLRPParameterI<DT, N>> | _LLRPParameter<DT, N> | Buffer) {
                if (args instanceof _LLRPParameter || args instanceof Buffer) {
                    super(args as any);
                } else
                    super({ data: {}, ...args, ...{ type: Name } });
            }
        }

        const td = Def[Name];
        // Fields
        for (let fd of td.fieldDescriptors) {
            if (fd.type === "reserved") continue;
            _LLRPTypedParameter.prototype[`set${fd.name}`] = function <T extends _LLRPTypedParameter>(this: T, v: any) {
                this.setField(fd.name, v);
                return this;
            }
            _LLRPTypedParameter.prototype[`get${fd.name}`] = function <T extends _LLRPTypedParameter>(this: T) {
                return this.getField(fd.name);
            }
        }
        // Sub-parameters
        for (let tRef of td.subTypeRefs) {
            const { td: name, repeat } = tRef;
            if (repeat === "0-1" || repeat === "1") {
                _LLRPTypedParameter.prototype[`set${name}`] = function <T extends _LLRPTypedParameter>(this: T, p: LLRPProxyParameter<LLRPUserData>) {
                    this.setSubParameter(name as any, p)
                    return this;
                }
            } else {
                _LLRPTypedParameter.prototype[`add${name}`] = function <T extends _LLRPTypedParameter>(this: T, p: LLRPProxyParameter<LLRPUserData>) {
                    this.addSubParameter(name as any, p);
                    return this;
                }
            }
            _LLRPTypedParameter.prototype[`get${name}`] = function <T extends _LLRPTypedParameter>(this: T) {
                const subP = this.getSubParameter(name as any);
                if (!subP) return null;
                if (Array.isArray(subP)) {
                    return subP;
                }
                return subP;
            }
        }
        return _LLRPTypedParameter as GetParamClassType<AnyConstructor<LLRPTypedParameter<AD, N, TD, DT>>, AD, N, TD, DT>;
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
        const originP = this.origin.getSubElement(name) as _LLRPParameter<LLRPUserData> | _LLRPParameter<LLRPUserData>[];
        if (!originP) return null;
        // wrap it
        if (Array.isArray(originP)) {
            return originP.map(p => {
                let TypedClass = this.CR.getCoreParameterClass(p.getName() as subName) as AnyConstructor<LLRPTypedParameter<AD, subName>>;
                if (!TypedClass) {
                    TypedClass = LLRPProxyParameter as any;
                }
                return new TypedClass(originP) as InstanceType<ParamClass>;
            });
        }
        let TypedClass = this.CR.getCoreParameterClass(originP.getName() as subName) as AnyConstructor<LLRPTypedParameter<AD, subName>>;
        if (!TypedClass) {
            TypedClass = LLRPProxyParameter as any;
        }
        return new TypedClass(originP) as InstanceType<ParamClass>;
    }

    setParamType<n extends N>(v: n) {
        this.origin.type = v;
        return <unknown>this as LLRPTypedParameter<AD, n>;
    }

    getParamType() {
        return this.origin.type as N;
    }

    setParamData(v: Id<DT>) {
        this.origin.setData(v);
        return this;
    }

    getParamData() {
        return this.origin.getData();
    }

}

