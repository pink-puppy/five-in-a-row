"use strict";
exports.__esModule = true;
exports.decode = exports.CREATE_ENTER_ROOM = exports.CREATE_CREATE_ROOM = exports.CREATE_ROOM_LIST = exports.Types = void 0;
var Types;
(function (Types) {
    Types[Types["ROOM_LIST"] = 1] = "ROOM_LIST";
    Types[Types["CREATE_ROOM"] = 2] = "CREATE_ROOM";
    Types[Types["ENTER_ROOM"] = 3] = "ENTER_ROOM";
})(Types = exports.Types || (exports.Types = {}));
function CREATE_ROOM_LIST(rooms) {
    return { action: 1, rooms: rooms };
}
exports.CREATE_ROOM_LIST = CREATE_ROOM_LIST;
function CREATE_CREATE_ROOM() {
    return { action: 2 };
}
exports.CREATE_CREATE_ROOM = CREATE_CREATE_ROOM;
function CREATE_ENTER_ROOM(roomId, isHost) {
    return { action: 3, roomId: roomId, isHost: isHost };
}
exports.CREATE_ENTER_ROOM = CREATE_ENTER_ROOM;
function decode(raw) {
    var obj = undefined;
    try {
        obj = JSON.parse(raw);
    }
    catch (_) {
        return undefined;
    }
    if (!obj || !('action' in obj))
        return undefined;
    return obj;
}
exports.decode = decode;
