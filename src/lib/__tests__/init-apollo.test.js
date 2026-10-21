import { openSnackbar } from 'elements/snackbars'
import { ApolloLink, Observable, execute } from '@apollo/client'
import { gql } from '@apollo/client'
import { beginRequest } from '../after-first-load'
import { buildAuthHeaders, handleApolloError, inflightLink, networkErrorMessage } from '../init-apollo'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('../after-first-load', () => ({ beginRequest: jest.fn() }))

describe('handleApolloError：API 錯誤一定要讓使用者知道', () => {
  let now = 1_000_000
  let originalLocation

  beforeEach(() => {
    openSnackbar.mockClear()
    now += 60_000 // 每個測試都離上一次網路錯誤提示超過節流間隔
    jest.spyOn(Date, 'now').mockImplementation(() => now)
    jest.spyOn(window.localStorage, 'clear').mockImplementation(() => {})
    window.alert = jest.fn()
    originalLocation = window.location
    delete window.location
    window.location = { href: 'http://localhost/order/create' }
  })

  afterEach(() => {
    jest.restoreAllMocks()
    window.location = originalLocation
  })

  it('後端業務錯誤（例如密碼錯誤）原文顯示給使用者', () => {
    handleApolloError({ graphQLErrors: [{ message: '密碼錯誤', extensions: { code: 'BAD_USER_INPUT' } }] })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '密碼錯誤', variant: 'error' })
  })

  it('錯誤沒有 extensions 時不可讓錯誤處理本身拋錯（原本讀 extensions.code 會 TypeError）', () => {
    expect(() => handleApolloError({ graphQLErrors: [{ message: '伺服器內部錯誤' }] })).not.toThrow()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '伺服器內部錯誤', variant: 'error' })
  })

  it('登入逾期（TKN_ERROR）清除登入資料並導回登入頁，不另外跳錯誤訊息', () => {
    handleApolloError({ graphQLErrors: [{ message: 'token expired', extensions: { code: 'TKN_ERROR' } }] })
    expect(window.localStorage.clear).toHaveBeenCalled()
    expect(window.location.href).toBe('/auth/login')
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  it('帳號被停權（TKN_IN_JAIL）以 alert 告知', () => {
    handleApolloError({ graphQLErrors: [{ message: '帳號已停用', extensions: { code: 'TKN_IN_JAIL' } }] })
    expect(window.alert).toHaveBeenCalledWith('帳號已停用')
    expect(openSnackbar).not.toHaveBeenCalled()
  })

  it('斷線時提示使用者（原本只寫 console，按鈕停在處理中也看不出原因）', () => {
    handleApolloError({ networkError: new TypeError('Failed to fetch') })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '網路連線異常，請檢查網路後再試一次', variant: 'error' })
  })

  it('同一次斷線多支查詢同時失敗只提示一次，過了節流間隔才再提示', () => {
    handleApolloError({ networkError: new TypeError('Failed to fetch') })
    now += 1000
    handleApolloError({ networkError: new TypeError('Failed to fetch') })
    expect(openSnackbar).toHaveBeenCalledTimes(1)
    now += 10_000
    handleApolloError({ networkError: new TypeError('Failed to fetch') })
    expect(openSnackbar).toHaveBeenCalledTimes(2)
  })
})

describe('networkErrorMessage', () => {
  it('伺服器有回應但狀態碼錯誤時，說明是伺服器問題而不是使用者網路', () => {
    // 與頁面 catch 經 openSnackbar 顯示的文字一致（lib/friendly-error），並依狀態碼給下一步
    expect(networkErrorMessage({ statusCode: 502 })).toBe('伺服器暫時無法處理，請稍後再試；若持續發生，請截圖並聯絡客服（502）')
    expect(networkErrorMessage({ statusCode: 401 })).toBe('登入狀態已失效，請重新登入後再試一次')
  })

  it('連不上伺服器時提示檢查網路', () => {
    expect(networkErrorMessage(new TypeError('Failed to fetch'))).toBe('網路連線異常，請檢查網路後再試一次')
  })
})

describe('buildAuthHeaders：每個請求都要帶登入憑證與目前店家', () => {
  let store

  beforeEach(() => {
    store = {}
    jest.spyOn(window.localStorage, 'getItem').mockImplementation(key => (key in store ? store[key] : null))
  })

  afterEach(() => jest.restoreAllMocks())

  it('已登入且選了店家：帶 accesstoken 與 usermerchantid', () => {
    store.token = 'tok-123'
    store.userMerchant = JSON.stringify({ id: 'merchant-9', name: '中山店' })
    expect(buildAuthHeaders()).toEqual({ accesstoken: 'tok-123', usermerchantid: 'merchant-9' })
  })

  it('未登入：不帶任何憑證標頭', () => {
    expect(buildAuthHeaders()).toEqual({})
  })

  it('保留呼叫端傳入的標頭（原本會被丟掉）', () => {
    store.token = 'tok-123'
    expect(buildAuthHeaders({ 'x-request-id': 'abc' })).toEqual({ 'x-request-id': 'abc', accesstoken: 'tok-123' })
  })

  it('店家資料損毀成 "null" 時不拋錯，只是不帶店家', () => {
    store.token = 'tok-123'
    store.userMerchant = 'null'
    expect(buildAuthHeaders()).toEqual({ accesstoken: 'tok-123' })
  })
})

// 為什麼重要：inflightLink 包在所有查詢外面，只能計數、不能改動結果或吞掉錯誤；
// 而且完成、失敗、取消（換頁時元件卸載）都要結束計數，否則首屏延後的查詢（訂單佇列、店家清單）要等到 10 秒保底才發出。
describe('inflightLink：統計進行中的查詢，不影響查詢本身', () => {
  const query = gql`
    query PING {
      ping
    }
  `
  let end
  beforeEach(() => {
    end = jest.fn()
    beginRequest.mockImplementation(() => end)
  })
  const run = terminating => execute(inflightLink.concat(new ApolloLink(terminating)), { query })

  test('結果原樣傳回，完成時結束計數一次', done => {
    const result = { data: { ping: 'pong' } }
    const values = []
    run(() => Observable.of(result)).subscribe({
      next: value => values.push(value),
      complete: () => {
        expect(values).toEqual([result])
        expect(beginRequest).toHaveBeenCalledTimes(1)
        expect(end).toHaveBeenCalled()
        done()
      },
    })
  })

  test('錯誤照樣往上傳（errorLink 才能提示使用者），並結束計數', done => {
    const failure = new Error('network down')
    run(() => new Observable(observer => observer.error(failure))).subscribe({
      error: error => {
        expect(error).toBe(failure)
        expect(end).toHaveBeenCalled()
        done()
      },
    })
  })

  test('查詢還沒回來就取消（換頁卸載）也結束計數', () => {
    const subscription = run(() => new Observable(() => {})).subscribe({})
    expect(end).not.toHaveBeenCalled()
    subscription.unsubscribe()
    expect(end).toHaveBeenCalled()
  })
})
