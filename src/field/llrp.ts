import { CRUMB, FieldDescriptor, LLRPFieldType } from "../types";
import { LLRPField } from "./field";

// TODO: add buffer availability assertion before read/write ops

class LLRPU1 extends LLRPField<"u1"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u1");
    }

    encode(): this {
        super.encode();
        this.buffer.writeBit(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readBit();
        return this;
    }
}

class LLRPU2 extends LLRPField<"u2"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u2");
    }

    encode(): this {
        super.encode();
        this.buffer.writeNMsb(this.iValue, 2);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readNMsb(2) as CRUMB;
        return this;
    }
}

class LLRPU8 extends LLRPField<"u8"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u8");
    }

    encode(): this {
        super.encode();
        this.buffer.writeUInt8(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readUInt8();
        return this;
    }
}

class LLRPS8 extends LLRPField<"s8"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("s8");
    }

    encode(): this {
        super.encode();
        this.buffer.writeInt8(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readInt8();
        return this;
    }
}

class LLRPU16 extends LLRPField<"u16"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u16");
    }

    encode(): this {
        super.encode();
        this.buffer.writeUInt16(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readUInt16();
        return this;
    }
}

class LLRPS16 extends LLRPField<"s16"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("s16");
    }

    encode(): this {
        super.encode();
        this.buffer.writeInt16(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readInt16();
        return this;
    }
}

class LLRPU32 extends LLRPField<"u32"> {
    iValue = 0;

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u32");
    }

    encode(): this {
        super.encode();
        this.buffer.writeUInt32(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readUInt32();
        return this;
    }
}

class LLRPS32 extends LLRPField<"s32"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("s32");
    }

    encode(): this {
        super.encode();
        this.buffer.writeInt32(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readInt32();
        return this;
    }
}

class LLRPU64 extends LLRPField<"u64"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u64");
    }

    encode(): this {
        super.encode();
        this.buffer.writeUInt64(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readUInt64();
        return this;
    }
}

class LLRPS64 extends LLRPField<"s64"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("s64");
    }

    encode(): this {
        super.encode();
        this.buffer.writeInt64(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        this.iValue = this.buffer.readInt64();
        return this;
    }
}



class LLRPReserved extends LLRPField<"reserved"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("reserved");
    }

    encode(): this {
        super.encode();
        for (let i = 0; i < this.getByteSize(); i++)
            this.buffer.writeUInt8(0);

        this.buffer.writeBits(0, this.getBitSize() - this.getByteSize() * 8);
        return this;
    }

    decode(): this {
        super.decode();
        for (let i = 0; i < this.getByteSize(); i++)
            this.buffer.readUInt8();

        this.buffer.readBits(this.getBitSize() - this.getByteSize() * 8);
        return this;
    }
}



class LLRPUTF8V extends LLRPField<"utf8v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("utf8v");
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.buffer.writeUInt16(n);
        this.buffer.writeUTF8(this.iValue);
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.buffer.readUInt16();
        this.iValue = this.buffer.readUTF8(n);
        return this;
    }
}


class LLRPU96 extends LLRPField<"u96"> {

    constructor() {
        super();
        this.setDefault("u96");
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
            this.buffer.writeUInt8(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        for (let i = 0; i < 12; i++) {
            this.iValue[i] = this.buffer.readUInt8();
        }
        return this;
    }
}

class LLRPU1V extends LLRPField<"u1v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u1v");
    }

    encode(): this {
        super.encode();
        // 1) write number of bits as 16-bit integer
        this.buffer.writeUInt16(this.getBitSize());
        // 2) write all bytes first
        for (let i = 0; i < this.iValue.length; i++) {
            this.buffer.writeUInt8(this.iValue[i]);
        }
        let bitCount = this.getBitSize() - this.getByteSize() * 8;
        // 3) write all succeeding bits
        if (bitCount > 0) {
            let partial = this.iValue[this.getByteSize()];  // index of the partial is right after the last byte
            this.buffer.writeNMsb(partial, bitCount);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let result = [];
        // 1) get length (bits)
        let bitSize = this.buffer.readUInt16();
        let byteSize = bitSize >> 3;
        // 2) get all bytes
        for (let i = 0; i < byteSize; i++) {
            result.push(this.buffer.readUInt8());
        }
        // 3) get the trailing partial (if any)
        let bitCount = bitSize - byteSize * 8;
        if (bitCount) {
            result.push(this.buffer.readNMsb(bitCount));
        }
        this.setValue(result);
        return this;
    }
}

