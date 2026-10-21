import { ApolloClient, ApolloLink, InMemoryCache, Observable, gql } from '@apollo/client'
import { settingsQuery, settingsCacheLink, bindSettingsCache, evictSettings, SETTINGS_MAX_AGE_MS } from '../settings-cache'

// 為什麼重要：設定類查詢改成 cache-first 後，換頁不再重抓（省掉大量重複請求）；
// 但店家在任何地方存檔後、或過了 10 分鐘，畫面上的設定一定要重新抓，否則會用到舊設定（例如會員卡開關、商品分類）。

const SETTING = settingsQuery(gql`
  query TEST_SETTING {
    getIsMemberShipCardActive
  }
`)
const SAVE = gql`
  mutation TEST_SAVE {
    saveSomething
  }
`

function setup() {
  const calls = []
  let value = true
  const terminal = new ApolloLink(operation => {
    calls.push(operation.operationName)
    return new Observable(observer => {
      const data = operation.operationName === 'TEST_SAVE' ? { saveSomething: true } : { getIsMemberShipCardActive: value }
      observer.next({ data })
      observer.complete()
    })
  })
  const cache = new InMemoryCache({ addTypename: false })
  const client = new ApolloClient({ link: settingsCacheLink.concat(terminal), cache })
  bindSettingsCache(cache, { expire: false })
  return { client, calls, setValue: v => { value = v } }
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

test('同一次開頁第二次讀取設定直接用快取，不再打 API', async () => {
  const { client, calls } = setup()
  await client.query({ query: SETTING, fetchPolicy: 'cache-first' })
  await client.query({ query: SETTING, fetchPolicy: 'cache-first' })
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(1)
})

test('任何 mutation 成功後，畫面上正在看的設定會自動重抓到新值', async () => {
  const { client, calls, setValue } = setup()
  const seen = []
  const sub = client.watchQuery({ query: SETTING, fetchPolicy: 'cache-first' }).subscribe(r => seen.push(r.data && r.data.getIsMemberShipCardActive))
  await flush()
  setValue(false)
  await client.mutate({ mutation: SAVE })
  await flush()
  await flush()
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(2)
  expect(seen[seen.length - 1]).toBe(false)
  sub.unsubscribe()
})

test('每 10 分鐘自動清除設定快取，畫面上的設定會重抓', async () => {
  jest.useFakeTimers()
  const { client, calls } = setup()
  bindSettingsCache(client.cache, { expire: true })
  const sub = client.watchQuery({ query: SETTING, fetchPolicy: 'cache-first' }).subscribe(() => {})
  await Promise.resolve()
  jest.advanceTimersByTime(SETTINGS_MAX_AGE_MS + 1)
  await Promise.resolve()
  jest.useRealTimers()
  await flush()
  expect(calls.filter(c => c === 'TEST_SETTING')).toHaveLength(2)
  sub.unsubscribe()
  bindSettingsCache(client.cache, { expire: false })
})

test('沒有綁定 cache 時清除不拋錯', () => {
  expect(() => evictSettings(null)).not.toThrow()
})

test('共用根欄位（merchant 底下還有權限與報表）不能登記為設定，否則清設定會連帶清掉它們', () => {
  expect(() => settingsQuery(gql`query SHARED_ROOT { merchant { thirdpartyCoupons { id } } }`)).toThrow('merchant')
})
