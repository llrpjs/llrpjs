import { Base } from "../bryntum/chronograph/Base";
import { AnyConstructor, Mixin, MixinAny } from "../bryntum/chronograph/Mixin";
import { FieldDescriptor, GetFieldFormat, LLRPFieldFormat, LLRPFieldType } from "../types";

const BITWIDTH: {[key in LLRPFieldType]: 0|1|2|8|16|32|64} = {
    "u1": 1,
    "u2": 2,
    "u8": 8,
    "s8": 8,
    "u16": 16,
    "s16": 16,
    "u32": 32,
    "s32": 32,
    "u64": 64,
    "s64": 64,
    "u96": 8,
    "bytesToEnd": 8,
    "reserved": 0,
    "u1v": 1,
    "u8v": 8,
    "s8v": 8,
    "u16v": 16,
    "s16v": 16,
    "u32v": 32,
    "s32v": 32,
    "u64v": 64,
    "s64v": 64,
    "utf8v": 8
}

export interface LLRPFieldDescriptor {
    fd: FieldDescriptor<LLRPFieldType>;
}

export class LLRPFieldDescriptor extends Mixin(
    [Base],
    (base: AnyConstructor<Base, typeof Base>) =>
        class LLRPFieldDescriptor extends base {
            fd: FieldDescriptor<LLRPFieldType>;

            setDefaultFormat(): this {
                this.fd.format = (this.fd.type == "utf8v" ? "UTF8V" : "Normal") as LLRPFieldFormat;
                return this;
            }

            setDescriptor(fd: this['fd']) {
                this.fd = fd;
                return this;
            }

            // name
            setName(name: string): this {
                this.fd.name = name;
                return this;
            }

            getName(): string {
                return this.fd.name;
            }

            // type
            setType(v: this['fd']['type']): this {
                this.fd.type = v;
                return this;
            }

            getType() {
                return this.fd.type;
            }

            // format
            setFormat(v: this['fd']['format']): this {
                this.fd.format = v;
                return this;
            }

            getFormat() {
                return this.fd.format;
            }

            isType(type: LLRPFieldType | LLRPFieldType[]) {
                if (Array.isArray(type)) {
                    return type.includes(this.fd.type);
                }
                return this.fd.type == type;
            }

            get bitWidth () {
                if (this.fd.type === "reserved") {
                    return this.fd.bitCount;
                }
                return BITWIDTH[this.fd.type];
            }

            get isVectorType() {
                return [
                    "u1v",
                    "u8v", "s8v",
                    "u16v", "s16v",
                    "u32v", "s32v",
                    "u64v", "s64v",
                    "u96",
                    "bytesToEnd"
                ].includes(this.fd.type);
            }

            get isNumeric() {
                return ![
                    "reserved",
                    "utf8"
                ].includes(this.fd.type)
            }

            get isBigInt() {
                return [
                    "u64", "s64",
                    "u64v", "s64v"
                ].includes(this.fd.type)
            }

            get isString() {
                return "utf8v" == this.fd.type;
            }

            get isReserved() {
                return "reserved" == this.fd.type;
            }

            get isNormalFormattable() {
                return this.fd.format == "Normal";
            }

            get isDecFormattable() {
                return (this.isNumeric || this.isBigInt) && this.fd.format == "Dec";
            }

            get isHexFormattable() {
                return (this.isNumeric || this.isBigInt) && this.fd.format == "Hex";
            }

            get isUtf8Formattable() {
                return this.fd.type == "utf8v";
            }

            get isDateFormattable() {
                return [
                    "u64",
                    "u64v"
                ].includes(this.fd.type) && this.fd.format == "Datetime";
            }

            get isEnumerable() {
                return this.isNumeric && this.fd.enumTable ? true : false;
            }
        }
) { }
