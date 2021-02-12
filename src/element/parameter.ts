import { LLRPFieldFactory } from "../field/llrp";
import { LLRPUserData } from "../types";
import { LLRPElement } from "./element";


export class LLRPParameter<T extends LLRPUserData> extends LLRPElement {
    // TLV
    protected rsvdType = LLRPFieldFactory({
        name: "RsvdTypeNum",
        type: "u16",
        format: "Normal"
    });
    protected paramLength = LLRPFieldFactory({
        name: "paramLength",
        type: "u16",
        format: "Normal"
    });
    // TV
    protected tvType = LLRPFieldFactory({
        name: "TVType",
        type: "u8",
        format: "Normal"
    });

    get type() { return this.getName() };
    set type(v: this['td']['name']) { this.setType(v); };

    createElement() {
        return new LLRPParameter();
    }

    setTypeByNumber(type: number) {
        let td = this.tr.getParamTypeByTypeNum(type);
        if (!td) throw new Error(`typeNum not found ${type}`);
        this.setTypeDescriptor(td);
        return this;
    }

    setType(type: string) {
        super.setType(type);
        if (this.isTV)
            this.setTVTypeNum(this.getTypeNum());
        else
            this.setTLVTypeNum(this.getTypeNum());
        return this;
    }

    assembleTLVHeader() {
        if (this.header.isEmpty) {
            this.header.push(this.rsvdType);
            this.header.push(this.paramLength);
        }
        return this;
    }

    assembleTVHeader() {
        if (this.header.isEmpty) {
            this.header.push(this.tvType);
        }
        return this;
    }

    assembleHeader() {
        this.header.setStartBit(this.getStartBit())
        if (this.isTV) {
            this.assembleTVHeader();
            this.setTVTypeNum(this.getTypeNum());
        } else {
            this.assembleTLVHeader();
            this.setTLVTypeNum(this.getTypeNum());
        }
        return this;
    }

    assemble() {
        super.assemble();
        if (!this.isTV)
            this.setTLVLength(this.getByteSize());
        return this;
    }

    decodeHeader() {
        this.header.setStartBit(this.getStartBit());

        let typeNum = this.tvType.setBuffer(this.getBuffer())
            .setStartBit(this.getStartBit())
            .decode()
            .getValue();
        if (typeNum & 0x80) {
            // TV
            typeNum &= 0x7f;
            this.setTypeByNumber(typeNum);
            this.assembleTVHeader();
            return this;
        }
        // TLV ? Message ?
        typeNum = this.rsvdType.setBuffer(this.getBuffer())
            .setStartBit(this.getStartBit())
            .decode()
            .getValue();

        this.setTypeByNumber(typeNum & 0x3ff);
        this.assembleTLVHeader();
        this.header.decode();

        this.setBitSize(this.getTLVLength() * 8);
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

    // Parameter tools

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
        return this.paramLength.getValue();
    }

    toLLRPData() {
        this.marshal();
        return this.getData();
    }
}

export interface LLRPParameter<T extends LLRPUserData> {
    LLRPDATATYPE: T;
}