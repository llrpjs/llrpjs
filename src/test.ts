import { LLRPMessage } from "./LLRPMessage";
import { TypeRegistry } from "./type-registry";
import * as DEF from "./def";


TypeRegistry.getInstance().build();
let n = new DEF.LLRP_C_TEST_MESSAGE({id: 0x123456, data: {
    ROSpec: {
        ROSpecID: 0x123,
        Priority: 0x45,
        CurrentState: "Active"
    },
    LLRPStatus: {
        Status: "ERROR"
    }
}});
n.addROSpec({
    ROSpecID: 12345,
    Priority: 2,
    CurrentState: "Disabled"
}).encode();

console.log(n.getBuffer());

let m = new LLRPMessage(n.getBuffer());
console.log(JSON.stringify(m.toLLRPData(), null, 2));

// let n = new LLRP_C_ADD_ROSPEC();
// n.setMessageId(0x12345678)
// n.setROSpec({
//     ROSpecID: 0x1234,
//     Priority: 0x99,
//     CurrentState: "InActive"
// }).encode();
// console.log(n.toLLRPData());
// console.log(n.getBuffer());

// let m = new LLRPMessage(n.getBuffer().getBuffer());
// console.log(m.toLLRPData());

/**
 * Alternative view on how to transform data from UserData to Elements:
 *  We could use object pooling (by name?) and directly create elements and assign data to them respectively.
 *  For Example:
 *  on message creation, we immediately build up all fields since we're going to build them anyways at some point.
 *  we also build mandatory parameters.
 *  we build optional parameters as the data come in.
 *
 *  Advantages:
 *      1) we would have one source of truth instead of two (UserData and Elements)
 *
 *  Disadvantages:
 *      1) building elements in three places (constructor for mandatory, in data setters for optional, in buffer decoding)
 *      2) how would you pass user data down to pooled sub-parameters?
 *      3) complicated!
 */

/**
 * Building fields:
 *      - Iterate element's field descriptors:
 *          - create field from fd
 *          - get data for this fd from (callback)
 *          - if no data, throw error "missing field"
 *          - set data
 *          - add to the field list (don't pool)
 */

/**
 * Create parameter(td, data):
 *          - create parameter and assign td and data
 *          - Build fields and assimilate data
 *          - Build sub-parameters and assimilate data
 */

/**
 * Build sub-parameter and assimilate data:
 *          - get data for this ref from (callback)
 *          - if no data, throw error "missing param" if mandatory
 *          - if data is array, iterate and create parameter(td, d) if allowedIn add to pool
 *          - if not array, create parameter(td, data) if allowedIn add to pool
 */

/**
 * Building sub-parameters and assimilate data:
 *      - for each reference:
 *          - if choice:
 *              - for each choice: build sub-parameter and assimilate data:
 *          - if normal:
 *              - build sub-parameter and assimilate data
 *
 */

/**
 * Building from data:
 *      - Determine type from LLRPMessage/LLRPParameter classes, or directly from the element's end-user class (e.g: ADD_ROSPEC)
 *      - build header
 *      - Build fields and assimilate their data
 *      - Build mandatory sub-parameters and assimilate their data (add optional sub-parameters on the fly)
 */




/**
 * Decode
 *      - decode fields
 *      - decode sub-parameter list
 */

/**
 * Building from buffer:
 *      - Build header in LLRPMessage or LLRPParameter and decode it
 *      - Build fields and decode
 *      - Build mandatory sub-parameters
 *      - Decode and build additional (optional) sub-parameters
 */