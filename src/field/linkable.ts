import { Base } from "../bryntum/chronograph/Base";
import { ClassUnion, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPElement } from "../element/element";
import { LLRPLinkable } from "../llrp-linkable";
import { LLRPFieldDescriptor } from "./descriptor";
import { LLRPEncDec } from "./encdec";

/**
 * This is a mixin that accepts another mixin and a base class to produce a linkable LLRP field:
 *  1) LLRPLinkable mixin class: more like a basic template for linking elements (linked list)
 *  2) LLRPEncDec class: buffer ops to set field's exact buffer location and boundaries
 * 
 */

type LinkableEncodable<P> = LLRPLinkable<P> & LLRPEncDec | null;


export class LLRPFieldLinkable<P extends LLRPElement> extends Mixin(
    [LLRPLinkable, LLRPEncDec],
    (base: ClassUnion<typeof LLRPLinkable, typeof LLRPEncDec>) =>
        class LLRPFieldLinkable extends base {
            parent: any;
            prev: LLRPFieldLinkable | null;
            next: LLRPFieldLinkable | null;

            constructor(...args: any[]) {
                super(...args);
                this.prev = null;
                this.next = null;
            }

            setPrev(prev: this['prev']): this {
                if (prev) {
                    this.setStart(prev.getEnd() + 1);

                    prev.next = this;
                }
                return super.setPrev(prev) as this;
            }

            setNext(next: this['next']): this {
                if (next) {
                    next.setStart(this.getEnd() + 1);

                    next.prev = this;
                }
                return super.setNext(next) as this;
            }

            setBufferList(buffer: Buffer): this {
                this.setBuffer(buffer);
                if (this.next) {
                    this.next.setBufferList(buffer);
                }
                return this;
            }

            encodeList(): this {
                this.encode();
                if (this.next) {
                    this.next.encodeList();
                }
                return this;
            }

            decodeList(): this {
                this.decode();
                if (this.next) {
                    this.next.decodeList();
                }
                return this;
            }

            getListSize(): number {
                return this.getByteSize() + (this.next? this.next.getListSize(): 0);
            }
        }
) { };

export interface LLRPFieldLinkable<P extends LLRPElement> {
    parent: P;
}
