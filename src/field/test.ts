
// test

import { LLRPBuffer } from "../buffer/buffer";
import { LLRPFieldList } from "./list";
import { LLRPFieldFactory } from "./llrp";

let epc96 = LLRPFieldFactory({
    name: "EPC96",
    type: "u96",
    format: "Hex"
}).setValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

let testu1v = LLRPFieldFactory({
    name: "u1v",
    type: "u1v",
    format: "Hex"
}).setValue("E2501D0C0D81E8540C939E4AB39429920F073869BB34A02B5C56BD186ADEA8410A88B5F6F54FC4B6306B2B1A81EFA2D28C62663B519AA9670BC32F1CFF405F19193F0C1B43BB0A5904E281640ACEC1E1F419879B15C5865909E880635D1126585BC729BFC6904FAB62F3A4BA848ABC7C47FA2A88BC5262BC4AFBCBCF6A6643EA23")

let llrpStatus = LLRPFieldFactory({
    name: "LLRPStatus",
    type: "u8",
    format: "Normal",
    enumTable: [
        {
            name: "OK",
            value: 0
        } as const,
        {
            name: "ERROR",
            value: 1
        } as const
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
fieldList.push(testu1v);
fieldList.push(llrpStatus);
fieldList.push(readerHostname);
fieldList.push(microSeconds);

let buf = new LLRPBuffer(Buffer.alloc(fieldList.getByteSize()));
fieldList.setBuffer(buf).encode();

epc96.setValue([38, 3, 1, 2, 3, 5, 4, 8, 8, 1, 2, 3]);

fieldList.decode();

console.log(fieldList.getByteSize());
console.log(fieldList);

