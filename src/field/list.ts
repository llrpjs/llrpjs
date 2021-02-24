import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPField } from "./field";
import { FieldDescriptor } from "../types";
import { LLRPList } from "../base/list";

export class LLRPFieldList extends Mixin(
    [LLRPList],
    (base: AnyConstructor<LLRPList, typeof LLRPList>) =>
    class LLRPFieldList extends base {
        first: LLRPField<FieldDescriptor> = null;
        last: LLRPField<FieldDescriptor> = null;
    }
) { };

export interface LLRPFieldList {
    first: LLRPField<FieldDescriptor>;
    last: LLRPField<FieldDescriptor>;
}
