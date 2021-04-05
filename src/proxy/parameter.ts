import { LLRPParameter } from "../element/parameter";
import { LLRPBuffer } from "../buffer/buffer";
import { LLRPUserData, LLRPParameterI } from "../types";


export class LLRPProxyParameter<DT extends LLRPUserData = LLRPUserData, N extends string = string> {
    origin: LLRPParameter<DT, N>;

    constructor(p?: LLRPParameterI<DT, N>);
    constructor(o?: LLRPParameter<DT, N>);
    constructor(b?: Buffer);

    constructor(args?: LLRPParameterI<DT, N> | LLRPParameter<DT, N> | Buffer) {
        if (args instanceof Buffer) {
            this.origin = new LLRPParameter(new LLRPBuffer(args));
        } else if (args instanceof LLRPParameter) {
            this.origin = args;
        } else {
            this.origin = new LLRPParameter(args);
        }
    }

    getName() {
        return this.origin.getName() as N;
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