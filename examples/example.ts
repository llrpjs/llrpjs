
import { LLRPClient, LLRPCore, LLRPCoreDataTypes } from "../src";
import * as ADD_ROSPEC from "./ADD_ROSPEC.json";
const ADD_ROSPEC_DATA = ADD_ROSPEC.data as LLRPCoreDataTypes['ADD_ROSPEC'];

// create a client
//const reader = new LLRPClient({ host: "192.168.7.2" });
const reader = new LLRPClient();

reader.on("RO_ACCESS_REPORT", msg => {
    let tagReportDataList = msg.getTagReportData();
    if (!Array.isArray(tagReportDataList)) {
        tagReportDataList = [tagReportDataList]
    }
    for (let tagReportData of tagReportDataList) {
        let epc = tagReportData.getEPCParameter();
        console.log(`EPC: ${epc.getEPC()}`);
    }
});
reader.on("READER_EVENT_NOTIFICATION", msg => {
    // handle reader event notification messages here
});

reader.on("error", err => {
    // handle errors
});
reader.on("connect", () => {
    console.log("connected");
})
reader.on("disconnect", () => {
    console.log("disconnected");
});

/** Main */
(async () => {
    try {
        // connect to reader
        await reader.connect();
        // wait for connection confirmation
        await checkConnectionStatus();
        // start scanning for RFID tags
        await startReaderOperation();

        console.log("Press ctrl+c to exit");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

/**
 * wait for a READER_EVENT_NOTIFICATION message
 */
const checkConnectionStatus = async () => {
    let msg = await reader.recv(7000);
    if (!(msg instanceof LLRPCore.READER_EVENT_NOTIFICATION)) {
        throw new Error(`connection status check failed - unexpected message ${msg.getName()}`);
    }
    const status = msg.getReaderEventNotificationData().getConnectionAttemptEvent()?.getStatus();
    if (status != "Success") {
        throw new Error(`connection status check failed ${status}`);
    }
    return;
}

/**
 * perform all operations necessary to start the reader
 */
const startReaderOperation = async () => {
    // delete all existing ROSpecs (if any)
    await reader.transact(new LLRPCore.DELETE_ROSPEC({
        data: { ROSpecID: 0 /** all */}
    }));

    // factory reset
    await reader.transact(new LLRPCore.SET_READER_CONFIG({
        data: { ResetToFactoryDefault: true }
    }));

    // add ROSpec defined in "./ADD_ROSPEC.json"
    await reader.transact(new LLRPCore.ADD_ROSPEC({
        data: ADD_ROSPEC_DATA
    }));

    // enable ROSpec
    await reader.transact(new LLRPCore.ENABLE_ROSPEC({
        data: { ROSpecID: ADD_ROSPEC_DATA.ROSpec.ROSpecID }
    }));

    // start ROSpec
    await reader.transact(new LLRPCore.START_ROSPEC({
        data: { ROSpecID: ADD_ROSPEC_DATA.ROSpec.ROSpecID }
    }));
}

process.on("SIGINT", async () => {
    // request termination
    const rsp = await reader.transact(new LLRPCore.CLOSE_CONNECTION);
    if (rsp instanceof LLRPCore.CLOSE_CONNECTION_RESPONSE) {
        const status = rsp.getLLRPStatus();
        console.log(`${status.getErrorDescription()} - ${status.getStatusCode()}`)
    }
    // make sure it's disconnected
    if (reader.socketWritable) await reader.disconnect();
});
