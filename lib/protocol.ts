export enum Types {
    ROOM_LIST = 1,
    CREATE_ROOM = 2,
    ENTER_ROOM = 3,
    UPDATE_ROOM = 4,
    CHALLENGER_COMING = 5,
    CHALLENGER_LEAVING = 6,
    READY_TO_RACE = 7,
    WELCOME = 8,
    GAME_START = 9,
    GAME_ROUND = 10,
    OCCUPATION = 11,
    GAME_OVER = 12
}

export type Room = {
    id: number,
    members: number[]
}

export interface ROOM_LIST {
    action: Types.ROOM_LIST,
    rooms: Room[]
}

export interface CREATE_ROOM {
    action: Types.CREATE_ROOM
}

export interface ENTER_ROOM {
    action: Types.ENTER_ROOM,
    roomId: number,
    isHost: boolean,
}

export interface UPDATE_ROOM {
    action: Types.UPDATE_ROOM,
    id: number,
    members: number[]
}

export interface CHALLENGER_COMING {
    action: Types.CHALLENGER_COMING,
    id: number,
    name: string,
    isHost: boolean,
    ready: boolean,
}

export interface CHALLENGER_LEAVING {
    action: Types.CHALLENGER_LEAVING,
    playerId: number,
    changeHost: boolean,
}

export interface READY_TO_RACE {
    action: Types.READY_TO_RACE,
    id: number
}

export interface WELCOME {
    action: Types.WELCOME,
    id: number,
    population: number
}

export interface GAME_START {
    action: Types.GAME_START
    roomId: number
}

export interface GAME_ROUND {
    action: Types.GAME_ROUND
}

export interface OCCUPATION {
    action: Types.OCCUPATION,
    index: number,
    side: number
}

export interface GAME_OVER {
    action: Types.GAME_OVER,
    win: boolean
}
export type Message = ROOM_LIST | CREATE_ROOM | ENTER_ROOM | UPDATE_ROOM | CHALLENGER_COMING | CHALLENGER_LEAVING | READY_TO_RACE | WELCOME | GAME_START | GAME_ROUND | OCCUPATION | GAME_OVER;
export function CREATE_ROOM_LIST(rooms: Room[]): ROOM_LIST {
    return { action: 1, rooms }
}
export function CREATE_CREATE_ROOM(): CREATE_ROOM {
    return { action: 2 }
}
export function CREATE_ENTER_ROOM(roomId: number, isHost: boolean): ENTER_ROOM {
    return { action: 3, roomId, isHost }
}
export function CREATE_UPDATE_ROOM(id: number, members: number[]): UPDATE_ROOM {
    return { action: 4, id, members }
}
export function CREATE_CHALLENGER_COMING(id: number, name: string, isHost: boolean, ready: boolean): CHALLENGER_COMING {
    return { action: 5, id, name, isHost, ready }
}
export function CREATE_CHALLENGER_LEAVING(playerId: number, changeHost: boolean): CHALLENGER_LEAVING {
    return { action: 6, playerId, changeHost }
}
export function CREATE_READY_TO_RACE(id: number): READY_TO_RACE {
    return { action: 7, id }
}
export function CREATE_WELCOME(id: number, population: number): WELCOME {
    return { action: 8, id, population }
}
export function CREATE_GAME_START(roomId: number): GAME_START {
    return { action: 9, roomId }
}
export function CREATE_GAME_ROUND(): GAME_ROUND {
    return { action: 10 }
}
export function CREATE_OCCUPATION(index: number, side: number): OCCUPATION {
    return { action: 11, index, side }
}
export function CREATE_GAME_OVER(win: boolean): GAME_OVER {
    return { action: 12, win }
}
export function decode(raw: string): Message | undefined {
    let obj = undefined;
    try {
        obj = JSON.parse(raw);
    } catch (_) {
        return undefined;
    }
    if (!obj || !('action' in obj)) return undefined;
    return obj as Message;
}
