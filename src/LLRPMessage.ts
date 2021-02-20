import { LLRPMessage as _LLRPMessage, LLRPMessageI } from "./element/message";
import { LLRPUserData } from "./types";

export class LLRPMessage<T extends LLRPUserData> {
    origin: _LLRPMessage<T>;

    constructor(args?: LLRPMessageI | Buffer) {
        if (args) {
            this.origin = new _LLRPMessage(args);
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
        this.origin.decode().marshal();
        return this;
    }

    toLLRPData() {
        return this.origin.toLLRPData() as this['origin']['LLRPMESSAGETYPE'];
    }

    getBuffer() {
        return this.origin.getBuffer().getBuffer();
    }
}
