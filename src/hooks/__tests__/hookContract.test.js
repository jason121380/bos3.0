// 資料存取 hook 的「契約」量測工具（本身也是測試檔：直接執行時驗證工具本身；被其他測試 import 時只提供函式）。
// 為什麼需要：src/hooks 下 600 多個 hook 大多只包一支 GraphQL 查詢／mutation，頁面靠它們送出正確的 variables
// （店家 id、日期區間、帳單內容）、用正確的快取策略（設定類 cache-first、交易資料 cache-and-network），
// 並拿到固定形狀的回傳值（{ data, loading, error }、[執行函式, 結果]、{ 具名函式 }）。
// observeHook 在與正式環境相同的外層（Redux、路由、Apollo）執行 hook，回傳可直接比對的觀察結果：
//   initial  掛載後送出的查詢（operationName＋variables）
//   invoked  呼叫回傳的函式（mutation、lazy query）後送出的查詢，以及 mutation Promise 解析出的 data 欄位
//   policies 每支查詢實際使用的 fetchPolicy（從 Apollo client 的 ObservableQuery 讀，不是讀原始碼；未指定記為 DEFAULT_POLICY）
//   unevictableCacheFirst  明確 cache-first 卻沒以 settingsQuery 登記的根欄位（存檔後不會重抓）；正常情況不會出現
//   shape    頁面拿到的回傳值形狀（函式、查詢結果的 loading／data 欄位／是否有 error）；shapeAfter 為呼叫函式後有變化時的形狀
// GraphQL 一律由 testkit 的模擬 link 依查詢名稱回應，不連後端。
import { useApolloClient } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, render } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { getMainDefinition } from '@apollo/client/utilities'
import { registeredSettingsFields } from 'lib/settings-cache'
import { blockNetwork, createAutoMockLink, createTestStore, loginAs } from '../../__tests__/testkit.test'

const isMain = expect.getState().testPath === __filename

// hook 沒指定 fetchPolicy 時 Apollo 用 cache-first（init-apollo 沒有設 defaultOptions）；與「明確指定 cache-first」分開標示
export const DEFAULT_POLICY = 'default(cache-first)'

const isApolloResult = v => v && typeof v === 'object' && 'loading' in v && 'called' in v

// 頁面拿到的回傳值形狀：只描述頁面會讀的部分（函式、查詢結果的狀態與 data 根欄位），不比對 Apollo 內部物件
export function describeValue(v, depth = 0) {
  if (typeof v === 'function') return 'function'
  if (isApolloResult(v)) {
    return {
      loading: v.loading,
      called: v.called,
      data: v.data ? Object.keys(v.data) : v.data === null ? null : undefined,
      error: v.error ? 'error' : undefined,
    }
  }
  if (Array.isArray(v)) return depth > 1 ? 'array' : v.map(x => describeValue(x, depth + 1))
  if (v && typeof v === 'object') {
    if (depth > 1) return 'object'
    const out = {}
    Object.keys(v).forEach(k => {
      out[k] = describeValue(v[k], depth + 1)
    })
    return out
  }
  return v
}

// 等到模擬後端沒有進行中的查詢、且連續兩輪沒有新的查詢（hook 依結果再發的查詢也回來了）
async function settle(link, calls) {
  let last = -1
  for (let i = 0; i < 200; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    if (link.pending === 0 && calls.length === last) return
    last = calls.length
  }
  throw new Error('查詢一直沒有全部回應')
}

