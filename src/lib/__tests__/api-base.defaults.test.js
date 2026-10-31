// api-base 的預設參數：頁面實際呼叫時都不帶參數，由目前網址與 REACT_APP_API_URL 決定。
// 為什麼重要：只測帶參數的版本，會漏掉「預設值讀錯環境變數／讀錯網址」——那正是 2026/10/24 連到正式站的原因。
import { detectApiEnv, getApiEnvironment, getApiOrigin, getGraphqlUrl, implicitApiNotice, IMPLICIT_API_NOTICE, TEST_ORIGIN } from '../api-base'

describe('api-base：不帶參數時讀目前網址與環境變數', () => {
  const original = process.env.REACT_APP_API_URL

  afterEach(() => {
    if (original === undefined) delete process.env.REACT_APP_API_URL
    else process.env.REACT_APP_API_URL = original
  })

  it('未設定變數時，以 jsdom 的 localhost 網址判斷為測試環境', () => {
    delete process.env.REACT_APP_API_URL
    expect(window.location.hostname).toBe('localhost')
    expect(detectApiEnv()).toBe('test')
    expect(getGraphqlUrl()).toBe(`${TEST_ORIGIN}/graphql`)
    expect(getApiOrigin()).toBe(TEST_ORIGIN)
    expect(getApiEnvironment()).toBe('staging')
    expect(implicitApiNotice()).toBeNull()
  })

  it('設定變數時，預設參數讀到它，WebSocket／REST 跟著同一台主機', () => {
    process.env.REACT_APP_API_URL = 'https://env-api.example.com/graphql'
    expect(getGraphqlUrl()).toBe('https://env-api.example.com/graphql')
    expect(getApiOrigin()).toBe('https://env-api.example.com')
    expect(implicitApiNotice()).toBeNull()
  })

  it('沒有 window（建置腳本、伺服器端）且未設定變數時不可連正式 API：連測試站並提示', () => {
    delete process.env.REACT_APP_API_URL
    // jsdom 的 global.window 是可設定的 getter：暫時拿掉來模擬沒有 window 的環境
    const descriptor = Object.getOwnPropertyDescriptor(global, 'window')
    Object.defineProperty(global, 'window', { value: undefined, configurable: true })
    try {
      expect(detectApiEnv()).toBe('closed')
      expect(getGraphqlUrl()).toBe(`${TEST_ORIGIN}/graphql`)
      expect(implicitApiNotice()).toBe(IMPLICIT_API_NOTICE)
    } finally {
      Object.defineProperty(global, 'window', descriptor)
    }
    expect(window.location.hostname).toBe('localhost')
  })

  it('網址不是字串或解析失敗時當成認不得的網址：改連測試並提示', () => {
    expect(detectApiEnv(12345)).toBe('closed')
    expect(detectApiEnv('http://')).toBe('closed')
    expect(implicitApiNotice(null, 'not a url')).toBe(IMPLICIT_API_NOTICE)
  })
})
