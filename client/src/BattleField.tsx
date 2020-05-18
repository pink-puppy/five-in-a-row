import React, { useEffect, useState, useRef } from 'react';
import Chair from './Chair';
import Board from './Board';
import Dialog, { Notification } from './Dialog';

import { useHistory } from 'react-router-dom';
import Game, { GameStatus } from './Game';



interface Player {
    name: string,
    ready: boolean,
    side: number,
    id: number,
}

export default function BattleField() {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const history = useHistory();
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [player1, setPlayer1] = useState<Player>({ name: '', id: 0, ready: false, side: 1 });
    const [player2, setPlayer2] = useState<Player>({ name: '', id: 0, ready: false, side: 1 });
    const [notifications, setNotifications] = useState<Notification[]>([]);
    useEffect(() => {
        if (Game.status !== GameStatus.MATCHING) {
            history.push('/lobby');
        } else {
            const self = { name: Game.name, ready: false, side: Game.side, id: Game.id };
            setPlayer1(self);
        }
        const board = new Board(ref.current as unknown as HTMLCanvasElement);
        board.yourSide = Game.side;
        Game.on('close', () => history.push('/'));
        board.on('occupation', (index: number) => {
            Game.occupation(index);
        });

        Game.on('occupation', (index: number, side: number) => {
            board.setStone(index, side);
        });
        Game.on('challenger_coming', (id: number, name: string, host: boolean, ready: boolean) => {
            setPlayer2({ name: name as string, ready: ready, side: host ? 0 : 1, id });
        });
        Game.on('ready_to_race', (id: number) => {
            setPlayer1(p => ({ ...p, ready: p.id === id ? true : p.ready }));
            setPlayer2(p => ({ ...p, ready: p.id === id ? true : p.ready }));
        })
        Game.on('game_start', () => {
            board.start();
            setPlaying(true);
        });
        Game.on('game_round', () => {
            board.yourTurn = true;
        });
        Game.on('notice', (message: string) => {
            setNotifications(ns => [{ type: 'sys', message }, ...ns]);
        });
        Game.on('challenger_leaving', (id: number, changeHost: boolean) => {
            if (changeHost) {
                Game.changeSide();
                setPlayer1(p => ({ ...p, side: Game.side }));
            }
            setPlayer2({ name: '', ready: false, id, side: Game.side === 0 ? 1 : 0 });
        });
        Game.on('gameover', (win: boolean) => {
            setNotifications(ns => [
                {
                    type: win ? 'win' : 'lost',
                    message: `You ${win ? 'win' : 'lost'!}`
                },
                ...ns
            ]);
            setPlaying(false);
            setReady(false);
            setPlayer1(p => ({ ...p, ready: false }));
            setPlayer2(p => ({ ...p, ready: false }));
        });

    }, [ref, history]);

    return (
        <div className="battleField">
            <div className="players">
                <Chair {...player1} />
                <Chair {...player2} />
                <div className="controls">
                    <button type="button" disabled={ready} onClick={() => {
                        setReady(true);
                        Game.ready()
                    }}>Start</button>
                    <button type="button" disabled={!playing}>Surrender</button>
                </div>
            </div>
            <canvas ref={ref} className="board" width="450" height="450" />
            <Dialog list={notifications} />
        </div>
    )
}