import { ClassUnion, MixinAny } from "../bryntum/chronograph/Mixin";
import { FieldDescriptor, GetFieldRawValue, GetFieldFormatValue, LLRPFieldType, GetEnumValue } from "../types";
import { LLRPEnumerator } from "./enumerator";
import { LLRPFormatterParser } from "./formatter";
import { LLRPNode } from "../base/node";
import { LLRPFieldData } from "./data";

export class LLRPField<FD extends FieldDescriptor> extends MixinAny(
    [LLRPFieldData, LLRPFormatterParser, LLRPEnumerator, LLRPNode],
    (base: ClassUnion<
        typeof LLRPFieldData,
        typeof LLRPFormatterParser,
        typeof LLRPEnumerator,
        typeof LLRPNode
        >) =>
    class LLRPField extends base {
        /**
         * Do all the stuff in common between derived (user) LLRP field classes
         */
        RV: any;
        FMTV: any;
        ETV: any;
        EV: this['RV'] | this['FMTV'] | this['ETV'];      // end-user value type: raw | formatted | enumerated

        private isEVFormattable(v: this['EV']) {
            if (this.isUtf8Formattable) return true;
            if (!this.isUnsigned) return false;
            if (this.isBigInt)
                return this.isDateFormattable && (typeof v === 'string' || <any>v instanceof Date);
            return typeof v === 'string' && !this.isNormalFormattable;
        }

        private isEVEnumerable(v: this['EV']) {
            if (!this.isUnsigned) return false;
            if (Array.isArray(v))
                return v.every(x=>typeof x === 'string') && this.isEnumerable;
            return typeof v === 'string' && this.isEnumerable;
        }

        setValue(v: this['EV']) {
            let value: this['RV'];
            if (this.isEVFormattable(v)) {
                value = this.getParsed(v);
            } else if (this.isEVEnumerable(v)) {
                value = this.getEnumValue(v);
            } else {
                value = v;
            }
            this.setRawValue(value);
            this.updateBitSize();     // update size in case of vectors and strings
            return this;
        }

        getValue(): this['EV'] {
            let value: this['EV'];
            if (this.isEnumerable) {
                value = this.getEnumName(this.getRawValue());
            } else {
                value = this.getFormatted(this.getRawValue());
            }
            return value;
        }

        updateBitSize(): this {
            if (this.isType(["u96", "bytesToEnd"])) {
                // they don't have count field
                this.setBitSize(this.bitWidth * this.rValue.length);
            } else if (this.isVectorType || this.isString) {
                // other vectors
                this.setBitSize(16 + this.bitWidth * this.rValue.length);
            } else {
                this.setBitSize(this.bitWidth);
            }
            return this;
        }

        setDefault(type: this['fd']['type']): this {
            this.setDefaultDescriptor();
            this.setType(type);
            this.setStartBit(0);               // default buf start
            this.setDefaultRawValue();
            this.updateBitSize();
            return this;
        }
    }
) {
    static ofType<C extends typeof LLRPField, FT extends LLRPFieldType, FD extends FieldDescriptor<FT>>(this: C, type: FT) {
        return class _LLRPField extends LLRPField<FD> {
            constructor(...args: any[]) {
                super(...args);
                this.setDefault(type);
            }
        };
    }
}

export interface LLRPField<FD extends FieldDescriptor> {
    fd: FD;
    RV: GetFieldRawValue<FD['type']>;
    FMTV: GetFieldFormatValue<FD['format']>;
    ETV: GetEnumValue<FD['type']>;

    prev: LLRPField<FieldDescriptor>;
    next: LLRPField<FieldDescriptor>;
}

export const LLRPFieldInstanceType = LLRPField;
export type LLRPFieldInstanceType = LLRPField<FieldDescriptor>;


