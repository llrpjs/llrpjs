import { LLRPError } from "../base/error";
import { LLRPBuffer } from "../buffer/buffer";
import { LLRPMessageHeader } from "./header";

export class LLRPScanner {
    private llrpBuf: LLRPBuffer;
    private scanner = (new LLRPMessageHeader).build();

    addBuffer(b: Buffer) {
        if (this.llrpBuf) {
            let oldBuf = this.llrpBuf.getBuffer()
            this.llrpBuf.setBuffer(Buffer.concat([oldBuf, b]))
        } else {
            this.llrpBuf = new LLRPBuffer(b);
        }
        return this;
    }

    resetBuffer() {
        this.llrpBuf = null;
        return this;
    }

    getNext() {
        this.scanner.setStartBit(0).setBuffer(this.llrpBuf);
        try {
            this.scanner.decode();
        } catch (e) {
            if (e instanceof LLRPError) {
                if (e.name === "ERR_LLRP_NO_DATA_IN_BUF") return null;
            }
            throw e;
        }

        const version = this.scanner.getVersion();
        if (version != 1) throw new LLRPError("ERR_LLRP_UNSUPPORTED_VERSION",
            `unsupported version - received: ${version}, supported: ${LLRPMessageHeader.version}`);

        const msgLength = this.scanner.getMessageLength();
        if (msgLength < 10) throw new LLRPError("ERR_LLRP_INVALID_LENGTH",
            `invalid message length ${msgLength}`);

        const buffer = this.scanner.getBuffer().getBuffer();
        if (buffer.length < msgLength) return null;
        
        const messageBuf = buffer.slice(0, msgLength);
        this.llrpBuf.setBuffer(buffer.slice(msgLength));
        return messageBuf;
    }
}