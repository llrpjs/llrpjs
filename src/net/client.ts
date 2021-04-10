import { LLRPTypedNet } from "./typed";
import { LLRPAllTypeDefinitions } from "../types";
import net from "net";
import EventEmitter from "events";

export const LLRPClientOfDef = <AD extends LLRPAllTypeDefinitions>(Def: AD) =>
    class LLRPClient extends LLRPTypedNet.ofDef(Def) {

        async connect() {
            const socket = net.createConnection(this.options);
            return this.initializeClient(socket);
        }
    }
