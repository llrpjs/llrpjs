import { LLRPList } from "../base/list";
import { LLRPElement } from "./element";

export class LLRPElementList extends LLRPList {
    first: LLRPElement;
    last: LLRPElement;

    static getElementList(l: LLRPList) {
        let elementList = new this;
        elementList.first = l.first as LLRPElement;
        elementList.last = l.last as LLRPElement;
        elementList.length = l.length;
        return elementList;
    }

    toLLRPData() {
        let result = [];
        for (let e of this) result.push(e.toLLRPData());
        return result;
    }
}

export interface LLRPElementList {
    first: LLRPElement;
    last: LLRPElement;
}

// let e = LLRPElement.new({
//     type: "ADD_ROSPEC"
// });
// e.addSubElement(LLRPElement.new({type: "ROSpec"}));
// console.log(e);

