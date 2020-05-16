export declare enum Types {
    ROOM_LIST = 1,
    CREATE_ROOM = 2,
    ENTER_ROOM = 3
}
export declare type Room = {
    id: number;
    members: number[];
};
export interface ROOM_LIST {
    action: Types.ROOM_LIST;
    rooms: Room[];
}
export interface CREATE_ROOM {
    action: Types.CREATE_ROOM;
}
export interface ENTER_ROOM {
    action: Types.ENTER_ROOM;
    roomId: number;
    isHost: boolean;
}
export declare type Message = ROOM_LIST | CREATE_ROOM | ENTER_ROOM;
export declare function CREATE_ROOM_LIST(rooms: Room[]): ROOM_LIST;
export declare function CREATE_CREATE_ROOM(): CREATE_ROOM;
export declare function CREATE_ENTER_ROOM(roomId: number, isHost: boolean): ENTER_ROOM;
export declare function decode(raw: string): Message | undefined;
