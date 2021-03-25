import EventEmitter from "events";
import net from "net";
import { promisify } from "util";
import { LLRPError } from "../base/error";
import { LLRPMessage } from "../LLRPMessage";
import { LLRPScanner } from "../LLRPScanner";
import { LLRPUserData } from "../types";
import { Lock } from "./lock";
import { Timer } from "./timer";

interface LLRPReaderI {
    host: string;
    port: number;
}

export class LLRPReader extends EventEmitter {
    private _scanner = new LLRPScanner;
    private _tcp: net.Socket;
    private _lock = new Lock;
    private _timer = new Timer;
    private _send = (b: Buffer) => new Promise<void>((r, j) => j(new Error(`send is not initialized`)));
    private _recv = () => new Promise<Buffer>((r,j) => { j (new Error (`recv is not initialized`)) });

    constructor(public options: LLRPReaderI) {
        super();
    }

    async connect() {
        return new Promise<void>((resolve, reject) => {
            this._tcp = net.createConnection(this.options);

            this._send = promisify(this._tcp.write.bind(this._tcp));
            this._recv = () => new Promise<Buffer>(resolve => this._tcp.once("data", data => {
                this._scanner.addBuffer.call(this._scanner, data);
                resolve(this._scanner.getNext.call(this._scanner));
            }));

            this._tcp.on("connect", resolve);

            this._tcp.on("error", reject);

            this._tcp.on("close", () => {
                this._timer.cancel();
                this._tcp.removeAllListeners();
                this._send = (b: Buffer) => new Promise<void>((r, j) => j(new Error(`send is not initialized`)));
                this._recv = () => new Promise<Buffer>((r,j) => { j (new Error (`recv is not initialized`)) });
            })

            this._tcp.on("data", async data => {
                try {
                    const msg = new LLRPMessage(data).decode();
                    this.emit("message", msg);
                    this.emit(msg.getName(), msg);
                } catch (e) {
                    if (e instanceof LLRPError)
                        this.emit("error", e);
                    else
                        throw e;
                }
            });
        });
    }

    async disconnect() {
        this._tcp.end();
        this._tcp.destroy();
    }

    async send(m: LLRPMessage<LLRPUserData>) {
        return this._send(m.encode().getBuffer());
    }

    async recv(timeout = 5000) {
        let buf: Buffer;
        try {
            while (!(buf = await Promise.race([this._recv(), this._timer.watch(timeout)])));
        } catch (e) {
            if (e instanceof LLRPError) {
                if (e.name === "ERR_LLRP_READER_TIMEOUT") {
                    e.message = `No message received after ${timeout} mSec`;
                }
                this.emit("error", e);
            }
            throw e;
        }
        this._timer.cancel();
        let rsp = new LLRPMessage(buf).decode();
        return rsp;
    }

    async transact(m: LLRPMessage<LLRPUserData>, timeout = 5000) {
        let rsp: LLRPMessage<LLRPUserData> = null;
        await this._lock.acquire();
        this._scanner.resetBuffer();
        await this._send(m.encode().getBuffer());
        const resName = m.getResponseName();
        if (resName) {
            let buf: Buffer;
            do {
                try {
                    while (!(buf = await Promise.race([this._recv(), this._timer.watch(timeout)]))); // no complete response yet
                } catch (e) {
                    if (e instanceof LLRPError) {
                        if (e.name === "ERR_LLRP_READER_TIMEOUT") {
                            e.message = `Remote reader didn't respond after ${timeout} msec`;
                        }
                        this.emit("error", e);
                    }
                    this._lock.release();
                    throw e;
                }
                rsp = new LLRPMessage(buf).decode();
            } while (rsp.getName() !== resName)
            this._timer.cancel();
        }
        this._lock.release();
        return rsp;
    }
}