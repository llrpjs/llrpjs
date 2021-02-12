import { LLRPFieldDescriptor } from "./descriptor";
import { LLRPDataType } from "../types";
import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";


export class LLRPFieldData extends Mixin(
        [LLRPFieldDescriptor],
        (base: AnyConstructor<LLRPFieldDescriptor, typeof LLRPFieldDescriptor>) =>
            class LLRPFieldData extends base {
                iValue: LLRPDataType;

                setDefaultValue(): void {
                    this.iValue = (this.isVectorType ?
                        this.fd.type == "u96" ? Array(12).fill(0) : []
                        : this.isReserved ? undefined
                            : this.isString ? ""
                                : this.isNumeric ? this.isBigInt ? 0n : 0
                                    : 0) as this['iValue']
                };

                setValue(v: this['iValue']): this {
                    this.iValue = v;
                    return this;
                }

                getValue(): this['iValue'] {
                    return this.iValue;
                }
            }
    ) { }

export interface LLRPFieldData {
    setValue(v: this['iValue']): this;
    getValue(): this['iValue'];
}
