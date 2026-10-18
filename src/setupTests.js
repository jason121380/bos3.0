import '@testing-library/jest-dom/extend-expect'
import '@testing-library/jest-dom'
import 'mutationobserver-shim'

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
