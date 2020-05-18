import Connection from "./Connection";
import Player from "./Player";
import Lobby from "./Lobby";
import { CREATE_ROOM_LIST, Message, Types, CREATE_WELCOME } from "lib/protocol";
import RoomProcessor from "./RoomRrocessor";
import Processor from "./Processor";



export default class LobbyProcessor extends Processor {
    player: Player;
    constructor(public conn: Connection, public lobby: Lobby) {
        super();
        this.player = new Player(conn);
    }

    enter() {
        this.lobby.addPlayer(this.player);
        console.log(`Player ${this.player.name} joined. num of players:${this.lobby.numOfPlayers}`);
        this.conn.send(CREATE_WELCOME(this.player.id, this.lobby.numOfPlayers));
        this.conn.send(CREATE_ROOM_LIST(this.lobby.serializeRoomList()));
    }

    handle(message: Message) {
        switch (message.action) {
            case Types.CREATE_ROOM: {
                const room = this.lobby.createRoom(this.player);
                this.conn.processor = new RoomProcessor(
                    this.conn,
                    this.lobby,
                    this.player,
                    room
                );
                break;
            }
            case Types.ENTER_ROOM: {
                const room = this.lobby.joinTheRace(this.player, message.roomId);
                if (room) {
                    this.conn.processor = new RoomProcessor(
                        this.conn,
                        this.lobby,
                        this.player,
                        room
                    );
                }
                break;
            }

        }
    }



    leave() {

    }

    hungup() {
        this.lobby.removePlayer(this.player);
        console.log(`Player ${this.player.name} left.`);
    }
}