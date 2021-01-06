import { BitOps } from "./bitops";
import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";
import { BOOL } from "../types";


export interface LLRPEncDec {
    setBitSize(bitSize: number): this;
    setStart(bit: number): this;
    getStart(): number;
    getEnd(): number;
    setBuffer(buffer: Buffer): this;
    getBuffer(): Buffer;
    reset(): void;

    encode(): this;
    decode(): this;
}

export class LLRPEncDec extends Mixin(
    [],
    (base: AnyConstructor) =>
        class LLRPEncDec extends base {
            byteSize: number = 0;       // number of bytes
            bitSize: number = 0;        // total number of bits. Equals ( <byteSize> * 8 + <bitCount> ) (specifically used by u1v and reserved)

            startByte: number = 0;      // starting byte of our field
            startBit: number = 0;       // starting bit of our field


            setBitSize(bitSize: number): this {
                this.bitSize = bitSize;
                this.byteSize = bitSize >> 3;
                return this;
            }

            getBitSize(): number {
                return this.bitSize;
            }

            getByteSize(): number {
                return this.byteSize;
            }

            setStart(bit: number): this {
                this.startBit = bit;
                this.startByte = bit >> 3;
                return this;
            }

            getStart(): number {
                return this.startBit;
            }

            private get endBit(): number {
                return this.startBit + this.bitSize - 1;
            }

            private get endByte(): number {
                return this.startByte + this.byteSize - 1;
            }

            getEnd(): number {
                return this.endBit;
            }


            private buffer: Buffer = Buffer.alloc(0);
            private bitOps: BitOps = new BitOps(this.buffer);
            private _byte = 0;           // index (offset)
            private _bit = 0;            // index of bit in the current byte address MSB(0)/LSB(7)
            private get bit(): number {
                return this._bit;
            }
            private set bit(v: number) {
                this._bit = v & 7;
                this._byte += v >> 3;
            }
            private get byte(): number {
                return this._byte;
            }
            private set byte(v: number) {
                this._byte = v;
            }

            setBuffer(buffer: Buffer): this {
                this.buffer = buffer;
                this.bitOps = new BitOps(buffer);
                return this;
            }

            getBuffer(): Buffer {
                return this.buffer;
            }

            reset() {
                this._bit = this.startBit;
                this._byte = this.startByte;
            }


            encode(): this {
                this.reset();
                return this;
            }
            decode(): this {
                this.reset();
                return this;
            };


            assertBits(bits: number) {
                this.assertBytes(bits >> 3);
                if ((bits & 7) > this.bitSize - this.byteSize * 8)
                    throw new Error(`attempt to read/write bits beyond field limits`);
            }

            assertBytes(bytes: number) {
                if (this.byte + bytes - 1 > this.endByte)   // -1 for that current index included
                    throw new Error(`attempt to read/write bytes beyond field limits`);
            }
            // LLRPField is BE protocol
            readBit(): BOOL {
                this.assertBits(1);
                return this.bitOps.readBit(this.byte, this.bit) as BOOL;
            }

            writeBit(v: BOOL): number {
                this.assertBits(1);
                return this.bitOps.writeBit(v ? 1 : 0, this.byte, this.bit);
            }

            readNMsb(n: number): number {
                this.assertBits(n);
                return this.bitOps.readNMsbBE(this.byte, n);
            }

            writeNMsb(v: number, n: number): number {
                this.assertBits(n);
                return this.bitOps.writeNMsbBE(v, this.byte, n);
            }

            readUInt8(): number {
                this.assertBytes(1);
                return this.buffer.readUInt8(this.byte++);
            }

            writeUInt8(v: number): number {
                this.assertBytes(1);
                return this.buffer.writeUInt8(v, this.byte++);
            }

            readInt8(): number {
                this.assertBytes(1);
                return this.buffer.readInt8(this.byte++);
            }

            writeInt8(v: number): number {
                this.assertBytes(1);
                return this.buffer.writeInt8(v, this.byte++);
            }

            readUInt16(): number {
                let n = 2;
                this.assertBytes(n);
                let res = this.buffer.readUInt16BE(this.byte);
                this.byte += n;
                return res;
            }

            writeUInt16(v: number): number {
                let n = 2;
                this.assertBytes(n);
                let res = this.buffer.writeUInt16BE(v, this.byte);
                this.byte += n;
                return res;
            }

            readInt16(): number {
                let n = 2;
                this.assertBytes(n);
                let res = this.buffer.readInt16BE(this.byte);
                this.byte += n;
                return res;
            }

            writeInt16(v: number): number {
                let n = 2;
                this.assertBytes(n);
                let res = this.buffer.writeInt16BE(v, this.byte);
                this.byte += n;
                return res;
            }

            readUInt32(): number {
                let n = 4;
                this.assertBytes(n);
                let res = this.buffer.readUInt32BE(this.byte);
                this.byte += n;
                return res;
            }

            writeUInt32(v: number): number {
                let n = 4;
                this.assertBytes(n);
                let res = this.buffer.writeUInt32BE(v, this.byte);
                this.byte += n;
                return res;
            }

            readInt32(): number {
                let n = 4;
                this.assertBytes(n);
                let res = this.buffer.readInt32BE(this.byte);
                this.byte += n;
                return res;
            }

            writeInt32(v: number): number {
                let n = 4;
                this.assertBytes(n);
                let res = this.buffer.writeInt32BE(v, this.byte);
                this.byte += n;
                return res;
            }

            readUInt64(): bigint {
                let n = 8;
                this.assertBytes(n);
                let res = this.buffer.readBigUInt64BE(this.byte);
                this.byte += n;
                return res;
            }

            writeUInt64(v: bigint): number {
                let n = 8;
                this.assertBytes(n);
                let res = this.buffer.writeBigUInt64BE(v, this.byte);
                this.byte += n;
                return res;
            }

            readInt64(): bigint {
                let n = 8;
                this.assertBytes(n);
                let res = this.buffer.readBigInt64BE(this.byte);
                this.byte += n;
                return res;
            }

            writeInt64(v: bigint): number {
                let n = 8;
                this.assertBytes(n);
                let res = this.buffer.writeBigInt64BE(v, this.byte);
                this.byte += n;
                return res;
            }

            readUTF8(n: number): string {
                this.assertBytes(n);
                let res = this.buffer.slice(this.byte, this.byte + n).toString("utf-8");
                this.byte += n;
                return res;
            }

            writeUTF8(v: string): number {
                let n = v.length;
                this.assertBytes(n);
                this.buffer.write(v, this.byte, "utf-8");
                this.byte += n;
                return n;
            }
        }
) {}