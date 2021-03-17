import { LLRPBuffer } from "./buffer/buffer";
import { LLRPParameter as _LLRPParameter, LLRPParameterI } from "./element/parameter";
import { LLRPDataValue, LLRPUserData } from "./types";

export class LLRPParameter<T extends LLRPUserData> {
    origin: _LLRPParameter<T>;

    constructor(m?: LLRPParameterI<T>);
    constructor(b?: Buffer);

    constructor(_?: LLRPParameterI<T> | Buffer) {
        if (_) {
            if (_ instanceof Buffer)
                this.origin = new _LLRPParameter(new LLRPBuffer(_));
            else
                this.origin = new _LLRPParameter(_);
        }
    }

    setField(name: string, v: LLRPDataValue) {
        return this.origin.setField(name, v);
    }

    getField(name: string) {
        return this.origin.getField(name);
    }

    addSubParameter(p: LLRPParameter<LLRPUserData>) {
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
}