import { LLRPFMTDate, LLRPFMTDec, LLRPFMTHex } from "../types";
import { AnyConstructor, Mixin } from "../bryntum/chronograph/Mixin";
import { LLRPFieldDescriptor } from "./descriptor";
import { LLRPError } from "../base/error";

const ISO8601_REGEX_MILLI = /(?<=\.)\d{3}(?=Z)/;
const ISO8601_REGEX_MICRO = /(?<=\.)\d{6}(?=Z)/;


export class LLRPFormatterParser extends Mixin(
    [LLRPFieldDescriptor],
    (base: AnyConstructor<LLRPFieldDescriptor, typeof LLRPFieldDescriptor>) =>
    class LLRPFormatterParser extends base {
        RV: any;
        FMTV: any;

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

            let microseconds = parseInt(timestamp.match(ISO8601_REGEX_MICRO)?.toString() || "", 10);
            if (isNaN(microseconds))
                microseconds = parseInt(timestamp.match(ISO8601_REGEX_MILLI)?.toString() || "", 10) * 1000;

            if (isNaN(microseconds))
                throw new LLRPError("ERR_LLRP_BAD_FORMAT", `cannot parse microseconds ${timestamp}`);

            return BigInt(time * 1000000 + microseconds);
        }

        static enableFullPrecision(): void {
            LLRPFormatterParser.fullPrecision = true;
        }

        static disableFullPrecision(): void {
            LLRPFormatterParser.fullPrecision = false;
        }

        // Formatters

        protected static formatNormal(value: any) {
            return value;
        }

        protected static formatDec(value: number | bigint): LLRPFMTDec {
            return value.toString(10);
        }

        protected static formatDecVector(value: (number | bigint)[]) {
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
                : (new Date(Number(value) / 1000)).toJSON();
        }

        protected static formatUTF8(value: string): string {
            return value;
        }
        // Parsers
        protected static parseNormal(v: any) {
            return v;
        }

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
            v = v.trim().split('').reduce((acc, x, i) => (i % n == 0) && (i != 0) ? `${acc},${x}` : `${acc}${x}`, '');
            return v.length ? v.split(',').map(x => parseInt(x.padEnd(2, "0"), 16)) : [];
        }

        protected static parseDateTime(v: LLRPFMTDate): bigint {
            return LLRPFormatterParser.fullPrecision ? LLRPFormatterParser.parseIso8601Microseconds(v)
                : BigInt(new Date(v)) * 1000n;
        }

        protected static parseUTF8(value: string): string {
            return value;
        }

        /** methods */
        public getFormatted(v: this['RV']) {
            let res: this['FMTV'];
            if (this.isNormalFormattable)
                res = LLRPFormatterParser.formatNormal(v);   // void

            else if (this.isDecFormattable)
                res = (this.isVectorType ?
                    LLRPFormatterParser.formatDecVector(v as number[] | bigint[])
                    : LLRPFormatterParser.formatDec(v as number | bigint));

            else if (this.isHexFormattable)
                res = (this.isVectorType ?
                    LLRPFormatterParser.formatHexVector(v as (number | bigint)[], this.bitWidth)
                    : LLRPFormatterParser.formatHex(v as number | bigint, this.bitWidth));

            else if (this.isUtf8Formattable)
                res = LLRPFormatterParser.formatUTF8(v as string);

            else if (this.isDateFormattable)
                res = LLRPFormatterParser.formatDateTime(v as bigint);

            return res;
        }

        public getParsed(v: this['FMTV']) {
            let res: this['RV'];
            if (this.isNormalFormattable)
                res = LLRPFormatterParser.parseNormal(v);

            else if (this.isDecFormattable)
                res = this.isVectorType ?
                    LLRPFormatterParser.parseDec(v as string)
                    : LLRPFormatterParser.parseDecVector(v as string)

            else if (this.isHexFormattable)
                res = this.isVectorType ?
                    LLRPFormatterParser.parseHexVector(v as string, this.bitWidth)
                    : LLRPFormatterParser.parseHex(v as string);

            else if (this.isUtf8Formattable)
                res = LLRPFormatterParser.parseUTF8(v as string);

            else if (this.isDateFormattable)
                res = LLRPFormatterParser.parseDateTime(v as LLRPFMTDate);

            return res;
        }
    }
) { }

export interface LLRPFormatterParser { }
