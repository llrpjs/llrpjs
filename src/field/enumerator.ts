import { LLRPFieldData } from "./data";
import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";


export class LLRPEnumerator extends Mixin(
    [LLRPFieldData],
    (base: AnyConstructor<LLRPFieldData, typeof LLRPFieldData>) =>
        class LLRPEnumerator extends base {
            eValue: string;

            setDefaultEnum() {
                this.eValue = this.fd.enumTable?.filter(entry => entry.value === 0)[0]?.name || "";
                return this;
            }

            setEnumValue(v: this['eValue']): this {
                this.eValue = v;
                return this;
            }

            getEnumValue(): this['eValue'] {
                return this.eValue;
            }

            convertToEnum(): this {
                if (this.isEnumerable) {
                    let res = this.fd.enumTable?.filter(entry => entry.value === this.iValue as number)[0];
                    if (!res)
                        throw new Error(`no enum found for value ${this.iValue as number}`);
                    this.eValue = res.name;
                }
                return this;
            }

            convertToValue(): this {
                if (this.isEnumerable) {
                    let res = this.fd.enumTable?.filter(entry => entry.name === this.eValue)[0];
                    if (!res)
                        throw new Error(`no enum found for name ${this.eValue}`);
                    this.iValue = res.value as this['iValue'];
                }
                return this;
            }
        }
) { }

export interface LLRPEnumerator {
    convertToEnum(): this;
    convertToValue(): this;
}

// test

// let n = new LLRPEnumerator<"u8">();
// n.setName("EnumField");
// n.setValue(0);
// n.fd.enumTable = [
//     {
//         name: "First",
//         value: 0
//     },
//     {
//         name: "Second",
//         value: 1
//     }
// ]



// n.convertToEnum();
// console.log(n);

// n.eValue = "Second";
// n.convertToValue();
// console.log(n);