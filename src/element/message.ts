import { LLRPParameter } from "./parameter";
import { LLRPElement } from "./element";
import { LLRPUserData, Overwrite } from "../types";
import { LLRPBuffer } from "../buffer/buffer";
import { LLRPMessageHeader } from "./header";
import { LLRPError } from "../base/error";


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
    LLRPDATATYPE: T;
    LLRPMESSAGETYPE: ExpandRecursively<Overwrite<Required<LLRPMessageI>, Encapsulate<this['LLRPDATATYPE']>>>;

    static readonly version: 1 = 1;
    static idCounter = 0;
    static getId() {
        return this.idCounter++;
    }

    header = new LLRPMessageHeader;

    get id() { return this.header.getMessageId() as number }
    set id(v: number) { this.header.setMessageId(v) }
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
        if (!td) throw new LLRPError("ERR_LLRP_BAD_TYPENUM", `typeNum not found ${type}`);
        this.setTypeDescriptor(td);
        return this;
    }

    setType(type: string) {
        super.setType(type);
        this.header.setMessageTypeNum(this.getTypeNum());
        return this;
    }

    assembleHeader() {
        super.assembleHeader();
        this.header.build();
        return this;
    }

    assemble() {
        super.assemble();
        const byteSize = this.getByteSize();
        this.header.setMessageLength(byteSize);
        this.setBuffer(new LLRPBuffer(Buffer.alloc(byteSize)));
        return this;
    }

    decodeHeader() {
        this.header.setStartBit(0);
        this.assembleHeader();
        this.header.decode();

        let version = this.header.getVersion();
        if (version !== LLRPMessageHeader.version)
            throw new LLRPError("ERR_LLRP_UNSUPPORTED_VERSION", `unsupported version ${version}`);

        this.setTypeByNumber(this.header.getMessageTypeNum());

        let length = this.header.getMessageLength();
        if (length < 10) throw new LLRPError("ERR_LLRP_INVALID_LENGTH",
            `invalid message length ${length}`);

        this.setBitSize(length * 8);

        return this;
    }

    toLLRPData(): this['LLRPMESSAGETYPE'] {
        return {
            id: this.id,
            type: this.type,
            data: this.getData()
        } as this['LLRPMESSAGETYPE'];
    }
}

export interface LLRPMessage<T extends LLRPUserData> { }