class LLRPU8V extends LLRPField<"u8v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u8v");
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.buffer.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.buffer.writeUInt8(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.buffer.readUInt16();
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.buffer.readUInt8());
        }
        this.setValue(result);
        return this;
    }
}

class LLRPS8V extends LLRPField<"s8v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("s8v");
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.buffer.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.buffer.writeInt8(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.buffer.readUInt16();
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.buffer.readInt8());
        }
        this.setValue(result);
        return this;
    }
}

class LLRPU16V extends LLRPField<"u16v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u16v");
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.buffer.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.buffer.writeUInt16(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.buffer.readUInt16();
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.buffer.readUInt16());
        }
        this.setValue(result);
        return this;
    }
}

class LLRPS16V extends LLRPField<"s16v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("s16v");
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.buffer.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.buffer.writeInt16(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.buffer.readUInt16();
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.buffer.readInt16());
        }
        this.setValue(result);
        return this;
    }
}

class LLRPU32V extends LLRPField<"u32v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u32v");
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.buffer.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.buffer.writeUInt32(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.buffer.readUInt16();
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.buffer.readUInt32());
        }
        this.setValue(result);
        return this;
    }
}

class LLRPS32V extends LLRPField<"s32v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("s32v");
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.buffer.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.buffer.writeInt32(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.buffer.readUInt16();
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.buffer.readInt32());
        }
        this.setValue(result);
        return this;
    }
}

class LLRPU64V extends LLRPField<"u64v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("u64v");
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.buffer.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.buffer.writeUInt64(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.buffer.readUInt16();
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.buffer.readUInt64());
        }
        this.setValue(result);
        return this;
    }
}

class LLRPS64V extends LLRPField<"s64v"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("s64v");
    }

    encode(): this {
        super.encode();
        let n = this.iValue.length;
        this.buffer.writeUInt16(n);
        for (let i = 0; i < n; i++) {
            this.buffer.writeInt64(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let n = this.buffer.readUInt16();
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(this.buffer.readInt64());
        }
        this.setValue(result);
        return this;
    }
}

class LLRPBytesToEnd extends LLRPField<"bytesToEnd"> {

    constructor(...args: any[]) {
        super(...args);
        this.setDefault("bytesToEnd");
    }

    encode(): this {
        super.encode();
        for (let i = 0; i < this.iValue.length; i++) {
            this.buffer.writeUInt8(this.iValue[i]);
        }
        return this;
    }

    decode(): this {
        super.decode();
        let result = [];
        while (this.buffer.hasData) {
            result.push(this.buffer.readUInt8());
        }
        this.setValue(result);
        return this;
    }
}

const Classes = {
    "u1": LLRPU1,
    "u2": LLRPU2,
    "u8": LLRPU8,
    "s8": LLRPS8,
    "u16": LLRPU16,
    "s16": LLRPS16,
    "u32": LLRPU32,
    "s32": LLRPS32,
    "u64": LLRPU64,
    "s64": LLRPS64,
    "u96": LLRPU96,
    "u1v": LLRPU1V,
    "u8v": LLRPU8V,
    "s8v": LLRPS8V,
    "u16v": LLRPU16V,
    "s16v": LLRPS16V,
    "u32v": LLRPU32V,
    "s32v": LLRPS32V,
    "u64v": LLRPU64V,
    "s64v": LLRPS64V,
    "utf8v": LLRPUTF8V,
    "bytesToEnd": LLRPBytesToEnd,
    "reserved": LLRPReserved
} as const;

export function LLRPFieldFactory<FT extends LLRPFieldType>(fd: FieldDescriptor<FT>, props?: Partial<InstanceType<typeof Classes[FT]>>) {
    const FieldClass = Classes[fd.type];
    let f = FieldClass.new(props) as LLRPField<FT>;
    return f.setDescriptor(fd);
}
