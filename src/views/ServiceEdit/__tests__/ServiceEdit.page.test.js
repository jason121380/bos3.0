// 保護「編輯服務項目」與「建立副本」（/service/duplicate/:id 共用同一頁）：
// - 帶入原服務：名稱、代號、價格、類別、鎖價、特殊抽成、綁定第三方卡券（沒有綁定顯示「無」、送出 null）與鎖定方式
// - 原扣項設定的整理：沒有項目的補一筆預設、舊資料沒有順序的重新編號並把基準點歸 0、其餘重新編號保留基準點；
//   服務沒有扣項時改依店家抽成方式產生；畫面把「系統預設」排到最後
// - 原互助設定依數值判斷方式（點數＞固定金額＞業績%數）與是否分指定；送出時轉數字、去掉畫面用欄位
// - 儲存（UPDATE_SERVICE，含 itemId）、儲存並上一筆／下一筆（依服務列表順序導頁，第一筆／最後一筆停用）；
//   建立副本送 CREATE_SERVICE（不帶 itemId，扣項改用 ServiceDeductionItems、帶店家 id），名稱與代號加「的副本」
// - 扣項卡只在店家開啟顯示扣項（或建立副本）時出現；實業績預估的計算
// - 存檔成功後清除設定類查詢快取；失敗顯示錯誤、按鈕恢復
// GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不改真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { deductionDisplayActions } from 'store/deductionDisplay'
import {
  renderPage,
  loginAs,
  callsOf,
  currentLocation,
  createTestStore,
  MERCHANT_ID,
  PAGE_CRASH_TEXT,
} from '../../../__tests__/testkit.test'
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
  buttonIn,
  renderWithSettingsCache,
  fillDeductionRow,
  addDeductionRow,
} from '../../ServiceCreate/__tests__/itemFormKit.test'
import ServiceEdit from '..'

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

const makeService = (overrides = {}) => ({
  id: 's1',
  no: 'S01',
  name: '精緻剪髮',
  price: 1000,
  helperDeductionSetting: [helper({ type: '洗髮', nameList: ['1', '2'], peopleCount: 2, point: 1 })],
  serviceDetail: {
    customerSellSetting: [],
    serviceDeductionItems: [
      { type: '系統預設', itemSettings: [item({ deductionWay: '扣趴數', price: 10, deductionReference: 0 })] },
      { type: '設計師抽成', itemSettings: [] },
    ],
    isTicketCountNow: true,
    ticketAvailableCount: null,
  },
  isUsing: true,
  serviceCategory: { id: 'cat-1', name: '剪髮' },
  isLocked: 'TRUE',
  isLockedOriginalValue: 'UNSET',
  isNoCash: false,
  isSpecialRakeUsing: true,
  specialRake: 5,
  bindedThirdPartTicket: { id: 'tp-1' },
  isBindedThirdPartTicketLocked: 'FALSE',
  ...overrides,
})

const LIST = [{ id: 's0', name: '洗髮' }, { id: 's1', name: '精緻剪髮' }, { id: 's2', name: '染髮' }]

const fixtures = ({ service = makeService(), list = LIST, ...overrides } = {}) =>
  settingFixtures({
    service: { service },
    FETCH_SERVICES: { services: { totalCount: list.length, pageOffset: 0, pageLimit: 50, data: list } },
    UPDATE_SERVICE: { updateService: true },
    CREATE_SERVICE: { createService: true },
    ...overrides,
  })

const storeWithDeduction = (service = true) => {
  const store = createTestStore()
  store.dispatch(deductionDisplayActions.setDisplay({ service, coupon: false }))
  return store
}

const setup = (options = {}, { id = 's1', store = storeWithDeduction(), route = `/service/edit/${id}` } = {}) =>
  renderPage(<ServiceEdit match={{ params: { id } }} />, { fixtures: fixtures(options), route, store })

const button = text => screen.getByText(text, { selector: 'button' })
const DEFAULT_SECTION = '項目扣項設定 - 系統預設'
const DESIGNER_SECTION = '項目扣項設定 - 設計師抽成'
const summaryLines = title => [...sectionOf(title).lastElementChild.querySelectorAll('p')].map(p => p.textContent)
const HELPER = '互助點數設定'
const helperRow = i => rowsOf(sectionOf(HELPER))[i]

