import { Base } from "../bryntum/chronograph/Base";
import { AnyConstructor, ClassUnion, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPFieldDescriptor } from "./descriptor";
import { LLRPBuffer } from "../buffer/buffer";
import { LLRPField } from "./field";
import { LLRPFieldType } from "../types";
import { LLRPList } from "../base/list";

/**
 * Do I need element insertion?
 * No.
 * 
 * Do I need push/pop?
 * Yes, mostly push
 * 
 * Do I need shift/unshift?
 * No.
 */


export class LLRPFieldList extends Mixin(
    [LLRPList],
    (base: AnyConstructor<LLRPList, typeof LLRPList>) =>
        class LLRPFieldList extends base {
            first: LLRPField<LLRPFieldType> = null;
            last: LLRPField<LLRPFieldType> = null;
        }
) { };

export interface LLRPFieldList {
    first: LLRPField<LLRPFieldType>;
    last: LLRPField<LLRPFieldType>;
}
