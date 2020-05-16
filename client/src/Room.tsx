import React from 'react';

interface RoomProps {
    members: number[]
    id: number,
    onClick: (id: number) => void
}

export default (props: RoomProps) => {
    const { id, members } = props;
    let className = 'room';
    if (members.length > 1)
        className += ' busy';

    const onClick = () => {
        (members.length === 1) && props.onClick(id);
    }
    return (
        <div className={className} onClick={onClick}>
            {members.map((m, i) => {
                const cls = i === 0 ? 'member' : 'member sec';
                return <div key={i} className={cls}></div>
            })}
            <div className="roomId">{id}</div>
        </div>
    )
}