beforeEach(() => {
  loginAs()
  window.history.pushState({}, '', '/service/edit/s1')
})
afterEach(() => {
  cleanup()
  window.history.pushState({}, '', '/')
})

describe('編輯服務項目：帶入原資料與儲存', () => {
  it('帶入原服務的基本資料、鎖價、特殊抽成、綁定第三方卡券與鎖定方式', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(screen.getByText('編輯服務項目', { selector: 'h1' })).toBeInTheDocument()
    expect(controlByLabel('代號')).toHaveValue('S01')
    expect(controlByLabel('名稱')).toHaveValue('精緻剪髮')
    expect(controlByLabel('價格')).toHaveValue(1000)
    expect(selectedText(controlByLabel('服務類別'))).toBe('剪髮')
    expect(selectedText(controlByLabel('打帳單是否能更改預設價格'))).toBe('依系統參數設定')
    expect(checkboxByLabel('特殊抽成')).toBeChecked()
    expect(controlByLabel('%數')).toHaveValue(5)
    expect(selectedText(controlByLabel('綁定第三方卡券'))).toBe('團購券')
    expect(selectedText(controlByLabel('是否鎖定第三方卡券'))).toBe('不鎖定')
    expect(callsOf(calls, 'service')[0].variables).toEqual({ serviceId: 's1' })
  })

  // Jason 2026/10/22：比照卡券編輯與商品編輯，鎖價帶入 isLockedOriginalValue（店家原本的設定值，可能是 UNSET「依系統參數設定」），
  // 不帶套用系統參數後的 isLocked，避免編輯後儲存把「依系統參數設定」改成固定值
  it('鎖價帶入 isLockedOriginalValue（不是 isLocked），原樣送出', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.isLocked).toBe('UNSET')
  })

  it('儲存：送出 UPDATE_SERVICE（含 itemId、整理過的扣項與互助、販售設定），成功後提示並回列表', async () => {
    const { calls, settle } = setup()
    await settle()
    await typeText(controlByLabel('名稱'), '精緻剪髮 A')
    await typeText(controlByLabel('代號'), 'S01A')
    pick(controlByLabel('服務類別'), '染髮')
    pick(controlByLabel('服務類別'), '剪髮')
    fireEvent.change(controlByLabel('價格'), { target: { value: '1200' } })
    pick(controlByLabel('綁定第三方卡券'), '禮券')
    fireEvent.click(button('儲存'))
    expect(button('儲存')).toBeDisabled()
    await wait(() => expect(currentLocation()).toBe('/services'))
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功儲存服務變更' })
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input).toEqual({
      itemId: 's1',
      no: 'S01A',
      name: '精緻剪髮 A',
      price: 1200,
      isTicket: false,
      isTicketCountNow: true,
      helperDeductionSetting: [helper({ type: '洗髮', nameList: ['1', '2'], peopleCount: 2, point: 1 })],
      serviceDeductionItems: [
        { type: '系統預設', itemSettings: [item({ deductionWay: '扣趴數', price: 10 })] },
        { type: '設計師抽成', itemSettings: [item()] },
      ],
      customerSellSetting: [
        { category: '一般', percent: 100, birthday: 100 },
        { category: 'VIP', percent: 100, birthday: 100 },
      ],
      ServiceCategoryId: 'cat-1',
      isLocked: 'UNSET',
      isNoCash: false,
      isSpecialRakeUsing: true,
      specialRake: 5,
      bindedThirdPartTicketId: 'tp-2',
      isBindedThirdPartTicketLocked: 'FALSE',
    })
  })

  it('沒有綁定第三方卡券顯示「無」並送出 null；取消特殊抽成時 %數 歸 0', async () => {
    const { calls, settle } = setup({ service: makeService({ bindedThirdPartTicket: null }) })
    await settle()
    expect(selectedText(controlByLabel('綁定第三方卡券'))).toBe('無')
    fireEvent.click(checkboxByLabel('特殊抽成'))
    expect(controlsByLabel('%數')).toHaveLength(0)
    pick(controlByLabel('是否鎖定第三方卡券'), '鎖定')
    pick(controlByLabel('打帳單是否能更改預設價格'), '不可更改')
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input).toMatchObject({
      bindedThirdPartTicketId: null,
      isSpecialRakeUsing: false,
      specialRake: 0,
      isBindedThirdPartTicketLocked: 'TRUE',
      isLocked: 'TRUE',
    })
  })

  it('特殊抽成 %數 可改；價格與 %數 欄位捲動滑鼠時失焦', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.change(controlByLabel('%數'), { target: { value: '12.5' } })
    ;[controlByLabel('價格'), controlByLabel('%數')].forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.specialRake).toBe(12.5)
  })

  it('名稱清空或沒有類別時不可儲存', async () => {
    const { settle } = setup()
    await settle()
    expect(button('儲存')).not.toBeDisabled()
    await typeText(controlByLabel('名稱'), '')
    expect(button('儲存')).toBeDisabled()
    expect(button('儲存並上一筆')).toBeDisabled()
    expect(button('儲存並下一筆')).toBeDisabled()
  })

  it('儲存並上一筆／下一筆：依服務列表的順序導到相鄰服務', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(button('儲存並上一筆'))
    await wait(() => expect(currentLocation()).toBe('/service/edit/s0'))
    expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1)
    cleanup()
    const second = setup()
    await second.settle()
    fireEvent.click(button('儲存並下一筆'))
    await wait(() => expect(currentLocation()).toBe('/service/edit/s2'))
  })

  it('第一筆不可「儲存並上一筆」、最後一筆不可「儲存並下一筆」', async () => {
    const first = setup({ list: [{ id: 's1' }, { id: 's2' }] })
    await first.settle()
    expect(button('儲存並上一筆')).toBeDisabled()
    expect(button('儲存並下一筆')).not.toBeDisabled()
    cleanup()
    const last = setup({ list: [{ id: 's0' }, { id: 's1' }] })
    await last.settle()
    expect(button('儲存並上一筆')).not.toBeDisabled()
    expect(button('儲存並下一筆')).toBeDisabled()
  })

  it('儲存失敗：顯示錯誤、不離開，按鈕恢復可按', async () => {
    const { settle } = setup({ UPDATE_SERVICE: new Error('服務已被刪除') })
    await settle()
    fireEvent.click(button('儲存'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '服務已被刪除' }))
    expect(currentLocation()).toBe('/service/edit/s1')
    expect(button('儲存')).not.toBeDisabled()
  })

  it('存檔成功後清除設定類查詢快取（抽成方式重抓）', async () => {
    const { calls, settle } = renderWithSettingsCache(<ServiceEdit match={{ params: { id: 's1' } }} />, {
      fixtures: fixtures(),
      route: '/service/edit/s1',
    })
    await settle()
    expect(callsOf(calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(1)
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(2))
    expect(callsOf(calls, 'MERCHANT_HELPER_ITEMS')).toHaveLength(2)
  })
})

