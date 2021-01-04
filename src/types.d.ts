
/** Buffer base types */
export type BOOL = boolean | 0 | 1;
export type CRUMB = 0 | 1 | 2 | 3;
/** LLRP intermediary types */
export type LLRPDataType = BOOL | CRUMB | number | bigint | string | (number | bigint)[] | void

export type LLRPSimpleFieldType =
  | "u1" | "u2"
  | "u8" | "s8"
  | "u16" | "s16"
  | "u32" | "s32"
  | "u64" | "s64"

export type LLRPVectorFieldType =
  | "u1v"
  | "u8v" | "s8v"
  | "u16v" | "s16v"
  | "u32v" | "s32v"
  | "u64v" | "s64v"
  | "u96"
  | "bytesToEnd"

export type LLRPStringFieldType = "utf8v"

export type LLRPVoidFieldType = "reserved"

export type LLRPFieldType = LLRPSimpleFieldType | LLRPVectorFieldType | LLRPStringFieldType | LLRPVoidFieldType


/** LLRP Formats */
export type LLRPFMTNormal = void;
export type LLRPFMTDec = string;  // decimals
export type LLRPFMTHex = string;  // hex
export type LLRPFMTUTF8 = string; // strings
export type LLRPFMTDate = Date | string;  // dates
export type LLRPFormat = LLRPFMTNormal | LLRPFMTDec | LLRPFMTHex | LLRPFMTUTF8 | LLRPFMTDate;


export type LLRPFieldFormat =
  | "Normal"
  | "Dec"
  | "Hex"
  | "Datetime"
  | "UTF8"

export type LLRPRepeat =
  | "0-1"   // optional/only once
  | "1"     // mandatory/only once
  | "0-N"   // optional/multiple
  | "1-N"   // mandatory/multiple

/** Enumerator */
export interface EnumEntry {
  name: string,
  value: number
}

/** Field */
/*
export interface FieldDescriptor {
  name: string;
  type: LLRPFieldType;
  format: LLRPFieldFormat;
  enumTable?: EnumEntry[];
  bitCount?: number;
}
*/

export type FieldDescriptor<FT extends LLRPFieldType> = {
  name: string;
  type: FT;
  format: GetFieldFormat<FT>;
  enumTable?: EnumEntry[];
  bitCount?: number;
}

export type GetFieldFormat<T extends LLRPFieldType> =
  T extends "u64" ? "Normal" | "Datetime"
  : T extends LLRPSimpleFieldType | LLRPVoidFieldType ? "Normal"
  : T extends LLRPVectorFieldType ? "Normal" | "Dec" | "Hex"
  : T extends LLRPStringFieldType ? "UTF8"
  : never

export type GetFormatValType<T extends LLRPDataType> = T extends void ? void : string;


export type GetFieldDataType<T extends LLRPFieldType> =
  T extends LLRPVoidFieldType ? void
  : T extends "u64" | "s64" ? bigint
  : T extends "u1" ? BOOL
  : T extends "u2" ? CRUMB
  : T extends "utf8v" ? string
  : T extends LLRPSimpleFieldType ? number
  : T extends "u64v" | "s64v" ? bigint[]
  : T extends LLRPVectorFieldType ? number[]
  : never

export interface ParameterReference {
  type: string;
  repeat: LLRPRepeat;
  choices: Array<TypeDescriptor> | null;  // has a value when this parameter is a choice
}

export interface TypeDescriptor {
  isMessage: boolean;
  name: string;
  typeNum: number;

  vendorDescriptor: VendorDescriptor;
  namespaceDescriptor: NamespaceDescriptor;

  responseType: TypeDescriptor | null;

  fieldDescriptors: FieldDescriptor<LLRPFieldType>[];
  parameterRefs: Array<ParameterReference>;
}

export interface VendorDescriptor {
  /** @brief Vendor name (e.g. Acme) */
  name: string;
  /** @brief Vendor IANA PEN */
  vendorID: number;
}

export interface NamespaceDescriptor {
  /** @brief Adding prefix to message/parameter name (useful for vendor-specific messages). */
  prefix: string;
  /** @brief The actual namespace identifier. */
  uri: string;
  /** @brief JSON schema location associated with the given namespace. */
  schemaLocation: string;
}