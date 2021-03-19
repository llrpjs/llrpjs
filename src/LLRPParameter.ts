import { LLRPBuffer } from "./buffer/buffer";
import { LLRPParameter as _LLRPParameter, LLRPParameterI } from "./element/parameter";
import { LLRPDataValue, LLRPUserData } from "./types";

export class LLRPParameter<T extends LLRPUserData> {
    origin: _LLRPParameter<T>;

    constructor(p?: LLRPParameterI<T>);
    constructor(b?: Buffer);
    constructor(o?: _LLRPParameter<T>);

    constructor(_?: LLRPParameterI<T> | Buffer | _LLRPParameter<T>) {
        if (_) {
            if (_ instanceof Buffer)
                this.origin = new _LLRPParameter(new LLRPBuffer(_));
            else if (_ instanceof _LLRPParameter) {
                this.origin = _;
            } else
                this.origin = new _LLRPParameter(_);
        }
    }

    setField(name: string, v: LLRPDataValue) {
        return this.origin.setField(name, v);
    }

    getField(name: string) {
        return this.origin.getField(name);
    }

    addSubParameter(name: string, p: LLRPParameter<LLRPUserData>) {
        this.origin.addSubElement(name, p.origin);
        return this;
    }

    setSubParameter(name: string, p: LLRPParameter<LLRPUserData>) {
        this.origin.setSubElement(name, p.origin);
        return this;
    }

    getSubParameter(name: string) {
        const originP = this.origin.getSubElement(name) as _LLRPParameter<LLRPUserData> | _LLRPParameter<LLRPUserData>[];
        if (!originP) return null;
        // wrap it
        if (Array.isArray(originP)) {
            return originP.map(p => new LLRPParameter(p));
        }
        return new LLRPParameter(originP);
    }

    setParamType(v: string) {
        this.origin.type = v;
        return this;
    }

    getParamType() {
        return this.origin.type;
    }

    setParamData(v: T) {
        this.origin.setData(v);
        return this;
    }

    getParamData() {
        return this.origin.getData();
    }

    encode() {
        this.origin.assemble().encode();
        return this;
    }

    decode() {
        this.origin.decode().marshal();
        return this;
    }

    toLLRPData() {
        return this.origin.toLLRPData();
    }

    getBuffer() {
        return this.origin.getBuffer().getBuffer();
    }
}