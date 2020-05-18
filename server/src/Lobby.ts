import Player from "./Player";
import { Message, CREATE_ROOM_LIST, CREATE_UPDATE_ROOM, CREATE_CHALLENGER_COMING, CREATE_GAME_START, CREATE_GAME_ROUND, CREATE_CHALLENGER_LEAVING } from 'lib/protocol';
import Room from "./Room";
import assert from 'assert';

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
            if (player.roomId === 0 && player.id !== ignoreId) {
                player.connection.send(message);
            }
        });
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
        return this.rooms.find(room => room.id === id);
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

    startGame(room: Room) {
        room.playing = true;
        room.members.forEach(player => {
            player.connection.send(CREATE_GAME_START(room.id));
        });
        room.host?.connection.send(CREATE_GAME_ROUND());
        room.roundId = room.host?.id as number;
    }

    removeOfResetRoom(room: Room, playerId: number) {
        if (room.members.length === 0) {
            // no one in the room
            this.removeRoom(room.id);
        } else {
            let changeHost = !room.host;
            const player = room.members[0];
            changeHost && (room.host = player);
            player.connection.send(CREATE_CHALLENGER_LEAVING(playerId, changeHost));
            if (room.playing) {
                room.quiteExit();
            }
        }
    }

    forEachPlayer(fn: (player: Player) => void) {
        this.players.forEach(player => fn(player));
    }

    joinTheRace(player: Player, id: number) {
        const room = this.findRoom(id);
        if (room && room.members.length === 1) {
            player.enterRoom(room);
            const roomData = room.serialize();
            const message = CREATE_UPDATE_ROOM(roomData.id, roomData.members);
            this.boardcast(message);
            const host = room.host as Player;
            host.connection.send(CREATE_CHALLENGER_COMING(player.id, player.name, false, player.ready));
            return room;
        }
        return undefined;
    }
}