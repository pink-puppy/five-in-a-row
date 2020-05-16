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

