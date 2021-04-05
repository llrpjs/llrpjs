import { AnyConstructor } from "../bryntum/chronograph/Mixin";
import { LLRPProxyMessage } from "../proxy/message";
import { LLRPProxyParameter } from "../proxy/parameter";
import { LLRPTypedMessage } from "../typed/message";
import { LLRPTypedParameter } from "../typed/parameter";
import { GetAllTypedMessageClasses, GetAllTypedParamClasses, LLRPAllTypeDefinitions, LLRPMessageNames, LLRPParamNames } from "../types";

export class LLRPClassRegistry<
    AD extends LLRPAllTypeDefinitions,
    MN extends LLRPMessageNames<AD> = LLRPMessageNames<AD>,
    PN extends LLRPParamNames<AD> = LLRPParamNames<AD>
    > {
    private static instance: LLRPClassRegistry<LLRPAllTypeDefinitions>;

    private CoreDef: AD;
    private CoreMessageClasses: GetAllTypedMessageClasses<AnyConstructor<LLRPProxyMessage>, AnyConstructor<LLRPProxyParameter>, AD> = {} as any;
    private CoreParamClasses: GetAllTypedParamClasses<AnyConstructor<LLRPProxyParameter>, AD> = {} as any;

    private constructor() { }

    static getInstance<
        AD extends LLRPAllTypeDefinitions,
        MN extends LLRPMessageNames<AD> = LLRPMessageNames<AD>,
        PN extends LLRPParamNames<AD> = LLRPParamNames<AD>
    >(def?: AD, name?: MN | PN) {
        if (!this.instance) {
            this.instance = new this<AD, MN, PN>();
        }
        return this.instance as LLRPClassRegistry<AD, MN, PN>;
    }

    reset() {
        this.CoreMessageClasses = {} as any;
        this.CoreParamClasses = {} as any;
        return this;
    }

    enrollCoreDefinitions(Def: AD) {
        this.CoreDef = Def;
        return this;
    }

    build() {
        for (let name in this.CoreDef) {
            const td = this.CoreDef[name];
            if (td.isMessage)
                this.CoreMessageClasses[name as any] = LLRPTypedMessage.ofType(this.CoreDef, name);
            else if (!td.isMessage && td.typeNum >= 0)
                this.CoreParamClasses[name as any] = LLRPTypedParameter.ofType(this.CoreDef, name);
        }
        return this;
    }

    getCoreMessageClasses() {
        return this.CoreMessageClasses;
    }

    getCoreParamClasses() {
        return this.CoreParamClasses;
    }

    getCoreMessageClass<N extends MN>(name: N) {
        return this.CoreMessageClasses[name];
    }

    getCoreParameterClass<N extends PN>(name: N) {
        return this.CoreParamClasses[name];
    }
}