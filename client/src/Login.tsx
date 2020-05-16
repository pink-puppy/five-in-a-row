import React, { useState, createRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Connect } from './Networking';


export default function Login() {
    const [name, setName] = useState('');
    const ref = createRef<HTMLInputElement>();
    const [{ logged, loading, error }, doLogin] = Connect();
    const history = useHistory();
    useEffect(() => {
        if (logged) {
            history.push('/lobby');
        }
        ref.current?.focus();
    }, [history, logged, ref]);
    return (
        <div className="login">
            <form onSubmit={e => {
                e.preventDefault();
                doLogin(name);
            }}>
                <h3>FIVE IN A ROW</h3>
                <input
                    ref={ref}
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>Login</button>
                <div className="err">{error}</div>
            </form>
        </div>
    )
}