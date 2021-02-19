import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPField } from "./field";
import { LLRPFieldType } from "../types";
import { LLRPList } from "../base/list";

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