describe('編輯服務項目：建立副本', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/service/duplicate/s1')
  })

  it('標題為新增、名稱與代號加「的副本」；即使店家關閉扣項顯示也顯示扣項卡', async () => {
    const { settle } = setup({}, { store: createTestStore(), route: '/service/duplicate/s1' })
    await settle()
    expect(screen.getByText('新增服務項目', { selector: 'h1' })).toBeInTheDocument()
    expect(controlByLabel('名稱')).toHaveValue('精緻剪髮的副本')
    expect(controlByLabel('代號')).toHaveValue('S01的副本')
    expect(screen.getByText(DEFAULT_SECTION)).toBeInTheDocument()
    expect(screen.queryByText('儲存並上一筆')).toBeNull()
  })

  it('新增：送 CREATE_SERVICE（不帶 itemId、扣項以 ServiceDeductionItems 送出、帶店家 id），重抓服務列表並回列表', async () => {
    const { calls, settle } = setup({}, { route: '/service/duplicate/s1' })
    await settle()
    const fetches = callsOf(calls, 'FETCH_SERVICES').length
    fireEvent.click(button('新增'))
    await wait(() => expect(currentLocation()).toBe('/services'))
    const { input } = callsOf(calls, 'CREATE_SERVICE')[0].variables
    expect(input).not.toHaveProperty('itemId')
    expect(input).not.toHaveProperty('serviceDeductionItems')
    expect(input).toMatchObject({
      name: '精緻剪髮的副本',
      no: 'S01的副本',
      OfficialBrandMerchantId: MERCHANT_ID,
      ServiceDeductionItems: [
        { type: '系統預設', itemSettings: [item({ deductionWay: '扣趴數', price: 10 })] },
        { type: '設計師抽成', itemSettings: [item()] },
      ],
      bindedThirdPartTicketId: 'tp-1',
    })
    expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(0)
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功新增服務' })
    await wait(() => expect(callsOf(calls, 'FETCH_SERVICES').length).toBeGreaterThan(fetches))
  })

  it('新增失敗：顯示錯誤、按鈕恢復', async () => {
    const { settle } = setup({ CREATE_SERVICE: new Error('代號重複') }, { route: '/service/duplicate/s1' })
    await settle()
    fireEvent.click(button('新增'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '代號重複' }))
    expect(button('新增')).not.toBeDisabled()
  })
})

