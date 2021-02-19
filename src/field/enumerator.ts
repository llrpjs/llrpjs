import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPFieldDescriptor } from "./descriptor";


export class LLRPEnumerator extends Mixin(
    [LLRPFieldDescriptor],
    (base: AnyConstructor<LLRPFieldDescriptor, typeof LLRPFieldDescriptor>) =>
    class LLRPEnumerator extends base {
        RV: any;
        ET: any;

        getEnumName(value: this['RV']) {
            let res: this['ET'];
            if (this.isVectorType)
                res = (<number[]>value).map(v =>
                    this.fd.enumTable?.filter(entry => entry.value === v)[0]?.name || ""
                );
            else
                res = this.fd.enumTable?.filter(entry => entry.value === value as number)[0]?.name || "";
            return res;
        }

        getEnumValue(name: this['ET']) {
            let res: this['RV'];
            if (this.isVectorType)
                res = (<string[]>name).map(n =>
                    this.fd.enumTable?.filter(entry => entry.name === n)[0]?.value ?? 0);
            else
                res = this.fd.enumTable?.filter(entry => entry.name === name as string)[0]?.value ?? 0;
            return res;
        }
    }
) { }

export interface LLRPEnumerator { }
