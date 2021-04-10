import { LLRPFieldDescriptor } from "./descriptor";
import { LLRPRawDataValue } from "../types";
import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";

export class LLRPFieldData extends Mixin(
    [LLRPFieldDescriptor],
    (base: AnyConstructor<LLRPFieldDescriptor, typeof LLRPFieldDescriptor>) =>
    class LLRPFieldData extends base {
        RV: LLRPRawDataValue
        rValue: this['RV'];

        setDefaultRawValue(): void {
            this.rValue = (this.isVectorType ?
                this.fd.type == "u96" ? Array(12).fill(0) : []
                : this.isReserved ? undefined
                    : this.isString ? ""
                        : this.isNumeric ? this.isBigInt ? 0n : 0
                            : 0);
        };

        setRawValue(v: this['RV']): this {
            this.rValue = v;
            return this;
        }

        getRawValue(): this['RV'] {
            return this.rValue;
        }
    }
) { }

export interface LLRPFieldData { }
