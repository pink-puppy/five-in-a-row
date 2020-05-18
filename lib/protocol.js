"use strict";
exports.__esModule = true;
exports.decode = exports.CREATE_GAME_OVER = exports.CREATE_OCCUPATION = exports.CREATE_GAME_ROUND = exports.CREATE_GAME_START = exports.CREATE_WELCOME = exports.CREATE_READY_TO_RACE = exports.CREATE_CHALLENGER_LEAVING = exports.CREATE_CHALLENGER_COMING = exports.CREATE_UPDATE_ROOM = exports.CREATE_ENTER_ROOM = exports.CREATE_CREATE_ROOM = exports.CREATE_ROOM_LIST = exports.Types = void 0;
var Types;
(function (Types) {
    Types[Types["ROOM_LIST"] = 1] = "ROOM_LIST";
    Types[Types["CREATE_ROOM"] = 2] = "CREATE_ROOM";
    Types[Types["ENTER_ROOM"] = 3] = "ENTER_ROOM";
    Types[Types["UPDATE_ROOM"] = 4] = "UPDATE_ROOM";
    Types[Types["CHALLENGER_COMING"] = 5] = "CHALLENGER_COMING";
    Types[Types["CHALLENGER_LEAVING"] = 6] = "CHALLENGER_LEAVING";
    Types[Types["READY_TO_RACE"] = 7] = "READY_TO_RACE";
    Types[Types["WELCOME"] = 8] = "WELCOME";
    Types[Types["GAME_START"] = 9] = "GAME_START";
    Types[Types["GAME_ROUND"] = 10] = "GAME_ROUND";
    Types[Types["OCCUPATION"] = 11] = "OCCUPATION";
    Types[Types["GAME_OVER"] = 12] = "GAME_OVER";
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
function CREATE_UPDATE_ROOM(id, members) {
    return { action: 4, id: id, members: members };
}
exports.CREATE_UPDATE_ROOM = CREATE_UPDATE_ROOM;
function CREATE_CHALLENGER_COMING(id, name, isHost, ready) {
    return { action: 5, id: id, name: name, isHost: isHost, ready: ready };
}
exports.CREATE_CHALLENGER_COMING = CREATE_CHALLENGER_COMING;
function CREATE_CHALLENGER_LEAVING(playerId, changeHost) {
    return { action: 6, playerId: playerId, changeHost: changeHost };
}
exports.CREATE_CHALLENGER_LEAVING = CREATE_CHALLENGER_LEAVING;
function CREATE_READY_TO_RACE(id) {
    return { action: 7, id: id };
}
exports.CREATE_READY_TO_RACE = CREATE_READY_TO_RACE;
function CREATE_WELCOME(id, population) {
    return { action: 8, id: id, population: population };
}
exports.CREATE_WELCOME = CREATE_WELCOME;
function CREATE_GAME_START(roomId) {
    return { action: 9, roomId: roomId };
}
exports.CREATE_GAME_START = CREATE_GAME_START;
function CREATE_GAME_ROUND() {
    return { action: 10 };
}
exports.CREATE_GAME_ROUND = CREATE_GAME_ROUND;
function CREATE_OCCUPATION(index, side) {
    return { action: 11, index: index, side: side };
}
exports.CREATE_OCCUPATION = CREATE_OCCUPATION;
function CREATE_GAME_OVER(win) {
    return { action: 12, win: win };
}
exports.CREATE_GAME_OVER = CREATE_GAME_OVER;
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
