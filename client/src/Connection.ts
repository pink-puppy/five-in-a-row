import { EventEmitter } from "events";
import { CREATE_CREATE_ROOM, Message, decode, Types } from 'lib/protocol';

export default class Connection extends EventEmitter {
    name?: string;
    token?: string;
    ws?: WebSocket;
    readyState = -1;
    connect(url = 'ws://localhost:5000') {
        if (!this.name || !this.token)
            return;
        const ws = this.ws = new WebSocket(url, [encodeURIComponent(this.name), encodeURIComponent(this.token)]);
        this.ws.onopen = () => {
            this.readyState = ws.readyState;
            this.emit('connect');
        }
        this.ws.onclose = (e) => {
            this.readyState = ws.readyState;
            this.emit('close', e.code, e.reason);
        }
        this.ws.onerror = () => {
            this.emit('error');
            this.readyState = ws.readyState;
        }
        this.ws.onmessage = (e) => {
            const message = decode(e.data);
            message && this.onMessage(message);
        }
    }

    onMessage(message: Message) {
        switch (message.action) {
            case Types.ROOM_LIST:
                this.emit('roomList', message.rooms);
                break;
            case Types.ENTER_ROOM:
                this.emit('enterRoom', message.roomId, message.isHost);
                break;
        }
    }

    send(message: Message) {
        this.ws?.send(JSON.stringify(message));
    }

    createRoom() {
        this.send(CREATE_CREATE_ROOM());
    }

    enterRoom(id: number) {
        //
    }
}
