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