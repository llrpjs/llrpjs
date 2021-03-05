/** Buffer ops */
export class BitOps {
    protected buffer: Buffer;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }
    /** big-endian bit ops */
    readBit(offset: number = 0, bit: number = 0): number {
        return (this.buffer[offset] >> (7 - (bit & 7))) & 1;
    }

    writeBit(value: number, offset: number = 0, bit: number = 0): number {
        value = value ? 1 : 0;
        if (this.readBit(offset, bit) === value)
            return 0;
        this.buffer[offset] ^= 1 << (7 - (bit & 7));
        return 1;
    }

    readBits(offset: number, bit: number, n: number) {
        return (this.buffer[offset] & (0xff >> bit)) >> (8 - bit - n);
    }

    writeBits(value: number, offset: number, bit: number, n: number) {
        // Do we need this?!
        return 0;
    }

    readNMsbBE(offset: number = 0, n: number = 0): number {
        return this.buffer[offset] >> (8 - n);
    }

    readNLsbBE(offset: number = 0, n: number = 0): number {
        return this.buffer[offset] & (0xff >> (8 - n));
    }

    writeNMsbBE(value: number, offset: number = 0, n: number = 0): number {
        /** 2x buff I/O ops */
        value = 0xff & (value << (8 - n));
        let mask = 0xff >> n;
        this.buffer[offset] = (value & ~mask) | (this.buffer[offset] & mask);
        return 1;
    }

    writeNLsbBE(value: number, offset: number = 0, n: number = 0): number {
        let mask = 0xff >> (8 - n);
        this.buffer[offset] = (value & mask) | (this.buffer[offset] & ~mask);
        return 1;
    }
}
