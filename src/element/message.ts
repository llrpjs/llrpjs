import { LLRPParameter } from "./parameter";

import { LLRPElement } from "./element";
import { LLRPUserData, Overwrite } from "../types";
import { LLRPFieldFactory } from "../field/llrp";
import { LLRPBuffer } from "../buffer/buffer";


export interface LLRPMessageI {
    id?: number,
    type: string,
    data?: LLRPUserData
}

type Encapsulate<T> = { data: T };

// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
  : T;


export class LLRPMessage<T extends LLRPUserData> extends LLRPElement {
    LLRPMESSAGETYPE: ExpandRecursively<Overwrite<Required<LLRPMessageI>, Encapsulate<this['LLRPDATATYPE']>>>;

    static readonly version: 1 = 1;
    static idCounter = 0;
    static getId() {
        return this.idCounter++;
    }

    protected rsvdVersionType = LLRPFieldFactory({
        name: "RsvdVersionTypeNum",
        type: "u16",
        format: "Normal"
    });
    protected messageLength = LLRPFieldFactory({
        name: "MessageLength",
        type: "u32",
        format: "Normal"
    });
    protected messageId = LLRPFieldFactory({
        name: "MessageID",
        type: "u32",
        format: "Normal"
    });

    get id() { return this.messageId.getValue() as number }
    set id(v: number) { this.messageId.setValue(v) }
    get type() { return this.getName() };
    set type(v: this['td']['name']) { this.setType(v); };


    constructor(arg: LLRPMessageI | Buffer) {
        super();
        if (arg instanceof Buffer) {
            this.setBuffer(new LLRPBuffer(arg));
            this.setStartBit(0);
            this.decode().marshal();  // convert this buffer to elements (TODO: this needs to be optimized to decode and marshal in one shot)
        } else {
            // unmarshalHeader
            this.id = arg.id ?? LLRPMessage.getId();
            this.type = arg.type;
            if (arg.data) this.setData(arg.data as T);
            this.unmarshal();   // convert this data to elements
        }
        this.setStartBit(0);
    }

    createElement(): LLRPParameter<LLRPUserData> {
        return new LLRPParameter();
    }

    setTypeByNumber(type: number) {
        let td = this.tr.getMsgTypeByTypeNum(type);
        if (!td) throw new Error(`typeNum not found ${type}`);
        this.setTypeDescriptor(td);
        return this;
    }

    setType(type: string) {
        super.setType(type);
        this.setMessageTypeNum(this.getTypeNum());
        return this;
    }

    assembleHeader() {
        super.assembleHeader();
        if (this.header.isEmpty) {
            this.header.push(this.rsvdVersionType);
            this.header.push(this.messageLength.setStartBit(this.rsvdVersionType.getBitSize()));
            this.header.push(this.messageId.setStartBit(this.messageLength.getBitSize()));
        }
        return this;
    }

    assemble() {
        super.assemble();
        const byteSize = this.getByteSize();
        this.setMessageLength(byteSize);
        this.setBuffer(new LLRPBuffer(Buffer.alloc(byteSize)));
        return this;
    }

    decodeHeader() {
        this.header.setStartBit(0);
        this.assembleHeader();
        this.header.decode();

        let version = this.getVersion();
        if (version !== LLRPMessage.version)
            throw new Error(`unsupported version ${version}`);

        this.setTypeByNumber(this.getMessageTypeNum());

        let length = this.getMessageLength();
        if (length < 10)
            throw new Error(`invalid message length ${length}`);

        this.setBitSize(length * 8);

        return this;
    }


    // Message tools

    setMessageLength(length: number) {
        this.messageLength.setValue(length);
        return this;
    }

    getMessageLength() {
        return this.messageLength.getValue() as number;
    }

    setMessageTypeNum(typeNum: number) {
        this.rsvdVersionType.setValue((LLRPMessage.version << 10) + typeNum);
        return this;
    }

    getMessageTypeNum() {
        return <number>this.rsvdVersionType.getValue() & 0x3ff;
    }

    setMessageId(id: number) {
        this.messageId.setValue(id);
        return this;
    }

    getMessageId() {
        return this.messageId.getValue();
    }

    getVersion() {
        return (<number>this.rsvdVersionType.getValue() & 0x1c00) >>> 10;
    }

    toLLRPData(): this['LLRPMESSAGETYPE'] {
        this.marshal();
        return {
            id: this.id,
            type: this.type,
            data: this.getData()
        } as this['LLRPMESSAGETYPE'];
    }
}

export interface LLRPMessage<T extends LLRPUserData> {
    LLRPDATATYPE: T;
}

// let msg = new LLRPMessage({
//     MessageID: 123,
//     MessageType: "ADD_ROSPEC"
// });
// console.log(msg);

// // Example 1:

// let msg = new Message({MessageID=123, MessageType="ADD_ROSPEC"});
// msg.addROSpec({
//     ROSpecID: 1,
//     Priority: 1,
//     ...
// }).encode();

// // Example 2:
// let msg = new Message({MessageID=123, MessageType="ADD_ROSPEC", MessageBody={
//     ROSpec: {
//         ROSpecID: 1,
//         Priority: 1,
//         ...
//     }
// }})

// // Example 3:
// let msg = new Message({MessageID=123, MessageType="ADD_ROSPEC"})
// let roSpec = new ROSpec({
//     ROSpecID: 1,
//     Priority: 1,
//     ...
// });
// msg.addROSpec(roSpec);


// // Example 4:
// let msg = new CADD_ROSPEC({
//     ROSpec: {
//         ROSpecID: 1,
//         Priority: 1,
//         ...
//     }
// });


// // Example 5:
// let msg = (new CADD_ROSPEC());
// msg.getROSpec()
//     .setROSpecID(1)
//     .setPriority(1);

// // Decode
// let buffer = Buffer.from("LLRP Binary Message!");
// let msg = LLRPMessage.new();
// let data = msg.setBuffer(buffer)
//     .setStartBit(0)
//     .decode()
//     .marshal()
//     .getData();

// console.log(data);

// // encode
// msg = new LLRPMessage();
// buffer = msg.setType("ADD_ROSPEC")
//     .setData({
//         ROSpec: {
//             ROSpecID: 1
//         }
//     })
//     .unmarshal()
//     .setBuffer(Buffer.alloc(msg.getByteSize()))
//     .encode()
//     .getBuffer();