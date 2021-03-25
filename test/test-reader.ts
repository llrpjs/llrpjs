// Server
import { LLRPDef } from "../src/def";
import { LLRPMessageFactory } from "../src/LLRPFactory";
import { LLRPReader } from "../src/reader/reader";
import { TypeRegistry } from "../src/type-registry";

//import net from "net";
import { LLRPMessage } from "../src/LLRPMessage";
import { LLRPUserData } from "../src/types";

import net from "net";

TypeRegistry.getInstance().enrollCoreDefinitions(LLRPDef).build();

const LLRPCoreMessages = LLRPMessageFactory(LLRPDef);


const server = net.createServer(function (socket) {
    const timer = setInterval(() => {
        socket.write(new LLRPCoreMessages.KEEPALIVE().encode().getBuffer());
    }, 1500);

    socket.on("close", () => {
        console.log("connection closed");
        clearInterval(timer);
    });

    socket.on("connect", () => console.log("connected"));

    socket.on("data", data => {
        const msg = new LLRPMessage(data).decode();
        if (msg.getName() === "KEEPALIVE_ACK") return;
        setTimeout(() => {
            const msg = new LLRPCoreMessages.ADD_ROSPEC_RESPONSE({
                data: {
                    LLRPStatus: {
                        StatusCode: "M_Success",
                        ErrorDescription: "ROSpec added successfully"
                    }
                }
            });
            socket.write(msg.encode().getBuffer());
        }, 200);
    });
});

server.listen(1337, '127.0.0.1');


// Client

const reader = new LLRPReader({
    host: "localhost",
    port: 1337
});

const msg = new LLRPCoreMessages.ADD_ROSPEC({
    data: {
        ROSpec: {
            ROSpecID: 12345,
            Priority: 2,
            CurrentState: "Disabled",
            ROBoundarySpec: {
                ROSpecStartTrigger: {
                    ROSpecStartTriggerType: "Null"
                },
                ROSpecStopTrigger: {
                    ROSpecStopTriggerType: "Null",
                    DurationTriggerValue: 0
                }
            },
            AISpec: [
                {
                    AntennaIDs: [1, 2, 3, 4],
                    AISpecStopTrigger: {
                        AISpecStopTriggerType: "Duration",
                        DurationTrigger: 5000
                    },
                    InventoryParameterSpec: {
                        InventoryParameterSpecID: 1,
                        ProtocolID: "EPCGlobalClass1Gen2"
                    }
                },
                {
                    AntennaIDs: [3, 4],
                    AISpecStopTrigger: {
                        AISpecStopTriggerType: "Null",
                        DurationTrigger: 0
                    },
                    InventoryParameterSpec: {
                        InventoryParameterSpecID: 2,
                        ProtocolID: "EPCGlobalClass1Gen2"
                    }
                }
            ],
            RFSurveySpec: {
                AntennaID: 1,
                StartFrequency: 980000,
                EndFrequency: 990000,
                RFSurveySpecStopTrigger: {
                    StopTriggerType: "N_Iterations_Through_Frequency_Range",
                    DurationPeriod: 0,
                    N: 10
                }
            }
        }
    }
});

(async () => {
    try {
        await reader.connect();
        for (let i = 0; i < 100; i++) {
            console.log("send message");
            const rsp = await reader.transact(msg);
            console.log(rsp.toLLRPData());
        }
    } catch (e) {
        console.error(e);
    }

    server.close();
    await reader.disconnect();
})();

reader.on("message", (msg: LLRPMessage<LLRPUserData>) => {
    const data = msg.toLLRPData();
    if (data.type === "KEEPALIVE") {
        console.log(data.type);
        reader.send(new LLRPCoreMessages.KEEPALIVE_ACK()).catch(console.error);
    }
});

reader.on("error", err => {
    console.error(err);
});
