import { ClassUnion, MixinAny } from "../bryntum/chronograph/Mixin";
import { GetFieldDataType, LLRPFieldType } from "../types";
import { LLRPEnumerator } from "./enumerator";
import { LLRPFormatterParser } from "./formatter";
import { LLRPFieldLinkable } from "./linkable";

export class LLRPField<FT extends LLRPFieldType> extends MixinAny(
    [LLRPFormatterParser, LLRPEnumerator, LLRPFieldLinkable],
    (base: ClassUnion<
        typeof LLRPFormatterParser,
        typeof LLRPEnumerator,
        typeof LLRPFieldLinkable
        >) =>
    class LLRPField extends base {
        /**
         * Do all the stuff that are common between derived (user) LLRP field classes
         */

        iValue: any;

        setValue(v: this['iValue']) {
            super.setValue(v);
            this.updateSize();     // update size in case of vectors and strings
            return this;
        }

        updateSize(): this {
            if (this.isType(["u96", "bytesToEnd"])) {
                // they don't have count field
                this.setBitSize(this.bitWidth * this.iValue.length);
            } else if (this.isVectorType || this.isString) {
                // other vectors
                this.setBitSize(16 + this.bitWidth * this.iValue.length);
            } else {
                this.setBitSize(this.bitWidth);
            }
            this.setNext(this.next as this);    // just to update next fields
            return this;
        }

        setDefault(): this {
            this.setStart(0);               // default buf start
            this.setDefaultValue();         // default data value
            this.setDefaultBitWidth();      // default bitWidth is set according to field type
            this.updateSize();              // set the field size according to the field type (and current value if vector/string)
            this.setDefaultFormat();        // default format value
            this.format();                  // format the current value
            this.convertToEnum();           // enumerate the current value
            return this;
        }
    }
) { }

export interface LLRPField<FT extends LLRPFieldType> {
    FT: FT;
    iValue: GetFieldDataType<FT>;
}
