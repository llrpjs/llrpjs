import { LLRPMessage, LLRPClient, LLRPCoreDataTypes, LLRPCore } from "../src/";
import net from "net";


const server = net.createServer(function (socket) {
    const timer = setInterval(() => {
        //        socket.write(new LLRPCoreMessages.KEEPALIVE().encode().getBuffer());
    }, 1500);

    socket.on("close", () => {
        console.log("connection closed");
        clearInterval(timer);
    });

    socket.on("connect", () => console.log("connected"));

    socket.on("data", data => {
        const msg = new LLRPMessage(data).decode();
        if (msg.getName() === "KEEPALIVE_ACK") return;
        const rsp = new LLRPCore.ADD_ROSPEC_RESPONSE({
            id: msg.getMessageId(),
            data: {
                LLRPStatus: {
                    StatusCode: "M_Success",
                    ErrorDescription: "ROSpec added successfully"
                }
            }
        });
        socket.write(rsp.encode().getBuffer());
    });
});

server.listen(5084, '127.0.0.1');


// Client
const reader = new LLRPClient({
    host: "localhost",
    port: 5084
});

const addROSpecData: LLRPCoreDataTypes['ADD_ROSPEC'] = {
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
};

(async () => {
    try {
        await reader.connect();
        for (let i = 0; i < 100; i++) {
            const msg = new LLRPCore.ADD_ROSPEC({
                data: addROSpecData
            });
            console.log(`send ${msg.getName()} ${msg.getMessageId()}`);
            const rsp = await reader.transact(msg);
            console.log(`recv ${rsp.getName()} ${rsp.getMessageId()}`);
        }
    } catch (e) {
        console.error(e);
    }

    server.close();
    await reader.disconnect();
})();

reader.on("message", msg => {
    const data = msg.toLLRPData();
});

reader.on("READER_EVENT_NOTIFICATION", msg => {
    let gpiEvent = msg.getReaderEventNotificationData()
        .getGPIEvent();
    if (1 === gpiEvent.getGPIPortNumber()) {
        //        doSomethingSerious();
    } else {
        //        wellMeh();
    }
})

reader.on("KEEPALIVE", msg => {
    console.log(`KEEPALIVE listener`);
    reader.send(new LLRPCore.KEEPALIVE_ACK({
        id: msg.getMessageId(),
        data: {}
    })).catch(console.error);
});

// reader.on("ADD_ROSPEC_RESPONSE", msg => {
//     console.log(`ADD_ROSPEC_RESPONSE listener`);
//     console.log(msg.getLLRPStatus().getStatusCode());
// });

reader.on("error", err => {
    console.error(err);
});