// useHook：要量測的 hook；args：傳給 hook 的參數；invoke：依序呼叫回傳值中的函式 [{ fn: 鍵名或索引, args }]
// loggedIn：false 時清掉 localStorage（未登入／沒有 userMerchant）；fallback 'error'：所有查詢模擬 API 失敗
export async function observeHook(useHook, { args = [], invoke = [], loggedIn = true, fixtures = {}, fallback = 'empty', route = '/' } = {}) {
  if (loggedIn) loginAs()
  else localStorage.clear()
  blockNetwork()
  const calls = []
  const link = createAutoMockLink(fixtures, { calls, fallback })
  const result = { current: undefined }
  let client
  function Probe() {
    client = useApolloClient()
    result.current = useHook(...args)
    return null
  }
  const utils = render(
    <Provider store={createTestStore()}>
      <MockedProvider link={link} addTypename={false}>
        <MemoryRouter initialEntries={[route]}>
          <Probe />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  )
  await settle(link, calls)
  const observation = { initial: calls.slice(), shape: describeValue(result.current) }
  if (invoke.length) {
    observation.invoked = []
    for (const { fn, args: fnArgs = [] } of invoke) {
      const before = calls.length
      let returned
      let rejected
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        try {
          returned = await result.current[fn](...fnArgs)
        } catch (e) {
          rejected = e.message
        }
      })
      // eslint-disable-next-line no-await-in-loop
      await settle(link, calls)
      const entry = { fn, calls: calls.slice(before) }
      if (returned && typeof returned === 'object' && 'data' in returned) entry.resolved = returned.data ? Object.keys(returned.data) : null
      if (rejected !== undefined) entry.rejected = rejected
      observation.invoked.push(entry)
    }
    // 呼叫後回傳值有變（例如 lazy query 有了 data）才記錄
    const after = describeValue(result.current)
    if (JSON.stringify(after) !== JSON.stringify(observation.shape)) observation.shapeAfter = after
  }
  const policies = {}
  const settingsFields = new Set(registeredSettingsFields())
  const unevictable = []
  client.getObservableQueries('all').forEach(oq => {
    const name = oq.queryName || '(anonymous)'
    policies[name] = oq.options.fetchPolicy || DEFAULT_POLICY
    // 明確指定 cache-first 的查詢必須以 settingsQuery 登記根欄位，mutation 後才會被 evictSettings 清掉重抓（lib/settings-cache）
    if (oq.options.fetchPolicy === 'cache-first') {
      getMainDefinition(oq.options.query)
        .selectionSet.selections.filter(sel => sel.kind === 'Field' && !settingsFields.has(sel.name.value))
        .forEach(sel => unevictable.push(`${name}.${sel.name.value}`))
    }
  })
  observation.policies = policies
  if (unevictable.length) observation.unevictableCacheFirst = unevictable
  utils.unmount()
  // 只留可比對的純資料（undefined 欄位與 toEqual 的比對方式一致）
  return JSON.parse(JSON.stringify(observation))
}

// 表格驅動：每一列是一個 hook 的契約。expect 是登入狀態下的完整觀察；
// loggedOut：沒有 userMerchant 時的觀察（只有 hook 會讀 localStorage 的列才有）；
// noArgs：不帶參數時的觀察（參數有預設值的 hook 才有）；withDefaults：物件參數省略有預設值的欄位時的觀察；
// failure：API 失敗時頁面拿到的形狀（掛載就查詢的列才有：不拋錯、loading 結束、帶 error，頁面據此防呆）
export function runContractRows(rows) {
  it.each(rows.map(row => [row.id, row]))('%s', async (_id, row) => {
    const spec = { args: row.args, invoke: row.invoke }
    expect(await observeHook(row.hook, spec)).toEqual(row.expect)
    if (row.loggedOut) {
      const out = await observeHook(row.hook, { ...spec, loggedIn: false })
      expect({ initial: out.initial, invoked: out.invoked }).toEqual(row.loggedOut)
    }
    if (row.noArgs) {
      const out = await observeHook(row.hook, { invoke: row.invoke })
      expect({ initial: out.initial, invoked: out.invoked }).toEqual(row.noArgs)
    }
    if (row.withDefaults) {
      const out = await observeHook(row.hook, { args: row.withDefaults.args, invoke: row.invoke })
      expect({ initial: out.initial, invoked: out.invoked }).toEqual(row.withDefaults.expect)
    }
    if (row.failure) {
      const out = await observeHook(row.hook, { ...spec, invoke: [], fallback: 'error' })
      expect(out.shape).toEqual(row.failure)
    }
  })
}

