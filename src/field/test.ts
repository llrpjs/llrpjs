
// test

import { LLRPBuffer } from "../buffer/buffer";
import { LLRPFieldList } from "./list";
import { LLRPFieldFactory } from "./llrp";

let epc96 = LLRPFieldFactory({
    name: "EPC96",
    type: "u96",
    format: "Hex"
}).setValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);


let llrpStatus = LLRPFieldFactory({
    name: "LLRPStatus",
    type: "u8",
    format: "Normal",
    enumTable: [
        {
            name: "OK",
            value: 0
        },
        {
            name: "ERROR",
            value: 1
        }
    ]
}).setValue("ERROR");

let readerHostname = LLRPFieldFactory({
    name: "ReaderHostname",
    type: "utf8v",
    format: "UTF8"
});
readerHostname.setValue("llrp-test-reader.local")

//LLRPField.disableFullPrecision();

let microSeconds = LLRPFieldFactory({
    name: "Microseconds",
    type: "u64",
    format: "Datetime"
}).setValue("2021-02-18T16:17:06.691123Z");

let fieldList = new LLRPFieldList();
fieldList.setStartBit(0);
fieldList.push(epc96);
fieldList.push(llrpStatus);
fieldList.push(readerHostname);
fieldList.push(microSeconds);

let buf = new LLRPBuffer(Buffer.alloc(fieldList.getByteSize()));
fieldList.setBuffer(buf).encode();

epc96.setFormat("Normal").setValue([38, 3, 1, 2, 3, 5, 4, 8, 8, 1, 2, 3]);

fieldList.decode();

console.log(fieldList.getByteSize());
console.log(fieldList);

