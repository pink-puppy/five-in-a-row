import { EventEmitter } from "events";
import Connection from "./Connection";
import Room from "./Room";


export default class Player extends EventEmitter {
    roomId: number = 0;
    id: number;
    name: string;
    ready: boolean = false;
    constructor(public connection: Connection) {
        super();
        this.id = connection.id;
        this.name = connection.name;
    }

    enterRoom(room: Room) {
        this.roomId = room.id;
        room.addPlayer(this);
    }

    leaveRoom(room: Room) {
        this.roomId = 0;
        if (room.host === this) {
            room.host = undefined;
        }
        room.removePlayer(this);
    }


}