if (isMain) {
  const { gql, useQuery, useMutation, useLazyQuery } = require('@apollo/client')
  const Q = gql`
    query HARNESS_Q($id: ID) {
      thing(id: $id) {
        id
      }
    }
  `
  const M = gql`
    mutation HARNESS_M($input: ThingInput) {
      saveThing(input: $input)
    }
  `
  describe('hookContract：量測工具本身', () => {
    it('記錄掛載時的查詢、fetchPolicy 與回傳值形狀', async () => {
      const obs = await observeHook(id => useQuery(Q, { variables: { id }, fetchPolicy: 'cache-and-network' }), { args: ['t1'] })
      expect(obs).toEqual({
        initial: [{ operationName: 'HARNESS_Q', variables: { id: 't1' } }],
        shape: expect.objectContaining({ loading: false, called: true, data: ['thing'] }),
        policies: { HARNESS_Q: 'cache-and-network' },
      })
    })

    it('依序呼叫回傳的函式：記錄 variables 與 mutation 解析出的 data', async () => {
      const useSave = () => {
        const [save] = useMutation(M)
        const [load, loaded] = useLazyQuery(Q)
        return { save: input => save({ variables: { input } }), load, loaded }
      }
      const obs = await observeHook(useSave, {
        invoke: [
          { fn: 'save', args: [{ name: '甲' }] },
          { fn: 'load', args: [{ variables: { id: 'x' } }] },
        ],
      })
      expect(obs.invoked).toEqual([
        { fn: 'save', calls: [{ operationName: 'HARNESS_M', variables: { input: { name: '甲' } } }], resolved: ['saveThing'] },
        { fn: 'load', calls: [{ operationName: 'HARNESS_Q', variables: { id: 'x' } }] },
      ])
      expect(obs.shape).toEqual({ save: 'function', load: 'function', loaded: { loading: false, called: false } })
      expect(obs.shapeAfter.loaded).toEqual({ loading: false, called: true, data: ['thing'] })
      expect(obs.policies).toEqual({ HARNESS_Q: DEFAULT_POLICY })
    })

    it('API 失敗：查詢結果帶 error、mutation 的 Promise 被拒絕', async () => {
      const failed = await observeHook(() => useQuery(Q), { fallback: 'error' })
      expect(failed.shape).toEqual({ loading: false, called: true, error: 'error' })
      const useSave = () => useMutation(M)
      const obs = await observeHook(useSave, { invoke: [{ fn: 0, args: [{ variables: {} }] }], fallback: 'error' })
      expect(obs.invoked[0].rejected).toContain('HARNESS_M')
    })

    it('cache-first 查詢沒有以 settingsQuery 登記時標出來（存檔後不會被清掉重抓）', async () => {
      const obs = await observeHook(() => useQuery(Q, { fetchPolicy: 'cache-first' }))
      expect(obs.unevictableCacheFirst).toEqual(['HARNESS_Q.thing'])
      const { settingsQuery } = require('lib/settings-cache')
      const SETTINGS = settingsQuery(gql`
        query HARNESS_SETTINGS {
          harnessSetting
        }
      `)
      const ok = await observeHook(() => useQuery(SETTINGS, { fetchPolicy: 'cache-first' }))
      expect(ok.unevictableCacheFirst).toBeUndefined()
      expect(ok.policies).toEqual({ HARNESS_SETTINGS: 'cache-first' })
    })

    it('loggedIn: false 時沒有 userMerchant', async () => {
      const read = () => localStorage.getItem('userMerchant')
      expect((await observeHook(read)).shape).toContain('merchant-1')
      expect((await observeHook(read, { loggedIn: false })).shape).toBeNull()
    })
  })
}
