import Player from "./Player";

let uniqueId = 100;
export default class Room {
    id: number;
    members: Player[] = [];
    host?: Player;
    constructor() {
        this.id = uniqueId++;
    }

    addPlayer(player: Player) {
        this.members.push(player);
    }

    removePlayer(player: Player) {
        for (let i = this.members.length - 1; i > -1; i--) {
            if (this.members[i] === player) {
                this.members.splice(i, 1);
                break;
            }
        }
    }

    serialize() {
        return {
            id: this.id,
            members: this.members.map(p => p.id)
        }
    }
}