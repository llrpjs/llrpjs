import { LLRPList } from "../base/list";
import { LLRPElement } from "./element";

export class LLRPElementList extends LLRPList {
    first: LLRPElement;
    last: LLRPElement;
}

export interface LLRPElementList {
    first: LLRPElement;
    last: LLRPElement;
}
