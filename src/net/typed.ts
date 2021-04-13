import { AnyConstructor, AnyFunction } from "../bryntum/chronograph/Mixin";
import { LLRPProxyMessage } from "../proxy/message";
import { LLRPProxyParameter } from "../proxy/parameter";
import { LLRPTypedMessage } from "../typed/message";
import { LLRPNetNativeEvents, LLRPNet } from "./base";
import { LLRPClassRegistry } from "../registry/class-registry";
import { LLRPAllTypeDefinitions, LLRPMessageNames, GetAllTypedMessageClasses, LLRPUserData } from "../types";


export class LLRPTypedNet<
    AD extends LLRPAllTypeDefinitions,
    N extends LLRPMessageNames<AD> = LLRPMessageNames<AD>,
    L extends LLRPNetNativeEvents = LLRPNetNativeEvents,
    MD extends GetAllTypedMessageClasses<AnyConstructor<LLRPTypedMessage<AD, N>>, AnyConstructor<LLRPProxyParameter>, AD> =
    GetAllTypedMessageClasses<AnyConstructor<LLRPTypedMessage<AD, N>>, AnyConstructor<LLRPProxyParameter>, AD>,
    > extends LLRPNet {
    Def: AD;
    CR: LLRPClassRegistry<AD> = LLRPClassRegistry.getInstance() as any;

    protected listenerMap: Map<AnyFunction, [string, AnyFunction]> = new Map;

    static ofDef<AD extends LLRPAllTypeDefinitions>(Def: AD) {
        return class LLRPTypedNet extends this<AD> {
            Def = Def;
            CR = LLRPClassRegistry.getInstance(Def);

            async send(m: LLRPProxyMessage) {
                return super.send(m);
            }
        
            async recv(timeout?: number) {
                const proxy = await super.recv(timeout);
                const LLRPTypedMessage = this.CR.getCoreMessageClass(proxy.getName());
                // unfortunately, we need to cast as any to avoid the excessively deep type matching in the class registry (when using a typed constructor instead of the proxy)
                return new LLRPTypedMessage(proxy.origin as any);
            }
        
            async transact(m: LLRPProxyMessage, timeout?: number) {
                const proxy = await super.transact(m, timeout);
                const LLRPTypedMessage = this.CR.getCoreMessageClass(proxy.getName());
                return new LLRPTypedMessage(proxy.origin as any);
            }
        };
    }

    private getNewListener<E extends N | L>(event: E, listener: AnyFunction) {
        const newListener = (m) => {
            if (LLRPNetNativeEvents.includes(<LLRPNetNativeEvents>event)) {
                listener(m);
            } else {
                const CR = LLRPClassRegistry.getInstance(this.Def, <N>event);
                const LLRPTypedMessage = CR.getCoreMessageClass(<N>event);
                let newM;
                if (!LLRPTypedMessage) {
                    // no typed class found? go with the generic proxy
                    newM = new LLRPProxyMessage(m.origin);
                } else
                    newM = new LLRPTypedMessage((<LLRPProxyMessage<LLRPUserData, N>>m).origin as any);
                listener(newM);
            }
        };

        this.listenerMap.set(listener, [event, newListener]);
        return newListener;
    }

    on<E extends "error">(event: E, listener: (err: Error) => void ): this;
    on<E extends "connection" | "close" | "disconnect" | "connect">(event: E, listener: () => void): this;
    on<E extends "message">(event: E, listener: (msg: LLRPProxyMessage) => void): this;
    on<E extends N>(event: E, listener: (msg: InstanceType<MD[E]>) => void): this;

    on<E extends N | L>(event: E, listener: AnyFunction) {
        const newListener: typeof listener = this.getNewListener(event, listener);
        this._ee.on(event, newListener);
        return this;
    }

    off<E extends "error">(event: E, listener: (err: Error) => void ): this;
    off<E extends "connection" | "close" | "disconnect" | "connect">(event: E, listener: () => void): this;
    off<E extends "message">(event: E, listener: (msg: LLRPProxyMessage) => void): this;
    off<E extends N>(event: E, listener: (msg: InstanceType<MD[E]>) => void): this;

    off<E extends N | L>(event: E, listener: AnyFunction) {
        const pair = this.listenerMap.get(listener);
        if (!pair) return this;
        const [e, newListener] = pair;
        if (newListener)
            this._ee.off(event, newListener);
        this.listenerMap.delete(listener);
        return this;
    }


    once<E extends "error">(event: E, listener: (err: Error) => void ): this;
    once<E extends "connection" | "close" | "disconnect" | "connect">(event: E, listener: () => void): this;
    once<E extends "message">(event: E, listener: (msg: LLRPProxyMessage) => void): this;
    once<E extends N>(event: E, listener: (msg: InstanceType<MD[E]>) => void): this;

    once<E extends N | L>(event: E, listener: AnyFunction) {
        const newListener: typeof listener = this.getNewListener(event, listener)
        this._ee.once(event, newListener);
        return this;
    }


    removeListener<E extends "error">(event: E, listener: (err: Error) => void ): this;
    removeListener<E extends "connection" | "close" | "disconnect" | "connect">(event: E, listener: () => void): this;
    removeListener<E extends "message">(event: E, listener: (msg: LLRPProxyMessage) => void): this;
    removeListener<E extends N>(event: E, listener: (msg: InstanceType<MD[E]>) => void): this;

    removeListener<E extends N | L>(event: E, listener: AnyFunction) {
        const pair = this.listenerMap.get(listener);
        if (!pair) return this;
        const [e, newListener] = pair;
        if (newListener)
            this._ee.removeListener(event, newListener);
        this.listenerMap.delete(listener);
        return this;
    }

    removeAllListeners(event?: N | L) {
        for (let pair of this.listenerMap) {
            const [listener, [e, newListener]] = pair;
            if (!event || (event === e))
                this.removeListener(e as any, listener);
        }
        return this;
    }
}