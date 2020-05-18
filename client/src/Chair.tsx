import React from 'react';

export interface ChairProps {
    name: string;
    ready: boolean;
    side: number;
}

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