describe('編輯服務項目：扣項設定', () => {
  it('店家關閉扣項顯示時編輯頁不顯示扣項卡', async () => {
    const { settle } = setup({}, { store: storeWithDeduction(false) })
    await settle()
    expect(screen.queryByText(DEFAULT_SECTION)).toBeNull()
    expect(screen.getByText(HELPER)).toBeInTheDocument()
  })

  it('「系統預設」排在最後；沒有項目的抽成方式補一筆預設；舊資料沒有順序的重新編號且基準點歸 0', async () => {
    const service = makeService({
      serviceDetail: {
        serviceDeductionItems: [
          { type: '系統預設', itemSettings: [item({ name: '舊名', deductionOrder: 3, deductionReference: 0 }), item({ deductionOrder: 9, deductionReference: 1 })] },
          { type: '設計師抽成', itemSettings: [] },
          { type: '助理抽成', itemSettings: [item({ deductionOrder: null, deductionReference: 2 }), item({ deductionOrder: null, deductionReference: 1 })] },
        ],
      },
    })
    const { calls, settle } = setup({ service })
    await settle()
    const titles = [...document.querySelectorAll('h3')].map(h => h.textContent).filter(t => t.startsWith('項目扣項設定'))
    expect(titles).toEqual(['項目扣項設定 - 設計師抽成', '項目扣項設定 - 助理抽成', DEFAULT_SECTION])
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.serviceDeductionItems).toEqual([
      { type: '系統預設', itemSettings: [item({ deductionOrder: 1 }), item({ deductionOrder: 2, deductionReference: 1 })] },
      { type: '設計師抽成', itemSettings: [item()] },
      { type: '助理抽成', itemSettings: [item({ deductionOrder: 1 }), item({ deductionOrder: 2 })] },
    ])
  })

  it('服務沒有扣項時依店家抽成方式產生預設扣項（價格 0 時預估顯示 0）', async () => {
    const { calls, settle } = setup({ service: makeService({ price: 0, serviceDetail: { serviceDeductionItems: [] } }) })
    await settle()
    expect(rowsOf(sectionOf(DESIGNER_SECTION))).toHaveLength(1)
    expect(summaryLines(DESIGNER_SECTION)).toEqual(['實業績(含扣項):0', '實業績(含扣項、扣互助)預估:0 - 2點'])
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.serviceDeductionItems).toEqual([
      { type: '系統預設', itemSettings: [item()] },
      { type: '設計師抽成', itemSettings: [item()] },
    ])
  })

  // Jason 2026/10/22：扣項排序把「系統預設」移到最後；沒有「系統預設」時不推入空物件，頁面正常顯示既有扣項並可儲存
  it('服務的扣項沒有「系統預設」時頁面正常顯示，可儲存', async () => {
    const service = makeService({ serviceDetail: { serviceDeductionItems: [{ type: '設計師抽成', itemSettings: [item()] }] } })
    const { calls, settle } = setup({ service })
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

  it('實業績預估：%數／固定金額 × 分指定與否 × 扣業績／扣薪水，基準點引用前一筆剩餘業績；只有扣薪水的卡等於價格', async () => {
    const S = { isSpecial: true }
    const service = makeService({
      helperDeductionSetting: [],
      serviceDetail: {
        serviceDeductionItems: [
          {
            type: '系統預設',
            itemSettings: [
              item({ deductionWay: '扣趴數', price: 10 }), // 扣 100，剩 900
              item({ type: 'onSalary', deductionWay: '扣趴數', price: 10, deductionReference: 1 }),
              item({ ...S, deductionWay: '扣趴數', designatePrice: 20, nonDesignatePrice: 30 }), // 扣 200
              item({ ...S, deductionWay: '扣趴數', designatePrice: 30, nonDesignatePrice: 10 }), // 扣 100
              item({ ...S, type: 'onSalary', deductionWay: '扣趴數', designatePrice: 9, nonDesignatePrice: 3 }),
              item({ ...S, type: 'onSalary', deductionWay: '扣趴數', designatePrice: 3, nonDesignatePrice: 9 }),
              item({ deductionWay: '扣固定金額', price: 50 }), // 扣 50
              item({ type: 'onSalary', deductionWay: '扣固定金額', price: 30 }),
              item({ ...S, deductionWay: '扣固定金額', designatePrice: 15, nonDesignatePrice: 25 }), // 扣 15
              item({ ...S, deductionWay: '扣固定金額', designatePrice: 25, nonDesignatePrice: 15 }), // 扣 15
              item({ ...S, type: 'onSalary', deductionWay: '扣固定金額', designatePrice: 20, nonDesignatePrice: 10 }),
              item({ ...S, type: 'onSalary', deductionWay: '扣固定金額', designatePrice: 10, nonDesignatePrice: 20 }),
              item({ type: 'none', deductionWay: '扣固定金額', price: 999 }),
            ],
          },
          { type: '設計師抽成', itemSettings: [item({ type: 'onSalary', deductionWay: '扣固定金額', price: 300 })] },
        ],
      },
    })
    const { settle } = setup({ service })
    await settle()
    expect(summaryLines(DEFAULT_SECTION)).toEqual(['實業績(含扣項):520', '實業績(含扣項、扣互助)預估:520'])
    expect(summaryLines(DESIGNER_SECTION)[0]).toBe('實業績(含扣項):1,000')
  })

  it('互助（扣業績）從預估扣除：點數另標示，負點數顯示加點', async () => {
    const service = makeService({
      helperDeductionSetting: [
        helper({ type: '洗髮', nameList: ['1'], peopleCount: 1, percent: 10 }),
        helper({ type: '吹整', nameList: ['1', '2'], peopleCount: 2, point: -1.5 }),
      ],
    })
    const { settle } = setup({ service })
    await settle()
    // 系統預設：1000 扣 10% = 900，再扣互助 10% × 1 人 = 100
    expect(summaryLines(DEFAULT_SECTION)).toEqual(['實業績(含扣項):900', '實業績(含扣項、扣互助)預估:800 + 3點'])
    fireEvent.change(controlByLabel('點數', helperRow(1)), { target: { value: '2' } })
    expect(summaryLines(DEFAULT_SECTION)[1]).toBe('實業績(含扣項、扣互助)預估:800 - 4點')
  })

  it('在畫面上編輯扣項（類別、方式、分指定、數字、基準點、新增、刪除、清除），送出的是編輯後的內容', async () => {
    const { calls, settle } = setup()
    await settle()
    fillDeductionRow(DEFAULT_SECTION, 0, { type: '扣薪水', way: '依固定金額', price: 40 })
    addDeductionRow(DEFAULT_SECTION)
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 1, { type: '扣業績', way: '依業績%數', special: true, designate: 5, nonDesignate: 7, ref: 1 })
    fillDeductionRow(DEFAULT_SECTION, 2, { way: '依業績%數', price: 3 })
    expect(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[1], '新增扣項')).toBeNull()
    fireEvent.click(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[2], '清除此扣項'))
    expect(controlByLabel('業績%數', rowsOf(sectionOf(DEFAULT_SECTION))[2])).toHaveValue(0)
    fireEvent.click(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[2], '刪除此扣項'))
    expect(rowsOf(sectionOf(DEFAULT_SECTION))).toHaveLength(2)
    // 另一張卡的編輯不影響系統預設
    fillDeductionRow(DESIGNER_SECTION, 0, { way: '依固定金額', price: 60 })
    // 分指定的固定金額標籤（勾、取消、再勾）
    fireEvent.click(checkboxByLabel('分指定/不指定', rowsOf(sectionOf(DESIGNER_SECTION))[0]))
    fireEvent.click(checkboxByLabel('分指定/不指定', rowsOf(sectionOf(DESIGNER_SECTION))[0]))
    expect(controlsByLabel('指定金額', rowsOf(sectionOf(DESIGNER_SECTION))[0])).toHaveLength(0)
    fireEvent.click(checkboxByLabel('分指定/不指定', rowsOf(sectionOf(DESIGNER_SECTION))[0]))
    fillDeductionRow(DESIGNER_SECTION, 0, { way: '依固定金額', designate: 8, nonDesignate: 9 })
    const fields = [
      controlByLabel('固定金額', rowsOf(sectionOf(DEFAULT_SECTION))[0]),
      controlByLabel('指定%', rowsOf(sectionOf(DEFAULT_SECTION))[1]),
      controlByLabel('不指定%', rowsOf(sectionOf(DEFAULT_SECTION))[1]),
    ]
    fields.forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    const sent = callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.serviceDeductionItems
    // 編輯後的清單已依畫面排序（系統預設在最後）
    expect(sent.map(d => d.type)).toEqual(['設計師抽成', '系統預設'])
    expect(sent[0].itemSettings).toEqual([item({ deductionWay: '扣固定金額', isSpecial: true, designatePrice: 8, nonDesignatePrice: 9 })])
    expect(sent[1].itemSettings).toEqual([
      item({ type: 'onSalary', deductionWay: '扣固定金額', price: 40 }),
      item({ deductionWay: '扣趴數', isSpecial: true, designatePrice: 5, nonDesignatePrice: 7, deductionOrder: 2, deductionReference: 1 }),
    ])
  })
})

