
import { LLRPMessage as _LLRPMessage } from "./element/message";
import { LLRPMessage } from "./LLRPMessage";
import { ChoiceAtLeastOnce, GetCtrArgs, ParamAtLeastOnce } from "./types";


// Enum Types
type LLRP_D_ROSpec_CurrentState = "Disabled" | "InActive" | "Active";
type LLRP_D_LLRPStatus_Status = "OK" | "ERROR";


// parameters
type LLRP_D_ROSpec = {
    ROSpecID: number;
    Priority: number;
    CurrentState: LLRP_D_ROSpec_CurrentState;
}

type LLRP_D_LLRPStatus = {
    Status: LLRP_D_LLRPStatus_Status;
}

// Messages
type LLRP_D_ADD_ROSPEC = ParamAtLeastOnce<{
    ROSpec: LLRP_D_ROSpec;
}>;

type LLRP_D_ADD_ROSPEC_RESPONSE = {
    LLRPStatus: LLRP_D_LLRPStatus;
}

type LLRP_D_TEST_MESSAGE =
    ChoiceAtLeastOnce<{
        ROSpec: LLRP_D_ROSpec;
        LLRPStatus: LLRP_D_LLRPStatus;
    }>;

// Messages

export class LLRP_C_ADD_ROSPEC extends LLRPMessage {
    origin: _LLRPMessage<LLRP_D_ADD_ROSPEC>;

    constructor(args?: GetCtrArgs<LLRP_C_ADD_ROSPEC>) {
        super({ ...args, ...{ type: "ADD_ROSPEC" } });
    }

    addROSpec(v: LLRP_D_ROSpec) {
        this.origin.addSubElement("ROSpec", v);
        return this;
    }

    getROSpec(): LLRP_D_ROSpec {
        let e = this.origin.getSubElement("ROSpec");
        return e.toLLRPData();
    }
}

export class LLRP_C_ADD_ROSPEC_RESPONSE extends LLRPMessage {
    origin: _LLRPMessage<LLRP_D_ADD_ROSPEC_RESPONSE>;

    constructor(args?: GetCtrArgs<LLRP_C_ADD_ROSPEC_RESPONSE>) {
        super({ ...args, ...{ type: "ADD_ROSPEC_RESPONSE" } });
    }

    setLLRPStatus(v: LLRP_D_LLRPStatus) {
        return this.origin.setSubElement("LLRPStatus", v);
    }
}

// choice
export class LLRP_C_TEST_MESSAGE extends LLRPMessage {
    origin: _LLRPMessage<LLRP_D_TEST_MESSAGE>;

    constructor(args?: GetCtrArgs<LLRP_C_TEST_MESSAGE>) {
        super({ ...args, ...{ type: "TEST_MESSAGE" } });
    }

    addROSpec(v: LLRP_D_ROSpec) {
        this.origin.addSubElement("ROSpec", v);
        return this;
    }

    addLLRPStatus(v: LLRP_D_LLRPStatus) {
        this.origin.addSubElement("LLRPStatus", v);
        return this;
    }
}
