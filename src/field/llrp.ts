import { CRUMB } from "../types";
import { LLRPField } from "./field";


export class LLRPU1 extends LLRPField<"u1"> {
    fd = {...this.fd, ...{ type: "u1" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeBit(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readBit();
        return this;
    }
}

export class LLRPU2 extends LLRPField<"u2"> {
    fd = {...this.fd, ...{ type: "u2" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeNMsb(this.iValue, 2);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readNMsb(2) as CRUMB;
        return this;
    }
}

export class LLRPU8 extends LLRPField<"u8"> {
    fd = {...this.fd, ...{ type: "u8" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeUInt8(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readUInt8();
        return this;
    }
}

export class LLRPS8 extends LLRPField<"s8"> {
    fd = {...this.fd, ...{ type: "s8" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeInt8(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readInt8();
        return this;
    }
}

export class LLRPU16 extends LLRPField<"u16"> {
    fd = {...this.fd, ...{ type: "u16" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeUInt16(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readUInt16();
        return this;
    }
}

export class LLRPS16 extends LLRPField<"s16"> {
    fd = {...this.fd, ...{ type: "s16" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeInt16(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readInt16();
        return this;
    }
}

export class LLRPU32 extends LLRPField<"u32"> {
    fd = {...this.fd, ...{ type: "u32" }};
    iValue = 0;

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeUInt32(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readUInt32();
        return this;
    }
}

export class LLRPS32 extends LLRPField<"s32"> {
    fd = {...this.fd, ...{ type: "s32" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeInt32(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readInt32();
        return this;
    }
}

export class LLRPU64 extends LLRPField<"u64"> {
    fd = {...this.fd, ...{ type: "u64" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeUInt64(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readUInt64();
        return this;
    }
}

export class LLRPS64 extends LLRPField<"s64"> {
    fd = {...this.fd, ...{ type: "s64" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        this.writeInt64(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.readInt64();
        return this;
    }
}



export class LLRPReserved extends LLRPField<"reserved"> {
    fd = {...this.fd, ...{ type: "reserved" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        for (let i = 0; i < this.byteSize; i++)
            this.writeUInt8(0);

        this.writeNMsb(0, this.bitSize - this.byteSize * 8);
        return this;
    }

    decode(): this {
        super.decode();
        return this;
    }
}



export class LLRPUTF8V extends LLRPField<"utf8v"> {
    fd = {...this.fd, ...{ type: "utf8v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.writeUInt16(n);
        this.writeUTF8(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.readUInt16();
        this.iValue = this.readUTF8(n);
        return this;
    }
}


export class LLRPU96 extends LLRPField<"u96"> {
    fd = {...this.fd, ...{ type: "u96" }};

    constructor() {
        super();
        this.setDefault();
    }

    setValue(v: number[]): this {
        super.setValue(
            Object.values({
                ...Array(12).fill(0),
                ...v.slice(0, 12)
            })
        );
        return this;
    }

    encode(): this {
        super.encode();
        for (let i = 0; i < this.iValue.length; i++) {
            this.writeUInt8(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        for (let i = 0; i < 12; i++) {
            this.iValue[i] = this.readUInt8();
        }
        return this;
    }
}

export class LLRPU1V extends LLRPField<"u1v"> {
    fd = {...this.fd, ...{ type: "u1v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        // 1) write number of bits as 16-bit integer
        this.writeUInt16(this.bitSize);
        // 2) write all bytes first
        for (let i = 0; i < this.iValue.length; i++) {
            this.writeUInt8(this.iValue[i]);
        }
        let bitCount = this.bitSize - this.byteSize * 8;
        // 3) write all succeeding bits
        if (bitCount > 0) {
            let partial = this.iValue[this.byteSize];  // index of the partial is right after the last byte
            this.writeNMsb(partial, bitCount);
        }
        return this;
    }

    decode(): this {
        super.decode();
        // 1) get length (bits)
        this.bitSize = this.readUInt16();
        this.byteSize = this.bitSize >> 3;
        // 2) get all bytes
        for (let i = 0; i < this.byteSize; i++) {
            this.iValue[i] = this.readUInt8();
        }
        // 3) get the trailing partial (if any)
        let bitCount = this.bitSize - this.byteSize * 8;
        if (bitCount) {
            this.iValue.push(this.readNMsb(bitCount));
        }
        return this;
    }
}

export class LLRPU8V extends LLRPField<"u8v"> {
    fd = {...this.fd, ...{ type: "u8v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.writeUInt8(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.readUInt16();
        for (let i = 0; i < n; i++) {
            this.iValue[i] = this.readUInt8();
        }
        return this;
    }
}

export class LLRPS8V extends LLRPField<"s8v"> {
    fd = {...this.fd, ...{ type: "s8v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.writeInt8(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.readUInt16();
        for (let i = 0; i < n; i++) {
            this.iValue[i] = this.readInt8();
        }
        return this;
    }
}

export class LLRPU16V extends LLRPField<"u16v"> {
    fd = {...this.fd, ...{ type: "u16v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.writeUInt16(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.readUInt16();
        for (let i = 0; i < n; i++) {
            this.iValue[i] = this.readUInt16();
        }
        return this;
    }
}

export class LLRPS16V extends LLRPField<"s16v"> {
    fd = {...this.fd, ...{ type: "s16v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.writeInt16(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.readUInt16();
        for (let i = 0; i < n; i++) {
            this.iValue[i] = this.readInt16();
        }
        return this;
    }
}

export class LLRPU32V extends LLRPField<"u32v"> {
    fd = {...this.fd, ...{ type: "u32v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.writeUInt32(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.readUInt16();
        for (let i = 0; i < n; i++) {
            this.iValue[i] = this.readUInt32();
        }
        return this;
    }
}

export class LLRPS32V extends LLRPField<"s32v"> {
    fd = {...this.fd, ...{ type: "s32v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.writeInt32(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.readUInt16();
        for (let i = 0; i < n; i++) {
            this.iValue[i] = this.readInt32();
        }
        return this;
    }
}

export class LLRPU64V extends LLRPField<"u64v"> {
    fd = {...this.fd, ...{ type: "u64v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.writeUInt64(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.readUInt16();
        for (let i = 0; i < n; i++) {
            this.iValue[i] = this.readUInt64();
        }
        return this;
    }
}

export class LLRPS64V extends LLRPField<"s64v"> {
    fd = {...this.fd, ...{ type: "s64v" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.writeInt64(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.readUInt16();
        for (let i = 0; i < n; i++) {
            this.iValue[i] = this.readInt64();
        }
        return this;
    }
}

export class LLRPBytesToEnd extends LLRPField<"bytesToEnd"> {
    fd = {...this.fd, ...{ type: "bytesToEnd" }};

    constructor(...args: any[]) {
        super(...args);
        this.setDefault();
    }

    encode(): this {
        super.encode();
        for (let i = 0; i < this.iValue[i]; i++) {
            this.writeUInt8(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        this.byteSize = this.getBuffer().length - this.startByte;
        for (let i = 0; i < this.byteSize; i++) {
            this.iValue[i] = this.readUInt8();
        }
        return this;
    }
}

