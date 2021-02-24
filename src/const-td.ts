
/**
 * Message header field descriptors
 */

export const LLRP_TD_RSVD_VERSION_TYPENUM = {
    name: "RsvdVersionTypeNum",
    type: "u16",
    format: "Normal"
} as const;

export const LLRP_TD_MESSAGE_LENGTH = {
    name: "MessageLength",
    type: "u32",
    format: "Normal"
} as const;

export const LLRP_TD_MESSAGE_ID = {
    name: "MessageID",
    type: "u32",
    format: "Normal"
} as const;

/**
 * TLV parameter header field descriptors
 */

export const LLRP_TD_RSVD_TYPENUM = {
    name: "RsvdTLVTypeNum",
    type: "u16",
    format: "Normal"
} as const;

export const LLRP_TD_PARAM_LENGTH = {
    name: "TLVparamLength",
    type: "u16",
    format: "Normal"
} as const;

/**
 * TV parameter header field descriptor
 */

export const LLRP_TD_TV_TYPENUM = {
    name: "TVTypeNum",
    type: "u8",
    format: "Normal"
} as const;