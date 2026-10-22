import '@testing-library/jest-dom/extend-expect'
import '@testing-library/jest-dom'
import 'mutationobserver-shim'

// ========== 測試中一律不得連網（Jason 2026/10/22：不可以動到真的資料庫） ==========
// CRA 的 jsdom 環境會補上真的 fetch／XMLHttpRequest，沒走 testkit 的測試若不小心呼叫到，就會真的連到後端。
// 這裡在每個測試檔開始前把三種出口都換掉：fetch 一律回傳失敗、XMLHttpRequest 送出即拋錯、WebSocket 建立即拋錯，
// 並把被擋下的網址記在 global.__blockedNetwork__ 供測試檢查。testkit 的 blockNetwork() 之後會再把 fetch 換成回傳空內容的假版本，同樣不連網。
// 用一般函式而非 jest.fn：CRA 的 resetMocks 會在每個測試前清掉 jest.fn 的實作。
global.__blockedNetwork__ = []
const denyNetwork = (kind, url) => {
  global.__blockedNetwork__.push(`${kind} ${url}`)
  return new Error(`測試中禁止連網（${kind}）：${url}`)
}
const deniedFetch = url => Promise.reject(denyNetwork('fetch', url))
window.fetch = deniedFetch
global.fetch = deniedFetch
const xhrOpen = window.XMLHttpRequest.prototype.open
window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  this.__blockedUrl__ = url
  return xhrOpen.call(this, method, url, ...rest)
}
window.XMLHttpRequest.prototype.send = function () {
  throw denyNetwork('XMLHttpRequest', this.__blockedUrl__)
}
const DeniedWebSocket = function (url) {
  throw denyNetwork('WebSocket', url)
}
window.WebSocket = DeniedWebSocket
global.WebSocket = DeniedWebSocket

// import { configure } from 'enzyme'
// import Adapter from 'enzyme-adapter-react-16'

document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
})

// configure({ adapter: new Adapter() })

const mockConsoleMethod = realConsoleMethod => {
  const ignoredMessages = ['test was not wrapped in act(...)']

  return (message, ...args) => {
    const containsIgnoredMessage = ignoredMessages.some(ignoredMessage =>
      message.includes(ignoredMessage)
    )

    if (!containsIgnoredMessage) {
      realConsoleMethod(message, ...args)
    }
  }
}

console.warn = jest.fn(mockConsoleMethod(console.warn))
console.error = jest.fn(mockConsoleMethod(console.error))

// ========== Mock localStorage ==========

var localStorageMock = (function () {
  var store = {}
  return {
    getItem: function (key) {
      // 與真實 localStorage 一致：不存在的 key 回傳 null（元件以 !== null 判斷 liffId）
      return key in store ? store[key] : null
    },
    setItem: function (key, value) {
      store[key] = JSON.stringify(value)
    },
    clear: function () {
      store = {}
    },
    removeItem: function (key) {
      delete store[key]
    },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// jsdom 沒有 crypto.getRandomValues（lib/uuid 用到）：補 Node 的 webcrypto，只影響測試環境
// 用 window（jsdom 的全域）而非 globalThis：eslint-check 的環境設定不認得 globalThis
if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') {
  Object.defineProperty(window, 'crypto', { value: require('crypto').webcrypto, configurable: true })
}
