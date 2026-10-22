// 保護「新增卡券項目」（預收卡）：
// - 送出的 CREATE_COUPON input：代號、名稱、服務類別、價格（數字）、可使用次數（空白或 0 視為 1）、打帳單鎖價、
//   業績入帳模式（使用時／販賣時／使用時扣項依販賣時）、手續費扣款模式、上架狀態（布林）、店家 id、
//   依抽成方式產生的扣項、依顧客分類產生的販售設定、互助設定（數字化、去掉畫面用欄位）、isTicket=true
// - 名稱與服務類別未填不可送出；成功後提示並回卡券列表；失敗顯示錯誤、按鈕恢復；存檔成功後清除設定類查詢快取
// - 扣項與互助的新增、刪除、清除、分指定等編輯都反映在送出的內容
// GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, MERCHANT_ID, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
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
  fillDeductionRow,
  addDeductionRow,
  renderWithSettingsCache,
} from '../../ServiceCreate/__tests__/itemFormKit.test'
import CouponCreate from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const fixtures = (overrides = {}) => settingFixtures({ CREATE_COUPON: { createCoupon: true }, ...overrides })
const setup = overrides => renderPage(<CouponCreate />, { fixtures: fixtures(overrides), route: '/coupon/create' })
const submitButton = () => screen.getByText('新增卡券', { selector: 'button' })
const DEFAULT_SECTION = '項目扣項設定 - 系統預設'
const DESIGNER_SECTION = '項目扣項設定 - 設計師抽成'
const HELPER = '互助點數設定'
const helperRow = i => rowsOf(sectionOf(HELPER))[i]
const ZERO = {
  point: 0,
  cash: 0,
  percent: 0,
  designateCash: 0,
  nonDesignateCash: 0,
  designatePercent: 0,
  nonDesignatePercent: 0,
  designatePoint: 0,
  nonDesignatePoint: 0,
}
const ITEM = {
  isSpecial: false,
  name: '材料費',
  type: 'onSales',
  deductionWay: '',
  price: 0,
  designatePrice: 0,
  nonDesignatePrice: 0,
  deductionOrder: 1,
  deductionReference: 0,
}

async function fillBasics() {
  await typeText(controlByLabel('代號'), 'T10')
  await typeText(controlByLabel('名稱'), '護髮十次卡')
  pick(controlByLabel('服務類別'), '剪髮')
  fireEvent.change(controlByLabel('價格'), { target: { value: '5000' } })
  fireEvent.change(controlByLabel('次數'), { target: { value: '10' } })
}

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('新增卡券項目：送出', () => {
  it('名稱與服務類別都填了才可送出', async () => {
    const { settle } = setup()
    await settle()
    expect(submitButton()).toBeDisabled()
    await typeText(controlByLabel('名稱'), '護髮十次卡')
    expect(submitButton()).toBeDisabled()
    pick(controlByLabel('服務類別'), '染髮')
    expect(submitButton()).not.toBeDisabled()
  })

  it('預設值送出：鎖價 UNSET、使用時入業績、每次使用時扣手續費、上架；扣項與販售設定依店家設定產生', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(selectedText(controlByLabel('打帳單是否能更改預設價格'))).toBe('依系統參數設定')
    expect(selectedText(controlByLabel('業績入帳模式'))).toBe('使用時入業績')
    expect(selectedText(controlByLabel('手續費扣款模式'))).toBe('每次使用時扣除')
    expect(selectedText(controlByLabel('卡券上架狀態設定'))).toBe('上架')
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_COUPON')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_COUPON')[0].variables.input).toEqual({
      no: 'T10',
      name: '護髮十次卡',
      price: 5000,
      isTicket: true,
      ticketAvailableCount: 10,
      isTicketCountNow: false,
      helperDeductionSetting: [{ ...ZERO, helperDeductionType: 'onSales', type: '', nameList: [], peopleCount: 0, isSplitted: false }],
      ServiceDeductionItems: [
        { type: '系統預設', itemSettings: [ITEM] },
        { type: '設計師抽成', itemSettings: [ITEM] },
      ],
      customerSellSetting: [
        { category: '一般', percent: 100, birthday: 100 },
        { category: 'VIP', percent: 100, birthday: 100 },
      ],
      ServiceCategoryId: 'cat-1',
      OfficialBrandMerchantId: MERCHANT_ID,
      isLocked: 'UNSET',
      performanceCalculationMode: 'USING',
      handlingFeeDecountMode: 'USING',
      isLaunched: true,
    })
  })

  it('送出鎖價、業績入帳模式、手續費模式與下架；次數空白或 0 視為 1；成功後回卡券列表', async () => {
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    fireEvent.change(controlByLabel('次數'), { target: { value: '0' } })
    expect(controlByLabel('次數')).toHaveValue(1)
    pick(controlByLabel('打帳單是否能更改預設價格'), '可更改')
    pick(controlByLabel('業績入帳模式'), '使用時入業績（扣項依販賣時設定）')
    pick(controlByLabel('手續費扣款模式'), '販賣時整筆扣除')
    pick(controlByLabel('卡券上架狀態設定'), '下架')
    fireEvent.click(submitButton())
    expect(submitButton()).toBeDisabled()
    await wait(() => expect(currentLocation()).toBe('/coupons'))
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功新增卡券' })
    expect(callsOf(calls, 'CREATE_COUPON')[0].variables.input).toMatchObject({
      ticketAvailableCount: 1,
      isLocked: 'FALSE',
      performanceCalculationMode: 'USINGSAVEDEDUCT',
      handlingFeeDecountMode: 'SELLING',
      isLaunched: false,
    })
  })

  it('送出失敗：顯示錯誤、不離開，按鈕恢復可按', async () => {
    const { settle } = setup({ CREATE_COUPON: new Error('代號重複') })
    await settle()
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '代號重複' }))
    expect(currentLocation()).toBe('/coupon/create')
    expect(submitButton()).not.toBeDisabled()
  })

  it('沒有目前店家時送出的店家 id 為 null', async () => {
    loginAs({ merchant: null })
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_COUPON')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_COUPON')[0].variables.input.OfficialBrandMerchantId).toBeNull()
  })

  it('存檔成功後清除設定類查詢快取（抽成方式、互助類別重抓）', async () => {
    const { calls, settle } = renderWithSettingsCache(<CouponCreate />, { fixtures: fixtures(), route: '/coupon/create' })
    await settle()
    expect(callsOf(calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(1)
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(2))
    expect(callsOf(calls, 'MERCHANT_HELPER_ITEMS')).toHaveLength(2)
  })

  // Jason 2026/10/22：抽成方式查詢失敗時扣項以空清單處理（沒有扣項卡），頁面正常且可送出
  it('抽成方式查詢失敗時頁面正常（沒有扣項卡），可送出', async () => {
    const { calls, settle } = setup({ MERCHANT_COMMISSION_WAY: new Error('x') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByText(DEFAULT_SECTION)).toBeNull()
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_COUPON')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_COUPON')[0].variables.input.ServiceDeductionItems).toEqual([])
  })
})

