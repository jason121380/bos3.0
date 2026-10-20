// 只載入 stable polyfill：Vite 產出的是 ES module（需 Safari 14／Chrome 87 以上），IE11 本來就無法執行，ie11 polyfill 只是多餘的首屏負擔
import 'react-app-polyfill/stable'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store/index'

import App from './App'
import * as serviceWorker from './serviceWorker'

// 不使用 service worker（離線快取），確保已安裝的舊版會被移除
serviceWorker.unregister()

// 路由由 App 內的 <Router history> 提供；原本外層還包了一層未使用的 BrowserRouter＋Switch
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
