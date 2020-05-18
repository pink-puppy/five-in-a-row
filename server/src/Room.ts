import Player from "./Player";
import { CREATE_GAME_ROUND, CREATE_OCCUPATION, CREATE_GAME_OVER } from "lib/protocol";
import assert from 'assert';

let uniqueId = 100;
export default class Room {
    id: number;
    members: Player[] = [];
    host?: Player;
    playing: boolean = true;
    roundId: number = 0;
    chessboard: number[] = [];
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

    checkedId: number = 0;
    check(index: number) {
        const x = index % 15;
        const y = Math.floor(index / 15);
        let startX = Math.max(0, x - 5);
        let endX = Math.min(14, x + 5);
        let startY = Math.max(0, y - 5);
        let endY = Math.min(14, y + 5);
        let id = this.chessboard[index];
        this.checkedId = id;

        const checkLines = () => {
            let count = 0;
            for (let i = 0; i < lines.length; i++) {
                const loc = lines[i];
                if (this.chessboard[loc] === id) {
                    count++;
                } else {
                    count = 0;
                }
                if (count >= 5) break;
            }
            lines = [];
            return count >= 5;
        }

        let lines: number[] = [];
        for (let px = startX; px < endX; px++) {
            const loc = px + y * 15;
            lines.push(loc);
        }
        if (checkLines()) return true;

        for (let py = startY; py < endY; py++) {
            const loc = x + py * 15;
            lines.push(loc);
        }
        if (checkLines()) return true;

        for (let i = 1; i < 5; i++) {
            if (x - i > -1 && y - i > -1)
                lines.push(x - i + (y - i) * 15);
        }
        lines.push(x + y * 15);
        for (let i = 1; i < 5; i++) {
            if (x + i < 15 && y + i < 15)
                lines.push(x + i + (y + i) * 15);
        }
        if (checkLines()) return true;

        for (let i = 1; i < 5; i++) {
            if (x - i > -1 && y + i < 15)
                lines.push(x - i + (y + i) * 15);
        }
        lines.push(x + y * 15);
        for (let i = 1; i < 5; i++) {
            if (x - i < 15 && y - i > -1)
                lines.push(x + i + (y - i) * 15);
        }
        if (checkLines()) return true;
    }

    round(index: number, playerId: number) {
        if (!this.playing) return;
        if (this.roundId !== playerId) return;
        if (this.chessboard[index]) {
            return;
        }
        this.chessboard[index] = playerId;
        this.members.forEach(p => {
            p.connection.send(CREATE_OCCUPATION(index, (playerId === this.host?.id) ? 0 : 1));
        })
        if (this.check(index)) {
            this.gameOver();
        } else {
            let next = this.members.find(p => p.id !== this.roundId) as Player;
            this.roundId = next.id;
            next.connection.send(CREATE_GAME_ROUND());
        }
    }

    quiteExit() {
        assert(this.members.length > 0);
        this.playing = false;
        this.chessboard = [];
        this.members[0].connection.send(CREATE_GAME_OVER(true));
    }

    gameOver() {
        this.playing = false;
        this.members.forEach(p => {
            const win = p.id === this.checkedId;
            p.connection.send(CREATE_GAME_OVER(win));
            p.ready = false;
            this.chessboard = [];
        });
    }
}