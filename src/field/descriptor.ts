import { Base } from "../bryntum/chronograph/Base";
import { AnyConstructor, Mixin, MixinAny } from "../bryntum/chronograph/Mixin";
import { FieldDescriptor, GetFieldFormat, LLRPFieldType } from "../types";


export interface LLRPFieldDescriptor {
    FT: LLRPFieldType;
}

export class LLRPFieldDescriptor extends Mixin(
    [],
    (base: AnyConstructor) =>
        class LLRPFieldDescriptor extends base {
            FT: any;
            fd: FieldDescriptor<this['FT']>;

            constructor() {
                super();
                this.fd = {
                    name: "undefined",
                    type: "u8",
                    format: "Normal"
                } as FieldDescriptor<this['FT']>
            }

            setDefaultFormat(): this {
                this.fd.format = (this.fd.type == "utf8v" ? "UTF8V" : "Normal") as GetFieldFormat<this['FT']>;
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
            setType(v: this['FT']): this {
                this.fd.type = v;
                return this;
            }

            getType(): this['FT'] {
                return this.fd.type as this['FT'];
            }

            // format
            setFormat(v: GetFieldFormat<this['FT']>): this {
                this.fd.format = v;
                return this;
            }

            getFormat(): GetFieldFormat<this['FT']> {
                return this.fd.format as GetFieldFormat<this['FT']>;
            }

            isType(type: LLRPFieldType | LLRPFieldType[]): boolean {
                if (Array.isArray(type)) {
                    return type.includes(this.fd.type);
                }
                return this.fd.type == type;
            }

            get isVectorType(): boolean {
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

            get isNumeric(): boolean {
                return ![
                    "reserved",
                    "utf8"
                ].includes(this.fd.type)
            }

            get isBigInt(): boolean {
                return [
                    "u64", "s64",
                    "u64v", "s64v"
                ].includes(this.fd.type)
            }

            get isString(): boolean {
                return "utf8v" == this.fd.type;
            }

            get isReserved(): boolean {
                return "reserved" == this.fd.type;
            }

            get isNormalFormattable(): boolean {
                return this.fd.format == "Normal";
            }

            get isDecFormattable(): boolean {
                return (this.isNumeric || this.isBigInt) && this.fd.format == "Dec";
            }

            get isHexFormattable(): boolean {
                return (this.isNumeric || this.isBigInt) && this.fd.format == "Hex";
            }

            get isUtf8Formattable(): boolean {
                return this.fd.type == "utf8v";
            }

            get isDateFormattable(): boolean {
                return [
                    "u64",
                    "u64v"
                ].includes(this.fd.type) && this.fd.format == "Datetime";
            }

            get isEnumerable(): boolean {
                return this.isNumeric && this.fd.enumTable ? true : false;
            }
        }
) { }
