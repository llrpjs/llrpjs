import EventEmitter from "events";
import net from "net";
import { LLRPError } from "../base/error";
import { LLRPProxyMessage as LLRPMessage } from "../proxy/message";
import { LLRPScanner } from "../element/scanner";
import { LLRPUserData } from "../types";
import { Lock } from "./lock";
import { Timer } from "./timer";

export const LLRPNetNativeEvents = [
    "connection",
    "close",
    "connect",
    "disconnect",
    "message",
    "error"
] as const;

export type LLRPNetNativeEvents = typeof LLRPNetNativeEvents[number];

export interface LLRPNetI {
    host?: string;
    port?: number;
}

export class LLRPNet {
    protected options: Required<LLRPNetI>;
    protected _ee = new EventEmitter;

    private _scanner = new LLRPScanner;
    protected _server: net.Server;
    protected _tcp: net.Socket;
    private _lock = new Lock;
    private _send = this.invalidSend;
    private _recv = this.invalidRecv;

    constructor(options?: LLRPNetI) {
        options = { host: "localhost", port: 5084, ...options };
        this.options = <Required<LLRPNetI>>options;
    }

    private async invalidSend (m: LLRPMessage) {
        return new Promise<void>((r, j) => j(new LLRPError("ERR_LLRP_READER_OFFLINE", `Cannot send data`)));
    }

    private async invalidRecv () {
        return new Promise<LLRPMessage>((r, j) => j(new LLRPError("ERR_LLRP_READER_OFFLINE", `Cannot receive data`)));
    }

    private async validSend(m: LLRPMessage) {
        return new Promise<void>((resolve, reject) => {
            this._tcp.write.call(this._tcp, m.encode().getBuffer(), err => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    private async validRecv() {
        return new Promise<LLRPMessage>(resolve => this._ee.once("message", msg => {
            resolve(msg);
        }))
    };

    private async onData(data: Buffer) {
        try {
            this._scanner.addBuffer.call(this._scanner, data);
            const msgBuf = this._scanner.getNext.call(this._scanner);
            if (msgBuf) {
                const msg = new LLRPMessage(msgBuf).decode();
                this._ee.emit("message", msg);
                this._ee.emit(msg.getName(), msg);
            }
        } catch (e) {
            if (e instanceof LLRPError)
                this._ee.emit("error", e);
            else
                throw e;
        }
    }

    private async onSocketClose() {
        this._tcp.removeAllListeners();
        this._send = this.invalidSend.bind(this);
        this._recv = this.invalidRecv.bind(this);
        this._tcp = null;
        this._ee.emit("disconnect");
    }

    protected async initializeServer(server: net.Server) {
        this._server = server;
        server.maxConnections = 1;
        server.on("connection", async socket => {
            this._tcp = socket;

            this._send = this.validSend.bind(this);
            this._recv = this.validRecv.bind(this);

            socket.on("error", err => {
                this._ee.emit("error", err);
            })

            socket.on("close", this.onSocketClose.bind(this));

            socket.on("data", this.onData.bind(this));

            this._ee.emit("connection");
        });
        server.on("close", () => {
            this._ee.emit("close");
        });
    }

    protected async initializeClient(socket: net.Socket) {
        this._tcp = socket;
        return new Promise<void>((resolve, reject) => {
            this._send = this.validSend.bind(this);
            this._recv = this.validRecv.bind(this);

            socket.on("connect", () => {
                this._scanner.resetBuffer.call(this._scanner);
                this._ee.emit("connect");
                resolve();
            });

            socket.on("error", err => {
                this._ee.emit("error", err);
                reject(err);
            });

            socket.on("close", this.onSocketClose.bind(this));

            socket.on("data", this.onData.bind(this));
        });
    }

    protected async cleanupSocket() {
        return new Promise<void>(resolve => {
            if (this._tcp) {
                this._tcp.end(resolve);
            } else
                resolve();
        });
    }

    get socketWritable() {
        return !!this._tcp?.writable
    }

    async send(m: LLRPMessage<LLRPUserData>) {
        return this._send(m);
    }

    async recv(timeout = 5000) {
        const _timer = new Timer;
        _timer.start(timeout);
        let msg: LLRPMessage = await Promise.race([this._recv(), _timer.watch()]);
        _timer.cancel();
        return msg;
    }

    async transact(m: LLRPMessage<LLRPUserData>, timeout = 5000) {
        let rsp: LLRPMessage<LLRPUserData> = null;
        const resName = m.getResponseName();

        await this._lock.acquire();         // prevent other transactions

        let recvPromise = this.recv(timeout);
        await this.send(m);
        if (resName) {
            while (true) {
                try {
                    rsp = await recvPromise;
                } catch (e) {
                    this._lock.release();
                    throw e;
                }
                // check type
                if (rsp.getName() === resName) break;
            }
        }

        this._lock.release();               // allow transactions
        return rsp;
    }
}