import { LLRPCore, LLRPMessage, LLRPCoreDataTypes, LLRPServer } from "../src";

type LLRPServer = InstanceType<typeof LLRPServer>;
type LLRPMessage = InstanceType<typeof LLRPMessage>;

import net from "net";
import { promisify } from "util";

const sleep = promisify(setTimeout);
const getRandomEPC96 = () => {
    let i = 0;
    const result = [] as number[];
    while (i++ < 12) {
        result.push(Math.round(Math.random() * 255))
    }
    return result;
}

const getRandomEPCData = () => {
    let i = 0;
    const result = [] as number[];
    while (i++ < Math.round(8 + Math.random()* 24)) {
        result.push(Math.round(Math.random() * 255))
    }
    return result;
}

const getRandomTagReportData = () => {
    type tagReportData = LLRPCoreDataTypes["TagReportData"];
    type epc96 = LLRPCoreDataTypes["EPC_96"];
    type epcData = LLRPCoreDataTypes["EPCData"];

    const epc96 = {
        EPC_96: {
            EPC: getRandomEPC96()
        } as epc96
    };

    const epcData = {
        EPCData: {
            EPC: getRandomEPCData()
        } as epcData
    }

    const epc = Math.random() >= 0.5 ? epc96: epcData

    const tagReportData: tagReportData = {
        ...epc,
        AntennaID: {
            AntennaID: Math.round(Math.random() * 4)
        },
        FirstSeenTimestampUTC: {
            Microseconds: new Date((new Date).getTime() - Math.round(Math.random() * 10000))
        },
        LastSeenTimestampUTC: {
            Microseconds: new Date
        }
    };

    return tagReportData;
}

const getRandomROAccessReport = () => {
    let rOAccessReport: LLRPCoreDataTypes['RO_ACCESS_REPORT'];
    let result: typeof rOAccessReport['TagReportData'];
    if (Math.random() >= 0.5) {
        // array
        let i = 0
        result = [getRandomTagReportData()];
        while (i++ < (Math.random() * 10)) {
            result.push(getRandomTagReportData());
        }
    } else {
        // single
        result = getRandomTagReportData();
    }
    rOAccessReport = {
        TagReportData: result
    }
    return rOAccessReport;
}

class Main {
    reader: LLRPServer;

    keepAliveTimer: NodeJS.Timeout;
    keepAliveInterval = 10000;

    constructor(reader: LLRPServer) {
        this.reader = reader;
        this.reader.on("connection", () => {
            console.log("new connection");
            this.sendReaderEventNotification();
        });

        this.reader.on("error", err => {
            console.error(err);
        });

        this.reader.on("disconnect", () => {
            console.log("connection closed");
        });

        this.reader.on("ADD_ROSPEC", msg=> {
            const rsp = new LLRPCore.ADD_ROSPEC_RESPONSE({
                data: {
                    LLRPStatus: {
                        StatusCode: "M_Success",
                        ErrorDescription: "ROSpec added successfully"
                    }
                }
            });
            this.reader.send(rsp);
        });
        this.reader.on("DELETE_ROSPEC", msg => {
            const rsp = new LLRPCore.DELETE_ROSPEC_RESPONSE({
                data: {
                    LLRPStatus: {
                        StatusCode: "M_Success",
                        ErrorDescription: "All ROSpecs are deleted"
                    }
                }
            });
            this.reader.send(rsp);
        });
        this.reader.on("SET_READER_CONFIG", msg => {
            const rsp = new LLRPCore.SET_READER_CONFIG_RESPONSE({
                data: {
                    LLRPStatus: {
                        StatusCode: "M_Success",
                        ErrorDescription: "Reader restored to factory settings"
                    }
                }
            });
            this.reader.send(rsp);
        });
        this.reader.on("ENABLE_ROSPEC", msg => {
            const rsp = new LLRPCore.ENABLE_ROSPEC_RESPONSE({
                data: {
                    LLRPStatus: {
                        StatusCode: "M_Success",
                        ErrorDescription: "ROSpec enabled"
                    }
                }
            });
            this.reader.send(rsp);
        });
        this.reader.on("START_ROSPEC", async msg => {
            const rsp = new LLRPCore.START_ROSPEC_RESPONSE({
                data: {
                    LLRPStatus: {
                        StatusCode: "M_Success",
                        ErrorDescription: "ROSpec started"
                    }
                }
            });

            await this.reader.send(rsp);
            this.sendROAccessReports();
        })

        this.reader.on("KEEPALIVE_ACK", msg => { /** keep this connection up */ });

        this.reader.on("CLOSE_CONNECTION", async msg => {
            await this.reader.send(new LLRPCore.CLOSE_CONNECTION_RESPONSE({
                data: {
                    LLRPStatus: {
                        StatusCode: "M_Success",
                        ErrorDescription: "Connection closed gracefully"
                    }
                }
            }));
            await this.reader.disconnect();
        });
    }

    async sendReaderEventNotification() {
        const rsp = new LLRPCore.READER_EVENT_NOTIFICATION({
            data: {
                ReaderEventNotificationData: {
                    ConnectionAttemptEvent: {
                        Status: "Success"
                    },
                    UTCTimestamp: {
                        Microseconds: new Date()
                    }
                }
            }
        });
        await this.reader.send(rsp);
    }

    async sendROAccessReports() {
        await sleep(Math.random() * 1000 * 3);
        while (this.reader.socketWritable) {
            console.log("send RO_ACCESS_REPORT");
            const msg = new LLRPCore.RO_ACCESS_REPORT({
                data: getRandomROAccessReport()
            });
            this.reader.send(msg);
            await sleep(Math.random() * 1000 * 3);
        }
    }

    run() {
        this.reader.listen();
    }

    async cleanup() {
        this.keepAliveTimer && clearInterval(this.keepAliveTimer);
        await this.reader.close();
    }
}

const main = new Main(
    new LLRPServer()
);

main.run();
