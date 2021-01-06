
import { LLRPFieldData } from "./data";
import { LLRPFMTDate, LLRPFMTDec, LLRPFMTHex, LLRPFormat, LLRPDataType, LLRPFieldFormat, GetFieldFormat, GetFieldDataType, LLRPFieldType, GetFormatValType } from "../types";
import { AnyConstructor, ClassUnion, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPFieldDescriptor } from "./descriptor";

const ISO8601_REGEX_MILLI = /(?<=\.)\d{3}(?=Z)/;
const ISO8601_REGEX_MICRO = /(?<=\.)\d{6}(?=Z)/;


export class LLRPFormatterParser<
    FT extends LLRPFieldType> extends Mixin(
        [LLRPFieldData],
        (base: AnyConstructor<LLRPFieldData<LLRPFieldType>, typeof LLRPFieldData>) =>
            class LLRPFormatterParser extends base {
                fValue: any;

                getFormattedValue(): this['fValue'] {
                    return this.fValue;
                }

                getInitialfValue(): this['fValue'] {
                    return (this.isNormalFormattable ? undefined
                        : this.isDecFormattable || this.isHexFormattable ? "0"
                            : this.isDateFormattable ? new Date()
                                : "") as this['fValue']
                }

                protected static fullPrecision = true;

                protected static formatIso8601Microseconds(microseconds: bigint): string {
                    const date = (new Date(Number(microseconds / 1000n))).toISOString();
                    const residue = (microseconds % 1000000n).toString().padStart(6, "0");
                    return date.replace(ISO8601_REGEX_MILLI, residue);
                }

                protected static parseIso8601Microseconds(timestamp: LLRPFMTDate): bigint {
                    // seconds
                    if (timestamp instanceof Date)
                        timestamp = timestamp.toJSON();
                    let time = Math.floor(Date.parse(timestamp) / 1000);

                    const microseconds = parseInt(timestamp.match(ISO8601_REGEX_MICRO)?.toString() || "", 10);
                    if (isNaN(microseconds))
                        throw new Error(`cannot parse microseconds ${timestamp}`);

                    return BigInt(time * 1000000 + microseconds);
                }

                protected static enableFullPrecision(): void {
                    LLRPFormatterParser.fullPrecision = true;
                }

                protected static disableFullPrecision(): void {
                    LLRPFormatterParser.fullPrecision = false;
                }

                // Formatters

                protected static formatNormal(): void {
                }

                protected static formatDec(value: number | bigint): LLRPFMTDec {
                    return value.toString(10);
                }

                protected static formatDecVector(value: (number | bigint)[]): LLRPFMTDec {
                    return value.map(x => LLRPFormatterParser.formatDec(x)).join(' ');
                }

                protected static formatHex(value: number | bigint, bitWidth: number): LLRPFMTHex {
                    return value.toString(16).padStart(bitWidth / 4, "0").toUpperCase();
                }

                protected static formatHexVector(value: (number | bigint)[], bitWidth: number): LLRPFMTHex {
                    return value.map(x => LLRPFormatterParser.formatHex(x, bitWidth)).join('')
                }

                protected static formatDateTime(value: bigint): string {
                    return LLRPFormatterParser.fullPrecision ?
                        LLRPFormatterParser.formatIso8601Microseconds(value)
                        : (new Date(Number(value) / 1000)).toString();
                }

                protected static formatUTF8(value: string): string {
                    return value;
                }
                // Parsers

                protected static parseDec(v: string): number {
                    return parseInt(v, 10);
                }

                protected static parseDecVector(v: string): number[] {
                    return v.split(' ').map(() => LLRPFormatterParser.parseDec(v));
                }

                protected static parseHex(v: string): number {
                    return parseInt(v, 16);
                }

                protected static parseHexVector(v: string, bitWidth: number): number[] {
                    let n = bitWidth / 4;
                    return v.split('').reduce((acc, x, i) => (i % n == 0) && (i != 0) ? `${acc},${x}` : `${acc}${x}`, '')
                        .split(',').map(x => parseInt(x.padEnd(2, "0"), 16))
                }

                protected static parseDateTime(v: LLRPFMTDate): bigint {
                    return LLRPFormatterParser.fullPrecision ? LLRPFormatterParser.parseIso8601Microseconds(v)
                        : BigInt(new Date(v)) * 1000n;
                }

                protected static parseUTF8(value: string): string {
                    return value;
                }

                /** methods */
                public format(): this {
                    if (this.isNormalFormattable) {

                        this.fValue = LLRPFormatterParser.formatNormal();   // void

                    } else if (this.isDecFormattable) {

                        this.fValue = (this.isVectorType ?
                            LLRPFormatterParser.formatDecVector(this.iValue as (number | bigint)[])
                            : LLRPFormatterParser.formatDec(this.iValue as number | bigint));

                    } else if (this.isHexFormattable) {

                        this.fValue = (this.isVectorType ?
                            LLRPFormatterParser.formatHexVector(this.iValue as (number | bigint)[], this.bitWidth)
                            : LLRPFormatterParser.formatHex(this.iValue as number | bigint, this.bitWidth));


                    } else if (this.isUtf8Formattable) {

                        this.fValue = LLRPFormatterParser.formatUTF8(this.iValue as string);

                    } else if (this.isDateFormattable) {

                        this.fValue = LLRPFormatterParser.formatDateTime(this.iValue as bigint);
                    }
                    return this;
                }

                public parse(): this {
                    if (this.isNormalFormattable) {
                        // pass
                    } else if (this.isDecFormattable) {

                        this.iValue = this.isVectorType ?
                            LLRPFormatterParser.parseDec(this.fValue as string)
                            : LLRPFormatterParser.parseDecVector(this.fValue as string)

                    } else if (this.isHexFormattable) {

                        this.iValue = this.isVectorType ?
                            LLRPFormatterParser.parseHexVector(this.fValue as string, this.bitWidth)
                            : LLRPFormatterParser.parseHex(this.fValue as string);

                    } else if (this.isUtf8Formattable) {

                        this.iValue = LLRPFormatterParser.parseUTF8(this.fValue as string);

                    } else if (this.isDateFormattable) {

                        this.iValue = LLRPFormatterParser.parseDateTime(this.fValue as LLRPFMTDate);

                    }
                    return this;
                }
            }
    ) { }

export interface LLRPFormatterParser<FT extends LLRPFieldType> {
    FT: FT;
    iValue: GetFieldDataType<FT>;
    fValue: GetFormatValType<FT>;

    bitWidth: Readonly<number>;

    format(): this;
    parse(): this;
}

// Test


// let n = new LLRPFormatterParser<"u64v">();
// n.setType("u64v");
// n.setName("MessageType");
// n.setFormat("Hex");
// n.setValue([255n, 28n, 34n, 65n]);
// n.bitWidth = 64;
// n.format();
// n.fValue = '00000000000000FF000000000000001C00000000000000220000000000000255';
// n.parse();

// console.log(n);