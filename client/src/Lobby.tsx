import React, { useEffect, useState } from 'react';
import { connection } from './Networking';
import { useHistory } from 'react-router-dom';
import { Room } from 'lib/protocol';
import RoomCompoent from './Room';

export default function Lobby() {
    const history = useHistory();
    const [roomList, setRoomList] = useState<Room[]>([]);
    const [connected, setConnected] = useState(false);
    useEffect(() => {
        connection.on('connect', () => {
            setConnected(true);
        });
        connection.on('roomList', (rooms: Room[]) => {
            setRoomList(rooms);
        });
        connection.on('enterRoom', (roomId: number, isHost: boolean) => {
            history.push('/battle')
        });
        if (!connection.token) {
            history.push('/');
        } else {
            connection.connect();
        }
        return () => {
            connection.removeAllListeners();
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
                            onClick={roomId => connection.enterRoom(roomId)}
                        />
                    )
                )
            }
            <button className="newRoom" disabled={!connected} onClick={() => connection.createRoom()}>NEW</button>
        </div>
    )
}