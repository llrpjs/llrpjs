import { AnyConstructor } from "./bryntum/chronograph/Mixin";

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

export type LLRPUserDataValue = any;

/** Class interfaces */
export interface LLRPElementI<T extends LLRPUserData, N extends string = string> {
  type: N,
  data: Id<T>
}

export interface LLRPMessageI<T extends LLRPUserData, N extends string = string> extends LLRPElementI<T, N> {
  id?: number,
}

export interface LLRPParameterI<T extends LLRPUserData, N extends string = string> extends LLRPElementI<T, N> { }

// Type registry tools
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type SubTypeRefDefinition = Readonly<Overwrite<SubTypeReference, {
  td: string;
  choices: Readonly<string[]>;
}>>;

export type TypeDefinition<T extends string = string> = Readonly<Overwrite<TypeDescriptor, {
  name: T;
  fieldDescriptors: Readonly<Overwrite<FieldDescriptor, { enumTable: LLRPEnumTableType }>[]>;
  responseType?: string;
  subTypeRefs: Readonly<SubTypeRefDefinition[]>;
}>>;

export type LLRPAllTypeDefinitions = Readonly<{
  [x in string]: TypeDefinition<x>
}>;

export type Id<T> = T extends Date ? Date : T extends object ? {} & { [P in keyof T]: Id<T[P]> } : T;
export type Trim<T, S extends string> = T extends `${S}${infer U}` ? Trim<U, S> : T extends `${S}${infer U}` ? Trim<U, S> : T;




/** LLRP data type helpers and tools */
// an array type of 1-N repeat
type NonEmptyArray<T> = [T, ...T[]];

// Parameter: 1
type ParamOnlyOnce<T> = Required<T>;
// Parameter: 1-N
type ParamAtLeastOnce<T, Keys extends keyof T = keyof T> = {
  [K in Keys]: T[K] | NonEmptyArray<T[K]>;
};
// Parameter: 0-N
type ParamMultipleOptional<T, Keys extends keyof T = keyof T> = {
  [K in Keys]?: T[K] | NonEmptyArray<T[K]>;
};
// Parameter: 0-1
type ParameterOnceAtMost<T> = Partial<T>;

// Choice: 1-N
type ChoiceAtLeastOnce<T, Keys extends keyof T = keyof T> = [Keys] extends [never] ? {} : {
  [K in Keys]-?:
  Required<ParamAtLeastOnce<Pick<T, K>>>
  & Partial<ParamAtLeastOnce<Pick<T, Exclude<Keys, K>>>>
}[Keys];
// Choice: 0-N
type ChoiceMultipleOptional<T> = ChoiceAtLeastOnce<T> | {
  [K in keyof T]?: undefined
}
// Choice: 1
type ChoiceOnlyOnce<T, Keys extends keyof T = keyof T> = [Keys] extends [never] ? {} : {
  [K in Keys]-?:
  Required<Pick<T, K>>
  & Partial<Record<Exclude<Keys, K>, undefined>>
}[Keys];
// Choice: 0-1
type ChoiceOnceAtMost<T> = ChoiceOnlyOnce<T> | {
  [K in keyof T]?: undefined
}

// Fields
export type FieldDefinition = Readonly<FieldDescriptor>;
export type GetEnum<FD extends FieldDefinition> = FD['enumTable'][number]['name'] | FD['enumTable'][number]['value'];
export type GetDataTypeFromFieldType<FD extends FieldDefinition> = Id<
  | GetFieldRawValue<FD['type']>
  | GetFieldFormatValue<FD['format']>
  | GetEnum<FD>>

export type GetDataTypeFromFD<
  FD extends FieldDefinition,
  _FD extends Exclude<FD, { type: "reserved" }> = Exclude<FD, { type: "reserved" }>,
  K extends _FD['name'] = _FD['name']> = {
    [x in K]: Id<GetDataTypeFromFieldType<Extract<FD, { name: x }>>>
  };

// Sub-parameters
export type GetDefFromRef<AD extends LLRPAllTypeDefinitions, Ref extends SubTypeRefDefinition> = AD[Ref['td']]

export type GetNormalSubTypes<AD extends LLRPAllTypeDefinitions, Ref extends SubTypeRefDefinition> =
  Exclude<GetDefFromRef<AD, Ref>, { typeNum: -1 }>;

