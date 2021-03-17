import { LLRPBuffer } from "./buffer/buffer";
import { LLRPMessage as _LLRPMessage, LLRPMessageI } from "./element/message";
import { LLRPUserData } from "./types";

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
