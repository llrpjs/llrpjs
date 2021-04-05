import { LLRPError } from "../base/error";

export class Timer {
    private _timer: ReturnType<typeof setTimeout> = null;
    private _promise: Promise<null> = null;

    start(ms: number) {
        this._promise = new Promise((resolve, reject) => {
            this._timer = setTimeout(() => {
                this._promise = null;
                reject(new LLRPError("ERR_LLRP_READER_TIMEOUT"));
            }, ms)
        });
        return this._promise;
    }

    watch() {
        return this._promise;
    }

    cancel() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        this._promise = null;
    }
}