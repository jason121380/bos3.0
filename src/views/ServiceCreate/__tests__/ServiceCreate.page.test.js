// 保護「新增服務項目」：
// - 送出的 CREATE_SERVICE input：代號、名稱、服務類別、價格（數字）、打帳單鎖價（TRUE／FALSE／UNSET）、特殊抽成、
//   綁定第三方卡券（「無」送 null）與鎖定方式（預設「依系統參數設定」UNSET）、店家 id、依抽成方式產生的扣項設定、
//   依顧客分類產生的販售設定（100%）、互助設定（數字化、去掉畫面用的 deductionWay／isDesignate）
// - 名稱與服務類別未填不可送出；送出失敗顯示錯誤並可再送；成功後回列表、重抓服務列表，設定類查詢快取被清除重抓
// - 扣項設定的「實業績預估」：依業績%數／固定金額 × 分指定與否 × 扣業績／扣薪水，扣項基準點引用前一筆的剩餘業績；
//   互助（只算扣業績）的金額與點數再從預估中扣除
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
  renderWithSettingsCache,
  fillDeductionRow,
  addDeductionRow,
} from './itemFormKit.test'
import ServiceCreate from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const fixtures = (overrides = {}) =>
  settingFixtures({
    CREATE_SERVICE: { createService: true },
    FETCH_SERVICES: { services: { totalCount: 0, pageOffset: 0, pageLimit: 50, data: [] } },
    ...overrides,
  })

const setup = (overrides, options = {}) => renderPage(<ServiceCreate />, { fixtures: fixtures(overrides), route: '/service/create', ...options })

const submitButton = () => screen.getByText('新增', { selector: 'button' })
const DEFAULT_SECTION = '項目扣項設定 - 系統預設'
const DESIGNER_SECTION = '項目扣項設定 - 設計師抽成'
const summaryLines = title => [...sectionOf(title).lastElementChild.querySelectorAll('p')].map(p => p.textContent)

