import { Base } from "./bryntum/chronograph/Base";
import { AnyConstructor, MixinAny } from "./bryntum/chronograph/Mixin";

/** Linkable Mixin*/

export class LLRPLinkable<P> extends MixinAny(
    [],
    (base: AnyConstructor) =>
        class LLRPLinkable extends base {
            parent: any;
            prev: LLRPLinkable | null;
            next: LLRPLinkable | null;

            setParent(p: this['parent']): this {
                this.parent = p;
                return this;
            }

            getParent(): this['parent'] {
                return this.parent;
            }

            setPrev(v: this['prev']): this {
                this.prev = v;
                return this;
            }

            getPrev(): this['prev'] {
                return this.prev;
            }

            setNext(v: this['next']): this {
                this.next = v;
                return this;
            }

            getNext(): this['next'] {
                return this.next;
            }
        }
) {};

export interface LLRPLinkable<P> {
    parent: P | null;
    prev: LLRPLinkable<P> | null;
    next: LLRPLinkable<P> | null;
}