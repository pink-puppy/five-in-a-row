export enum Types {
    ROOM_LIST = 1,
    CREATE_ROOM = 2,
    ENTER_ROOM = 3,
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


export type Message = ROOM_LIST | CREATE_ROOM | ENTER_ROOM;
export function CREATE_ROOM_LIST(rooms: Room[]): ROOM_LIST {
    return { action: 1, rooms }
}
export function CREATE_CREATE_ROOM(): CREATE_ROOM {
    return { action: 2 }
}
export function CREATE_ENTER_ROOM(roomId: number, isHost: boolean): ENTER_ROOM {
    return { action: 3, roomId, isHost }
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
