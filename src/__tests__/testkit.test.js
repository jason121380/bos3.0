// 頁面測試共用工具（本身也是測試檔：直接執行時驗證工具本身；被其他測試 import 時只提供函式）。
// 為什麼需要：頁面一次發出數十支查詢，MockedProvider 的 mocks 必須逐一比對 variables，頁面一改變數組成就全部失配。
// 這裡把 MockedProvider 的 link 換成「依 operation 名稱回應」的模擬 link：回應依查詢的欄位自動補齊（沒給的欄位補 null），
// 讓測試只需寫出與業務有關的資料；同時記錄每一次呼叫的 variables，供斷言「送出的帳單內容」等。
// 不連任何真實後端、不建立真實資料。
import { ApolloLink, Observable, gql } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { configureStore } from '@reduxjs/toolkit'
import { render, wait } from '@testing-library/react'

import PageErrorBoundary from 'components/PageErrorBoundary'
import TeachingModeState from 'context/TeachingModeState'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import socketReducer from 'store/socket'
import reservationReducer from 'store/reservation'
import deductionDisplayReducer from 'store/deductionDisplay'
import QRcodeClockInReducer from 'store/QRcodeClockIn'
import pinnedTableReducer from 'store/pinnedTable'
import { makeFieldChange } from 'views/OrderShared/customerFormInput'

const isMain = expect.getState().testPath === __filename

export const MERCHANT_ID = 'merchant-1'
export const USER_ID = 'user-1'

// 依 selection set 把 fixture 補齊成完整回應（Apollo 快取才不會因缺欄位而回傳 undefined）。
// 沒給的純量欄位補 null；沒給的物件／清單欄位依 missing：
//   'empty'（預設）＝「後端回了空資料」：名稱像清單的（複數、List、records…）補空陣列；分頁包裝（含 totalCount／pageLimit）、
//   查詢最外層「內含清單欄位」的包裝（例如 getOrderList { intervalSummary orderList }）與其他物件補成欄位為空的物件——
//   頁面讀 .map／.length／.data 不會因測試沒寫到的欄位而拋錯；
//   'null'＝照實補 null（用來重現後端回 null 的情況）
const LIST_NAME = /(^data$|s$|sV\d+$|List|list$|Records|records$|Record$|Data$)/
const PAGINATION_FIELDS = ['totalCount', 'pageLimit', 'pageOffset']
const selectionNames = ss => ss.selections.filter(sel => sel.kind === 'Field').map(sel => sel.name.value)
const containsList = ss =>
  ss.selections.some(sel => sel.kind === 'Field' && sel.selectionSet && LIST_NAME.test(sel.name.value))
function emptyComposite(sel, fragments, missing, depth) {
  const names = selectionNames(sel.selectionSet)
  // 最外層、只含物件／清單欄位（沒有 id、name 等純量）且內含清單者視為包裝物件（getOrderList { intervalSummary orderList }）；
  // 帶純量欄位的（shortcuts { id name services {…} }）仍是清單
  const hasScalar = sel.selectionSet.selections.some(child => child.kind === 'Field' && !child.selectionSet)
  const isWrapper =
    names.some(n => PAGINATION_FIELDS.includes(n)) || (depth === 0 && !hasScalar && containsList(sel.selectionSet))
  if (!isWrapper && LIST_NAME.test(sel.name.value)) return []
  return fillSelection(sel.selectionSet, {}, fragments, missing, depth + 1)
}

function fillSelection(selectionSet, value, fragments, missing, depth = 0) {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) return value.map(v => fillSelection(selectionSet, v, fragments, missing, depth))
  if (typeof value !== 'object') return value
  const out = {}
  const visit = ss => {
    ss.selections.forEach(sel => {
      if (sel.kind === 'Field') {
        const key = sel.alias ? sel.alias.value : sel.name.value
        const v = value[key]
        if (v === undefined) {
          if (!(key in out)) {
            out[key] = sel.selectionSet && missing === 'empty' ? emptyComposite(sel, fragments, missing, depth) : null
          }
        } else if (sel.selectionSet) {
          const filled = fillSelection(sel.selectionSet, v, fragments, missing, depth + 1)
          out[key] =
            out[key] && typeof out[key] === 'object' && !Array.isArray(out[key]) && filled
              ? { ...out[key], ...filled }
              : filled
        } else {
          out[key] = v
        }
      } else if (sel.kind === 'InlineFragment') {
        visit(sel.selectionSet)
      } else if (sel.kind === 'FragmentSpread' && fragments[sel.name.value]) {
        visit(fragments[sel.name.value].selectionSet)
      }
    })
  }
  visit(selectionSet)
  return out
}

export function buildResponse(query, fixture, missing = 'empty') {
  const op = query.definitions.find(d => d.kind === 'OperationDefinition')
  const fragments = {}
  query.definitions
    .filter(d => d.kind === 'FragmentDefinition')
    .forEach(f => {
      fragments[f.name.value] = f
    })
  return fillSelection(op.selectionSet, fixture || {}, fragments, missing)
}

