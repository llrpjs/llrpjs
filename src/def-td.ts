import { NamespaceDescriptor } from "./types";

const LLRP_NAMESPACE: NamespaceDescriptor = {
    prefix: "llrp",
    schemaLocation: "http://www.llrp.org/ltk/schema/core/encoding/xml/1.0/llrp.xsd",
    uri: "http://www.llrp.org/ltk/schema/core/encoding/xml/1.0"
};

// Parameters
export const LLRP_TD_ROSpec = {
    namespaceDescriptor: LLRP_NAMESPACE,

    isMessage: false,
    name: "ROSpec",
    typeNum: 128,

    fieldDescriptors: [
        {
            name: "ROSpecID",
            type: "u16",
            format: "Normal"
        },
        {
            name: "Priority",
            type: "u8",
            format: "Normal"
        },
        {
            name: "CurrentState",
            type: "u8",
            format: "Normal",
            enumTable: [
                {
                    name: "Disabled",
                    value: 0
                },
                {
                    name: "InActive",
                    value: 1
                },
                {
                    name: "Active",
                    value: 2
                }
            ]
        }
    ] as const,
    subTypeRefs: [] as const
};

export const LLRP_TD_LLRPStatus = {
    namespaceDescriptor: LLRP_NAMESPACE,

    isMessage: false,
    name: "LLRPStatus",
    typeNum: 129,

    fieldDescriptors: [
        {
            type: "u8",
            name: "Status",
            format: "Normal",
            enumTable: [
                {
                    name: "OK",
                    value: 0
                },
                {
                    name: "ERROR",
                    value: 1
                }
            ]
        }
    ],
    subTypeRefs: []
};

// Choice
export const LLRP_TD_Test = {
    namespaceDescriptor: LLRP_NAMESPACE,

    isMessage: false,
    name: "Test",
    typeNum: -1,

    fieldDescriptors: [],
    subTypeRefs: []
}

// Messages
export const LLRP_TD_ADD_ROSPEC = {
    namespaceDescriptor: LLRP_NAMESPACE,

    isMessage: true,
    name: "ADD_ROSPEC",
    typeNum: 122,

    responseType: "ADD_ROSPEC_RESPONSE",

    fieldDescriptors: [],
    subTypeRefs: [
        {
            td: "ROSpec",
            repeat: "1-N"
        }
    ]
};


export const LLRP_TD_ADD_ROSPEC_RESPONSE = {
    namespaceDescriptor: LLRP_NAMESPACE,

    isMessage: true,
    name: "ADD_ROSPEC_RESPONSE",
    typeNum: 123,

    fieldDescriptors: [],
    subTypeRefs: [
        {
            td: "LLRPStatus",
            repeat: "1"
        }
    ]
};

export const LLRP_TD_TEST_MESSAGE = {
    namespaceDescriptor: LLRP_NAMESPACE,

    isMessage: true,
    name: "TEST_MESSAGE",
    typeNum: 190,

    fieldDescriptors: [],
    subTypeRefs: [
        {
            td: "Test",
            repeat: "1-N",
            choices: [
                "ROSpec",
                "LLRPStatus"
            ]
        }
    ]
};