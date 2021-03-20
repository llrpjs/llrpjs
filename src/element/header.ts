import { LLRP_TD_RSVD_VERSION_TYPENUM, LLRP_TD_MESSAGE_LENGTH, LLRP_TD_MESSAGE_ID, LLRP_TD_PARAM_LENGTH, LLRP_TD_RSVD_TYPENUM, LLRP_TD_TV_TYPENUM } from "./header-fd";
import { LLRPFieldList } from "../field/list";
import { LLRPFieldFactory } from "../field/llrp";

export class LLRPMessageHeader extends LLRPFieldList {
    static readonly version: 1 = 1;
    protected rsvdVersionType = LLRPFieldFactory(LLRP_TD_RSVD_VERSION_TYPENUM);
    protected messageLength = LLRPFieldFactory(LLRP_TD_MESSAGE_LENGTH);
    protected messageId = LLRPFieldFactory(LLRP_TD_MESSAGE_ID);

    build() {
        if (!this.isEmpty) this.clear();
        this.push(this.rsvdVersionType);
        this.push(this.messageLength.setStartBit(this.rsvdVersionType.getBitSize()));
        this.push(this.messageId.setStartBit(this.messageLength.getBitSize()));
        return this;
    }

    setMessageLength(length: number) {
        this.messageLength.setValue(length);
        return this;
    }

    getMessageLength() {
        return this.messageLength.getValue() as number;
    }

    setMessageTypeNum(typeNum: number) {
        this.rsvdVersionType.setValue((LLRPMessageHeader.version << 10) + typeNum);
        return this;
    }

    getMessageTypeNum() {
        return <number>this.rsvdVersionType.getValue() & 0x3ff;
    }

    setMessageId(id: number) {
        this.messageId.setValue(id);
        return this;
    }

    getMessageId() {
        return this.messageId.getValue();
    }

    getVersion() {
        return (<number>this.rsvdVersionType.getValue() & 0x1c00) >>> 10;
    }
}

export class LLRPParameterHeader extends LLRPFieldList {
    // TLV
    protected rsvdType = LLRPFieldFactory(LLRP_TD_RSVD_TYPENUM);
    protected paramLength = LLRPFieldFactory(LLRP_TD_PARAM_LENGTH);
    // TV
    protected tvType = LLRPFieldFactory(LLRP_TD_TV_TYPENUM);

    buildTLV() {
        if (!this.isEmpty) this.clear();
        this.push(this.rsvdType);
        this.push(this.paramLength);
        return this;
    }

    buildTV() {
        if (!this.isEmpty) this.clear();
        this.push(this.tvType);
        return this;
    }

    setTVTypeNum(v: number) {
        this.tvType.setValue(0x80 | v);
        return this;
    }

    setTLVTypeNum(v: number) {
        this.rsvdType.setValue(v & 0x3ff);
        return this;
    }

    setTLVLength(v: number) {
        this.paramLength.setValue(v);
        return this;
    }

    getTLVLength() {
        return <number>this.paramLength.getValue();
    }
}