import React from 'react';
import FormLogin from "./user/FormLogin";
import FormSignUp from "./user/FormSignUp";
import {Route, Switch, MemoryRouter} from 'react-router-dom';
import './App.css';

function App() {
  return (
      <MemoryRouter>
        <Switch>
          <Route exact path="/signUp" component={FormSignUp} key={1}/>
          <Route exact path="/" component={FormLogin} key={2}/>
        </Switch>
      </MemoryRouter>
  );
}

export default App;
