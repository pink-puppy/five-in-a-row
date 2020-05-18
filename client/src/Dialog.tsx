import React from 'react';

export interface Notification {
    type: string,
    message: string
}

export default function Dialog(props: { list: Notification[] }) {
    const { list } = props;
    return (
        <div className="dialog">
            {
                list.map((n, i) => <div key={i} className={`msg ${n.type}`}>{n.message}</div>)
            }
        </div>
    )
}