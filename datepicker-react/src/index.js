import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import App from './components/App';
import DatePickerSimple from './components/DatePickerSimple/DatePickerSimple';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

const server = process.env.REACT_APP_SERVER_URL;
const DatePickerSimpleWithProps = () => <DatePickerSimple server={server} />
const AppWithProps = () => <App server={server} />

const routes = [
    {
        path: "/datepicker-simple",
        component: DatePickerSimpleWithProps,
        exact: true
    },
    {
        path: "/", // Catch all
        component: AppWithProps,
        exact: false
    }
]

const Root = () => {
    return (
        <Router>
            <Switch>
                {routes.map((route, i) => <Route key={i} { ...route } />)}
            </Switch>
        </Router>
    )
}

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