export type GetChoiceSubTypes<AD extends LLRPAllTypeDefinitions, Ref extends SubTypeRefDefinition> =
  AD[Ref['choices'][number]];

export type RequiredOnceRef<Ref extends SubTypeRefDefinition> = Extract<Ref, { repeat: "1" }>
export type OptionalOnceRef<Ref extends SubTypeRefDefinition> = Extract<Ref, { repeat: "0-1" }>
export type RequiredAtLeastOnceRef<Ref extends SubTypeRefDefinition> = Extract<Ref, { repeat: "1-N" }>
export type OptionalManyRef<Ref extends SubTypeRefDefinition> = Extract<Ref, { repeat: "0-N" }>

export type GetParamDataTypeFromTRef<
  AD extends LLRPAllTypeDefinitions,
  Ref extends SubTypeRefDefinition,
  // parameters
  ParamOnceDef extends GetNormalSubTypes<AD, RequiredOnceRef<Ref>> = GetNormalSubTypes<AD, RequiredOnceRef<Ref>>,
  ParamOnceAtMostDef extends GetNormalSubTypes<AD, OptionalOnceRef<Ref>> = GetNormalSubTypes<AD, OptionalOnceRef<Ref>>,
  ParamAtLeastOnceDef extends GetNormalSubTypes<AD, RequiredAtLeastOnceRef<Ref>> = GetNormalSubTypes<AD, RequiredAtLeastOnceRef<Ref>>,
  ParamOptionalManyDef extends GetNormalSubTypes<AD, OptionalManyRef<Ref>> = GetNormalSubTypes<AD, OptionalManyRef<Ref>>
  > =
  // 1
  ([ParamOnceDef] extends [never] ? {} : ParamOnlyOnce<{
    [x in ParamOnceDef['name']]: GetDataType<AD, AD[x]>
  }>) &
  // 0-1
  ([ParamOnceAtMostDef] extends [never] ? {} : ParameterOnceAtMost<{
    [x in ParamOnceAtMostDef['name']]: GetDataType<AD, AD[x]>
  }>) &
  // 1-N
  ([ParamAtLeastOnceDef] extends [never] ? {} : ParamAtLeastOnce<{
    [x in ParamAtLeastOnceDef['name']]: GetDataType<AD, AD[x]>
  }>) &
  // 0-N
  ([ParamOptionalManyDef] extends [never] ? {} : ParamMultipleOptional<{
    [x in ParamOptionalManyDef['name']]: GetDataType<AD, AD[x]>
  }>);

export type GetChoiceDataTypeFromRef<
  AD extends LLRPAllTypeDefinitions,
  Ref extends SubTypeRefDefinition,
  // choices
  ChoiceOnceDef extends GetChoiceSubTypes<AD, RequiredOnceRef<Ref>> = GetChoiceSubTypes<AD, RequiredOnceRef<Ref>>,
  ChoiceOnceAtMostDef extends GetChoiceSubTypes<AD, OptionalOnceRef<Ref>> = GetChoiceSubTypes<AD, OptionalOnceRef<Ref>>,
  ChoiceAtLeastOnceDef extends GetChoiceSubTypes<AD, RequiredAtLeastOnceRef<Ref>> = GetChoiceSubTypes<AD, RequiredAtLeastOnceRef<Ref>>,
  ChoiceOptionalManyDef extends GetChoiceSubTypes<AD, OptionalManyRef<Ref>> = GetChoiceSubTypes<AD, OptionalManyRef<Ref>>
  > = &
  // 1
  ([ChoiceOnceDef] extends [never] ? {} : ChoiceOnlyOnce<{
    [x in ChoiceOnceDef['name']]: GetDataType<AD, AD[x]>
  }>) &
  // 0-1
  ([ChoiceOnceAtMostDef] extends [never] ? {} : ChoiceOnceAtMost<{
    [x in ChoiceOnceAtMostDef['name']]: GetDataType<AD, AD[x]>
  }>) &
  // 1-N
  ([ChoiceAtLeastOnceDef] extends [never] ? {} : ChoiceAtLeastOnce<{
    [x in ChoiceAtLeastOnceDef['name']]: GetDataType<AD, AD[x]>
  }>) &
  // 0-N
  ([ChoiceOptionalManyDef] extends [never] ? {} : ChoiceMultipleOptional<{
    [x in ChoiceOptionalManyDef['name']]: GetDataType<AD, AD[x]>
  }>);

