import { Base } from "./bryntum/chronograph/Base";
import { AnyConstructor, MixinAny } from "./bryntum/chronograph/Mixin";

/** Linkable Mixin*/

export class LLRPLinkable<P> extends MixinAny(
    [],
    (base: AnyConstructor) =>
        class LLRPLinkable extends base {
            parent: any;
            prev: LLRPLinkable;
            next: LLRPLinkable;

            setParent(p: this['parent']): this {
                this.parent = p;
                return this;
            }

            getParent(): this['parent'] {
                return this.parent;
            }

            setPrev(v: LLRPLinkable): LLRPLinkable {
                this.prev = v;
                return this;
            }

            getPrev(): LLRPLinkable {
                return this.prev;
            }

            setNext(v: LLRPLinkable): LLRPLinkable {
                this.next = v;
                return this;
            }

            getNext(): LLRPLinkable {
                return this.next;
            }
        }
) {};

export interface LLRPLinkable<P> {
    parent: P | null;
    prev: LLRPLinkable<P> | null;
    next: LLRPLinkable<P> | null;
}