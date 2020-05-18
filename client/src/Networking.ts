import { useState, useEffect } from "react"
import Game from "./Game";

type State = {
    loading: boolean,
    error: string,
    logged: boolean,
    name: string,
    token: string,
}


const Connect = (): [State, React.Dispatch<string>] => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logged, setLogged] = useState(false);
    const [name, setName] = useState('');
    const [token, setToken] = useState('');
    useEffect(() => {
        const request = async () => {
            setError('');
            setLoading(true);
            const res = await fetch('/api/login', {
                body: JSON.stringify({ name }),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setLoading(false);
            if (res.status === 200) {
                const { token } = await res.json();
                Game.name = name;
                Game.token = token;
                Game.logged = true;
                setToken(token);
                setLogged(true);
            } else {
                const errmsg = await res.text();
                setError(errmsg);
            }
        }
        if (name && !logged) {
            request();
        }
    }, [name, logged]);
    return [{ loading, error, logged, name, token }, setName];
}

export { Connect }
