// 不載入整包 core-js（原 react-app-polyfill/stable，入口 chunk 約 194 KB）：Vite 產出的是 ES module，只能在 Safari 14／Chrome 87 以上執行，
// 這些瀏覽器已內建絕大多數功能；程式與套件實際用到、但 Safari 14 缺少的少數功能另在 lib/polyfills 補上（Jason 2026/10/21 同意）
import './lib/polyfills'
// immer 升到 9 後維持 7 的凍結行為（正式環境不凍結 produce 結果）；須在任何用到 produce 的模組之前載入
import './lib/immer-config'
// 日期一律以台灣時間計算與顯示（裝置不在 UTC+8 時才會替換 Date）；須在 App 與各頁面之前載入
import './lib/install-business-timezone'
// 登入者資料只留畫面用得到的欄位：改版前已登入的使用者在開啟頁面時就地瘦身（不影響登入狀態）
import { sanitizeStoredUser } from './lib/stored-user'
import { installChunkReload } from './lib/lazy-with-retry'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store/index'

import App from './App'
import * as serviceWorker from './serviceWorker'

sanitizeStoredUser()
installChunkReload()

// 不使用 service worker（離線快取），確保已安裝的舊版會被移除
serviceWorker.unregister()

// 路由由 App 內的 <Router history> 提供；原本外層還包了一層未使用的 BrowserRouter＋Switch
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
