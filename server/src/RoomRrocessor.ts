
import Connection from "./Connection";
import Player from "./Player";
import Processor from "./Processor";
import Lobby from "./Lobby";
import { Message, CREATE_ENTER_ROOM, CREATE_CHALLENGER_COMING, Types, CREATE_READY_TO_RACE, CREATE_UPDATE_ROOM } from "lib/protocol";
import Room from "./Room";

export default class RoomProcessor extends Processor {
    constructor(
        public conn: Connection,
        public lobby: Lobby,
        public player: Player,
        public room: Room
    ) {
        super();
    }

    handle(message: Message) {
        switch (message.action) {
            case Types.READY_TO_RACE: {
                this.player.ready = true;
                let readyCount = 0;
                this.room.members.forEach(player => {
                    player.ready && readyCount++;
                    player.connection.send(CREATE_READY_TO_RACE(this.player.id));
                });
                if (readyCount === 2) {
                    this.lobby.startGame(this.room);
                }
                break;
            }
            case Types.OCCUPATION: {
                this.room.round(message.index, this.player.id);
                break;
            }
        }

    }

    enter() {
        const host = this.room?.host as Player;
        const isHost = host === this.player;
        this.conn.send(CREATE_ENTER_ROOM(this.room.id, isHost));
        if (!isHost) {
            this.conn.send(CREATE_CHALLENGER_COMING(host.id, host.name, true, host.ready));
        }
    }

    leave() {

    }

    hungup() {
        this.lobby.removePlayer(this.player);
        if (this.player.roomId) {
            this.player.leaveRoom(this.room);
            this.lobby.removeOfResetRoom(this.room, this.player.id);
            const roomData = this.room.serialize();
            this.lobby.boardcast(CREATE_UPDATE_ROOM(roomData.id, roomData.members))
        }
        console.log(`Player ${this.player.name} left.`);
    }
}