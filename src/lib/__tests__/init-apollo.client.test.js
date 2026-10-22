import { gql } from '@apollo/client'
import { openSnackbar } from 'elements/snackbars'
import initApollo from '../init-apollo'
import { client as withApolloClient } from '../with-apollo-client'
import { getGraphqlUrl } from '../api-base'
import { settingsQuery, SETTINGS_FETCH_POLICY } from '../settings-cache'

// 為什麼重要：全站只用一個 Apollo client（initApollo）。這裡用整條正式的 link 鏈（設定快取→計數→登入憑證→錯誤提示→HTTP）驗證：
// ①不論從哪裡取 client 都是同一個（原本每次呼叫都新建，啟動時有兩份快取，設定改了另一份不會更新）；
// ②每個請求都送到 api-base 決定的後端，並帶登入憑證、目前店家與 Apollo-Require-Preflight（後端擋 CSRF 必需）；
// ③存檔（mutation）成功後設定類查詢會重抓，確認 App 的 client 有接上設定快取清除；
// ④後端回錯誤時提示使用者。
// 以假 fetch 回應，不連任何後端。

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

const SETTING = settingsQuery(gql`
  query CLIENT_TEST_SETTING {
    clientTestSettingFlag
  }
`)
const SAVE = gql`
  mutation CLIENT_TEST_SAVE {
    clientTestSave
  }
`

let requests
let store
beforeEach(() => {
  requests = []
  store = { token: 'tok-1', userMerchant: JSON.stringify({ id: 'merchant-7', name: '中山店' }) }
  jest.spyOn(window.localStorage, 'getItem').mockImplementation(key => (key in store ? store[key] : null))
  global.fetch = jest.fn((url, options) => {
    const body = JSON.parse(options.body)
    requests.push({ url, headers: options.headers, operationName: body.operationName })
    const payload =
      body.operationName === 'CLIENT_TEST_FAIL'
        ? { errors: [{ message: '密碼錯誤' }] }
        : { data: body.operationName === 'CLIENT_TEST_SAVE' ? { clientTestSave: true } : { clientTestSettingFlag: requests.length } }
    return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(payload)) })
  })
})
afterEach(() => {
  jest.restoreAllMocks()
  delete global.fetch
})

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

test('全站共用同一個 client（initApollo 與 with-apollo-client 取得的是同一個）', () => {
  const client = initApollo()
  expect(initApollo()).toBe(client)
  expect(withApolloClient()).toBe(client)
})

test('請求送到 api-base 決定的後端，並帶登入憑證、目前店家與 CSRF 標頭', async () => {
  await initApollo().query({ query: SETTING, fetchPolicy: 'network-only' })
  expect(requests).toHaveLength(1)
  expect(requests[0].url).toBe(getGraphqlUrl())
  expect(requests[0].headers).toEqual(
    // Apollo 送出前把標頭名稱轉成小寫
    expect.objectContaining({ accesstoken: 'tok-1', usermerchantid: 'merchant-7', 'apollo-require-preflight': 'true' })
  )
})

test('存檔成功後，設定類查詢不再讀舊快取而是重抓', async () => {
  const client = initApollo()
  await client.query({ query: SETTING, fetchPolicy: SETTINGS_FETCH_POLICY })
  const before = requests.filter(r => r.operationName === 'CLIENT_TEST_SETTING').length
  await client.query({ query: SETTING, fetchPolicy: SETTINGS_FETCH_POLICY })
  expect(requests.filter(r => r.operationName === 'CLIENT_TEST_SETTING')).toHaveLength(before) // 第二次讀快取
  await client.mutate({ mutation: SAVE })
  await flush()
  await client.query({ query: SETTING, fetchPolicy: SETTINGS_FETCH_POLICY })
  expect(requests.filter(r => r.operationName === 'CLIENT_TEST_SETTING')).toHaveLength(before + 1)
})

test('後端回業務錯誤時以提示告知使用者', async () => {
  const FAIL = gql`
    query CLIENT_TEST_FAIL {
      clientTestSettingFlag
    }
  `
  await expect(initApollo().query({ query: FAIL, fetchPolicy: 'network-only' })).rejects.toThrow('密碼錯誤')
  expect(openSnackbar).toHaveBeenCalledWith({ message: '密碼錯誤', variant: 'error' })
})
