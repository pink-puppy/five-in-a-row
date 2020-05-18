import React, { useEffect, useState } from 'react';

import { useHistory } from 'react-router-dom';
import { Room, UPDATE_ROOM } from 'lib/protocol';
import RoomCompoent from './Room';
import Game from './Game';

export default function Lobby() {
    const history = useHistory();
    const [roomList, setRoomList] = useState<Room[]>([]);
    const [connected, setConnected] = useState(false);
    useEffect(() => {
        Game.on('welcome', () => setConnected(true));
        Game.on('roomList', (rooms: Room[]) => {
            setRoomList(rooms);
        });
        Game.on('enterRoom', () => {
            history.push('/battle')
        });
        Game.on('updateRoom', (updated: UPDATE_ROOM) => {
            setRoomList(rooms => {
                let room = rooms.find(r => r.id === updated.id);
                if (room) room.members = updated.members;
                return [...rooms];
            })
        });
        Game.on('close', () => history.push('/'));
        if (!Game.connect()) {
            history.push('/');
        }
        return () => {
            Game.removeAllListeners();
        }
    }, [history])
    return (
        <div className="lobby">
            {
                roomList.map(room =>
                    (
                        <RoomCompoent
                            key={room.id}
                            {...room}
                            onClick={roomId => Game.enterRoom(roomId)}
                        />
                    )
                )
            }
            <button className="newRoom" disabled={!connected} onClick={() => Game.createRoom()}>NEW</button>
        </div>
    )
}