// fixtures：{ [operationName]: data 物件 | (variables, operation) => data | Error（GraphQL 錯誤）}
// options.fallback：沒有 fixture 的查詢怎麼回應——'empty'（補 null 的空資料，預設）或 'error'（模擬 API 失敗）
// delays：{ 查詢名稱: 毫秒 }，讓指定查詢較晚回應（模擬設定比資料晚到的情況）
export function createAutoMockLink(fixtures = {}, { fallback = 'empty', missing = 'empty', calls = [], delays = {} } = {}) {
  const link = new ApolloLink(
    operation =>
      new Observable(observer => {
        const { operationName, variables, query } = operation
        calls.push({ operationName, variables })
        link.pending += 1
        const hasFixture = Object.prototype.hasOwnProperty.call(fixtures, operationName)
        let fixture = hasFixture ? fixtures[operationName] : undefined
        let done = false
        const timer = setTimeout(() => {
          done = true
          try {
            if (typeof fixture === 'function') fixture = fixture(variables, operation)
            if (fixture instanceof Error || (!hasFixture && fallback === 'error')) {
              const message = fixture instanceof Error ? fixture.message : `模擬 API 失敗：${operationName}`
              observer.next({ errors: [{ message }] })
            } else {
              observer.next({ data: buildResponse(query, fixture, missing) })
            }
            observer.complete()
          } catch (e) {
            observer.error(e)
          } finally {
            link.pending -= 1
          }
        }, delays[operationName] || 0)
        return () => {
          if (!done) link.pending -= 1
          clearTimeout(timer)
        }
      })
  )
  link.calls = calls
  link.pending = 0
  return link
}

export const callsOf = (calls, operationName) => calls.filter(c => c.operationName === operationName)

export function createTestStore() {
  return configureStore({
    reducer: {
      socket: socketReducer,
      reservation: reservationReducer,
      deductionDisplay: deductionDisplayReducer,
      QRcodeClockIn: QRcodeClockInReducer,
      pinnedTable: pinnedTableReducer,
    },
  })
}

// 登入狀態：setupTests 的 localStorage 假物件 setItem 會再 JSON.stringify，因此直接傳物件
export function loginAs({ merchant = { id: MERCHANT_ID, name: '測試店' }, user = { id: USER_ID, name: '店長' } } = {}) {
  localStorage.clear()
  if (merchant) localStorage.setItem('userMerchant', merchant)
  if (user) localStorage.setItem('user', user)
}