async function fillBasics() {
  await typeText(controlByLabel('代號'), 'S99')
  await typeText(controlByLabel('名稱'), '頭皮隔離霜')
  pick(controlByLabel('服務類別'), '染髮')
  fireEvent.change(controlByLabel('價格'), { target: { value: '1200' } })
}

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('新增服務項目：送出', () => {
  it('名稱與服務類別都填了才可送出', async () => {
    const { settle } = setup()
    await settle()
    expect(submitButton()).toBeDisabled()
    // 按鈕停用時要說出還缺什麼（STYLE.md §6），填一項就少一項，都填了就不顯示
    expect(screen.getByText('尚缺：名稱、服務類別')).toHaveAttribute('role', 'status')
    await typeText(controlByLabel('名稱'), '頭皮隔離霜')
    expect(submitButton()).toBeDisabled()
    expect(screen.getByText('尚缺：服務類別')).toBeInTheDocument()
    pick(controlByLabel('服務類別'), '剪髮')
    expect(submitButton()).not.toBeDisabled()
    expect(screen.queryByText(/^尚缺：/)).toBeNull()
  })

  it('預設值：鎖價與第三方卡券鎖定為「依系統參數設定」、綁定「無」送 null；扣項依抽成方式、販售設定依顧客分類產生', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(selectedText(controlByLabel('打帳單是否能更改預設價格'))).toBe('依系統參數設定')
    expect(selectedText(controlByLabel('綁定第三方卡券'))).toBe('無')
    expect(selectedText(controlByLabel('是否鎖定第三方卡券'))).toBe('依系統參數設定')
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_SERVICE')).toHaveLength(1))
    const { input } = callsOf(calls, 'CREATE_SERVICE')[0].variables
    const defaultItem = {
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
    expect(input).toEqual({
      no: 'S99',
      name: '頭皮隔離霜',
      price: 1200,
      isTicket: false,
      isTicketCountNow: true,
      helperDeductionSetting: [
        {
          helperDeductionType: 'onSales',
          type: '',
          nameList: [],
          peopleCount: 0,
          point: 0,
          cash: 0,
          percent: 0,
          designateCash: 0,
          nonDesignateCash: 0,
          designatePercent: 0,
          nonDesignatePercent: 0,
          designatePoint: 0,
          nonDesignatePoint: 0,
          isSplitted: false,
        },
      ],
      ServiceDeductionItems: [
        { type: '系統預設', itemSettings: [defaultItem] },
        { type: '設計師抽成', itemSettings: [defaultItem] },
      ],
      customerSellSetting: [
        { category: '一般', percent: 100, birthday: 100 },
        { category: 'VIP', percent: 100, birthday: 100 },
      ],
      ServiceCategoryId: 'cat-2',
      OfficialBrandMerchantId: MERCHANT_ID,
      isLocked: 'UNSET',
      isNoCash: false,
      isSpecialRakeUsing: false,
      specialRake: 0,
      bindedThirdPartTicketId: null,
      isBindedThirdPartTicketLocked: 'UNSET',
    })
  })

  it('送出鎖價、特殊抽成、綁定第三方卡券與鎖定方式；成功後提示、重抓服務列表並回列表', async () => {
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    pick(controlByLabel('打帳單是否能更改預設價格'), '不可更改')
    fireEvent.click(checkboxByLabel('特殊抽成'))
    fireEvent.change(controlByLabel('%數'), { target: { value: '7.5' } })
    pick(controlByLabel('綁定第三方卡券'), '禮券')
    pick(controlByLabel('是否鎖定第三方卡券'), '鎖定')
    const servicesFetches = callsOf(calls, 'FETCH_SERVICES').length
    fireEvent.click(submitButton())
    expect(submitButton()).toBeDisabled()
    await wait(() => expect(currentLocation()).toBe('/services'))
    const { input } = callsOf(calls, 'CREATE_SERVICE')[0].variables
    expect(input).toMatchObject({
      isLocked: 'TRUE',
      isSpecialRakeUsing: true,
      specialRake: 7.5,
      bindedThirdPartTicketId: 'tp-2',
      isBindedThirdPartTicketLocked: 'TRUE',
    })
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功新增服務' })
    await wait(() => expect(callsOf(calls, 'FETCH_SERVICES').length).toBeGreaterThan(servicesFetches))
  })

  it('鎖價「可更改」、第三方卡券「不鎖定」；取消特殊抽成後不顯示 %數 欄位', async () => {
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    pick(controlByLabel('打帳單是否能更改預設價格'), '可更改')
    pick(controlByLabel('是否鎖定第三方卡券'), '不鎖定')
    fireEvent.click(checkboxByLabel('特殊抽成'))
    expect(controlsByLabel('%數')).toHaveLength(1)
    fireEvent.click(checkboxByLabel('特殊抽成'))
    expect(controlsByLabel('%數')).toHaveLength(0)
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_SERVICE')[0].variables.input).toMatchObject({
      isLocked: 'FALSE',
      isBindedThirdPartTicketLocked: 'FALSE',
      isSpecialRakeUsing: false,
    })
  })

  it('價格欄位捲動滑鼠時失焦（避免滾輪誤改價格）', async () => {
    const { settle } = setup()
    await settle()
    const price = controlByLabel('價格')
    price.focus()
    expect(document.activeElement).toBe(price)
    fireEvent.wheel(price)
    expect(document.activeElement).not.toBe(price)
    fireEvent.click(checkboxByLabel('特殊抽成'))
    const rake = controlByLabel('%數')
    rake.focus()
    fireEvent.wheel(rake)
    expect(document.activeElement).not.toBe(rake)
  })

  it('沒有目前店家（localStorage 無 userMerchant）時送出的店家 id 為 null', async () => {
    loginAs({ merchant: null })
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_SERVICE')[0].variables.input.OfficialBrandMerchantId).toBeNull()
  })

  it('送出失敗：顯示錯誤、不離開頁面，新增鈕恢復可按', async () => {
    const { calls, settle } = setup({ CREATE_SERVICE: new Error('代號重複') })
    await settle()
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '代號重複' }))
    expect(currentLocation()).toBe('/service/create')
    expect(submitButton()).not.toBeDisabled()
    expect(callsOf(calls, 'CREATE_SERVICE')).toHaveLength(1)
  })

  it('存檔成功後清除設定類查詢快取（抽成方式、顧客分類、互助類別重抓）；失敗則不清', async () => {
    const ok = renderWithSettingsCache(<ServiceCreate />, { fixtures: fixtures(), route: '/service/create' })
    await ok.settle()
    expect(callsOf(ok.calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(1)
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(ok.calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(2))
    expect(callsOf(ok.calls, 'CUSTOMER_CATEGORY')).toHaveLength(2)
    expect(callsOf(ok.calls, 'MERCHANT_HELPER_ITEMS')).toHaveLength(2)
    cleanup()

    const bad = renderWithSettingsCache(<ServiceCreate />, { fixtures: fixtures({ CREATE_SERVICE: new Error('失敗') }), route: '/service/create' })
    await bad.settle()
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '失敗' }))
    await bad.settle()
    expect(callsOf(bad.calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(1)
  })
})

