import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPBound } from "../buffer/bound";
import { LLRPBuffer } from "../buffer/buffer";

export class LLRPNode extends Mixin(
    [LLRPBound],
    (base: AnyConstructor<LLRPBound, typeof LLRPBound>) =>
        class LLRPNode extends base {
            buffer: LLRPBuffer;
            prev: LLRPNode = null;
            next: LLRPNode = null;

            setBuffer(b: LLRPBuffer) {
                this.buffer = b;
                return this;
            }

            getBuffer() {
                return this.buffer;
            }

            setPrev(v: LLRPNode) {
                this.prev = v;
                return this;
            }

            setNext(v: LLRPNode) {
                this.next = v;
                return this;
            }

            encode() {
                this.buffer.setBitIndex(this.getStartBit());
                return this;
            }
    
            decode() {
                this.buffer.setBitIndex(this.getStartBit());
                return this;
            }

            get withinBoundLimits () {
                return this.buffer.getBitIndex() <= this.getEndBit();
            }
        }
) { };

export interface LLRPNode {
    prev: LLRPNode;
    next: LLRPNode;
}