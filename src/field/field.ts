import { Base } from "../bryntum/chronograph/Base";
import { AnyConstructor, ClassUnion, MixinAny } from "../bryntum/chronograph/Mixin";
import { GetFieldDataType, GetFormatValType, LLRPFieldFormat, LLRPFieldType } from "../types";
import { LLRPFieldData } from "./data";
import { LLRPFieldDescriptor } from "./descriptor";
import { LLRPEncDec } from "./encdec";
import { LLRPEnumerator } from "./enumerator";
import { LLRPFormatterParser } from "./formatter";
import { LLRPFieldLinkable } from "./linkable";
import { LLRPU96 } from "./llrp";

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

        setDefault() {
            this.setStart(0);           // default buf start
            this.setDefaultValue();     // default data value
            this.setDefaultFormat();    // default format value
            this.format();              // format the current value
            this.convertToEnum();       // enumerate the current value
            this.reset();               // reset buf index
        }
    }
) { }

export interface LLRPField<FT extends LLRPFieldType> {
    FT: FT;
    iValue: GetFieldDataType<FT>;
}


// test

let n = new LLRPField<"u64">();

n.setValue(1n);