describe('新增卡券項目：扣項與互助編輯', () => {
  it('扣項：類別、方式、分指定、數字、基準點、新增、刪除、清除都反映在送出的內容', async () => {
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    fillDeductionRow(DEFAULT_SECTION, 0, { type: '扣薪水', way: '依固定金額', price: 40 })
    addDeductionRow(DEFAULT_SECTION)
    // 每一列都有「新增扣項」
    fireEvent.click(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[0], '新增扣項'))
    expect(rowsOf(sectionOf(DEFAULT_SECTION))).toHaveLength(3)
    fillDeductionRow(DEFAULT_SECTION, 1, { type: '扣業績', way: '依業績%數', special: true, designate: 5, nonDesignate: 7, ref: '1' })
    fillDeductionRow(DEFAULT_SECTION, 2, { way: '依業績%數', price: 3 })
    fireEvent.click(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[2], '清除此扣項'))
    expect(controlByLabel('業績%數', rowsOf(sectionOf(DEFAULT_SECTION))[2])).toHaveValue(0)
    fireEvent.click(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[2], '刪除此扣項'))
    expect(rowsOf(sectionOf(DEFAULT_SECTION))).toHaveLength(2)
    expect(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[0], '刪除此扣項')).toBeNull()
    // 另一張卡：分指定固定金額（勾、取消、再勾）
    const other = () => rowsOf(sectionOf(DESIGNER_SECTION))[0]
    fireEvent.click(checkboxByLabel('分指定/不指定', other()))
    fireEvent.click(checkboxByLabel('分指定/不指定', other()))
    expect(controlsByLabel('指定%', other())).toHaveLength(0)
    fillDeductionRow(DESIGNER_SECTION, 0, { way: '依固定金額', special: true, designate: 8, nonDesignate: 9 })
    const fields = [
      controlByLabel('固定金額', rowsOf(sectionOf(DEFAULT_SECTION))[0]),
      controlByLabel('指定%', rowsOf(sectionOf(DEFAULT_SECTION))[1]),
      controlByLabel('不指定%', rowsOf(sectionOf(DEFAULT_SECTION))[1]),
      controlByLabel('指定金額', other()),
    ]
    fields.forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_COUPON')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_COUPON')[0].variables.input.ServiceDeductionItems).toEqual([
      {
        type: '系統預設',
        itemSettings: [
          { ...ITEM, type: 'onSalary', deductionWay: '扣固定金額', price: 40 },
          { ...ITEM, deductionWay: '扣趴數', isSpecial: true, designatePrice: 5, nonDesignatePrice: 7, deductionOrder: 2, deductionReference: 1 },
        ],
      },
      { type: '設計師抽成', itemSettings: [{ ...ITEM, deductionWay: '扣固定金額', isSpecial: true, designatePrice: 8, nonDesignatePrice: 9 }] },
    ])
  })

  it('互助：人數決定 nameList（0 人為空）、單一／分指定欄位、均分、新增、清除、刪除最後一列；送出轉數字', async () => {
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    pick(controlByLabel('類別', helperRow(0)), '洗髮')
    pick(controlByLabel('協助人員人數', helperRow(0)), '2')
    pick(controlByLabel('扣項方式', helperRow(0)), '依點數')
    fireEvent.change(controlByLabel('點數', helperRow(0)), { target: { value: '1.5' } })
    fireEvent.click(checkboxByLabel('互助均分', helperRow(0)))
    expect(checkboxByLabel('分指定/不指定', helperRow(0))).toBeDisabled()
    // 第 1 列沒有刪除鈕
    expect(buttonIn(helperRow(0), '刪除此互助設定')).toBeNull()
    fireEvent.click(buttonIn(helperRow(0), '新增互助設定'))
    pick(controlByLabel('扣項類別', helperRow(1)), '扣薪水')
    pick(controlByLabel('類別', helperRow(1)), '吹整')
    pick(controlByLabel('協助人員人數', helperRow(1)), '0')
    pick(controlByLabel('扣項方式', helperRow(1)), '依固定金額')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(1)))
    fireEvent.change(controlByLabel('指定固定金額', helperRow(1)), { target: { value: '50' } })
    fireEvent.change(controlByLabel('不指定固定金額', helperRow(1)), { target: { value: '30' } })
    // 只有最後一列可刪除：第 2 列（目前最後）有刪除鈕，第 1 列沒有
    expect(buttonIn(helperRow(0), '刪除此互助設定')).toBeNull()
    fireEvent.click(buttonIn(helperRow(1), '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRow(2)), '依業績%數')
    fireEvent.change(controlByLabel('業績%數', helperRow(2)), { target: { value: '9' } })
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(2)))
    fireEvent.change(controlByLabel('指定業績%數', helperRow(2)), { target: { value: '4' } })
    fireEvent.change(controlByLabel('不指定業績%數', helperRow(2)), { target: { value: '2' } })
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(2)))
    expect(controlByLabel('業績%數', helperRow(2))).toHaveValue(0)
    fireEvent.click(buttonIn(helperRow(2), '清除此互助設定'))
    expect(selectedText(controlByLabel('扣項方式', helperRow(2)))).toBe('')
    fireEvent.click(buttonIn(helperRow(2), '刪除此互助設定'))
    expect(rowsOf(sectionOf(HELPER))).toHaveLength(2)
    fireEvent.click(buttonIn(helperRow(1), '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRow(2)), '依點數')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(2)))
    fireEvent.change(controlByLabel('指定點數', helperRow(2)), { target: { value: '3' } })
    fireEvent.change(controlByLabel('不指定點數', helperRow(2)), { target: { value: '2' } })
    pick(controlByLabel('扣項方式', helperRow(2)), '依固定金額')
    // 改方式後數值歸 0，改填單一金額
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(2)))
    fireEvent.change(controlByLabel('固定金額', helperRow(2)), { target: { value: '70' } })
    // 均分只改該列（勾了再取消）
    fireEvent.click(checkboxByLabel('互助均分', helperRow(2)))
    expect(checkboxByLabel('互助均分', helperRow(1))).not.toBeChecked()
    fireEvent.click(checkboxByLabel('互助均分', helperRow(2)))
    ;[controlByLabel('點數', helperRow(0)), controlByLabel('指定固定金額', helperRow(1)), controlByLabel('不指定固定金額', helperRow(1))].forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_COUPON')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_COUPON')[0].variables.input.helperDeductionSetting).toEqual([
      { ...ZERO, helperDeductionType: 'onSales', type: '洗髮', nameList: ['1', '2'], peopleCount: 2, point: 1.5, isSplitted: true },
      { ...ZERO, helperDeductionType: 'onSalary', type: '吹整', nameList: [], peopleCount: 0, designateCash: 50, nonDesignateCash: 30, isSplitted: false },
      { ...ZERO, helperDeductionType: 'onSales', type: '', nameList: [], peopleCount: 0, cash: 70, isSplitted: false },
    ])
  })
})