describe('編輯服務項目：互助設定', () => {
  it('依原數值判斷方式與是否分指定：點數 > 固定金額 > 業績%數；類別空白的不判斷', async () => {
    const service = makeService({
      helperDeductionSetting: [
        helper({ helperDeductionType: 'onSalary' }),
        helper({ type: '洗髮', helperDeductionType: 'onSalary', nameList: ['1'], peopleCount: 1, point: 1 }),
        helper({ type: '洗髮', helperDeductionType: 'onSalary', designatePoint: 2, nonDesignatePoint: 1 }),
        helper({ type: '洗髮', helperDeductionType: 'onSalary', nonDesignatePoint: 3 }),
        helper({ type: '吹整', helperDeductionType: 'onSalary', cash: 100 }),
        helper({ type: '吹整', helperDeductionType: 'onSalary', designateCash: 40 }),
        helper({ type: '吹整', helperDeductionType: 'onSalary', nonDesignateCash: 50 }),
        helper({ type: '洗髮', helperDeductionType: 'onSalary', percent: 10 }),
        helper({ type: '洗髮', helperDeductionType: 'onSalary', designatePercent: 5 }),
      ],
    })
    const { settle } = setup({ service })
    await settle()
    const way = i => selectedText(controlByLabel('扣項方式', helperRow(i)))
    const designated = i => checkboxByLabel('分指定/不指定', helperRow(i)).checked
    expect(rowsOf(sectionOf(HELPER))).toHaveLength(9)
    expect(way(0)).toBe('')
    expect(controlsByLabel('點數', helperRow(0))).toHaveLength(0)
    expect([way(1), designated(1)]).toEqual(['依點數', false])
    expect(controlByLabel('點數', helperRow(1))).toHaveValue(1)
    expect(selectedText(controlByLabel('協助人員人數', helperRow(1)))).toBe('1')
    expect([way(2), designated(2)]).toEqual(['依點數', true])
    expect(controlByLabel('指定點數', helperRow(2))).toHaveValue(2)
    expect(controlByLabel('不指定點數', helperRow(2))).toHaveValue(1)
    expect([way(3), designated(3)]).toEqual(['依點數', true])
    expect([way(4), designated(4)]).toEqual(['依固定金額', false])
    expect([way(5), designated(5)]).toEqual(['依固定金額', true])
    expect([way(6), designated(6)]).toEqual(['依固定金額', true])
    expect([way(7), designated(7)]).toEqual(['依業績%數', false])
    expect([way(8), designated(8)]).toEqual(['依業績%數', true])
    expect(controlByLabel('指定業績%數', helperRow(8))).toHaveValue(5)
  })

  it('修改互助數值後送出：數字化、去掉 deductionWay／isDesignate；新增、清除、刪除列', async () => {
    const service = makeService({
      helperDeductionSetting: [
        helper({ type: '洗髮', nameList: ['1'], peopleCount: 1, point: 1 }),
        helper({ type: '吹整', designatePoint: 2, nonDesignatePoint: 1 }),
        helper({ type: '吹整', cash: 100 }),
        helper({ type: '吹整', designateCash: 40 }),
        helper({ type: '洗髮', percent: 10 }),
        helper({ type: '洗髮', designatePercent: 5 }),
      ],
    })
    const { calls, settle } = setup({ service })
    await settle()
    const set = (i, label, value) => fireEvent.change(controlByLabel(label, helperRow(i)), { target: { value } })
    set(0, '點數', '1.5')
    set(1, '指定點數', '3')
    set(1, '不指定點數', '2')
    set(2, '固定金額', '120')
    set(3, '指定固定金額', '45')
    set(3, '不指定固定金額', '35')
    set(4, '業績%數', '12')
    set(5, '指定業績%數', '6')
    set(5, '不指定業績%數', '4')
    ;['點數', '指定點數', '不指定點數'].forEach((label, n) => {
      const field = controlByLabel(label, helperRow(n === 0 ? 0 : 1))
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
    pick(controlByLabel('扣項類別', helperRow(0)), '扣薪水')
    pick(controlByLabel('類別', helperRow(0)), '吹整')
    pick(controlByLabel('協助人員人數', helperRow(0)), '3')
    // 互助均分（只改該列），再取消
    fireEvent.click(checkboxByLabel('互助均分', helperRow(2)))
    expect(checkboxByLabel('分指定/不指定', helperRow(2))).toBeDisabled()
    fireEvent.click(checkboxByLabel('互助均分', helperRow(2)))
    // 第 5 列取消分指定 → 數值歸 0、變回單一欄位
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(5)))
    expect(controlByLabel('業績%數', helperRow(5))).toHaveValue(0)
    // 單一欄位改成分指定 → 顯示指定／不指定兩欄；再改方式會清空數值
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(4)))
    expect(controlByLabel('指定業績%數', helperRow(4))).toHaveValue(0)
    pick(controlByLabel('扣項方式', helperRow(4)), '依點數')
    expect(controlByLabel('指定點數', helperRow(4))).toHaveValue(0)
    // 新增一列再清除、刪除
    fireEvent.click(buttonIn(helperRow(5), '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRow(6)), '依固定金額')
    fireEvent.click(buttonIn(helperRow(6), '清除此互助設定'))
    fireEvent.click(buttonIn(helperRow(6), '刪除此互助設定'))
    fireEvent.click(buttonIn(helperRow(4), '刪除此互助設定'))
    expect(rowsOf(sectionOf(HELPER))).toHaveLength(5)
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'UPDATE_SERVICE')[0].variables.input.helperDeductionSetting).toEqual([
      helper({ helperDeductionType: 'onSalary', type: '吹整', nameList: ['1', '2', '3'], peopleCount: 3, point: 1.5 }),
      helper({ type: '吹整', designatePoint: 3, nonDesignatePoint: 2 }),
      helper({ type: '吹整', cash: 120 }),
      helper({ type: '吹整', designateCash: 45, nonDesignateCash: 35 }),
      helper({ type: '洗髮' }),
    ])
  })
})

describe('編輯服務項目：查詢失敗與登入狀態', () => {
  it('沒有目前店家（localStorage 無 userMerchant）時仍可編輯儲存', async () => {
    loginAs({ merchant: null })
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'UPDATE_SERVICE')).toHaveLength(1))
  })

  // Jason 2026/10/22：第三方卡券查詢失敗時以空清單處理（與新增頁同寫法），綁定選單只剩「無」
  it('第三方卡券查詢失敗時頁面正常，綁定選單只有「無」', async () => {
    const { settle } = setup({ service: makeService({ bindedThirdPartTicket: null }), FETCH_THIRDPARTYS: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect([...controlByLabel('綁定第三方卡券').options].map(o => o.textContent)).toEqual(['無'])
  })

  // Jason 2026/10/22：服務列表（上一筆／下一筆用）查詢失敗時以空清單處理，頁面正常、上一筆／下一筆停用，仍可儲存
  it('服務列表查詢失敗時頁面正常，上一筆／下一筆停用', async () => {
    const { settle } = setup({ FETCH_SERVICES: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(button('儲存並上一筆')).toBeDisabled()
    expect(button('儲存並下一筆')).toBeDisabled()
    expect(button('儲存')).not.toBeDisabled()
  })
})
