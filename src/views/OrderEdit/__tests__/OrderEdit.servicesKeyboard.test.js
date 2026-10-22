// 保護「帳單詳細」服務列的鍵盤操作（櫃檯只用鍵盤打單的流程）：在每一欄按 Enter，游標依序移到下一個該填的欄位——
//   服務 →（價格沒鎖）價格 →（有助理）各助理 →（店家開「指定助理」）各助理的「指定」→（店家開第三方卡券且卡券沒鎖）第三方卡券
//   → 下一列的服務；最後一列再按 Enter 自動新增一列。
// 價格鎖定的服務跳過價格；卡券鎖定的服務跳過卡券；沒選服務的空白列按 Enter 不動；按其他鍵不移動。
// 聚焦價格欄時整段選取，直接輸入就能覆蓋原價。
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單。
import { cleanup, fireEvent, wait, within } from '@testing-library/react'
import { setup, pageReady, makeOrder, loginForTest, SERVICE, LOCKED_SERVICE, ASSISTANT } from './orderEditKit.test'

jest.setTimeout(20000)

beforeEach(() => loginForTest())
afterEach(cleanup)

// A：價格不鎖、卡券不鎖，兩個助理名額（洗髮、吹整）
const A = SERVICE
// B：價格鎖定、卡券鎖定（綁團購券），沒有助理
const B = LOCKED_SERVICE
// C：價格「依設定」（視同鎖定）、卡券鎖定，一個助理名額
const C = { ...SERVICE, id: 'service-4', no: 'S04', name: '燙髮', price: 3000, isLocked: 'UNSET', isBindedThirdPartTicketLocked: 'TRUE' }
// D：價格不鎖、卡券不鎖，沒有助理
const D = { ...SERVICE, id: 'service-5', no: 'S05', name: '洗髮', price: 300 }
// E：價格鎖定、卡券不鎖，沒有助理
const E = { ...SERVICE, id: 'service-6', no: 'S06', name: '染髮', price: 2000, isLocked: 'TRUE' }

const HELPERS = {
  [A.id]: [{ type: '助理', nameList: ['洗髮', '吹整'], helperDeductionType: 'CASH' }],
  [C.id]: [{ type: '設計師', nameList: ['副手'], helperDeductionType: 'CASH' }],
}

const row = (service, extra = {}) => ({
  id: `so-${service.id}`,
  name: service.name,
  price: service.price,
  thirdPartyPayName: null,
  thirdPartyPayId: service.bindedThirdPartTicket ? service.bindedThirdPartTicket.id : null,
  service: {
    id: service.id,
    name: service.name,
    no: service.no,
    isLocked: service.isLocked,
    isNoCash: false,
    isBindedThirdPartTicketLocked: service.isBindedThirdPartTicketLocked,
  },
  helperList: [],
  ...extra,
})

// rows：帳單的服務；thirdParty／designation：店家是否顯示第三方卡券、是否顯示「指定助理」
const open = ({ rows, thirdParty = true, designation = true }) =>
  setup({
    order: makeOrder({ serviceOrders: rows.map(s => row(s)) }),
    service: v => ({ service: { helperDeductionSetting: HELPERS[v.serviceId] || [] } }),
    GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 5, pageOffset: 0, pageLimit: 50, data: [A, B, C, D, E] } },
    GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: thirdParty },
    GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: designation },
  })

const panel = () => document.getElementById('panel-content')
// 第 i 列（每列是服務欄所在的那一排）
const rowEl = i => within(panel()).getAllByPlaceholderText('服務名稱/代號')[i].closest('.mb-6')
const serviceOf = i => within(rowEl(i)).getByPlaceholderText('服務名稱/代號')
const priceOf = i => rowEl(i).querySelector('input[name="price"]')
const helperOf = (i, type) => within(rowEl(i)).getByPlaceholderText(type)
const designateOf = (i, n) => within(rowEl(i)).getAllByLabelText('指定')[n]
const thirdPartyOf = i => within(rowEl(i)).getByPlaceholderText('第三方卡券')
const rowCount = () => within(panel()).getAllByPlaceholderText('服務名稱/代號').length
const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const otherKey = el => fireEvent.keyDown(el, { key: 'a', keyCode: 65 })
const focused = el => wait(() => expect(document.activeElement).toBe(el))
const helpersShown = (i, type) => wait(() => expect(within(rowEl(i)).getByPlaceholderText(type)).toBeInTheDocument())