describe('新增服務項目：扣項設定與實業績預估', () => {
  it('每個抽成方式一張扣項卡；預設一列「扣業績」，實業績預估等於價格', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.change(controlByLabel('價格'), { target: { value: '1000' } })
    expect(rowsOf(sectionOf(DEFAULT_SECTION))).toHaveLength(1)
    expect(rowsOf(sectionOf(DESIGNER_SECTION))).toHaveLength(1)
    const row = rowsOf(sectionOf(DEFAULT_SECTION))[0]
    expect(selectedText(controlByLabel('扣項類別', row))).toBe('扣業績')
    // 第一列的基準點只能是「依業績」，且不可刪除
    expect([...controlByLabel('扣項基準點', row).options].map(o => o.textContent)).toEqual(['依業績'])
    expect(buttonIn(row, '刪除此扣項')).toBeNull()
    expect(summaryLines(DEFAULT_SECTION)).toEqual(['實業績(含扣項):1,000', '實業績(含扣項、扣互助)預估:1,000'])
  })

  it('依業績%數：扣業績從剩餘業績扣、扣薪水不影響實業績；分指定/不指定取較小的%數；基準點引用前一筆剩餘業績', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.change(controlByLabel('價格'), { target: { value: '1000' } })
    fillDeductionRow(DEFAULT_SECTION, 0, { way: '依業績%數', price: 10 }) // 扣 100，剩 900
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 1, { type: '扣薪水', way: '依業績%數', price: 10, ref: 1 }) // 扣薪水 90（不影響）
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 2, { way: '依業績%數', special: true, designate: 20, nonDesignate: 30 }) // 取 20%：扣 200
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 3, { type: '扣薪水', way: '依業績%數', special: true, designate: 9, nonDesignate: 3 })
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 4, { type: '扣薪水', way: '依業績%數', special: true, designate: 3, nonDesignate: 9 })
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 5, { way: '依業績%數', special: true, designate: 30, nonDesignate: 10 }) // 取 10%：扣 100
    expect(summaryLines(DEFAULT_SECTION)[0]).toBe('實業績(含扣項):600')
    // 第 4 列的基準點可選 依業績、1、2、3
    const row4 = rowsOf(sectionOf(DEFAULT_SECTION))[3]
    expect([...controlByLabel('扣項基準點', row4).options].map(o => o.textContent)).toEqual(['依業績', '1', '2', '3'])
    // 標籤依方式切換
    expect(controlsByLabel('指定%', row4)).toHaveLength(1)
    expect(controlsByLabel('不指定%', row4)).toHaveLength(1)
  })

  it('依固定金額：扣業績直接減金額、扣薪水不影響；分指定/不指定取較小金額；「無扣項」不計', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.change(controlByLabel('價格'), { target: { value: '1000' } })
    fillDeductionRow(DEFAULT_SECTION, 0, { way: '依固定金額', price: 50 })
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 1, { type: '扣薪水', way: '依固定金額', price: 30 })
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 2, { way: '依固定金額', special: true, designate: 60, nonDesignate: 40 })
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 3, { type: '扣薪水', way: '依固定金額', special: true, designate: 10, nonDesignate: 20 })
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 4, { type: '無扣項', way: '依固定金額', price: 999 })
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 5, { way: '依固定金額', special: true, designate: 15, nonDesignate: 25 }) // 取 15
    addDeductionRow(DEFAULT_SECTION)
    fillDeductionRow(DEFAULT_SECTION, 6, { type: '扣薪水', way: '依固定金額', special: true, designate: 20, nonDesignate: 10 })
    expect(summaryLines(DEFAULT_SECTION)[0]).toBe('實業績(含扣項):895')
    const row = rowsOf(sectionOf(DEFAULT_SECTION))[2]
    expect(controlsByLabel('指定金額', row)).toHaveLength(1)
    expect(controlsByLabel('不指定金額', row)).toHaveLength(1)
    // 只有扣薪水（沒有扣業績）的卡，實業績＝價格
    fillDeductionRow(DESIGNER_SECTION, 0, { type: '扣薪水', way: '依固定金額', price: 300 })
    expect(summaryLines(DESIGNER_SECTION)[0]).toBe('實業績(含扣項):1,000')
  })

  it('清除此扣項：回到預設（扣業績、未選方式、0）；刪除此扣項：移除該列；送出的扣項帶順序與基準點', async () => {
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    fillDeductionRow(DEFAULT_SECTION, 0, { type: '扣薪水', way: '依業績%數', special: true, designate: 5, nonDesignate: 8 })
    fireEvent.click(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[0], '清除此扣項'))
    let row = rowsOf(sectionOf(DEFAULT_SECTION))[0]
    expect(selectedText(controlByLabel('扣項類別', row))).toBe('扣業績')
    expect(checkboxByLabel('分指定/不指定', row)).not.toBeChecked()
    expect(controlByLabel('業績%數', row)).toHaveValue(0)
    addDeductionRow(DEFAULT_SECTION)
    addDeductionRow(DEFAULT_SECTION)
    expect(rowsOf(sectionOf(DEFAULT_SECTION))).toHaveLength(3)
    // 只有最後一列有「新增扣項」
    expect(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[1], '新增扣項')).toBeNull()
    fillDeductionRow(DEFAULT_SECTION, 2, { way: '依固定金額', price: 80, ref: 2 })
    fireEvent.click(buttonIn(rowsOf(sectionOf(DEFAULT_SECTION))[1], '刪除此扣項'))
    expect(rowsOf(sectionOf(DEFAULT_SECTION))).toHaveLength(2)
    // 取消分指定：回到單一欄位、數字歸 0
    row = rowsOf(sectionOf(DEFAULT_SECTION))[0]
    fireEvent.click(checkboxByLabel('分指定/不指定', row))
    fireEvent.click(checkboxByLabel('分指定/不指定', rowsOf(sectionOf(DEFAULT_SECTION))[0]))
    expect(controlsByLabel('指定%', rowsOf(sectionOf(DEFAULT_SECTION))[0])).toHaveLength(0)
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_SERVICE')).toHaveLength(1))
    const items = callsOf(calls, 'CREATE_SERVICE')[0].variables.input.ServiceDeductionItems[0].itemSettings
    expect(items).toEqual([
      expect.objectContaining({ type: 'onSales', deductionWay: '', price: 0, isSpecial: false, deductionOrder: 1 }),
      expect.objectContaining({ type: 'onSales', deductionWay: '扣固定金額', price: 80, deductionOrder: 3, deductionReference: 2 }),
    ])
  })

  it('扣項輸入框捲動滑鼠時失焦', async () => {
    const { settle } = setup()
    await settle()
    const fields = [controlByLabel('業績%數', rowsOf(sectionOf(DEFAULT_SECTION))[0])]
    fireEvent.click(checkboxByLabel('分指定/不指定', rowsOf(sectionOf(DESIGNER_SECTION))[0]))
    fields.push(controlByLabel('指定%', rowsOf(sectionOf(DESIGNER_SECTION))[0]))
    fields.push(controlByLabel('不指定%', rowsOf(sectionOf(DESIGNER_SECTION))[0]))
    fields.forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
  })
})

