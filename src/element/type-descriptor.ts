import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";
import { TypeRegistry } from "../type-registry";
import { LLRPRepeat, SubTypeReference, TypeDescriptor } from "../types";
import { LLRPList } from "../base/list";
import { LLRPNode } from "../base/node";

const MaxOfOneRepeat: LLRPRepeat[] = ["0-1", "1"];
const UnlimitedRepeat: LLRPRepeat[] = ["0-N", "1-N"];
const RequiredRepeat: LLRPRepeat[] = ["1", "1-N"];


export class LLRPTypeDescriptor extends Mixin(
    [],
    (base: AnyConstructor) =>
        class LLRPTypeDescriptor extends base {
            type: string;
            protected tr: TypeRegistry = TypeRegistry.getInstance();
            protected td: TypeDescriptor = null;
            protected tRefs: { [x in TypeDescriptor['name']]: SubTypeReference } = {};

            protected pool: {
                [x: string]: LLRPNode | LLRPNode[];
            } = {};

            protected buildTypeReferences() {
                // flatten out choices as well
                this.tRefs = this.td.subTypeRefs.reduce((acc, x) => {
                    if (this.isChoice(x)) {
                        for (let td of x.choices) {
                            acc[td.name] = x;
                        }
                    }
                    acc[x.td.name] = x;
                    return acc;
                }, {});
                return this;
            }

            // pool tools
            addSubType(name: string, v: LLRPNode) {
                if (this.pool[name]) {
                    if (this.pool[name] instanceof LLRPNode) {
                        let foundNode = this.pool[name] as LLRPNode;
                        let newList = [];
                        newList.push(foundNode);
                        newList.push(v);
                        this.pool[name] = newList;
                    } else {
                        (<LLRPNode[]>this.pool[name]).push(v);
                    }
                } else
                    this.pool[name] = v;
                return this;
            }

            getSubType(name: string) {
                return this.pool[name] || null;
            }

            removeSubType(name: string) {
                return delete this.pool[name];
            }

            setTypeDescriptor(td: TypeDescriptor) {
                this.td = td;
                this.buildTypeReferences();
                return this;
            }

            setType(type: this['type']) {
                let td = this.tr.getTypeDescByName(type);
                if (!td) throw new Error(`type not found ${type}`);
                this.setTypeDescriptor(td);
                return this;
            }

            isAllowedIn(ref: string | SubTypeReference): boolean {
                if (typeof ref === 'string') {
                    ref = this.getSubTypeRefByName(ref);
                }
                if (!ref) return false;
                const name = ref.td.name;
                const repeat = ref.repeat;
                let count = 0;
                if (this.isChoice(ref)) {
                    const paramNameList = ref.choices.map(td => td.name) || [];
                    for (let key in this.pool) {
                        if (paramNameList.includes(key)) {
                            let subType = this.getSubType(key);
                            if (!subType) continue;
                            if (subType instanceof LLRPList) {
                                count += subType.length;
                            } else
                                count += 1;
                        }
                    }
                } else {
                    let subType = this.getSubType(name);
                    if (subType) {
                        if (subType instanceof LLRPList) count += subType.length;
                        else count += 1;
                    }
                }
                return MaxOfOneRepeat.includes(repeat) && count < 1 ? true
                    : UnlimitedRepeat.includes(repeat) ? true : false;
            }

            isRequired(arg: string | SubTypeReference): boolean {
                let ref: SubTypeReference;
                if (typeof arg === 'string')
                    ref = this.getSubTypeRefByName(arg);
                else
                    ref = arg;
                return RequiredRepeat.includes(ref.repeat);
            }

            isUnlimitedRepeat(ref: SubTypeReference) {
                return UnlimitedRepeat.includes(ref.repeat);
            }

            isMaxOfOneRepeat(ref: SubTypeReference) {
                return MaxOfOneRepeat.includes(ref.repeat);
            }

            isReferenced(name: string, ref: SubTypeReference) {
                if (this.isChoice(ref)) {
                    return !!ref.choices.filter(td => td.name === name)[0];
                }
                return name === ref.td.name;
            }

            isChoice(ref: SubTypeReference): boolean {
                return !!ref.choices;
            }

            getName() {
                return this.td?.name || "Unknown";
            }

            getTypeNum() {
                return this.td?.typeNum || -1;
            }

            getResponseTypeDescriptor() {
                return this.td?.responseType || null;
            }

            getFieldDescriptors() {
                return this.td?.fieldDescriptors || [];
            }

            getSubTypeReferences() {
                return this.td?.subTypeRefs || [];
            }

            getSubTypeRefByName(name: string) {
                return this.tRefs[name] || null;
            }

            // isTypeNumMessage(typeNum: number) {
            //     let td = this.tr.getMsgTypeByTypeNum(typeNum);
            //     if (!td) throw Error(`typeNum ${typeNum} not found`);
            //     return td.isMessage;
            // }

            get isMessage(): boolean {
                return this.td?.isMessage || false;
            }

            get isTV(): boolean {
                if (this.isMessage) return false;
                return this.td?.typeNum < 128 && this.td?.typeNum > 0;
            }

        }
) { }

export interface LLRPTypeDescriptor {
    type: string;
    td: TypeDescriptor;
}