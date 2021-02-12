import { ClassUnion, MixinAny } from "../bryntum/chronograph/Mixin";
import { FieldDescriptor, GetFieldDataType, GetFormatValType, LLRPFieldType } from "../types";
import { LLRPEnumerator } from "./enumerator";
import { LLRPFormatterParser } from "./formatter";
import { LLRPNode } from "../base/node";

export class LLRPField<FT extends LLRPFieldType> extends MixinAny(
    [LLRPFormatterParser, LLRPEnumerator, LLRPNode],
    (base: ClassUnion<
        typeof LLRPFormatterParser,
        typeof LLRPEnumerator,
        typeof LLRPNode
        >) =>
    class LLRPField extends base {
        /**
         * Do all the stuff that are common between derived (user) LLRP field classes
         */
        iValue: any;

        setValue(v: this['iValue']) {
            super.setValue(v);
            this.updateBitSize();     // update size in case of vectors and strings
            return this;
        }

        updateBitSize(): this {
            if (this.isType(["u96", "bytesToEnd"])) {
                // they don't have count field
                super.setBitSize(this.bitWidth * this.iValue.length);
            } else if (this.isVectorType || this.isString) {
                // other vectors
                super.setBitSize(16 + this.bitWidth * this.iValue.length);
            } else {
                super.setBitSize(this.bitWidth);
            }
            return this;
        }

        setDefault(type: LLRPFieldType): this {
            this.fd = {} as any;
            this.setName("undefined");
            this.setType(type);
            this.setDefaultFormat();        // default format
            this.setStartBit(0);               // default buf start
            this.setDefaultValue();         // default data value
            this.updateBitSize();              // set the field size according to the field type (and current value if vector/string)
            this.setDefaultFormatValue();   // default format value
            this.setDefaultEnum();          // default enum value
            this.format();                  // format the current value
            this.convertToEnum();           // enumerate the current value
            return this;
        }
    }
) { }

export interface LLRPField<FT extends LLRPFieldType> {
    fd: FieldDescriptor<FT>;
    iValue: GetFieldDataType<FT>;
    fValue: GetFormatValType<this['iValue']>;

    prev: LLRPField<LLRPFieldType>;
    next: LLRPField<LLRPFieldType>;
}

export type LLRPFieldInstanceType = LLRPField<LLRPFieldType>;
