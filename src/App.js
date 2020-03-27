import React from 'react';
import FormLogin from "./user/FormLogin";
import FormSignUp from "./user/FormSignUp";
import Menu from "./Menu";
import Home from "./Home";
import CustomReports from "./reports/CustomReports";
import AddressBook from "./adressbook/AddressBook";
import {Route, Switch, MemoryRouter} from 'react-router-dom';
import './App.css';

function App() {
    return (
        <MemoryRouter>
            <Switch>
                <Route exact path="/signUp" component={FormSignUp} key={1}/>
                <Route exact path="/login" component={FormLogin} key={2}/>
                <Menu key={3}>
                    <Switch>
                        <Route exact path="/addressBook" component={Home} key={3.1}/>
                        <Route exact path="/" component={AddressBook} key={3.2}/>
                        <Route exact path="/customReports" component={CustomReports} key={3.3}/>
                    </Switch>
                </Menu>
            </Switch>
        </MemoryRouter>
    );
}

export default App;
