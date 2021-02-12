import { LLRPMessage as _LLRPMessage, LLRPMessageI } from "./element/message";
import { LLRPUserData } from "./types";

export class LLRPMessage {
    origin: _LLRPMessage<LLRPUserData>;

    constructor(args?: LLRPMessageI | Buffer) {
        if (args) {
            this.origin = new _LLRPMessage(args);
        }
    }

    setMessageId(v: number) {
        this.origin.setMessageId(v);
        return this;
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
