// 保護「編輯卡券項目」與「建立副本」（/coupon/duplicate/:id 共用同一頁）：
// - 帶入原卡券：名稱、代號、價格、次數、類別、鎖價（帶 isLockedOriginalValue＝店家原設定，例如 UNSET）、業績入帳模式、手續費模式、上架狀態
// - 原扣項整理（沒有項目補預設、舊資料沒有順序重新編號並把基準點歸 0、其餘重新編號）、沒有扣項時依店家抽成方式產生；畫面把「系統預設」排最後
// - 原互助依數值判斷方式（點數＞固定金額＞業績%數）與是否分指定；送出時轉數字、去掉 deductionWay／isDesignate
// - 儲存（UPDATE_SERVICE，含 itemId）、儲存並上一筆／下一筆（依卡券列表順序，第一筆／最後一筆停用）；
//   建立副本送 CREATE_COUPON（不帶 itemId，扣項改用 ServiceDeductionItems、帶店家 id），名稱與代號加「的副本」
// - 扣項卡只在店家開啟卡券扣項顯示時出現；存檔成功後清除設定類查詢快取；失敗顯示錯誤、按鈕恢復
// GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不改真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { deductionDisplayActions } from 'store/deductionDisplay'
import { renderPage, loginAs, callsOf, currentLocation, createTestStore, MERCHANT_ID, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import {
  settingFixtures,
  typeText,
  controlByLabel,
  controlsByLabel,
  pick,
  selectedText,
  checkboxByLabel,
  sectionOf,
  rowsOf,
  fillDeductionRow,
  renderWithSettingsCache,
} from '../../ServiceCreate/__tests__/itemFormKit.test'
import CouponEdit from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const item = overrides => ({
  name: '材料費',
  type: 'onSales',
  price: 0,
  isSpecial: false,
  deductionWay: '',
  designatePrice: 0,
  nonDesignatePrice: 0,
  deductionOrder: 1,
  deductionReference: 0,
  ...overrides,
})
const ZERO_HELPER = {
  type: '',
  helperDeductionType: 'onSales',
  nameList: [],
  peopleCount: 0,
  point: 0,
  cash: 0,
  percent: 0,
  designatePoint: 0,
  designateCash: 0,
  designatePercent: 0,
  nonDesignatePoint: 0,
  nonDesignateCash: 0,
  nonDesignatePercent: 0,
  isSplitted: false,
}
const helper = overrides => ({ ...ZERO_HELPER, ...overrides })

const makeTicket = (overrides = {}) => ({
  id: 't1',
  no: 'T01',
  name: '護髮十次卡',
  price: 5000,
  isLaunched: false,
  helperDeductionSetting: [helper({ type: '洗髮', nameList: ['1'], peopleCount: 1, cash: 100 })],
  serviceDetail: {
    ticketAvailableCount: 10,
    serviceDeductionItems: [
      { type: '系統預設', itemSettings: [item({ deductionWay: '扣趴數', price: 10 })] },
      { type: '設計師抽成', itemSettings: [] },
    ],
  },
  serviceCategory: { id: 'cat-2', name: '染髮' },
  isLocked: 'TRUE',
  isLockedOriginalValue: 'UNSET',
  performanceCalculationMode: 'SELLING',
  handlingFeeDecountMode: 'SELLING',
  ...overrides,
})
const LIST = [{ id: 't0' }, { id: 't1' }, { id: 't2' }]

const fixtures = ({ ticket = makeTicket(), list = LIST, ...overrides } = {}) =>
  settingFixtures({
    service: { service: ticket },
    GET_TICKETS_FOR_LIST: { ticketsForList: list },
    UPDATE_SERVICE: { updateService: true },
    CREATE_COUPON: { createCoupon: true },
    ...overrides,
  })
const storeWith = (coupon = true) => {
  const store = createTestStore()
  store.dispatch(deductionDisplayActions.setDisplay({ service: false, coupon }))
  return store
}
const setup = (options = {}, { store = storeWith(), route = '/coupon/edit/t1' } = {}) =>
  renderPage(<CouponEdit match={{ params: { id: 't1' } }} />, { fixtures: fixtures(options), route, store })

const button = text => screen.getByText(text, { selector: 'button' })
const DEFAULT_SECTION = '項目扣項設定 - 系統預設'
const DESIGNER_SECTION = '項目扣項設定 - 設計師抽成'
const HELPER = '互助點數設定'
const helperRow = i => rowsOf(sectionOf(HELPER))[i]
const dedRow = (title, i) => rowsOf(sectionOf(title))[i]
// 這頁的列操作是圖示（沒有按鈕外框與 aria-label）
const icon = (row, kind) => row.querySelector(`svg[class*="lucide-${kind}"]`)

beforeEach(() => {
  loginAs()
  window.history.pushState({}, '', '/coupon/edit/t1')
})
afterEach(() => {
  cleanup()
  window.history.pushState({}, '', '/')
})

describe('編輯卡券項目：帶入與儲存', () => {
  it('帶入原卡券資料；鎖價帶店家原設定（isLockedOriginalValue）', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(screen.getByText('編輯卡券項目', { selector: 'h1' })).toBeInTheDocument()
    expect(controlByLabel('代號')).toHaveValue('T01')
    expect(controlByLabel('名稱')).toHaveValue('護髮十次卡')
    expect(controlByLabel('價格')).toHaveValue(5000)
    expect(controlByLabel('次數')).toHaveValue(10)
    expect(selectedText(controlByLabel('服務類別'))).toBe('染髮')
    expect(selectedText(controlByLabel('打帳單是否能更改預設價格'))).toBe('依系統參數設定')
    expect(selectedText(controlByLabel('業績入帳模式'))).toBe('販賣時入業績')
    expect(selectedText(controlByLabel('手續費扣款模式'))).toBe('販賣時整筆扣除')
    expect(selectedText(controlByLabel('卡券上架狀態設定'))).toBe('下架')
    expect(callsOf(calls, 'service')[0].variables).toEqual({ serviceId: 't1' })
    // 「系統預設」以紅字標示並排在最後
    const titles = [...document.querySelectorAll('h3')].filter(h => h.textContent.startsWith('項目扣項設定'))
    expect(titles.map(h => h.textContent)).toEqual([DESIGNER_SECTION, DEFAULT_SECTION])
    expect(titles[1]).toHaveClass('text-danger')
    expect(titles[0]).not.toHaveClass('text-danger')
  })

  it('儲存：送出 UPDATE_SERVICE（含 itemId 與所有欄位），成功後提示並回卡券列表', async () => {
    const { calls, settle } = setup()
    await settle()
    await typeText(controlByLabel('名稱'), '護髮十二次卡')
    await typeText(controlByLabel('代號'), 'T01B')
    pick(controlByLabel('服務類別'), '剪髮')
    fireEvent.change(controlByLabel('價格'), { target: { value: '6000' } })
    fireEvent.change(controlByLabel('次數'), { target: { value: '12' } })
    pick(controlByLabel('打帳單是否能更改預設價格'), '不可更改')
    pick(controlByLabel('業績入帳模式'), '使用時入業績')
    pick(controlByLabel('手續費扣款模式'), '每次使用時扣除')
    pick(controlByLabel('卡券上架狀態設定'), '上架')
    ;[controlByLabel('價格'), controlByLabel('次數')].forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
    fireEvent.click(button('儲存'))
    expect(button('儲存')).toBeDisabled()
    await wait(() => expect(currentLocation()).toBe('/coupons'))
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功儲存卡片變更' })
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input).toEqual({
      itemId: 't1',
      no: 'T01B',
      name: '護髮十二次卡',
      price: 6000,
      isTicket: true,
      ticketAvailableCount: 12,
      isTicketCountNow: false,
      helperDeductionSetting: [helper({ type: '洗髮', nameList: ['1'], peopleCount: 1, cash: 100 })],
      serviceDeductionItems: [
        { type: '系統預設', itemSettings: [item({ deductionWay: '扣趴數', price: 10 })] },
        { type: '設計師抽成', itemSettings: [item()] },
      ],
      customerSellSetting: [
        { category: '一般', percent: 100, birthday: 100 },
        { category: 'VIP', percent: 100, birthday: 100 },
      ],
      ServiceCategoryId: 'cat-1',
      isLocked: 'TRUE',
      performanceCalculationMode: 'USING',
      handlingFeeDecountMode: 'USING',
      isLaunched: true,
    })
  })

  it('名稱清空時不可儲存', async () => {
    const { settle } = setup()
    await settle()
    await typeText(controlByLabel('名稱'), '')
    expect(button('儲存')).toBeDisabled()
    expect(button('儲存並下一筆')).toBeDisabled()
  })

  it('儲存並上一筆／下一筆依卡券列表順序導頁', async () => {
    const first = setup()
    await first.settle()
    fireEvent.click(button('儲存並上一筆'))
    await wait(() => expect(currentLocation()).toBe('/coupon/edit/t0'))
    cleanup()
    const second = setup()
    await second.settle()
    fireEvent.click(button('儲存並下一筆'))
    await wait(() => expect(currentLocation()).toBe('/coupon/edit/t2'))
    expect(callsOf(second.calls, 'UPDATE_SERVICE')).toHaveLength(1)
  })

  it('第一筆不可上一筆、最後一筆不可下一筆', async () => {
    const first = setup({ list: [{ id: 't1' }, { id: 't2' }] })
    await first.settle()
    expect(button('儲存並上一筆')).toBeDisabled()
    expect(button('儲存並下一筆')).not.toBeDisabled()
    cleanup()
    const last = setup({ list: [{ id: 't0' }, { id: 't1' }] })
    await last.settle()
    expect(button('儲存並下一筆')).toBeDisabled()
  })

  it('儲存失敗：顯示錯誤、按鈕恢復', async () => {
    const { settle } = setup({ UPDATE_SERVICE: new Error('卡券已被刪除') })
    await settle()
    fireEvent.click(button('儲存'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '卡券已被刪除' }))
    expect(button('儲存')).not.toBeDisabled()
    expect(currentLocation()).toBe('/coupon/edit/t1')
  })

  it('存檔成功後清除設定類查詢快取', async () => {
    const { calls, settle } = renderWithSettingsCache(<CouponEdit match={{ params: { id: 't1' } }} />, { fixtures: fixtures(), route: '/coupon/edit/t1' })
    await settle()
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(2))
  })
})

