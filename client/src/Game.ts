import { EventEmitter } from "events";
import { decode, Message, CREATE_CREATE_ROOM, CREATE_ENTER_ROOM, Types, CREATE_READY_TO_RACE, CREATE_OCCUPATION } from "lib/protocol";

export enum GameStatus {
    NOT_READY,
    MATCHING,
    PLAYING,
}

class Game extends EventEmitter {
    id: number = 0;
    name: string = '';
    token: string = '';
    logged: boolean = false;
    ws?: WebSocket;
    url = 'ws://localhost:5000';
    roomId: number = 0;
    side: number = 1;
    status = GameStatus.NOT_READY;

    connect() {
        if (!this.logged)
            return false;
        this.ws = new WebSocket(this.url, [encodeURIComponent(this.name), encodeURIComponent(this.token)]);
        this.ws.onopen = () => this.emit('connect');
        this.ws.onclose = (e) => this.emit('close', e.code, e.reason);
        this.ws.onerror = () => this.emit('error');
        this.ws.onmessage = (e) => {
            const message = decode(e.data);
            message && this.onMessage(message);
        }
        return true;
    }

    send(message: Message) {
        this.ws && this.ws.send(JSON.stringify(message));
    }

    startMatch(roomId: number, isHost: boolean) {
        this.roomId = roomId;
        this.side = isHost ? 0 : 1;
        this.status = GameStatus.MATCHING;
    }

    onMessage(message: Message) {
        switch (message.action) {
            case Types.ROOM_LIST:
                this.emit('roomList', message.rooms);
                break;
            case Types.ENTER_ROOM:
                this.startMatch(message.roomId, message.isHost);
                this.emit('enterRoom');
                break;
            case Types.UPDATE_ROOM:
                this.emit('updateRoom', message);
                break;
            case Types.CHALLENGER_COMING:
                this.emit('challenger_coming', message.id, message.name, message.isHost, message.ready);
                break;
            case Types.WELCOME:
                this.id = message.id;
                this.emit('welcome');
                break;
            case Types.READY_TO_RACE:
                this.emit('ready_to_race', message.id);
                break;
            case Types.GAME_START:
                this.emit('game_start');
                this.emit('notice', 'The race has begun.');
                break;
            case Types.GAME_ROUND:
                this.emit('game_round');
                this.emit('notice', 'It\'s your turn.');
                break;
            case Types.OCCUPATION:
                this.emit('occupation', message.index, message.side);
                break;
            case Types.CHALLENGER_LEAVING:
                this.emit('challenger_leaving', message.playerId, message.changeHost);
                break;
            case Types.GAME_OVER:
                this.emit('gameover', message.win);
                break;
        }
    }

    enterRoom(id: number) {
        this.send(CREATE_ENTER_ROOM(id, false));
    }

    createRoom() {
        this.send(CREATE_CREATE_ROOM());
    }

    ready() {
        this.send(CREATE_READY_TO_RACE(-1));
    }

    occupation(index: number) {
        this.send(CREATE_OCCUPATION(index, -1));
        this.emit('notice', 'Waiting...');
    }

    changeSide() {
        this.side = this.side === 0 ? 1 : 0;
    }
}

export default new Game();