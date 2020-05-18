## 创建房间
完善之前创建房间的代码。
房间处理器创建时我传一个Room参数进去，不用以后再次查找了。

RoomProcessor.ts
````ts
constructor(
    public conn: Connection,
    public lobby: Lobby,
    public player: Player,
    public room: Room
) { ... }
````

在有人退出房间后，需要通知大厅其他人更新房间数据
````ts
export interface UPDATE_ROOM {
    action: Types.UPDATE_ROOM,
    id: number,
    members: number[]
}

hungup() {
    ...
    const roomData = this.room.serialize();
    this.lobby.boardcast(CREATE_UPDATE_ROOM(roomData.id, roomData.members))
}
````

`lobby.boardcast`增加条件判断，不通知在房间内的玩家。

````ts
boardcast(message: Message, ignoreId?: number) {
    this.players.forEach(player => {
-       if (player.id !== ignoreId) {
+       if (player.roomId === 0 && player.id !== ignoreId) {
            player.connection.send(message);
        }
    });
}
````
玩家处理器一开始给玩家发送进入房间的消息。
这里我把规则简化，房间的Host自动为黑方，先手，所以，在玩家不是房主的时候给他发送房主的信息。

````ts
export interface ENTER_ROOM {
    action: Types.ENTER_ROOM,
    roomId: number,
    isHost: boolean,
}

export interface CHALLENGER_COMING {
    action: Types.CHALLENGER_COMING,
    id: number,
    name: string,
    isHost: boolean,
    ready: boolean,
}

enter() {
    const host = this.room?.host as Player;
    const isHost = host === this.player;
    this.conn.send(CREATE_ENTER_ROOM(this.room.id, isHost));
    if (!isHost) {
        this.conn.send(CREATE_CHALLENGER_COMING(host.id, host.name, true, host.ready));
    }
}
````

## 开启对战

现在需要把前端的游戏界面整出来了，我简单的画了几个框框。

````ts
export default function BattleField() {
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
````
`Dialog`组件显示收到的消息。

`Chair`显示对战双方的信息。
````ts
export default function Chair(props: ChairProps) {
    const { name, ready, side } = props;
    const cls = side === 0 ? 'chair isBlack' : 'chair';
    return (
        <div className={cls}>
            <div className="username">{name}</div>
            <div className="status">{ready ? 'READY' : ''}</div>
        </div>
    )
}
````

棋盘我用Canvas画出来。按道理来说，棋类这种不需要用Canvas来画，确实要用，应该实现一套类似桌面UI一样的脏矩形渲染，我这里管不了这么多了，一切为了省事。
需要注意的是为了把鼠标坐标转化为棋子位置，我使用了MouseEvent对象的offsetX属性，这会有兼容问题，谁在乎呢，除了Chrome都是异端😄。
````ts
mousePosToCoordinate(x: number, y: number) {
    const rx = x - this.startX;
    const ry = y - this.startY;
    const ix = Math.max(0, Math.floor(rx / CELLSIZE));
    const iy = Math.max(0, Math.floor(ry / CELLSIZE));
    const offsetX = (rx % CELLSIZE) > (CELLSIZE / 2) ? 1 : 0;
    const offsetY = (ry % CELLSIZE) > (CELLSIZE / 2) ? 1 : 0;
    return {
        x: ix + offsetX,
        y: iy + offsetY
    }
}
````

另外我把`Connection`改名为`Game`了，因为它除了连接的功能之外还需要做一些游戏的工作。

点击`Start`之后告诉服务器我准备就绪了。

`Game.ts`
````ts
export interface READY_TO_RACE {
    action: Types.READY_TO_RACE,
    id: number
}

ready() {
    this.send(CREATE_READY_TO_RACE(-1));
}
````

`READY_TO_RACE`的消息是双向的，Front end <==> Server。
Server通知的时候回带上对应玩家的id, 前端发送则不需要了，可以自动获取。

后端的房间处理器收到READY消息之后。通知房间内的所有玩家该玩家已准备好了。

当两个人都准备完毕之后游戏自动开始。

````ts
case Types.READY_TO_RACE: {
    this.player.ready = true;
    let readyCount = 0;
    this.room.members.forEach(player => {
        player.ready && readyCount++;
        player.connection.send(CREATE_READY_TO_RACE(this.player.id));
    });
    if (readyCount === 2) {
        this.lobby.startGame(this.room);
    }
    break;
}
````

开始游戏后把房间的转态设为`Playing`, 只有状态是`Playing`的时候，房间处理器才会响应玩家的下棋动作。

给房间内玩家发送`GAME_START`消息，给当前回合的玩家发送`GAME_ROUND`消息。

````ts
export interface GAME_START {
    action: Types.GAME_START
    roomId: number
}

export interface GAME_ROUND {
    action: Types.GAME_ROUND
}

startGame(room: Room) {
    room.playing = true;
    room.members.forEach(player => {
        player.connection.send(CREATE_GAME_START(room.id));
    });
    room.host?.connection.send(CREATE_GAME_ROUND());
    room.roundId = room.host?.id as number;
}
````

前端收到`GAME_START`消息之后开始一局游戏。把棋盘清空，然后显示一条游戏开始的文字信息。

收到`GAME_ROUND`消息之后，`board`对象可以进行鼠标操作，点击之后如果是有效的位置则向服务器发送`OCCUPATION`消息，带上当前棋子的坐标。

````ts
// BattleField.ts
 board.on('occupation', (index: number) => {
    Game.occupation(index);
});
Game.on('game_start', () => {
    board.start();
    setPlaying(true);
});
Game.on('game_round', () => {
    board.yourTurn = true;
});


// Game.ts
occupation(index: number) {
    this.send(CREATE_OCCUPATION(index, -1));
    this.emit('notice', 'Waiting...');
}
````

服务器对下棋操作的处理：
````ts
round(index: number, playerId: number) {
    if (!this.playing) return;
    if (this.roundId !== playerId) return;
    if (this.chessboard[index]) {
        return;
    }
    this.chessboard[index] = playerId;
    this.members.forEach(p => {
        p.connection.send(CREATE_OCCUPATION(index, (playerId === this.host?.id) ? 0 : 1));
    })
    if (this.check(index)) {
        this.gameOver();
    } else {
        let next = this.members.find(p => p.id !== this.roundId) as Player;
        this.roundId = next.id;
        next.connection.send(CREATE_GAME_ROUND());
    }
}
````

首先判断一下合法性，一切没问题之后向前端发送落子。之后检查5子连线，
成功则结束这局游戏，发送结局消息，否则交换手。

输赢条件判断我撸了一段朴素的代码，甚至没有检查是否能在所有条件下正常工作。

````ts
checkedId: number = 0;
check(index: number) {
    const x = index % 15;
    const y = Math.floor(index / 15);
    let startX = Math.max(0, x - 5);
    let endX = Math.min(14, x + 5);
    let startY = Math.max(0, y - 5);
    let endY = Math.min(14, y + 5);
    let id = this.chessboard[index];
    this.checkedId = id;

    const checkLines = () => {
        let count = 0;
        for (let i = 0; i < lines.length; i++) {
            const loc = lines[i];
            if (this.chessboard[loc] === id) {
                count++;
            } else {
                count = 0;
            }
            if (count >= 5) break;
        }
        lines = [];
        return count >= 5;
    }

    let lines: number[] = [];
    for (let px = startX; px < endX; px++) {
        const loc = px + y * 15;
        lines.push(loc);
    }
    if (checkLines()) return true;

    for (let py = startY; py < endY; py++) {
        const loc = x + py * 15;
        lines.push(loc);
    }
    if (checkLines()) return true;

    for (let i = 1; i < 5; i++) {
        if (x - i > -1 && y - i > -1)
            lines.push(x - i + (y - i) * 15);
    }
    lines.push(x + y * 15);
    for (let i = 1; i < 5; i++) {
        if (x + i < 15 && y + i < 15)
            lines.push(x + i + (y + i) * 15);
    }
    if (checkLines()) return true;

    for (let i = 1; i < 5; i++) {
        if (x - i > -1 && y + i < 15)
            lines.push(x - i + (y + i) * 15);
    }
    lines.push(x + y * 15);
    for (let i = 1; i < 5; i++) {
        if (x - i < 15 && y - i > -1)
            lines.push(x + i + (y - i) * 15);
    }
    if (checkLines()) return true;
}
````

那么，加上一些必要的玩家中途退出的处理，这个小DEMO差不多算是完成了。

总结：周末两天花在这上面的时间应该超过8个小时了，这大大超出我原来的预期，再简单的东西如果加上实时交互复杂度就倍增，这还是在这个小游戏没有需要处理同步的需求。

`React Hooks`用起来还是力不从心，我的理解是如果用来做大一点的应用，状态管理还是跑不掉，我依然会引入`ReMatch`之类的东西。
