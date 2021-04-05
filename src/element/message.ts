import { LLRPParameter } from "./parameter";
import { LLRPElement } from "./element";
import { LLRPMessageI, LLRPParameterI, LLRPUserData } from "../types";
import { LLRPBuffer } from "../buffer/buffer";
import { LLRPMessageHeader } from "./header";
import { LLRPError } from "../base/error";


export class LLRPMessage<T extends LLRPUserData, N extends string = string> extends LLRPElement {
    LLRPMESSAGETYPE: LLRPMessageI<T, N>;
    LLRPDATATYPE: this['LLRPMESSAGETYPE']['data'];

    static readonly version: 1 = 1;
    static idCounter = 0;
    static getId() {
        return this.idCounter++;
    }

    header = new LLRPMessageHeader;

    get id() { return this.header.getMessageId() as number }
    set id(v: number) { this.header.setMessageId(v) }
    get type(): N { return this.getName() as N };
    set type(v: N) { this.setType(v); };

    get responseType() { return this.td.responseType };

    constructor(args?: LLRPMessageI<T, N> | LLRPBuffer) {
        super();
        if (args) {
            if (args instanceof LLRPBuffer) {
                this.setBuffer(args);
            } else {
                // unmarshalHeader
                this.id = args.id ?? LLRPMessage.getId();
                this.type = args.type;
                this.setData(args.data);
                this.unmarshal();   // convert this data to elements
            }
        }
        this.setStartBit(0);
    }

    createElement(args: LLRPParameterI<LLRPUserData> | LLRPBuffer) {
        return new LLRPParameter(args);
    }

    setTypeByNumber(type: number) {
        let td = this.tr.getMsgTypeByTypeNum(type);
        if (!td) throw new LLRPError("ERR_LLRP_BAD_TYPENUM", `typeNum not found ${type}`);
        this.setTypeDescriptor(td);
        return this;
    }

    setType(type: N) {
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