describe('服務列鍵盤：店家開啟第三方卡券與指定助理', () => {
  it('服務 → 價格 → 助理 → 指定 → 下一位助理 → 指定 → 第三方卡券 → 下一列；鎖定的服務跳過價格與卡券，最後一列再按 Enter 新增一列', async () => {
    const page = open({ rows: [A, B] })
    await pageReady(page)
    await helpersShown(0, '助理-吹整')

    otherKey(serviceOf(0))
    expect(document.activeElement).not.toBe(priceOf(0))
    enter(serviceOf(0))
    await focused(priceOf(0))
    otherKey(priceOf(0))
    enter(priceOf(0))
    await focused(helperOf(0, '助理-洗髮'))
    otherKey(helperOf(0, '助理-洗髮'))
    enter(helperOf(0, '助理-洗髮'))
    await focused(designateOf(0, 0))
    otherKey(designateOf(0, 0))
    enter(designateOf(0, 0))
    await focused(helperOf(0, '助理-吹整'))
    enter(helperOf(0, '助理-吹整'))
    await focused(designateOf(0, 1))
    enter(designateOf(0, 1))
    await focused(thirdPartyOf(0))
    otherKey(thirdPartyOf(0))
    enter(thirdPartyOf(0))
    await focused(serviceOf(1))
    // B 價格與卡券都鎖定、沒有助理：直接跳到下一列（最後一列 → 新增一列）
    enter(serviceOf(1))
    await wait(() => expect(rowCount()).toBe(3))
    await focused(serviceOf(2))
    // 空白列（還沒選服務）按 Enter 不動
    enter(serviceOf(2))
    expect(rowCount()).toBe(3)
    expect(document.activeElement).toBe(serviceOf(2))
  })

  it('價格「依設定」且有助理的服務：在服務欄按 Enter 跳到第一位助理；卡券鎖定時，最後一個「指定」按 Enter 跳下一列', async () => {
    const page = open({ rows: [C, D] })
    await pageReady(page)
    await helpersShown(0, '設計師-副手')
    expect(priceOf(0)).toBeDisabled()
    enter(serviceOf(0))
    await focused(helperOf(0, '設計師-副手'))
    enter(helperOf(0, '設計師-副手'))
    await focused(designateOf(0, 0))
    enter(designateOf(0, 0))
    await focused(serviceOf(1))
  })

  it('價格不鎖、沒有助理：價格按 Enter 跳第三方卡券；最後一列的卡券按 Enter 新增一列', async () => {
    const page = open({ rows: [D] })
    await pageReady(page)
    enter(priceOf(0))
    await focused(thirdPartyOf(0))
    enter(thirdPartyOf(0))
    await wait(() => expect(rowCount()).toBe(2))
  })

  it('價格鎖定、卡券不鎖、沒有助理：服務按 Enter 跳第三方卡券', async () => {
    const page = open({ rows: [E] })
    await pageReady(page)
    enter(serviceOf(0))
    await focused(thirdPartyOf(0))
  })

  it('聚焦價格欄時整段選取（直接輸入即覆蓋原價）', async () => {
    const page = open({ rows: [D] })
    await pageReady(page)
    const price = priceOf(0)
    price.focus()
    expect(price.selectionStart).toBe(0)
    expect(price.selectionEnd).toBe(String(D.price).length)
  })
})

describe('服務列：刪除正在填價格的那一列', () => {
  it('游標移到遞補上來那一列的下一個可填欄位（價格鎖定時跳到第三方卡券）', async () => {
    const page = open({ rows: [A, D, E] })
    await pageReady(page)
    priceOf(1).focus()
    fireEvent.click(within(rowEl(1)).getByLabelText('刪除此列', { selector: 'button' }))
    await wait(() => expect(rowCount()).toBe(2))
    await focused(thirdPartyOf(1))
    expect(serviceOf(1)).toHaveValue('染髮(S06)')
  })
})

describe('服務列鍵盤：店家開啟第三方卡券、關閉指定助理', () => {
  it('助理 → 下一位助理 → 第三方卡券；卡券鎖定的服務最後一位助理按 Enter 跳下一列', async () => {
    const page = open({ rows: [A, C, D], designation: false })
    await pageReady(page)
    await helpersShown(0, '助理-吹整')
    expect(within(rowEl(0)).queryByLabelText('指定')).toBeNull()
    otherKey(helperOf(0, '助理-洗髮'))
    enter(helperOf(0, '助理-洗髮'))
    await focused(helperOf(0, '助理-吹整'))
    enter(helperOf(0, '助理-吹整'))
    await focused(thirdPartyOf(0))
    await helpersShown(1, '設計師-副手')
    enter(helperOf(1, '設計師-副手'))
    await focused(serviceOf(2))
    // D：價格不鎖、沒有助理 → 價格按 Enter 跳卡券
    enter(priceOf(2))
    await focused(thirdPartyOf(2))
  })
})

describe('服務列鍵盤：店家關閉第三方卡券', () => {
  it('不顯示指定助理：最後一位助理、沒有助理的價格、鎖價服務按 Enter 都跳下一列', async () => {
    const page = open({ rows: [A, D, E], thirdParty: false, designation: false })
    await pageReady(page)
    await helpersShown(0, '助理-吹整')
    enter(helperOf(0, '助理-吹整'))
    await focused(serviceOf(1))
    enter(priceOf(1))
    await focused(serviceOf(2))
    enter(serviceOf(2))
    await wait(() => expect(rowCount()).toBe(4))
  })

  it('顯示指定助理：最後一個「指定」與沒有助理的價格按 Enter 跳下一列', async () => {
    const page = open({ rows: [A, D], thirdParty: false, designation: true })
    await pageReady(page)
    await helpersShown(0, '助理-吹整')
    enter(designateOf(0, 1))
    await focused(serviceOf(1))
    enter(priceOf(1))
    await wait(() => expect(rowCount()).toBe(3))
    await focused(serviceOf(2))
  })
})

describe('服務列：原帳單只填了第二個助理名額', () => {
  it('依名額類型帶回該助理，不會錯放到第一個名額', async () => {
    const page = setup({
      order: makeOrder({
        serviceOrders: [
          row(A, {
            helperList: [
              { id: 'h-1', type: '助理-吹整', isDesignate: true, helperDeductionType: 'CASH', helper: { id: ASSISTANT.userId } },
            ],
          }),
        ],
      }),
      service: v => ({ service: { helperDeductionSetting: HELPERS[v.serviceId] || [] } }),
      GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: true },
    })
    await pageReady(page)
    await helpersShown(0, '助理-吹整')
    await wait(() => expect(helperOf(0, '助理-吹整')).toHaveValue('李助理-02'))
    expect(helperOf(0, '助理-洗髮')).toHaveValue('')
  })
})
