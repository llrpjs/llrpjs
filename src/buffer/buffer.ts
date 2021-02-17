import { BitOps } from "./bitops";
import { BOOL } from "../types";


export class LLRPBuffer {
    private _buffer: Buffer;
    private _bitOps: BitOps;
    private _byte = 0;           // index (offset)
    private _bit = 0;            // index of bit in the current byte address MSB(0)/LSB(7)

    private get bit(): number {
        return this._byte * 8 + this._bit;
    }
    private set bit(v: number) {
        this._bit = v & 7;
        this._byte = v >> 3;
    }
    private get byte(): number {
        return this._byte;
    }
    private set byte(v: number) {
        this._byte = v;
    }

    constructor(buffer: Buffer) {
        this.setBuffer(buffer);
    }

    setBuffer(buffer: Buffer): this {
        this._buffer = buffer;
        this._bitOps = new BitOps(buffer);
        return this;
    }

    getBuffer(): Buffer {
        return this._buffer;
    }

    setBitIndex(startBit: number) {
        this.bit = startBit;
    }

    getBitIndex() {
        return this.bit;
    }

    getByteIndex() {
        return this.byte;
    }

    // LLRPField is BE protocol
    readBit(): BOOL {
        return this._bitOps.readBit(this.byte, this.bit++) as BOOL;
    }

    writeBit(v: BOOL): number {
        return this._bitOps.writeBit(v ? 1 : 0, this.byte, this.bit++);
    }

    readBits(n: number) {
        let result = this._bitOps.readBits(this.byte, this.bit, n);
        this.bit += n;
        return result;
    }

    writeBits(value: number, n: number) {
        let result = this._bitOps.writeBits(value, this.byte, this.bit, n);
        this.bit += n;
        return result;
    }

    readNMsb(n: number): number {
        n = n;
        let result = this._bitOps.readNMsbBE(this.byte, n);
        this.bit += n;
        return result;
    }

    writeNMsb(v: number, n: number): number {
        let result =  this._bitOps.writeNMsbBE(v, this.byte, n);
        this.bit += n;
        return result;
    }

    readUInt8(): number {
        return this._buffer.readUInt8(this.byte++);
    }

    writeUInt8(v: number): number {
        return this._buffer.writeUInt8(v, this.byte++);
    }

    readInt8(): number {
        return this._buffer.readInt8(this.byte++);
    }

    writeInt8(v: number): number {
        return this._buffer.writeInt8(v, this.byte++);
    }

    readUInt16(): number {
        let n = 2;
        let res = this._buffer.readUInt16BE(this.byte);
        this.byte += n;
        return res;
    }

    writeUInt16(v: number): number {
        let n = 2;
        let res = this._buffer.writeUInt16BE(v, this.byte);
        this.byte += n;
        return res;
    }

    readInt16(): number {
        let n = 2;
        let res = this._buffer.readInt16BE(this.byte);
        this.byte += n;
        return res;
    }

    writeInt16(v: number): number {
        let n = 2;
        let res = this._buffer.writeInt16BE(v, this.byte);
        this.byte += n;
        return res;
    }

    readUInt32(): number {
        let n = 4;
        let res = this._buffer.readUInt32BE(this.byte);
        this.byte += n;
        return res;
    }

    writeUInt32(v: number): number {
        let n = 4;
        let res = this._buffer.writeUInt32BE(v, this.byte);
        this.byte += n;
        return res;
    }

    readInt32(): number {
        let n = 4;
        let res = this._buffer.readInt32BE(this.byte);
        this.byte += n;
        return res;
    }

    writeInt32(v: number): number {
        let n = 4;
        let res = this._buffer.writeInt32BE(v, this.byte);
        this.byte += n;
        return res;
    }

    readUInt64(): bigint {
        let n = 8;
        let res = this._buffer.readBigUInt64BE(this.byte);
        this.byte += n;
        return res;
    }

    writeUInt64(v: bigint): number {
        let n = 8;
        let res = this._buffer.writeBigUInt64BE(v, this.byte);
        this.byte += n;
        return res;
    }

    readInt64(): bigint {
        let n = 8;
        let res = this._buffer.readBigInt64BE(this.byte);
        this.byte += n;
        return res;
    }

    writeInt64(v: bigint): number {
        let n = 8;
        let res = this._buffer.writeBigInt64BE(v, this.byte);
        this.byte += n;
        return res;
    }

    readUTF8(n: number): string {
        let res = this._buffer.slice(this.byte, this.byte + n).toString("utf-8");
        this.byte += n;
        return res;
    }

    writeUTF8(v: string): number {
        let n = v.length;
        this._buffer.write(v, this.byte, "utf-8");
        this.byte += n;
        return n;
    }
}

export interface LLRPBuffer { }