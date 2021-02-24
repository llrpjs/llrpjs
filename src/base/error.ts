const LLRP_ERROR_CODES = [
    "ERR_LLRP_MISSING_FIELD",
    "ERR_LLRP_MISSING_PARAM",
    "ERR_LLRP_NO_RSP_DEF",
    "ERR_LLRP_NO_DATA_IN_BUF",
    "ERR_LLRP_BAD_TYPENUM",
    "ERR_LLRP_NO_DEF_FOUND",
    "ERR_LLRP_PARAM_NOT_ALLOWED",
    "ERR_LLRP_UNEXPECTED_TYPE",
    "ERR_LLRP_UNSUPPORTED_VERSION",
    "ERR_LLRP_UNKNOWN_TYPE",
    "ERR_LLRP_BAD_FORMAT",
    "ERR_LLRP_BAD_ENUM",
    "ERR_LLRP_INVALID_LENGTH",
    "ERR_LLRP_INTERNAL"
] as const;

export type LLRP_ERROR_CODES = typeof LLRP_ERROR_CODES[number];


export class LLRPError extends Error {
    name: LLRP_ERROR_CODES;
    constructor(code: LLRP_ERROR_CODES, message?: string) {
        super(message);
        this.name = code;
    }
}
 