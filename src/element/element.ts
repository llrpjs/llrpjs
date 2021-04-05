import { Base } from "../bryntum/chronograph/Base";
import { ClassUnion, MixinAny } from "../bryntum/chronograph/Mixin";
import { LLRPDataValue, LLRPElementI, LLRPUserData } from "../types";
import { LLRPData } from "./data";
import { LLRPFieldFactory } from "../field/llrp";
import { LLRPTypeDescriptor } from "./type-descriptor";
import { LLRPFieldList } from "../field/list";
import { LLRPNode } from "../base/node";
import { LLRPElementList } from "./list";
import { LLRPBuffer } from "../buffer/buffer";
import { LLRPField, LLRPFieldInstanceType } from "../field/field";
import { LLRPError } from "../base/error";

export class LLRPElement extends MixinAny(
    [LLRPNode, LLRPTypeDescriptor, LLRPData, Base],
    (base: ClassUnion<
        typeof LLRPNode,
        typeof LLRPTypeDescriptor,
        typeof LLRPData,
        typeof Base>) =>
        class LLRPElement extends base {
            header: LLRPFieldList = new LLRPFieldList();
            fieldList: LLRPFieldList = new LLRPFieldList();

            prev: LLRPElement = null;
            next: LLRPElement = null;

            subElementList: LLRPElementList = new LLRPElementList();

            createElement(args: LLRPElementI<LLRPUserData> | LLRPBuffer) {
                /** couldn't find a way to morph this on class level while passing the sub-class's method version in main class's methods */
                return new LLRPElement();
            }

            // List management
            setStartBit(bit: number) {
                super.setStartBit(bit);
                this.header.setStartBit(bit);
                this.fieldList.setStartBit(this.header.getEndBit() + 1);
                this.subElementList.setStartBit(this.fieldList.getEndBit() + 1);
                return this;
            }

            setBuffer(b: LLRPBuffer) {
                super.setBuffer(b);
                this.header.setBuffer(b);
                this.fieldList.setBuffer(b);
                this.subElementList.setBuffer(b);
                return this;
            }

            setField(name: string, data: LLRPDataValue) {
                let f = this.getSubType(name) as LLRPFieldInstanceType;
                if (!f) {
                    const fd = this.getFieldDescriptors().find(fd => fd.name === name);
                    if (fd) {
                        f = LLRPFieldFactory(fd);
                        this.addSubType(name, f);
                    } else throw new LLRPError("ERR_LLRP_FIELD_NOT_ALLOWED", `field ${name} not allowed in type ${this.getName()}`);
                }
                f.setValue(data);
                return this;
            }

            getField(name: string) {
                let f = this.getSubType(name);
                if (f instanceof LLRPField) {
                    return (<LLRPFieldInstanceType>f).getValue();
                }
                return null;
            }

            addSubElement(name: string, element: LLRPElement) {
                let tRef = this.getSubTypeRefByName(name);
                if (!tRef)
                    throw new LLRPError("ERR_LLRP_PARAM_NOT_ALLOWED",
                        `name ${name} is not referenced in type ${this.getName()}`);
                if (!this.isAllowedIn(tRef))
                    throw new LLRPError("ERR_LLRP_PARAM_NOT_ALLOWED",
                        `no more ${name} instances are allowed in type ${this.getName()}`);

                this.addSubType(tRef.td.name, element);
                return this;
            }

            setSubElement(name: string, element: LLRPElement) {
                let tRef = this.getSubTypeRefByName(name);
                if (!tRef)
                    throw new LLRPError("ERR_LLRP_PARAM_NOT_ALLOWED",
                        `name ${name} is not allowed in type ${this.getName()}`);
                if (!this.isAllowedIn(tRef))
                    throw new LLRPError("ERR_LLRP_PARAM_NOT_ALLOWED",
                        `no more ${name} instances are allowed in type ${this.getName()}`);

                if (this.getSubType(tRef.td.name)) this.removeSubType(tRef.td.name);

                this.addSubType(tRef.td.name, element);
                return this;
            }

            getSubElement(name: string) {
                let e = this.getSubType(name);
                if (e instanceof LLRPElement) {
                    return e;
                }
                if (Array.isArray(e)) {
                    return <LLRPElement[]>e;
                }
                return null;
            }

            // Data <--> Pool
            unmarshalFields() {
                for (let fd of this.getFieldDescriptors()) {
                    let name = fd.name;
                    let type = fd.type;

                    if (type === "reserved") continue;  // skip reserved, they can be added on assembly

                    let value = this.getDataKey(name) as any;
                    if (value === undefined) {
                        this.getSubType(name) || this.addSubType(name, LLRPFieldFactory(fd));
                        continue;
                    }
                    // get class
                    let f = LLRPFieldFactory(fd).setValue(value);
                    this.addSubType(name, f);
                }
                return this;
            }

            unmarshalSubElement(name: string, data: LLRPUserData, recordName = name) {
                let subElement: LLRPElement;
                if (Array.isArray(data)) {
                    for (let d of data) {
                        subElement = this.createElement({
                            type: name,
                            data: d
                        });
                        this.addSubType(recordName, subElement);
                        if (!this.isAllowedIn(recordName)) break;
                    }
                } else {
                    subElement = this.createElement({type: name, data});
                    this.addSubType(recordName, subElement);
                }
                return this;
            }

            unmarshalSubElements() {
                for (let name in this.getData()) {
                    let value = this.getDataKey(name);
                    let ref = this.getSubTypeRefByName(name);
                    if (!ref) continue;
                    // go on and check data
                    if (this.isChoice(ref)) {
                        let choiceName = ref.td.name;
                        if (this.isAllowedIn(ref))
                            this.unmarshalSubElement(name, value, choiceName);  // record it under the choice name
                    } else {
                        // normal
                        if (this.isAllowedIn(ref))
                            this.unmarshalSubElement(name, value);
                    }
                }
                return this;
            }

            unmarshal() {
                this.unmarshalFields()
                    .unmarshalSubElements();
                return this;
            }


            marshalFields() {
                for (let f of this.fieldList) {
                    if (f.getType() === "reserved") continue;
                    this.setDataKey(f.getName(), f.getValue());
                }
                return this;
            }

            marshalSubElements() {
                for (let e of this.subElementList) {
                    e.marshal();
                    this.setDataKey(e.getName(), e.getData());
                }
                return this;
            }

            marshal() {
                /**
                 * to marshal:
                 * Converting an object in memory into a format that can be written to disk, or sent over the wire, etc.
                 * ref: https://stackoverflow.com/questions/154185/what-is-object-marshalling
                 */
                /** convert from executable to user data */
                return this.setData({})
                    .marshalFields()
                    .marshalSubElements();
            }

            /** Pool <--> Element */
            assembleHeader() {
                this.header.clear();
                this.header.setStartBit(this.getStartBit());
                return this;
            }

            assembleFields() {
                this.fieldList.clear();
                this.fieldList.setStartBit(this.header.getEndBit() + 1);
                for (let fd of this.getFieldDescriptors()) {
                    if (fd.type !== "reserved") {
                        let f = this.getSubType(fd.name) as LLRPFieldInstanceType;
                        if (!f) throw new LLRPError("ERR_LLRP_MISSING_FIELD", `missing field ${fd.name}`);
                        this.fieldList.push(f);
                    } else {
                        // reserved
                        let f = LLRPFieldFactory(fd).setName("Reserved");
                        this.fieldList.push(f);
                    }
                }
                return this;
            }

            assembleSubElements() {
                this.subElementList.clear();
                this.subElementList.setStartBit(this.fieldList.getEndBit() + 1);
                for (let tRef of this.getSubTypeReferences()) {
                    let name = tRef.td.name;
                    let e = this.getSubType(name) as LLRPElement | LLRPElement[];
                    if (!e) {
                        if (this.isRequired(tRef))
                            throw new LLRPError("ERR_LLRP_MISSING_PARAM", `missing parameter ${name}`);
                        continue;
                    }
                    if (e instanceof LLRPElement) {
                        this.subElementList.push(e.assemble());
                    } else {
                        for (let subElement of e) {
                            this.subElementList.push(subElement.assemble());
                        }
                    }
                }
                return this;
            }

            assemble() {
                this.assembleHeader()
                    .assembleFields()
                    .assembleSubElements()
                    .setBitSize(
                        this.header.getBitSize()
                        + this.fieldList.getBitSize()
                        + this.subElementList.getBitSize());
                return this;
            }

            // Element <--> Buffer
            /**
             * Note:
             *  Decode routines also perform element disassembly since we don't need to wait for pooling user data
             */

            decodeHeader() {
                /**
                 * 1. decode the header from the buffer at current location
                 * 2. set the element's type
                 * 3. build the header fields and assign their values
                 * 4. updateStartBit
                 */
                return this;
            }

            decodeFields() {
                this.fieldList.setStartBit(this.header.getEndBit() + 1);
                for (let fd of this.getFieldDescriptors()) {
                    let f = LLRPFieldFactory(fd);
                    this.addSubType(f.getName(), f);
                    this.fieldList.push(f);
                }
                this.fieldList.decode();
                return this;
            }

            decodeSubElements() {
                this.subElementList.setStartBit(this.fieldList.getEndBit() + 1);
                /**
                 * possible cases:
                 * 1) our reference matches the decode header   (allowedIn)
                 * 2) our reference does not match the decode header
                 *      a) our decoded header has another reference in our records (allowedIn)
                 *      b) our decoded header has no reference in our records (error)
                 */
                let e = this.createElement(this.getBuffer());
                for (let tRef of this.getSubTypeReferences()) {
                    while (this.isAllowedIn(tRef) && this.withinBoundLimits) {
                        e.setStartBit(this.subElementList.getEndBit() + 1)   // pickup from where we left off
                            .decodeHeader();

                        if (!this.isReferenced(e.getName(), tRef)) {  // sanity check
                            // it probably belongs to the next parameter
                            break;
                        }

                        e.decodeFields().decodeSubElements();
                        if (this.isChoice(tRef))
                            this.addSubType(tRef.td.name, e);   // add it under its choice name
                        else
                            this.addSubType(e.getName(), e);
                        this.subElementList.push(e);
                        e = this.createElement(this.getBuffer());

                        if (this.isMaxOfOneRepeat(tRef)) break;
                    }
                }
                return this;
            }

            decode() {
                return this.decodeHeader()
                    .decodeFields()
                    .decodeSubElements();
            }

            encode() {
                super.encode();
                this.header.encode();
                this.fieldList.encode();
                this.subElementList.encode();
                return this;
            }

            toLLRPData(): any {
                return this.getData();
            }
        }
) { }

export interface LLRPElement {
    header: LLRPFieldList;
    fieldList: LLRPFieldList;
    subElementList: LLRPElementList;

    prev: LLRPElement;
    next: LLRPElement;
}
