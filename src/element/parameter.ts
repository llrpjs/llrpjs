import { LLRPError } from "../base/error";
import { LLRP_TD_RSVD_TYPENUM, LLRP_TD_TV_TYPENUM } from "../const-td";
import { LLRPFieldFactory } from "../field/llrp";
import { LLRPUserData } from "../types";
import { LLRPElement } from "./element";
import { LLRPParameterHeader } from "./header";


export class LLRPParameter<T extends LLRPUserData> extends LLRPElement {
    header = new LLRPParameterHeader;

    get type() { return this.getName() };
    set type(v: this['td']['name']) { this.setType(v); };

    createElement() {
        return new LLRPParameter();
    }

    setTypeByNumber(type: number) {
        let td = this.tr.getParamTypeByTypeNum(type);
        if (!td) throw new LLRPError("ERR_LLRP_BAD_TYPENUM", `typeNum not found ${type}`);
        this.setTypeDescriptor(td);
        return this;
    }

    setType(type: string) {
        super.setType(type);
        if (this.isTV)
            this.header.setTVTypeNum(this.getTypeNum());
        else
            this.header.setTLVTypeNum(this.getTypeNum());
        return this;
    }

    assembleHeader() {
        super.assembleHeader();
        if (this.isTV) {
            this.header.buildTV();
            this.header.setTVTypeNum(this.getTypeNum());
        } else {
            this.header.buildTLV();
            this.header.setTLVTypeNum(this.getTypeNum());
        }
        return this;
    }

    assemble() {
        super.assemble();
        if (!this.isTV)
            this.header.setTLVLength(this.getByteSize());
        return this;
    }

    decodeHeader() {
        this.header.setStartBit(this.getStartBit());
        let typeNum = LLRPFieldFactory(LLRP_TD_TV_TYPENUM).setBuffer(this.getBuffer())
            .setStartBit(this.getStartBit())
            .decode()
            .getValue() as number;
        if (typeNum & 0x80) {
            // TV
            typeNum &= 0x7f;
            this.setTypeByNumber(typeNum);
            this.header.buildTV();
            return this;
        }
        // TLV ? Message ?
        typeNum = LLRPFieldFactory(LLRP_TD_RSVD_TYPENUM).setBuffer(this.getBuffer())
            .setStartBit(this.getStartBit())
            .decode()
            .getValue() as number;

        this.setTypeByNumber(typeNum & 0x3ff);
        this.header.buildTLV();
        this.header.decode();

        const length = this.header.getTLVLength();
        if (length < 4) throw new LLRPError("ERR_LLRP_INVALID_LENGTH",
            `invalid parameter length ${length}`);

        this.setBitSize(length * 8);
        return this;
    }

    decodeFields() {
        super.decodeFields();
        if (this.isTV) {
            let fieldSize = this.fieldList.getBitSize();
            this.setBitSize(this.header.getBitSize() + fieldSize);
        }
        return this;
    }

    toLLRPData() {
        this.marshal();
        return this.getData();
    }
}

export interface LLRPParameter<T extends LLRPUserData> {
    LLRPDATATYPE: T;
}