describe('編輯卡券項目：建立副本', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/coupon/duplicate/t1')
  })

  it('名稱與代號加「的副本」；新增送 CREATE_COUPON（不帶 itemId、扣項改 ServiceDeductionItems、帶店家 id）並回列表', async () => {
    const { calls, settle } = setup({}, { route: '/coupon/duplicate/t1' })
    await settle()
    expect(screen.getByText('新增卡券項目', { selector: 'h1' })).toBeInTheDocument()
    expect(controlByLabel('名稱')).toHaveValue('護髮十次卡的副本')
    expect(controlByLabel('代號')).toHaveValue('T01的副本')
    expect(screen.queryByText('儲存並上一筆')).toBeNull()
    fireEvent.click(button('新增'))
    await wait(() => expect(currentLocation()).toBe('/coupons'))
    const { input } = callsOf(calls, 'CREATE_COUPON')[0].variables
    expect(input).not.toHaveProperty('itemId')
    expect(input).not.toHaveProperty('serviceDeductionItems')
    expect(input).toMatchObject({
      name: '護髮十次卡的副本',
      OfficialBrandMerchantId: MERCHANT_ID,
      ServiceDeductionItems: [
        { type: '系統預設', itemSettings: [item({ deductionWay: '扣趴數', price: 10 })] },
        { type: '設計師抽成', itemSettings: [item()] },
      ],
      isLocked: 'UNSET',
    })
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功新增卡券' })
  })

  it('新增失敗：顯示錯誤、按鈕恢復', async () => {
    const { settle } = setup({ CREATE_COUPON: new Error('代號重複') }, { route: '/coupon/duplicate/t1' })
    await settle()
    fireEvent.click(button('新增'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '代號重複' }))
    expect(button('新增')).not.toBeDisabled()
  })
})

