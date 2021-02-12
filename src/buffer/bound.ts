import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";

/**
 * Buffer boundaries for each element/field
 */

export class LLRPBound extends Mixin(
    [],
    (base: AnyConstructor) =>
        class LLRPBound extends base {
            private _byteSize: number = 0;       // number of bytes
            private _bitSize: number = 0;        // total number of bits. Equals ( <byteSize> * 8 + <bitCount> ) (specifically used by u1v and reserved)
            private _startByte: number = 0;      // starting byte of our field
            private _startBit: number = 0;       // starting bit of our field


            setBitSize(bitSize: number): this {
                this._bitSize = bitSize;
                this._byteSize = bitSize >> 3;
                return this;
            }

            getBitSize(): number {
                return this._bitSize;
            }

            getByteSize(): number {
                return this._byteSize;
            }

            setStartBit(bit: number): this {
                this._startBit = bit;
                this._startByte = bit >> 3;
                return this;
            }

            getStartBit(): number {
                return this._startBit;
            }

            getEndBit(): number {
                return this._startBit + this._bitSize - 1;
            }

            setStartByte(byte: number): this {
                this._startByte = byte;
                return this;
            }

            getStartByte(): number {
                return this._startByte;
            }

            getEndByte(): number {
                return this._startByte + this._byteSize - 1;
            }
        }
) { }

export interface LLRPBound { }