describe('新增服務項目：互助點數設定', () => {
  const HELPER = '互助點數設定'
  const helperRow = i => rowsOf(sectionOf(HELPER))[i]

  it('送出時互助數字轉成數字、去掉畫面用欄位；人數決定 nameList；新增／刪除／清除列', async () => {
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    // 第 1 列：扣業績、洗髮、2 人、依點數 1.5
    pick(controlByLabel('類別', helperRow(0)), '洗髮')
    pick(controlByLabel('協助人員人數', helperRow(0)), '2')
    expect(selectedText(controlByLabel('協助人員人數', helperRow(0)))).toBe('2')
    pick(controlByLabel('扣項方式', helperRow(0)), '依點數')
    fireEvent.change(controlByLabel('點數', helperRow(0)), { target: { value: '1.5' } })
    // 第 2 列：扣薪水、吹整、1 人、依業績%數分指定 10／5
    fireEvent.click(buttonIn(helperRow(0), '新增互助設定'))
    pick(controlByLabel('扣項類別', helperRow(1)), '扣薪水')
    pick(controlByLabel('類別', helperRow(1)), '吹整')
    pick(controlByLabel('協助人員人數', helperRow(1)), '1')
    pick(controlByLabel('扣項方式', helperRow(1)), '依業績%數')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(1)))
    // 分指定時不可再勾互助均分
    expect(checkboxByLabel('互助均分', helperRow(1))).toBeDisabled()
    fireEvent.change(controlByLabel('指定業績%數', helperRow(1)), { target: { value: '10' } })
    fireEvent.change(controlByLabel('不指定業績%數', helperRow(1)), { target: { value: '5' } })
    // 第 3 列：新增後清除再刪除
    fireEvent.click(buttonIn(helperRow(1), '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRow(2)), '依固定金額')
    pick(controlByLabel('協助人員人數', helperRow(2)), '3')
    fireEvent.click(buttonIn(helperRow(2), '清除此互助設定'))
    expect(selectedText(controlByLabel('扣項方式', helperRow(2)))).toBe('')
    // 清除後人數歸零，下拉也要跟著清空（2026/10/30：新增頁原本沒綁 value，清除後仍顯示舊的「3」，畫面與送出資料不一致）
    expect(selectedText(controlByLabel('協助人員人數', helperRow(2)))).toBe('')
    expect(buttonIn(helperRow(2), '清除此互助設定')).toBeNull()
    fireEvent.click(buttonIn(helperRow(2), '刪除此互助設定'))
    // 互助均分只改該列（勾了再取消，送出仍為 false）
    fireEvent.click(checkboxByLabel('互助均分', helperRow(0)))
    expect(checkboxByLabel('互助均分', helperRow(0))).toBeChecked()
    expect(checkboxByLabel('互助均分', helperRow(1))).not.toBeChecked()
    fireEvent.click(checkboxByLabel('互助均分', helperRow(0)))
    expect(rowsOf(sectionOf(HELPER))).toHaveLength(2)

    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_SERVICE')).toHaveLength(1))
    const zero = {
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
    expect(callsOf(calls, 'CREATE_SERVICE')[0].variables.input.helperDeductionSetting).toEqual([
      { ...zero, helperDeductionType: 'onSales', type: '洗髮', nameList: ['1', '2'], peopleCount: 2, point: 1.5, isSplitted: false },
      { ...zero, helperDeductionType: 'onSalary', type: '吹整', nameList: ['1'], peopleCount: 1, designatePercent: 10, nonDesignatePercent: 5, isSplitted: false },
    ])
  })

  it('扣業績的互助從實業績預估扣除：金額／%數扣金額、點數另標示（負點數顯示為加點）；扣薪水的互助不扣', async () => {
    const { settle } = setup()
    await settle()
    fireEvent.change(controlByLabel('價格'), { target: { value: '1000' } })
    pick(controlByLabel('協助人員人數', helperRow(0)), '2')
    pick(controlByLabel('扣項方式', helperRow(0)), '依業績%數')
    fireEvent.change(controlByLabel('業績%數', helperRow(0)), { target: { value: '10' } }) // 10% × 2 人 = 200
    expect(summaryLines(DEFAULT_SECTION)[1]).toBe('實業績(含扣項、扣互助)預估:800')
    // 均分：只扣一次
    fireEvent.click(checkboxByLabel('互助均分', helperRow(0)))
    expect(checkboxByLabel('分指定/不指定', helperRow(0))).toBeDisabled()
    expect(summaryLines(DEFAULT_SECTION)[1]).toBe('實業績(含扣項、扣互助)預估:900')
    fireEvent.click(checkboxByLabel('互助均分', helperRow(0)))
    // 改依固定金額 分指定 50／80：取較大者 × 人數
    pick(controlByLabel('扣項方式', helperRow(0)), '依固定金額')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(0)))
    fireEvent.change(controlByLabel('指定固定金額', helperRow(0)), { target: { value: '50' } })
    fireEvent.change(controlByLabel('不指定固定金額', helperRow(0)), { target: { value: '80' } })
    expect(summaryLines(DEFAULT_SECTION)[1]).toBe('實業績(含扣項、扣互助)預估:840')
    // 點數：負點數顯示「+ N點」、正點數「- N點」
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(0)))
    pick(controlByLabel('扣項方式', helperRow(0)), '依點數')
    fireEvent.change(controlByLabel('點數', helperRow(0)), { target: { value: '-3' } })
    expect(summaryLines(DEFAULT_SECTION)[1]).toBe('實業績(含扣項、扣互助)預估:1,000 + 6點')
    fireEvent.change(controlByLabel('點數', helperRow(0)), { target: { value: '2' } })
    expect(summaryLines(DEFAULT_SECTION)[1]).toBe('實業績(含扣項、扣互助)預估:1,000 - 4點')
    // 扣薪水的互助不列入
    pick(controlByLabel('扣項類別', helperRow(0)), '扣薪水')
    expect(summaryLines(DEFAULT_SECTION)[1]).toBe('實業績(含扣項、扣互助)預估:1,000')
  })

  it('分指定的點數與固定金額欄位、單一欄位的固定金額都可輸入；輸入框捲動滑鼠時失焦', async () => {
    const { calls, settle } = setup()
    await settle()
    await fillBasics()
    pick(controlByLabel('扣項方式', helperRow(0)), '依固定金額')
    fireEvent.change(controlByLabel('固定金額', helperRow(0)), { target: { value: '120' } })
    const single = controlByLabel('固定金額', helperRow(0))
    single.focus()
    fireEvent.wheel(single)
    expect(document.activeElement).not.toBe(single)
    fireEvent.click(buttonIn(helperRow(0), '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRow(1)), '依點數')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRow(1)))
    fireEvent.change(controlByLabel('指定點數', helperRow(1)), { target: { value: '2' } })
    fireEvent.change(controlByLabel('不指定點數', helperRow(1)), { target: { value: '1' } })
    ;[controlByLabel('指定點數', helperRow(1)), controlByLabel('不指定點數', helperRow(1))].forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_SERVICE')).toHaveLength(1))
    const [first, second] = callsOf(calls, 'CREATE_SERVICE')[0].variables.input.helperDeductionSetting
    expect(first.cash).toBe(120)
    expect(second).toMatchObject({ designatePoint: 2, nonDesignatePoint: 1 })
  })
})

