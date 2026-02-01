import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch } from 'react-router-dom'
import { Provider } from 'react-redux';
import store from './store/index';

import App from './App'
import * as serviceWorker from './serviceWorker'

serviceWorker.unregister()

const rootDOM = document.getElementById('root')

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Provider store={store}>
        <App />
      </Provider>
    </Switch>
  </BrowserRouter>,
  rootDOM
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
