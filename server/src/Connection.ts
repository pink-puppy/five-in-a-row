import WebSocket from "ws";
import { EventEmitter } from "events";
import { Message, decode } from 'lib/protocol';
import Processor from "./Processor";

export default class Connection extends EventEmitter {
    on!: (event: 'close', listener: (this: Connection, id: number) => void) => this;

    id: number = 0;
    isClosed = false;
    constructor(public socket: WebSocket, public name: string) {
        super();
        socket.on('close', () => this.close());
        socket.on('message', data => this.receiveData(data));
    }

    receiveData(data: WebSocket.Data) {
        const message = decode(data as string);
        message && this.processor.handle(message);
    }

    close() {
        this.isClosed = true;
        this.processor.hungup();
        this.emit('close', this.id);
    }

    // close socket && clean it up
    destory(code?: number) {
        this.socket.removeAllListeners();
        this.socket.close(code);
        this.removeAllListeners();
    }

    _processor!: Processor;
    get processor() {
        return this._processor;
    }
    set processor(current: Processor) {
        if (this._processor) {
            this._processor.leave();
        }
        this._processor = current;
        current.enter();
    }

    send(message: Message) {
        this.socket.send(JSON.stringify(message));
    }

}