describe('新增服務項目：設定查詢失敗', () => {
  // Jason 2026/10/22：第三方卡券查詢失敗時以空清單處理，綁定選單只剩「無」，頁面正常
  it('第三方卡券查詢失敗時頁面正常，綁定選單只有「無」', async () => {
    const { settle } = setup({ FETCH_THIRDPARTYS: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect([...controlByLabel('綁定第三方卡券').options].map(o => o.textContent)).toEqual(['無'])
  })

  // Jason 2026/10/22：抽成方式查詢失敗時扣項以空清單處理（沒有扣項卡），頁面正常且可送出
  it('抽成方式查詢失敗時頁面正常（沒有扣項卡），可送出', async () => {
    const { calls, settle } = setup({ MERCHANT_COMMISSION_WAY: new Error('x') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByText(DEFAULT_SECTION)).toBeNull()
    await fillBasics()
    fireEvent.click(submitButton())
    await wait(() => expect(callsOf(calls, 'CREATE_SERVICE')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_SERVICE')[0].variables.input.ServiceDeductionItems).toEqual([])
  })

  it('顧客分類、互助類別、服務類別查詢失敗時頁面仍可顯示並送出（販售設定為空、類別選單只有提示）', async () => {
    const { calls, settle } = setup({
      CUSTOMER_CATEGORY: new Error('x'),
      MERCHANT_HELPER_ITEMS: new Error('x'),
      ServiceCategories: new Error('x'),
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    // 未選時欄位顯示「請選擇…」（Jason 2026/10/30 決定），隱藏 select 因此多一個不可選的空白未選項（hidden），不算選項
    expect([...controlByLabel('服務類別').options].filter(o => !o.hidden).map(o => o.textContent)).toEqual(['選擇服務類別'])
    expect([...controlByLabel('類別', rowsOf(sectionOf('互助點數設定'))[0]).options].map(o => o.textContent)).toEqual([''])
    expect(submitButton()).toBeDisabled()
    expect(callsOf(calls, 'CREATE_SERVICE')).toHaveLength(0)
  })
})
