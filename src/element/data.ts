import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPUserData, LLRPUserDataValue } from "../types";


export class LLRPData extends Mixin(
    [],
    (base: AnyConstructor) =>
        class LLRPElementData extends base {
            LLRPDATATYPE: any;
            private data: this['LLRPDATATYPE'] = {};

            setData(d: this['LLRPDATATYPE']) {
                this.data = d;
                return this;
            }

            getData(): this['LLRPDATATYPE'] {
                return this.data;
            }

            setDataKey(k: string, v: LLRPUserDataValue) {
                if (this.hasDataKey(k)) {
                    if (Array.isArray(this.data[k])) {
                        this.data[k].push(v);
                    } else {
                        this.data[k] = [this.data[k], v];
                    }
                } else
                    this.data[k] = v;
                return this;
            }

            getDataKey(k: string) {
                return this.data[k];
            }

            hasDataKey(k: string) {
                return !!this.data[k];
            }
        }
) { }

export interface LLRPData {
    LLRPDATATYPE: LLRPUserData;
}