// 測試中不得連網：以假的 fetch 取代（回傳空內容），並記錄被要求的網址供斷言
export const networkRequests = []
export function blockNetwork() {
  const fakeFetch = url => {
    networkRequests.push(String(url))
    return Promise.resolve({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(new Blob([''])),
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  }
  window.fetch = fakeFetch
  global.fetch = fakeFetch
}

// 以正式環境相同的外層（Redux、路由、教學模式、頁面錯誤邊界）渲染頁面
export function renderPage(ui, { fixtures = {}, fallback = 'empty', missing = 'empty', route = '/page', path, store, delays } = {}) {
  const calls = []
  blockNetwork()
  const link = createAutoMockLink(fixtures, { fallback, missing, calls, delays })
  const testStore = store || createTestStore()
  const content = path ? <Route path={path} render={() => ui} /> : ui
  const utils = render(
    <Provider store={testStore}>
      <MockedProvider link={link} addTypename={false}>
        <MemoryRouter initialEntries={[route]}>
          <TeachingModeState>
            <PageErrorBoundary resetKey="test">
              <React.Suspense fallback={null}>{content}</React.Suspense>
            </PageErrorBoundary>
            {/* 目前網址（驗證 history.push 導頁用） */}
            <Route
              render={({ location }) => (
                <div hidden data-testid="testkit-location">
                  {location.pathname + location.search}
                </div>
              )}
            />
          </TeachingModeState>
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  )
  // 等到模擬後端沒有進行中的查詢、且連續兩次輪詢之間沒有新的查詢（頁面依查詢結果再發的查詢也回來了）
  const settle = async () => {
    let last = -1
    await wait(() => {
      const stable = link.pending === 0 && calls.length === last
      last = calls.length
      if (!stable) throw new Error('查詢尚未全部回應')
    })
  }
  return { ...utils, calls, store: testStore, settle }
}

export const PAGE_CRASH_TEXT = '這個頁面發生錯誤'
// 目前網址（renderPage 之後）
export const currentLocation = () => document.querySelector('[data-testid="testkit-location"]').textContent

// 與使用者在瀏覽器打字相同的輸入：以原生 setter 改值再派送 input 事件，不包 act。
// 為什麼需要：@testing-library/react 的 fireEvent.change 包在 act（React 的批次更新）裡，React 會先把受控欄位的值
// 還原成舊值、離開 act 才執行 setState 的 updater；欄位處理若在 updater 內才讀 event.target.value
// （例如 OrderShared/customerFormInput 的 makeFieldChange），測試會讀到舊值而誤判「輸入沒存進去」。
// 真實瀏覽器（已用 Chromium 實測）是先執行 updater 再還原，讀到的是新值。測這類欄位請用這個函式。
export function typeLikeBrowser(input, value) {
  const proto = input instanceof window.HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, value)
  input.dispatchEvent(new window.Event('input', { bubbles: true }))
}

if (isMain) {
  const QUERY = gql`
    query DEMO($id: ID) {
      order(id: $id) {
        id
        price
        items {
          id
          name
          ...ItemExtra
        }
        ... on Order {
          remark
        }
      }
      other
    }
    fragment ItemExtra on Item {
      count
    }
  `

  describe('testkit：依查詢欄位自動補齊模擬回應', () => {
    it('沒給的純量補 null、陣列逐筆補齊、fragment 欄位也補上', () => {
      expect(buildResponse(QUERY, { order: { id: 'o1', items: [{ id: 'i1' }] } })).toEqual({
        order: { id: 'o1', price: null, items: [{ id: 'i1', name: null, count: null }], remark: null },
        other: null,
      })
    })

    it("沒給的清單補空陣列、物件補空欄位、分頁包裝補 data: []；missing: 'null' 時補 null", () => {
      expect(buildResponse(QUERY, {})).toEqual({
        order: { id: null, price: null, items: [], remark: null },
        other: null,
      })
      expect(buildResponse(QUERY, {}, 'null')).toEqual({ order: null, other: null })
      const PAGED = gql`
        query PAGED {
          products {
            totalCount
            data {
              id
            }
          }
        }
      `
      expect(buildResponse(PAGED, {})).toEqual({ products: { totalCount: null, data: [] } })
      const WRAPPED = gql`
        query WRAPPED {
          getOrderList {
            intervalSummary {
              service
            }
            orderList {
              id
            }
          }
        }
      `
      expect(buildResponse(WRAPPED, {})).toEqual({ getOrderList: { intervalSummary: { service: null }, orderList: [] } })
    })

    it('依 operation 名稱回應並記錄 variables；Error 轉成 GraphQL 錯誤', async () => {
      const calls = []
      const link = createAutoMockLink({ DEMO: v => ({ other: v.id }) }, { calls })
      const result = await new Promise(resolve =>
        ApolloLink.execute(link, { query: QUERY, variables: { id: 'x' } }).subscribe({ next: resolve })
      )
      expect(result.data.other).toBe('x')
      expect(callsOf(calls, 'DEMO')).toEqual([{ operationName: 'DEMO', variables: { id: 'x' } }])

      const errLink = createAutoMockLink({ DEMO: new Error('壞了') })
      const errResult = await new Promise(resolve =>
        ApolloLink.execute(errLink, { query: QUERY, variables: {} }).subscribe({ next: resolve })
      )
      expect(errResult.errors[0].message).toBe('壞了')
    })

    it("fallback: 'error' 時沒有 fixture 的查詢一律模擬失敗", async () => {
      const link = createAutoMockLink({}, { fallback: 'error' })
      const result = await new Promise(resolve =>
        ApolloLink.execute(link, { query: QUERY, variables: {} }).subscribe({ next: resolve })
      )
      expect(result.errors[0].message).toContain('DEMO')
    })

    it('blockNetwork：fetch 不連網，回傳空內容並記錄網址', async () => {
      blockNetwork()
      const res = await fetch('https://example.com/logo.png')
      expect(res.ok).toBe(true)
      expect(networkRequests).toContain('https://example.com/logo.png')
    })

    it('typeLikeBrowser：updater 內才讀 event.target 的受控欄位，也拿得到新輸入的值', () => {
      const Form = () => {
        const [values, setValues] = React.useState({ name: '舊名' })
        const [, setTick] = React.useState(0)
        const handleFieldChange = makeFieldChange(setValues)
        // 先排一個更新，讓 makeFieldChange 的 updater 在 render 時才執行（帳單頁的編輯顧客彈窗就是這樣）；
        // 這時改用 fireEvent.change 會讀到被還原的舊值而失敗
        const onChange = event => {
          setTick(t => t + 1)
          handleFieldChange(event)
        }
        return <input name="name" aria-label="姓名" value={values.name} onChange={onChange} />
      }
      const { getByLabelText, unmount } = render(<Form />)
      typeLikeBrowser(getByLabelText('姓名'), '新名')
      expect(getByLabelText('姓名')).toHaveValue('新名')
      unmount()
    })

    it('loginAs 寫入目前店家與登入者', () => {
      loginAs()
      expect(JSON.parse(localStorage.getItem('userMerchant')).id).toBe(MERCHANT_ID)
      expect(JSON.parse(localStorage.getItem('user')).id).toBe(USER_ID)
    })
  })
}
