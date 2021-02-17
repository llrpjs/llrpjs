import { AnyConstructor, MixinAny } from "../bryntum/chronograph/Mixin";
import { LLRPBound } from "../buffer/bound";
import { LLRPBuffer } from "../buffer/buffer";
import { LLRPNode } from "./node";


export class LLRPList extends MixinAny(
    [LLRPBound],
    (base: AnyConstructor<LLRPBound, typeof LLRPBound>) =>
        class LLRPList extends base {
            buffer: LLRPBuffer;
            first: LLRPNode = null;
            last: LLRPNode = null;
            length: number = 0;

            get isEmpty() {
                return !this.first;
            }

            private _push(v: this['last']) {
                if (!v) return null;
                if (this.isEmpty) {
                    v.prev = null;
                    v.next = null;
                    this.first = this.last = v;
                } else {
                    v.prev = this.last;
                    this.last.next = v;
                    this.last = v;
                }
                v.next = null;
                return ++this.length;
            }

            private _pop(): this['last'] {
                if (this.isEmpty) return null;
                let popped = this.last;
                this.last = this.last.prev;
                if (this.last) {
                    this.last.next = null;
                    popped.prev = null;
                } else {
                    this.first = null;
                }
                this.length--;
                return popped;
            }

            private _concat(v: this) {
                if (this.first && v.first) {
                    this.last = v.last;
                } else if (!this.first) {
                    this.first = v.first;
                    this.last = v.last;
                }
                this.length += v.length;
                return this;
            }

            setStartBit(bit: number) {
                super.setStartBit(bit);
                for (let i = this.first; !!i; i = i.next) {
                    if (i.prev)
                        i.setStartBit(i.prev.getEndBit() + 1);
                    else
                        i.setStartBit(this.getStartBit());
                }
                return this;
            }

            /**
             * updates all nodes' starting points, buffer pointers, and this list's total size
             */
            setBuffer(b: LLRPBuffer) {
                this.buffer = b;
                for (let i = this.first; !!i; i = i.next) {
                    i.setBuffer(b);
                    if (i.prev)
                        i.setStartBit(i.prev.getEndBit() + 1);
                    else
                        i.setStartBit(this.getStartBit());
                }
                return this;
            }

            getEndBit() {
                if (this.isEmpty) {
                    return this.getStartBit() - 1;
                }
                return this.last.getEndBit();
            }

            getBitSize() {
                return this.getEndBit() - this.getStartBit() + 1;
            }

            getEndByte() {
                return this.getEndBit() >> 3;
            }

            getByteSize() {
                return this.getEndByte() - this.getStartByte() + 1;
            }

            setBitSize(bit: number) {
                throw new Error(`can't set bit size of list`);
                return this;
            }

            getBuffer() {
                return this.buffer;
            }

            // List ops
            getFirst() {
                return this.first;
            }

            getLast() {
                return this.last;
            }

            push(v: this['last']) {
                v.setBuffer(this.buffer);
                if (this.isEmpty) {
                    v.setStartBit(this.getStartBit());
                } else {
                    v.setStartBit(this.last.getEndBit() + 1);
                }
                return this._push(v);
            }

            pop() {
                let popped = this._pop();
                popped.setBuffer(null);
                return popped;
            }

            concat(v: this) {
                v.setStartBit(this.getBitSize());
                return this._concat(v);
            }

            clear() {
                this.first = null;
                this.last = null;
                this.length = 0;
                return this;
            }

            // Encode/decode
            encode(): this {
                for (let i = this.first; !!i; i = i.next) {
                    i.encode();
                }
                return this;
            }

            decode(): this {
                for (let i = this.first; !!i; i = i.next) {
                    i.decode();
                }
                return this;
            }

            *[Symbol.iterator]() {
                let p: this['first'] = this.first;
                while(p) {
                    let y = p;
                    p = p.next;
                    yield y;
                }
            }
        }
) { };

export interface LLRPList {
    first: LLRPNode;
    last: LLRPNode;
}
