
// test

import { LLRPBuffer } from "../buffer/buffer";
import { LLRPFieldList } from "./list";
import { LLRPU64, LLRPU8, LLRPU96, LLRPUTF8V } from "./llrp";

let epc96 = new LLRPU96();
epc96.setName("EPC96")
    .setFormat("Hex")
    .setValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .format()


let llrpStatus = new LLRPU8();
llrpStatus.fd.enumTable = [
    {
        name: "OK",
        value: 0
    },
    {
        name: "ERROR",
        value: 1
    }
]
llrpStatus.setName("LLRPStatus")
    .setValue(1)
    .convertToEnum()

let readerHostname = new LLRPUTF8V();
readerHostname.setValue("llrp-test-reader.local")

//LLRPField.disableFullPrecision();

let microSeconds = new LLRPU64();
microSeconds.setName("Microseconds").setValue(9812387384343n).setFormat("Datetime").format();

let fieldList = new LLRPFieldList();
fieldList.setStartBit(0);
fieldList.push(epc96);
fieldList.push(llrpStatus);
fieldList.push(readerHostname);
fieldList.push(microSeconds);

let buf = new LLRPBuffer(Buffer.alloc(fieldList.getByteSize()));
fieldList.setBuffer(buf).encode();

epc96.setValue([38,3,1,2,3,5,4,8,8,1,2,3]);

fieldList.decode();

console.log(fieldList.getByteSize());
console.log(fieldList);

