import { LLRPMessage as _LLRPMessage } from "../element/message"
import { LLRPBuffer } from "../buffer/buffer";
import { LLRPUserData, LLRPMessageI, Id } from "../types";


export class LLRPProxyMessage<DT extends LLRPUserData = LLRPUserData, N extends string = string> {
    origin: _LLRPMessage<DT, N>;

    constructor(m?: LLRPMessageI<DT, N>);
    constructor(o?: _LLRPMessage<DT, N>);
    constructor(b?: Buffer);

    constructor(args?: LLRPMessageI<DT, N> | _LLRPMessage<DT, N> | Buffer) {
        if (args instanceof Buffer) {
            this.origin = new _LLRPMessage(new LLRPBuffer(args));
        } else if (args instanceof _LLRPMessage) {
            this.origin = args;
        } else {
            this.origin = new _LLRPMessage(args);
        }
    }

    getName() {
        return this.origin.getName() as N;
    }

    getResponseName() {
        return this.origin.responseType?.name || null;
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

    setMessageId(v: number) {
        this.origin.id = v;
        return this;
    }

    getMessageId() {
        return this.origin.id;
    }

    setMessageType(v: N) {
        this.origin.type = v;
        return this;
    }

    getMessageType() {
        return this.origin.type as N;
    }

    setMessageData(v: Id<DT>) {
        this.origin.setData(v);
        return this;
    }

    getMessageData() {
        return this.origin.getData();
    }
}