describe('編輯卡券項目：扣項', () => {
  it('店家關閉卡券扣項顯示時不顯示扣項卡', async () => {
    const { settle } = setup({}, { store: storeWith(false) })
    await settle()
    expect(screen.queryByText(DEFAULT_SECTION)).toBeNull()
  })

  it('原扣項整理：沒有項目補預設、沒有順序的重新編號且基準點歸 0、其餘重新編號保留基準點；沒有扣項時依抽成方式產生', async () => {
    const ticket = makeTicket({
      serviceDetail: {
        ticketAvailableCount: 3,
        serviceDeductionItems: [
          { type: '系統預設', itemSettings: [item({ deductionOrder: 5 }), item({ deductionOrder: 9, deductionReference: 1 })] },
          { type: '助理抽成', itemSettings: [item({ deductionOrder: null, deductionReference: 2 }), item({ deductionOrder: null })] },
          { type: '設計師抽成', itemSettings: [] },
        ],
      },
    })
    const { calls, settle } = setup({ ticket })
    await settle()
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.serviceDeductionItems).toEqual([
      { type: '系統預設', itemSettings: [item({ deductionOrder: 1 }), item({ deductionOrder: 2, deductionReference: 1 })] },
      { type: '助理抽成', itemSettings: [item({ deductionOrder: 1 }), item({ deductionOrder: 2 })] },
      { type: '設計師抽成', itemSettings: [item()] },
    ])
    cleanup()
    const empty = setup({ ticket: makeTicket({ serviceDetail: { ticketAvailableCount: 1, serviceDeductionItems: [] } }) })
    await empty.settle()
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(empty.calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(empty.calls, 'UPDATE_SERVICE')[0].variables.input.serviceDeductionItems).toEqual([
      { type: '系統預設', itemSettings: [item()] },
      { type: '設計師抽成', itemSettings: [item()] },
    ])
  })

  // Jason 2026/10/22：與服務編輯相同，扣項沒有「系統預設」時不推入空物件，頁面正常顯示既有扣項並可儲存
  it('卡券的扣項沒有「系統預設」時頁面正常顯示，可儲存', async () => {
    const ticket = makeTicket({ serviceDetail: { ticketAvailableCount: 1, serviceDeductionItems: [{ type: '設計師抽成', itemSettings: [item()] }] } })
    const { calls, settle } = setup({ ticket })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(sectionOf(DESIGNER_SECTION)).toBeTruthy()
    expect(screen.queryByText(DEFAULT_SECTION)).toBeNull()
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.serviceDeductionItems).toEqual([
      { type: '設計師抽成', itemSettings: [item()] },
    ])
  })

  it('在畫面上編輯扣項（類別、方式、分指定、數字、基準點、新增、刪除、清除），送出編輯後的內容', async () => {
    const { calls, settle } = setup()
    await settle()
    fillDeductionRow(DEFAULT_SECTION, 0, { type: '扣薪水', way: '依固定金額', price: 40 })
    fireEvent.click(icon(dedRow(DEFAULT_SECTION, 0), 'plus'))
    fireEvent.click(icon(dedRow(DEFAULT_SECTION, 1), 'plus'))
    expect(rowsOf(sectionOf(DEFAULT_SECTION))).toHaveLength(3)
    expect(icon(dedRow(DEFAULT_SECTION, 0), 'trash')).toBeNull()
    fillDeductionRow(DEFAULT_SECTION, 1, { type: '扣業績', way: '依業績%數', special: true, designate: 5, nonDesignate: 7, ref: '1' })
    fillDeductionRow(DEFAULT_SECTION, 2, { way: '依業績%數', price: 3 })
    fireEvent.click(icon(dedRow(DEFAULT_SECTION, 2), 'delete'))
    expect(controlByLabel('業績%數', dedRow(DEFAULT_SECTION, 2))).toHaveValue(0)
    fireEvent.click(icon(dedRow(DEFAULT_SECTION, 2), 'trash'))
    expect(rowsOf(sectionOf(DEFAULT_SECTION))).toHaveLength(2)
    const other = () => dedRow(DESIGNER_SECTION, 0)
    fireEvent.click(checkboxByLabel('分指定/不指定', other()))
    fireEvent.click(checkboxByLabel('分指定/不指定', other()))
    expect(controlsByLabel('指定%', other())).toHaveLength(0)
    fillDeductionRow(DESIGNER_SECTION, 0, { way: '依固定金額', special: true, designate: 8, nonDesignate: 9 })
    ;[
      controlByLabel('固定金額', dedRow(DEFAULT_SECTION, 0)),
      controlByLabel('指定%', dedRow(DEFAULT_SECTION, 1)),
      controlByLabel('不指定%', dedRow(DEFAULT_SECTION, 1)),
    ].forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    const sent = callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.serviceDeductionItems
    expect(sent.map(d => d.type)).toEqual(['設計師抽成', '系統預設'])
    expect(sent[0].itemSettings).toEqual([item({ deductionWay: '扣固定金額', isSpecial: true, designatePrice: 8, nonDesignatePrice: 9 })])
    expect(sent[1].itemSettings).toEqual([
      item({ type: 'onSalary', deductionWay: '扣固定金額', price: 40 }),
      item({ deductionWay: '扣趴數', isSpecial: true, designatePrice: 5, nonDesignatePrice: 7, deductionOrder: 2, deductionReference: 1 }),
    ])
  })
})

