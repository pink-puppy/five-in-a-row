import React from 'react';
import { BrowserRouter, Switch, Route, } from 'react-router-dom';
import Login from './Login';
import Lobby from './Lobby';
import BattleField from './BattleField';

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Login} />
          <Route path="/lobby" component={Lobby} />
          <Route path="/battle" component={BattleField} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}
