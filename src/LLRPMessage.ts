import { LLRPBuffer } from "./buffer/buffer";
import { LLRPMessage as _LLRPMessage, LLRPMessageI } from "./element/message";
import { LLRPParameter as _LLRPParameter } from "./element/parameter";
import { LLRPParameter } from "./LLRPParameter";
import { LLRPDataValue, LLRPUserData } from "./types";

export class LLRPMessage<T extends LLRPUserData> {
    origin: _LLRPMessage<T>;

    constructor(m?: LLRPMessageI<T>);
    constructor(b?: Buffer);

    constructor(_?: LLRPMessageI<T> | Buffer) {
        if (_) {
            if (_ instanceof Buffer)
                this.origin = new _LLRPMessage(new LLRPBuffer(_));
            else
                this.origin = new _LLRPMessage(_);
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

    setMessageId(v: number) {
        this.origin.id = v;
        return this;
    }

    getMessageId() {
        return this.origin.id;
    }

    setMessageType(v: string) {
        this.origin.type = v;
        return this;
    }

    getMessageType() {
        return this.origin.type;
    }

    setMessageData(v: T) {
        this.origin.setData(v);
        return this;
    }

    getMessageData() {
        return this.origin.getData();
    }

    encode() {
        this.origin.assemble().encode();
        return this;
    }

    decode() {
        this.origin.decode().marshal(); // convert buffer to elements (TODO: this needs to be optimized to decode and marshal in one shot)
        return this;
    }

    toLLRPData() {
        return this.origin.toLLRPData();
    }

    getBuffer() {
        return this.origin.getBuffer().getBuffer();
    }
}
