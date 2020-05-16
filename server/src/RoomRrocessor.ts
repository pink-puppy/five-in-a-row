
import Connection from "./Connection";
import Player from "./Player";
import Processor from "./Processor";
import Lobby from "./Lobby";
import { Message, CREATE_ENTER_ROOM, Room } from "lib/protocol";

export default class RoomProcessor extends Processor {
    constructor(public conn: Connection, public lobby: Lobby, public player: Player) {
        super();
    }

    handle(message: Message) {
        console.log(message);
    }

    enter() {
        const room = this.lobby.findRoom(this.player.roomId);
        room && this.conn.send(CREATE_ENTER_ROOM(room.id, room.host === this.player));
    }

    leave() {

    }

    hungup() {
        this.lobby.removePlayer(this.player);
        if (this.player.roomId) {
            const room = this.lobby.findRoom(this.player.roomId);
            if (room) {
                this.player.leaveRoom(room);
                this.lobby.removeOfResetRoom(room);
            }
        }
        console.log(`Player ${this.player.name} left.`);
    }
}