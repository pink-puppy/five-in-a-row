import { Server, IncomingMessage } from "http";
import WebSocket from "ws";
import { Socket } from "net";
import tokenUtil from './token';
import Connection from "./Connection";
import LobbyProcessor from "./LobbyProcessor";
import Lobby from "./Lobby";

let uniqueId = 100;

export default class GameServer {
    connections: Connection[] = [];
    lobby: Lobby = new Lobby();

    addConnection(conn: Connection) {
        this.connections.push(conn);
        conn.id = uniqueId++;
        conn.processor = new LobbyProcessor(conn, this.lobby);
        conn.on('close', id => {
            this.removeConnection(id);
        });
    }

    removeConnection(id: number) {
        for (let i = this.connections.length - 1; i > -1; i--) {
            let conn = this.connections[i];
            if (conn.id === id) {
                conn.destory();
                this.connections.splice(i, 1);
                break;
            }
        }
    }

    initialize(httpServer: Server) {
        const wss = new WebSocket.Server({ noServer: true });

        httpServer.on('upgrade', async (req: IncomingMessage, socket: Socket, head: Buffer) => {
            try {
                const conn = await this.acceptConnection(wss, req, socket, head);
                this.addConnection(conn);
            } catch (_) {
                console.error(_);
            }
        })
    }

    acceptConnection(wss: WebSocket.Server, req: IncomingMessage, socket: Socket, head: Buffer) {
        return new Promise<Connection>((resolve, reject) => {
            const [name, authenticated] = this.authenticate(req);
            if (authenticated) {
                wss.handleUpgrade(req, socket, head, ws => {
                    const conn = new Connection(ws, name);
                    resolve(conn);
                });
                if (socket.destroyed) {
                    reject('Handshake failed.')
                }
            } else {
                socket.write('HTTP/1.1 401\r\n');
                socket.destroy();
                reject('Unauthorized.');
            }
        });
    }

    authenticate(req: IncomingMessage): [string, boolean] {
        const userInfo = (req.headers['sec-websocket-protocol'] as string) ?? '';
        const [name, token] = userInfo.split(', ');
        return [name, tokenUtil.check(decodeURIComponent(name), decodeURIComponent(token))]
    }

    isPlayerExists(name: string) {
        return this.connections.find(c => c.name === name);
    }
}
