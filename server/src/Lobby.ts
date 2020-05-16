import Player from "./Player";
import { Message, CREATE_ROOM_LIST } from 'lib/protocol';
import Room from "./Room";

export default class Lobby {
    players: Player[] = [];
    rooms: Room[] = [];

    get numOfPlayers() {
        return this.players.length;
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    removePlayer(player: Player) {
        for (let i = this.players.length - 1; i > -1; i--) {
            if (player.id === this.players[i].id) {
                this.players.splice(i, 1);
                break;
            }
        }
    }

    boardcast(message: Message, ignoreId?: number) {
        this.players.forEach(player => {
            if (player.id !== ignoreId) {
                player.connection.send(message);
            }
        })
    }

    serializeRoomList() {
        return this.rooms.map(room => room.serialize())
    }

    createRoom(host: Player) {
        const room = new Room();
        room.host = host;
        this.rooms.push(room);
        host.enterRoom(room);
        this.boardcast(CREATE_ROOM_LIST(this.serializeRoomList()), host.id);
        return room;
    }

    findRoom(id: number) {
        return this.rooms.find(room => room.id === id)
    }

    removeRoom(id: number) {
        for (let i = this.rooms.length - 1; i > -1; i--) {
            if (this.rooms[i].id === id) {
                this.rooms.splice(i, 1);
                break;
            }
        }
        this.boardcast(CREATE_ROOM_LIST(this.serializeRoomList()));
    }

    transferRoom(room: Room) {

    }

    removeOfResetRoom(room: Room) {
        if (room.members.length === 0) {
            this.removeRoom(room.id);
        } else if (!room.host) {
            this.transferRoom(room);
        }
    }
}