export type GetDataType<
  AD extends LLRPAllTypeDefinitions,
  T extends TypeDefinition<string>> =
  GetDataTypeFromFD<T['fieldDescriptors'][number]> & (
    GetParamDataTypeFromTRef<AD, T['subTypeRefs'][number]> &
    GetChoiceDataTypeFromRef<AD, T['subTypeRefs'][number]>)




/** Extract all type names */
export type LLRPAllNames<AD extends LLRPAllTypeDefinitions, K extends keyof AD = keyof AD> = K;
export type LLRPMessageNames<AD extends LLRPAllTypeDefinitions, K extends keyof AD = keyof AD> = Extract<AD[K], { isMessage: true }>['name'];
export type LLRPParamNames<AD extends LLRPAllTypeDefinitions, K extends keyof AD = keyof AD> = Extract<Exclude<AD[K], { typeNum: -1 }>, { isMessage: false }>['name'];
export type LLRPChoiceNames<AD extends LLRPAllTypeDefinitions, K extends keyof AD = keyof AD> = Extract<AD[K], { typeNum: -1 }>['name']

/** Type descriptor attribute extractors */
export type GetFieldDescriptors<TD extends TypeDefinition> = TD['fieldDescriptors'][number];
export type GetSubTypeRefs<TD extends TypeDefinition> = TD['subTypeRefs'][number];
export type GetChoiceRefNames<Ref extends SubTypeRefDefinition> = Ref['choices'][number];

/** Top-level class constructor argument types */
export type GetTypedMessageCtrArgs<M extends LLRPMessageI<any, any>> =
  Partial<Pick<M, "id">> & Pick<M, "data">;

export type GetTypedParamCtrArgs<P extends LLRPParameterI<any> = LLRPParameterI<any>> = Pick<P, "data">;



/** */


export type GetMessageClassType<
  M extends AnyConstructor,
  P extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  N extends LLRPMessageNames<AD> = LLRPMessageNames<AD>,
  TD extends AD[N] = AD[N],
  Data extends GetDataType<AD, TD> = GetDataType<AD, TD>,
  FD extends GetFieldDescriptors<TD> = GetFieldDescriptors<TD>
  > = new (args?: GetTypedMessageCtrArgs<LLRPMessageI<Data, N>>) => InstanceType<M> &
    GetFieldSettersGetters<M, Exclude<FD, { type: "reserved"; }>> &
    GetAllSubParamSettersGetters<P, AD, GetSubTypeRefs<TD>>;

export type GetParamClassType<
  P extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  N extends LLRPParamNames<AD> = LLRPParamNames<AD>,
  TD extends AD[N] = AD[N],
  Data extends GetDataType<AD, TD> = GetDataType<AD, TD>,
  FD extends GetFieldDescriptors<TD> = GetFieldDescriptors<TD>
  > = new (args?: GetTypedParamCtrArgs<LLRPParameterI<Data, N>>) => InstanceType<P> &
    GetFieldSettersGetters<P, Exclude<FD, { type: "reserved"; }>> &
    GetAllSubParamSettersGetters<P, AD, GetSubTypeRefs<TD>>;


export type GetAllTypedMessageClasses<M extends AnyConstructor, P extends AnyConstructor, AD extends LLRPAllTypeDefinitions> = {
  [x in LLRPMessageNames<AD>]:
  GetMessageClassType<M, P, AD, x>
}

export type GetAllTypedParamClasses<P extends AnyConstructor, AD extends LLRPAllTypeDefinitions> = {
  [x in LLRPParamNames<AD>]:
  GetParamClassType<P, AD, x>
}



export type GetFieldSettersGetters<E extends AnyConstructor, FD extends FieldDefinition> = {
  [x in `set${FD['name']}`]: (v: GetDataTypeFromFieldType<Extract<FD, { name: Trim<x, "set">; }>>) => InstanceType<E>;
} & {
    [x in `get${FD['name']}`]: () => GetDataTypeFromFieldType<Extract<FD, { name: Trim<x, "get">; }>>;
  };
