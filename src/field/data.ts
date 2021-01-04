import { LLRPFieldDescriptor } from "./descriptor";
import { FieldDescriptor, GetFieldDataType, LLRPFieldType } from "../types";
import { AnyConstructor, ClassUnion, Mixin } from "../bryntum/chronograph/Mixin";
import { Base } from "../bryntum/chronograph/Base";


export class LLRPFieldData<
    FT extends LLRPFieldType> extends Mixin(
        [LLRPFieldDescriptor],
        (base: ClassUnion<typeof LLRPFieldDescriptor>) =>
            class LLRPFieldData extends base {
                iValue: any;

                setDefaultValue(): void {
                    this.iValue = (this.isVectorType ? []
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

export interface LLRPFieldData<FT extends LLRPFieldType> {
    FT: FT;
    iValue: GetFieldDataType<FT>;
}

//class LLRPFieldDataU64 extends LLRPFieldData<"u64"> { };


// Test

// let n = new LLRPFieldData<"u64">();

// n.setName("LLRPStatus");
// n.fd.type = "u64";
// n.fd.format = "Datetime";
// n.setFormat("Datetime");

// n.setType("u64");

// n.setValue(1n);
// console.log(n.getValue());

// console.log(n);