describe('編輯卡券項目：互助', () => {
  it('依原數值判斷方式與是否分指定', async () => {
    const ticket = makeTicket({
      helperDeductionSetting: [
        helper(),
        helper({ type: '洗髮', point: 1 }),
        helper({ type: '洗髮', designatePoint: 2 }),
        helper({ type: '洗髮', nonDesignatePoint: 3 }),
        helper({ type: '吹整', cash: 100 }),
        helper({ type: '吹整', designateCash: 40 }),
        helper({ type: '吹整', nonDesignateCash: 50 }),
        helper({ type: '洗髮', percent: 10 }),
        helper({ type: '洗髮', nonDesignatePercent: 5 }),
      ],
    })
    const { settle } = setup({ ticket })
    await settle()
    const way = i => selectedText(controlByLabel('扣項方式', helperRow(i)))
    const designated = i => checkboxByLabel('分指定/不指定', helperRow(i)).checked
    expect(way(0)).toBe('')
    expect([way(1), designated(1)]).toEqual(['依點數', false])
    expect([way(2), designated(2)]).toEqual(['依點數', true])
    expect([way(3), designated(3)]).toEqual(['依點數', true])
    expect([way(4), designated(4)]).toEqual(['依固定金額', false])
    expect([way(5), designated(5)]).toEqual(['依固定金額', true])
    expect([way(6), designated(6)]).toEqual(['依固定金額', true])
    expect([way(7), designated(7)]).toEqual(['依業績%數', false])
    expect([way(8), designated(8)]).toEqual(['依業績%數', true])
    expect(controlByLabel('不指定業績%數', helperRow(8))).toHaveValue(5)
  })

  it('修改互助後送出：數字化、去掉畫面用欄位；人數、均分、新增（預設 1 人）、清除、刪除最後一列', async () => {
    const ticket = makeTicket({
      helperDeductionSetting: [
        helper({ type: '洗髮', nameList: ['1'], peopleCount: 1, point: 1 }),
        helper({ type: '吹整', designatePoint: 2, nonDesignatePoint: 1 }),
        helper({ type: '吹整', designateCash: 40 }),
        helper({ type: '洗髮', designatePercent: 5 }),
      ],
    })
    const { calls, settle } = setup({ ticket })
    await settle()
    const set = (i, label, value) => fireEvent.change(controlByLabel(label, helperRow(i)), { target: { value } })
    set(0, '點數', '1.5')
    set(1, '指定點數', '3')
    set(1, '不指定點數', '2')
    set(2, '指定固定金額', '45')
    set(2, '不指定固定金額', '35')
    set(3, '指定業績%數', '6')
    set(3, '不指定業績%數', '4')
    pick(controlByLabel('扣項類別', helperRow(0)), '扣薪水')
    pick(controlByLabel('類別', helperRow(0)), '吹整')
    pick(controlByLabel('協助人員人數', helperRow(0)), '3')
    fireEvent.click(checkboxByLabel('互助均分', helperRow(0)))
    expect(checkboxByLabel('分指定/不指定', helperRow(0))).toBeDisabled()
    // 第 4 列取消分指定 → 單一欄位，再改方式
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(3)))
    pick(controlByLabel('扣項方式', helperRow(3)), '依固定金額')
    set(3, '固定金額', '20')
    set(3, '固定金額', '25')
    // 只有最後一列有新增與刪除
    expect(icon(helperRow(0), 'plus')).toBeNull()
    expect(icon(helperRow(0), 'trash')).toBeNull()
    fireEvent.click(icon(helperRow(3), 'plus'))
    expect(selectedText(controlByLabel('協助人員人數', helperRow(4)))).toBe('1')
    pick(controlByLabel('扣項方式', helperRow(4)), '依業績%數')
    set(4, '業績%數', '8')
    // 單一欄位改成分指定，再取消
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(4)))
    expect(controlByLabel('指定業績%數', helperRow(4))).toHaveValue(0)
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(4)))
    fireEvent.click(icon(helperRow(4), 'delete'))
    expect(selectedText(controlByLabel('扣項方式', helperRow(4)))).toBe('')
    fireEvent.click(icon(helperRow(4), 'trash'))
    expect(rowsOf(sectionOf(HELPER))).toHaveLength(4)
    ;[controlByLabel('點數', helperRow(0)), controlByLabel('指定點數', helperRow(1)), controlByLabel('不指定點數', helperRow(1))].forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.helperDeductionSetting).toEqual([
      helper({ helperDeductionType: 'onSalary', type: '吹整', nameList: ['1', '2', '3'], peopleCount: 3, point: 1.5, isSplitted: true }),
      helper({ type: '吹整', designatePoint: 3, nonDesignatePoint: 2 }),
      helper({ type: '吹整', designateCash: 45, nonDesignateCash: 35 }),
      helper({ type: '洗髮', cash: 25 }),
    ])
  })
})

describe('編輯卡券項目：查詢失敗與登入狀態', () => {
  // Jason 2026/10/22：卡券列表（上一筆／下一筆用）查詢失敗時以空清單處理，頁面正常、上一筆／下一筆停用
  it('卡券列表查詢失敗時頁面正常，上一筆／下一筆停用', async () => {
    const { settle } = setup({ GET_TICKETS_FOR_LIST: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(button('儲存並上一筆')).toBeDisabled()
    expect(button('儲存並下一筆')).toBeDisabled()
  })

  it('原卡券沒有互助設定時給一列空白設定；次數清空時視為 1', async () => {
    const { calls, settle } = setup({ ticket: makeTicket({ helperDeductionSetting: [] }) })
    await settle()
    expect(rowsOf(sectionOf(HELPER))).toHaveLength(1)
    fireEvent.change(controlByLabel('次數'), { target: { value: '' } })
    expect(controlByLabel('次數')).toHaveValue(1)
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input).toMatchObject({
      ticketAvailableCount: 1,
      helperDeductionSetting: [helper()],
    })
  })

  it('沒有目前店家時仍可編輯儲存', async () => {
    loginAs({ merchant: null })
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
  })
})