// Sub-export type setters/getters tools
export type GetAllSubParamSettersGetters<
  SP extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  Ref extends SubTypeRefDefinition> =
  GetOnceSettersGetters<SP, AD, Extract<Ref, { repeat: "0-1" | "1"; }>> &
  GetManySettersGetters<SP, AD, Extract<Ref, { repeat: "0-N" | "1-N"; }>>;

export type GetOnceSettersGetters<
  SP extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  Ref extends SubTypeRefDefinition,
  choiceRef extends Exclude<Ref, { td: LLRPParamNames<AD>; }> = Exclude<Ref, { td: LLRPParamNames<AD>; }>,
  normalRef extends Exclude<Ref, { td: LLRPChoiceNames<AD>; }> = Exclude<Ref, { td: LLRPChoiceNames<AD>; }>> =
  {
    [x in `set${choiceRef['td']}`]: SubChoiceSetter<SP, AD, GetChoiceRefNames<Extract<choiceRef, { td: Trim<x, "set">; }>>>;
  } & {
    [x in `set${normalRef['td']}`]: SubParameterSetter<SP, AD, Extract<Ref, { td: Trim<x, "set">; }>['td']>;
  } & {
    [x in `get${choiceRef['td']}`]: SubChoiceGetter<SP, AD, GetChoiceRefNames<Extract<choiceRef, { td: Trim<x, "get">; }>>>;
  } & {
    [x in `get${normalRef['td']}`]: SubParameterGetter<SP, AD, Extract<Ref, { td: Trim<x, "get">; }>['td']>;
  };

export type GetManySettersGetters<
  SP extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  Ref extends SubTypeRefDefinition,
  choiceRef extends Exclude<Ref, { td: LLRPParamNames<AD>; }> = Exclude<Ref, { td: LLRPParamNames<AD>; }>,
  normalRef extends Exclude<Ref, { td: LLRPChoiceNames<AD>; }> = Exclude<Ref, { td: LLRPChoiceNames<AD>; }>> =
  {
    [x in `add${choiceRef['td']}`]: SubChoiceSetter<SP, AD, GetChoiceRefNames<Extract<choiceRef, { td: Trim<x, "add">; }>>>;
  } & {
    [x in `add${normalRef['td']}`]: SubParameterSetter<SP, AD, Extract<Ref, { td: Trim<x, "add">; }>['td']>;
  } & {
    [x in `get${choiceRef['td']}`]: SubChoiceManyGetter<SP, AD, GetChoiceRefNames<Extract<choiceRef, { td: Trim<x, "get">; }>>>;
  } & {
    [x in `get${normalRef['td']}`]: SubParamManyGetter<SP, AD, Extract<Ref, { td: Trim<x, "get">; }>['td']>;
  };

export type SubParameterSetter<
  P extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  N extends LLRPParamNames<AD>> = <U>(this: U, p: InstanceType<GetParamClassType<P, AD, N>>) => U;

export type SubParameterGetter<
  P extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  N extends LLRPParamNames<AD>> = <U>(this: U) => InstanceType<GetParamClassType<P, AD, N>> | null;
export type SubChoiceSetter<
  P extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  N extends LLRPChoiceNames<AD>> = <U>(this: U, p: GetLLRPParameterUnion<P, AD, N>) => U;
export type SubChoiceGetter<
  P extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  N extends LLRPChoiceNames<AD>> = <U>(this: U) => GetLLRPParameterUnion<P, AD, N> | null;

export type SubParamManyGetter<
  P extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  N extends LLRPParamNames<AD>> = <U>(this: U) => GetLLRPParameterUnion<P, AD, N> | GetLLRPParameterUnion<P, AD, N>[];

export type SubChoiceManyGetter<
  P extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions,
  N extends LLRPParamNames<AD>> = <U>(this: U) => GetLLRPParameterUnion<P, AD, N> | GetLLRPParameterUnion<P, AD, N>[];

export type GetLLRPParameterUnion<
  P extends AnyConstructor,
  AD extends LLRPAllTypeDefinitions, N extends LLRPParamNames<AD>> = {
    [x in N]: InstanceType<GetParamClassType<P, AD, Extract<N, x>>>;
  }[N];
