import { Base } from "../bryntum/chronograph/Base";
import { ClassUnion, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPElement } from "../element/element";
import { LLRPLinkable } from "../llrp-linkable";
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

            constructor(...args: any[]) {
                super(...args);
                this.prev = null;
                this.next = null;
                this.setSize(0);
                this.setStart(0);
            }

            setSize(bitSize: number): this {
                super.setSize(bitSize);
                this.setNext(this.next as LinkableEncodable<this['parent']>);    // just to update
                return this;
            }

            setPrev(prev: LinkableEncodable<this['parent']>): this {
                if (prev) {
                    this.setBuffer(prev.getBuffer());
                    this.setStart(prev.getEnd() + 1);
                    
                    prev.next = this;
                }
                return super.setPrev(prev) as this;
            }

            setNext(next: LinkableEncodable<this['parent']>): this {
                if (next) {
                    next.setBuffer(this.getBuffer());
                    next.setStart(this.getEnd() + 1);

                    next.prev = this;
                }
                return super.setNext(next) as this;
            }
        }
) { };

export interface LLRPFieldLinkable<P extends LLRPElement> {
    parent: P;
}


// Test

// let f0 = new LLRPFieldLinkable<LLRPElement>()
// f0.setBuffer(Buffer.alloc(1024))
//     .setStart(0)
//     .setSize(256);

// let f1 = new LLRPFieldLinkable<LLRPElement>();
// f1.setSize(128).setPrev(f0);

// console.log(f0);