import { LLRPFieldDescriptor } from "./descriptor";
import { FieldDescriptor, GetFieldDataType, LLRPFieldType } from "../types";
import { AnyConstructor, ClassUnion, Mixin } from "../bryntum/chronograph/Mixin";
import { Base } from "../bryntum/chronograph/Base";


const BITWIDTH: {[key in LLRPFieldType]: 0|1|2|8|16|32|64} = {
    "u1": 1,
    "u2": 2,
    "u8": 8,
    "s8": 8,
    "u16": 16,
    "s16": 16,
    "u32": 32,
    "s32": 32,
    "u64": 64,
    "s64": 64,
    "u96": 8,
    "bytesToEnd": 8,
    "reserved": 0,
    "u1v": 1,
    "u8v": 8,
    "s8v": 8,
    "u16v": 16,
    "s16v": 16,
    "u32v": 32,
    "s32v": 32,
    "u64v": 64,
    "s64v": 64,
    "utf8v": 8
}

export class LLRPFieldData<
    FT extends LLRPFieldType> extends Mixin(
        [LLRPFieldDescriptor],
        (base: ClassUnion<typeof LLRPFieldDescriptor>) =>
            class LLRPFieldData extends base {
                iValue: any;
                bitWidth: number;

                setDefaultValue(): void {
                    this.iValue = (this.isVectorType ?
                        this.fd.type == "u96" ? Array(12).fill(0) : []
                        : this.isReserved ? undefined
                            : this.isString ? ""
                                : this.isNumeric ? this.isBigInt ? 0n : 0
                                    : 0) as this['iValue']
                };

                setDefaultBitWidth(): void {
                    this.bitWidth = BITWIDTH[this.fd.type];
                }

                setValue(v: this['iValue']): this {
                    this.iValue = v;
                    return this;
                }

                getValue(): this['iValue'] {
                    return this.iValue;
                }
            }
    ) { }

export interface LLRPFieldData<FT extends LLRPFieldType> {
    FT: FT;
    iValue: GetFieldDataType<FT>;
    bitWidth: number;
}
