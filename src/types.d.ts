
/** Buffer base types */
export type BOOL = boolean | 0 | 1;
export type CRUMB = 0 | 1 | 2 | 3;
export type LLRPRawDataValue = BOOL | CRUMB | number | bigint | string | number[] | bigint[] | void

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

export type LLRPBool = "u1";
export type LLRPCrumb = "u2";
export type LLRPNumber = "u8" | "s8" | "u16" | "s16" | "u32" | "s32";
export type LLRPBigInt = "u64" | "s64";
export type LLRPNumberVector = "u1v" | "u8v" | "s8v" | "u16v" | "s16v" | "u32v" | "s32v" | "bytesToEnd" | "u96";
export type LLRPBigIntVector = "u64v" | "s64v";
export type LLRPString = "utf8v";
export type LLRPVoid = "reserved";

export type GetFieldType<T extends LLRPRawDataValue> =
  T extends BOOL ? LLRPBool
  : T extends CRUMB ? LLRPCrumb
  : T extends number ? LLRPNumber
  : T extends bigint ? LLRPBigInt
  : T extends number[] ? LLRPNumberVector
  : T extends bigint[] ? LLRPBigIntVector
  : T extends string ? LLRPString
  : T extends void ? LLRPVoid
  : any;

/** LLRP Formats */
export type LLRPFMTNormal = never;
export type LLRPFMTDec = string;  // decimals
export type LLRPFMTHex = string;  // hex
export type LLRPFMTUTF8 = string; // strings
export type LLRPFMTDate = Date | string;  // dates
export type LLRPFormatValue = LLRPFMTNormal | LLRPFMTDec | LLRPFMTHex | LLRPFMTUTF8 | LLRPFMTDate;

/** LLRP Enum types */
export type LLRPEnumValue = string | string[];

/** LLRP Field data type */
export type LLRPDataValue = LLRPRawDataValue | LLRPFormatValue | LLRPEnumValue;

/** LLRP Field Descriptor tools */
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

export type LLRPEnumTableType = Readonly<EnumEntry[]>;

/** Field Descriptor */

export type FieldDescriptor<
  FT extends LLRPFieldType = LLRPFieldType,
  FMT extends LLRPFieldFormat = LLRPFieldFormat,
  ET extends LLRPEnumTableType = LLRPEnumTableType> = {
    name: string;
    type: FT;
    format: FMT;
    enumTable?: ET;
    bitCount?: number;
  }

export type GetFieldFormat<T> =
  T extends "u64" ? "Normal" | "Datetime"
  : T extends LLRPSimpleFieldType | LLRPVoidFieldType ? "Normal"
  : T extends LLRPVectorFieldType ? "Normal" | "Dec" | "Hex"
  : T extends LLRPStringFieldType ? "UTF8"
  : "Normal";

export type GetEnumTable<T extends LLRPFieldType> =
  T extends LLRPBool | LLRPCrumb | LLRPNumber | Exclude<LLRPNumberVector, "u96" | "bytesToEnd"> ? LLRPEnumTableType : never;

export type GetFieldFormatValue<T extends LLRPFieldFormat> =
  T extends "Datetime" ? LLRPFMTDate
  : T extends "Normal" ? LLRPFMTNormal
  : T extends "UTF8V" ? LLRPFMTUTF8
  : T extends "Hex" ? LLRPFMTHex
  : T extends "Dec" ? LLRPFMTDec
  : never;

export type GetEnumValue<T extends LLRPFieldType> =
  T extends LLRPNumber | LLRPBool | LLRPCrumb ?
  T extends Exclude<LLRPNumberVector, "u96" | "bytesToEnd"> ? never : string
  : T extends Exclude<LLRPNumberVector, "u96" | "bytesToEnd"> ? string[] : never;

export type GetFieldRawValue<T extends LLRPFieldType> =
  T extends LLRPVoidFieldType ? void
  : T extends "u64" | "s64" ? bigint
  : T extends "u1" ? BOOL
  : T extends "u2" ? CRUMB
  : T extends "utf8v" ? string
  : T extends LLRPSimpleFieldType ? number
  : T extends "u64v" | "s64v" ? bigint[]
  : T extends LLRPVectorFieldType ? number[]
  : never;

/** Complex types */

export interface SubTypeReference {
  td: TypeDescriptor;
  repeat: LLRPRepeat;
  choices?: TypeDescriptor[];  // has a value when this parameter is a choice
}

export interface TypeDescriptor {
  isMessage: boolean;
  name: string;
  typeNum: number;

  vendorDescriptor?: VendorDescriptor;
  namespaceDescriptor: NamespaceDescriptor;

  responseType?: TypeDescriptor;

  fieldDescriptors: FieldDescriptor<LLRPFieldType>[];
  subTypeRefs: SubTypeReference[];
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

/** User data type (message and parameter data passed by/presented to users) */
export type LLRPUserData = {
  [x: string]: LLRPUserDataValue;
}

export type LLRPUserDataValue = LLRPDataValue | LLRPUserData | LLRPUserData[];

// Type registry tools
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type SubTypeRefDefinition = Readonly<Overwrite<SubTypeReference, {
  td: string;
  choices?: Readonly<string[]>;
}>>;

export type TypeDefinition<T extends string = string> = Readonly<Overwrite<TypeDescriptor, {
  name: T;
  fieldDescriptors: ExpandRecursively< Readonly<Overwrite<FieldDescriptor, {enumTable: LLRPEnumTableType}>[]>>;
  responseType?: string;
  subTypeRefs: Readonly<SubTypeRefDefinition[]>;
}>>;

export type LLRPDefinition = {
  LLRPTypeDefinitions: {
      [x in string] : TypeDefinition
  };
  LLRPMessageNames: Readonly<string[]>;
  LLRPParamNames: Readonly<string[]>;
}

// expands object types one level deep
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
export type ExpandRecursively<T> = T extends object
    ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
    : T;