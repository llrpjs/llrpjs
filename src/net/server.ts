
import net from "net";
import { LLRPNetI } from "./base";
import { LLRPTypedNet } from "./typed";
import { LLRPAllTypeDefinitions } from "../types";

export const LLRPServerOfDef = <AD extends LLRPAllTypeDefinitions>(Def: AD) =>
    class LLRPServer extends LLRPTypedNet.ofDef(Def) {
        constructor(options?: LLRPNetI) {
            super(options);
            const server = net.createServer();
            this.initializeServer(server);
        }

        listen() {
            this._server.listen(this.options.port, this.options.host);
        }

        async close() {
            await this.cleanupSocket();
            return new Promise<void>((resolve, reject) => {
                if (this._server) {
                    this._server.close(err => {
                        if (err) reject(err);
                        else resolve();
                    });
                } else {
                    resolve();
                }
            });
        }
    }