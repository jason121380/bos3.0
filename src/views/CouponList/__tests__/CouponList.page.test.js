// 保護「預收卡設定」（卡券列表）：
// - 列表欄位（代號、類別／無類別、名稱、價格與次數千分位、業績入帳模式、變更者、扣項／互助「無設定」、上架狀態、變更日期）與報表匯出內容
// - 篩選：點服務類別送出 categoryIds、清除送空陣列
// - 勾選：全選只選啟用中的卡券、停用的不可勾；刪除：開啟刪除密碼時先輸入密碼（可取消），未開啟直接送出；成功後重抓、清除勾選
// - 批次上架狀態：送 UPDATE_SERVICES_LAUNCGED_STATUS（勾選的 id 與布林狀態）；批次互助／扣項：確認「會覆蓋原先設定」後才送出
// - 卡券列表查詢失敗時的行為
// GraphQL 全由 MockedProvider（testkit 的模擬 link）回應，不連後端、不改真實資料。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import {
  controlByLabel,
  controlsByLabel,
  pick,
  selectedText,
  checkboxByLabel,
  rowsUnderHeading,
  buttonIn,
  fillDeductionRow,
  addDeductionRow,
} from '../../ServiceCreate/__tests__/itemFormKit.test'
import CouponList from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const coupon = (overrides = {}) => ({
  id: 't1',
  no: 'T01',
  name: '護髮十次卡',
  price: 12000,
  ticketAvailableCount: 1000,
  isTicketCountNow: false,
  // 台灣時間 2026/10/1 00:30（UTC 為 9/30）
  updatedAt: new Date(2026, 9, 1, 0, 30).getTime(),
  isUsing: true,
  remark: '',
  ticketDeductionCount: 2,
  helperDeductionCount: 1,
  creator: { id: 'u1', name: '店長' },
  isLocked: 'UNSET',
  ServiceCategory: { name: '護髮' },
  performanceCalculationMode: 'SELLING',
  isLaunched: true,
  ...overrides,
})
const COUPONS = [
  coupon(),
  coupon({
    id: 't2',
    no: 'T02',
    name: '染髮三次卡',
    price: 3000,
    ticketAvailableCount: 3,
    ticketDeductionCount: 0,
    helperDeductionCount: 0,
    creator: null,
    ServiceCategory: null,
    performanceCalculationMode: 'USING',
    isLaunched: false,
  }),
  coupon({ id: 't3', no: 'T03', name: '舊卡', isUsing: false, performanceCalculationMode: 'USINGSAVEDEDUCT' }),
  coupon({ id: 't4', no: 'T04', name: '未知模式卡', performanceCalculationMode: 'OTHER' }),
]

const fixtures = ({ passwordOn = true, ...overrides } = {}) => ({
  GET_TICKETS_FOR_LIST: { ticketsForList: COUPONS },
  ServiceCategories: { serviceCategories: [{ id: 'c1', no: 'C1', name: '護髮' }, { id: 'c2', no: 'C2', name: '染髮' }] },
  MERCHANT_COMMISSION_WAY: { merchantCommissionWay: [{ id: 'cw-1', name: '系統預設' }, { id: 'cw-2', name: '設計師抽成' }] },
  MERCHANT_HELPER_ITEMS: { merchantHelperItems: [{ type: '洗髮', name: '洗髮' }, { type: '吹整', name: '吹整' }] },
  MERCHANT_DEDUCTION_ITEMS: { merchantDeductionItems: [] },
  GET_MERCHANT_PASSWORD: { merchantPassword: { deleteService: { password: '', isUsing: passwordOn } } },
  DEL_COUPONS: { deleteService: true },
  UPDATE_SERVICES_LAUNCGED_STATUS: { updateServicesLaunchedStatus: true },
  SET_BATCH_SETTING_FOR_HELPER: { batchSettingForHelper: true },
  SET_BATCH_SETTING_FOR_DEDUCTION: { batchSettingForDeduction: true },
  ...overrides,
})
const setup = options => renderPage(<CouponList />, { fixtures: fixtures(options), route: '/coupons' })
const ready = async settle => {
  await screen.findByText('共 4 筆')
  await settle()
}
const row = name => screen.getByText(name).closest('tr')
const barButton = text => within(screen.getByRole('toolbar', { hidden: true })).getByText(text, { selector: 'button, button *' })
const confirmWarning = async key => {
  const call = openSnackbar.mock.calls.find(([arg]) => arg.groupEdit)
  expect(call[0]).toMatchObject({ message: '您確定要批次編緝?，此步驟將會覆蓋原先設定', variant: 'error', disableHide: true, groupEdit: true })
  await act(async () => {
    call[0][key]()
  })
  return call[0]
}

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('預收卡設定：列表與匯出', () => {
  it('列出卡券欄位：類別、價格與次數千分位、業績入帳模式、變更者、無設定提醒、上架狀態、台灣日期', async () => {
    const { settle } = setup()
    await ready(settle)
    const first = within(row('護髮十次卡'))
    expect(first.getByText('護髮')).toBeInTheDocument()
    expect(first.getByText('12,000')).toBeInTheDocument()
    expect(first.getByText('1,000')).toBeInTheDocument()
    expect(first.getByText('販賣時入業績')).toBeInTheDocument()
    expect(first.getByText('店長')).toBeInTheDocument()
    expect(first.getByText('上架')).toBeInTheDocument()
    expect(first.getByText('2026/10/01')).toBeInTheDocument()
    const second = within(row('染髮三次卡'))
    expect(second.getByText('無類別')).toBeInTheDocument()
    expect(second.getByText('使用時入業績')).toBeInTheDocument()
    expect(second.getAllByText('無設定')).toHaveLength(2)
    second.getAllByText('無設定').forEach(el => expect(el).toHaveClass('text-danger'))
    expect(second.getByText('下架')).toBeInTheDocument()
    expect(within(row('舊卡')).getByText('使用時入業績（扣項依販賣時設定）')).toBeInTheDocument()
    expect(screen.getByLabelText('選取 舊卡')).toBeDisabled()
    expect(within(row('舊卡')).getByLabelText('編輯卡券')).toHaveAttribute('aria-disabled', 'true')
    expect(within(row('護髮十次卡')).getByLabelText('編輯卡券')).toHaveAttribute('href', '/coupon/edit/t1')
  })

  it('報表匯出內容（業績模式只分販賣時／使用時）', async () => {
    const { settle } = setup()
    await ready(settle)
    const link = screen.getByText('報表匯出').closest('a')
    expect(link).toHaveAttribute('download', '卡券列表.csv')
    const csv = decodeURIComponent(link.getAttribute('href'))
    expect(csv).toContain('"代號","類別","名稱","參考價格","可使用次數","業績","變更者","扣項設定數量","互助設定數量","上架狀態","變更時間"')
    expect(csv).toContain('"T01","護髮","護髮十次卡","12000","1000","販賣時入業績","店長","2","1","上架","2026/10/01"')
    expect(csv).toContain('"T02","無類別","染髮三次卡","3000","3","使用時入業績","","無設定","無設定","下架","2026/10/01"')
  })

  it('篩選：點服務類別送出 categoryIds、清除送空陣列', async () => {
    const { calls, settle } = setup()
    await ready(settle)
    fireEvent.click(screen.getByText('篩選', { selector: 'button, button *' }))
    fireEvent.click(screen.getByText('染髮', { selector: 'button' }))
    await wait(() => expect(callsOf(calls, 'GET_TICKETS_FOR_LIST').some(c => c.variables.categoryIds[0] === 'c2')).toBe(true))
    expect(screen.getByText('染髮', { selector: 'button' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('護髮', { selector: 'button' })).toHaveAttribute('aria-pressed', 'false')
    await settle()
    fireEvent.click(screen.getByText('清除', { selector: 'button' }))
    await wait(() => expect(callsOf(calls, 'GET_TICKETS_FOR_LIST').slice(-1)[0].variables).toEqual({ keyword: '', categoryIds: [] }))
  })

  // 已知缺口（待 Jason 決定）：卡券列表查詢失敗時 coupons 被設成 undefined，表頭讀 coupons.length 拋錯（CouponList/index.js:36、Results.js:358）
  it('卡券列表查詢失敗時整頁進入錯誤畫面（鎖住目前行為）', async () => {
    const { settle } = setup({ GET_TICKETS_FOR_LIST: new Error('壞了') })
    await settle()
    expect(screen.getByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })
})

describe('預收卡設定：勾選與刪除', () => {
  it('全選只選啟用中的卡券；單筆可取消', async () => {
    const { settle } = setup()
    await ready(settle)
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText('已選 3 筆')).toBeInTheDocument()
    expect(screen.getByLabelText('選取 舊卡')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 護髮十次卡'))
    expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
  })

  it('全部啟用時全選再按一次全部取消', async () => {
    const { settle } = setup({ GET_TICKETS_FOR_LIST: { ticketsForList: COUPONS.slice(0, 2) } })
    await screen.findByText('共 2 筆')
    await settle()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('全選')).toBeChecked()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('選取 護髮十次卡')).not.toBeChecked()
  })

  it('開啟刪除密碼：先輸入密碼（可取消），確認後送出勾選的卡券與密碼，成功後重抓並清除勾選', async () => {
    const { calls, settle } = setup()
    await ready(settle)
    fireEvent.click(screen.getByLabelText('選取 染髮三次卡'))
    fireEvent.click(barButton('刪除'))
    fireEvent.click(await screen.findByText('取消', { selector: 'button' }))
    await wait(() => expect(screen.queryByTestId('delete-password')).toBeNull())
    fireEvent.click(barButton('刪除'))
    fireEvent.keyDown(await screen.findByTestId('delete-password'), { key: 'Escape' })
    await wait(() => expect(screen.queryByTestId('delete-password')).toBeNull())
    expect(callsOf(calls, 'DEL_COUPONS')).toHaveLength(0)
    fireEvent.click(barButton('刪除'))
    fireEvent.change(await screen.findByTestId('delete-password'), { target: { value: 'pw' } })
    const fetches = callsOf(calls, 'GET_TICKETS_FOR_LIST').length
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除卡券', variant: 'success' }))
    expect(callsOf(calls, 'DEL_COUPONS')[0].variables).toEqual({ itemIds: ['t2'], password: 'pw' })
    await wait(() => expect(callsOf(calls, 'GET_TICKETS_FOR_LIST').length).toBeGreaterThan(fetches))
    expect(screen.getByLabelText('選取 染髮三次卡')).not.toBeChecked()
  })

  it('未開啟刪除密碼：按刪除直接送出（密碼為空字串）', async () => {
    const { calls, settle } = setup({ passwordOn: false })
    await ready(settle)
    fireEvent.click(screen.getByLabelText('選取 護髮十次卡'))
    fireEvent.click(barButton('刪除'))
    await wait(() => expect(callsOf(calls, 'DEL_COUPONS')).toHaveLength(1))
    expect(callsOf(calls, 'DEL_COUPONS')[0].variables).toEqual({ itemIds: ['t1'], password: '' })
  })
})

describe('預收卡設定：其他狀態', () => {
  it('沒有目前店家時列表仍可顯示', async () => {
    loginAs({ merchant: null })
    const { settle } = setup()
    await ready(settle)
    expect(screen.getByText('護髮十次卡')).toBeInTheDocument()
  })

  it('抽成方式尚未回來時開關扣項彈窗不會壞（回來後才產生扣項）', async () => {
    const utils = renderPage(<CouponList />, { fixtures: fixtures(), route: '/coupons', delays: { MERCHANT_COMMISSION_WAY: 1500 } })
    await screen.findByText('共 4 筆')
    fireEvent.click(screen.getByLabelText('選取 護髮十次卡'))
    fireEvent.click(barButton('編輯項目扣項'))
    await screen.findByText('扣項項目設定')
    fireEvent.click(screen.getByText('關閉', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('扣項項目設定')).toBeNull())
    await utils.settle()
    fireEvent.click(screen.getByLabelText('選取 護髮十次卡'))
    fireEvent.click(barButton('編輯項目扣項'))
    expect(await screen.findByText('項目扣項設定 - 系統預設')).toBeInTheDocument()
  })
})

describe('預收卡設定：批次上架狀態', () => {
  const open = async options => {
    const utils = setup(options)
    await ready(utils.settle)
    fireEvent.click(screen.getByLabelText('選取 護髮十次卡'))
    fireEvent.click(screen.getByLabelText('選取 染髮三次卡'))
    fireEvent.click(barButton('編輯上架狀態'))
    await screen.findByText('卡券上架狀態設定')
    return utils
  }
  const statusSelect = () => screen.getByRole('dialog').querySelector('select')

  it('選下架後儲存：送出勾選的 id 與 status=false，成功後重抓、清除勾選', async () => {
    const { calls } = await open()
    expect(selectedText(statusSelect())).toBe('上架')
    pick(statusSelect(), '下架')
    const fetches = callsOf(calls, 'GET_TICKETS_FOR_LIST').length
    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '變更上架狀態成功', variant: 'success' }))
    expect(callsOf(calls, 'UPDATE_SERVICES_LAUNCGED_STATUS')[0].variables).toEqual({ input: { ids: ['t1', 't2'], status: false } })
    await wait(() => expect(callsOf(calls, 'GET_TICKETS_FOR_LIST').length).toBeGreaterThan(fetches))
    await wait(() => expect(screen.getByLabelText('選取 護髮十次卡')).not.toBeChecked())
  })

  it('關閉鈕關閉彈窗、不送出', async () => {
    const { calls } = await open()
    fireEvent.click(screen.getByText('關閉', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('卡券上架狀態設定')).toBeNull())
    expect(callsOf(calls, 'UPDATE_SERVICES_LAUNCGED_STATUS')).toHaveLength(0)
  })

  it('送出失敗顯示錯誤；按 Esc 關閉彈窗', async () => {
    await open({ UPDATE_SERVICES_LAUNCGED_STATUS: new Error('狀態更新失敗') })
    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '狀態更新失敗', variant: 'error' }))
    fireEvent.keyDown(statusSelect(), { key: 'Escape' })
    await wait(() => expect(screen.queryByText('卡券上架狀態設定')).toBeNull())
  })
})

describe('預收卡設定：批次互助與扣項', () => {
  const helperRows = () => controlsByLabel('扣項類別').map(sel => sel.closest('.flex-wrap'))
  const openHelper = async options => {
    const utils = setup(options)
    await ready(utils.settle)
    fireEvent.click(screen.getByLabelText('選取 護髮十次卡'))
    fireEvent.click(barButton('編輯互助點數'))
    await screen.findByText('互助點數設定')
    return utils
  }

  it('互助：編輯後確認才送出勾選的卡券與設定（數字、去掉畫面用欄位），成功後關閉並清除勾選', async () => {
    const { calls } = await openHelper()
    pick(controlByLabel('類別', helperRows()[0]), '洗髮')
    pick(controlByLabel('協助人員人數', helperRows()[0]), '2')
    pick(controlByLabel('扣項方式', helperRows()[0]), '依點數')
    fireEvent.change(controlByLabel('點數', helperRows()[0]), { target: { value: '1.5' } })
    fireEvent.click(checkboxByLabel('互助均分', helperRows()[0]))
    fireEvent.click(buttonIn(helperRows()[0], '新增互助設定'))
    pick(controlByLabel('扣項類別', helperRows()[1]), '扣薪水')
    pick(controlByLabel('扣項方式', helperRows()[1]), '依固定金額')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRows()[1]))
    fireEvent.change(controlByLabel('指定固定金額', helperRows()[1]), { target: { value: '80' } })
    fireEvent.change(controlByLabel('不指定固定金額', helperRows()[1]), { target: { value: '60' } })
    fireEvent.click(buttonIn(helperRows()[1], '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRows()[2]), '依業績%數')
    fireEvent.change(controlByLabel('業績%數', helperRows()[2]), { target: { value: '7' } })
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRows()[2]))
    fireEvent.change(controlByLabel('指定業績%數', helperRows()[2]), { target: { value: '4' } })
    fireEvent.change(controlByLabel('不指定業績%數', helperRows()[2]), { target: { value: '2' } })
    fireEvent.click(buttonIn(helperRows()[2], '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRows()[3]), '依點數')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRows()[3]))
    fireEvent.change(controlByLabel('指定點數', helperRows()[3]), { target: { value: '2.5' } })
    fireEvent.change(controlByLabel('不指定點數', helperRows()[3]), { target: { value: '0.5' } })
    fireEvent.click(buttonIn(helperRows()[3], '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRows()[4]), '依固定金額')
    fireEvent.change(controlByLabel('固定金額', helperRows()[4]), { target: { value: '30' } })
    fireEvent.click(buttonIn(helperRows()[4], '清除此互助設定'))
    fireEvent.click(buttonIn(helperRows()[4], '刪除此互助設定'))
    // 多列時只改該列
    pick(controlByLabel('類別', helperRows()[1]), '吹整')
    pick(controlByLabel('協助人員人數', helperRows()[1]), '1')
    pick(controlByLabel('扣項類別', helperRows()[0]), '扣業績')
    fireEvent.click(checkboxByLabel('互助均分', helperRows()[0]))
    fireEvent.click(checkboxByLabel('互助均分', helperRows()[0]))
    expect(checkboxByLabel('互助均分', helperRows()[2])).not.toBeChecked()
    ;[controlByLabel('點數', helperRows()[0]), controlByLabel('指定點數', helperRows()[3]), controlByLabel('不指定點數', helperRows()[3])].forEach(field => {
      // 彈窗（Radix Dialog）的焦點鎖在 jsdom 會把焦點拉回輸入框，這裡不驗證失焦，只確認捲動不改數值
      const before = field.value
      field.focus()
      fireEvent.wheel(field)
      expect(field.value).toBe(before)
    })
    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_HELPER')).toHaveLength(0)
    const warning = await confirmWarning('handleSubmitHelperDeductionSetting')
    expect(warning.serviceHelperGroupEdit).toBe(true)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '批次卡券互助修改完成' }))
    const sent = callsOf(calls, 'SET_BATCH_SETTING_FOR_HELPER')[0].variables.input
    expect(sent.ids).toEqual(['t1'])
    expect(sent.helperDeductionSetting).toHaveLength(4)
    expect(sent.helperDeductionSetting[0]).toMatchObject({ type: '洗髮', nameList: ['1', '2'], peopleCount: 2, point: 1.5, isSplitted: true })
    expect(sent.helperDeductionSetting[1]).toMatchObject({ helperDeductionType: 'onSalary', type: '吹整', nameList: ['1'], peopleCount: 1, designateCash: 80, nonDesignateCash: 60 })
    expect(sent.helperDeductionSetting[2]).toMatchObject({ percent: 0, designatePercent: 4, nonDesignatePercent: 2 })
    expect(sent.helperDeductionSetting[3]).toMatchObject({ designatePoint: 2.5, nonDesignatePoint: 0.5 })
    sent.helperDeductionSetting.forEach(s => {
      expect(s).not.toHaveProperty('deductionWay')
      expect(s).not.toHaveProperty('isDesignate')
    })
    await wait(() => expect(screen.queryByText('互助點數設定')).toBeNull())
    expect(screen.getByLabelText('選取 護髮十次卡')).not.toBeChecked()
  })

  // 已知缺口（待 Jason 決定）：批次送出失敗時以 err.msg 提示（CouponList/Results.js:225、300），Apollo 錯誤沒有 msg，訊息為 undefined
  it('互助送出失敗時提示（訊息為 undefined）；關閉彈窗清除勾選', async () => {
    await openHelper({ SET_BATCH_SETTING_FOR_HELPER: new Error('失敗') })
    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    await confirmWarning('handleSubmitHelperDeductionSetting')
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: undefined }))
    fireEvent.click(screen.getByText('關閉', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('互助點數設定')).toBeNull())
    expect(screen.getByLabelText('選取 護髮十次卡')).not.toBeChecked()
  })

  const SECTION = '項目扣項設定 - 系統預設'
  const OTHER = '項目扣項設定 - 設計師抽成'
  const opts = { getRows: rowsUnderHeading, wayLabel: '抽成方式' }
  const openDeduction = async options => {
    const utils = setup(options)
    await ready(utils.settle)
    fireEvent.click(screen.getByLabelText('選取 染髮三次卡'))
    fireEvent.click(barButton('編輯項目扣項'))
    await screen.findByText('扣項項目設定')
    return utils
  }

  it('扣項：編輯後確認才送出勾選的卡券與扣項，成功後關閉並清除勾選', async () => {
    const { calls } = await openDeduction()
    fillDeductionRow(SECTION, 0, { way: '依業績%數', price: 10 }, opts)
    addDeductionRow(SECTION, opts)
    fillDeductionRow(SECTION, 1, { type: '扣業績', way: '依固定金額', special: true, designate: 50, nonDesignate: 30, ref: '1' }, opts)
    fireEvent.click(buttonIn(rowsUnderHeading(SECTION)[0], '新增扣項'))
    fillDeductionRow(SECTION, 2, { type: '扣薪水' }, opts)
    expect(buttonIn(rowsUnderHeading(SECTION)[2], '刪除此扣項')).toBeNull()
    fillDeductionRow(SECTION, 2, { type: '扣業績' }, opts)
    fireEvent.click(buttonIn(rowsUnderHeading(SECTION)[2], '刪除此扣項'))
    fillDeductionRow(OTHER, 0, { type: '扣薪水', way: '依業績%數', special: true, designate: 3, nonDesignate: 2 }, opts)
    fireEvent.click(checkboxByLabel('分指定/不指定', rowsUnderHeading(OTHER)[0]))
    fillDeductionRow(OTHER, 0, { way: '依固定金額', price: 99 }, opts)
    ;[controlByLabel('固定金額', rowsUnderHeading(OTHER)[0]), controlByLabel('指定金額', rowsUnderHeading(SECTION)[1]), controlByLabel('不指定金額', rowsUnderHeading(SECTION)[1])].forEach(field => {
      // 彈窗（Radix Dialog）的焦點鎖在 jsdom 會把焦點拉回輸入框，這裡不驗證失焦，只確認捲動不改數值
      const before = field.value
      field.focus()
      fireEvent.wheel(field)
      expect(field.value).toBe(before)
    })
    fireEvent.click(buttonIn(rowsUnderHeading(OTHER)[0], '清除此扣項'))
    expect(selectedText(controlByLabel('扣項類別', rowsUnderHeading(OTHER)[0]))).toBe('扣業績')
    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_DEDUCTION')).toHaveLength(0)
    await confirmWarning('handleSubmitDeductionSetting')
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '批次卡券扣項修改完成' }))
    const base = { isSpecial: false, name: '材料費', type: 'onSales', deductionWay: '', price: 0, designatePrice: 0, nonDesignatePrice: 0, deductionOrder: 1, deductionReference: 0 }
    expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_DEDUCTION')[0].variables).toEqual({
      input: {
        ids: ['t2'],
        serviceDeductionItems: [
          {
            type: '系統預設',
            itemSettings: [
              { ...base, deductionWay: '扣趴數', price: 10 },
              { ...base, deductionWay: '扣固定金額', isSpecial: true, designatePrice: 50, nonDesignatePrice: 30, deductionOrder: 2, deductionReference: 1 },
            ],
          },
          { type: '設計師抽成', itemSettings: [base] },
        ],
      },
    })
    await wait(() => expect(screen.queryByText('扣項項目設定')).toBeNull())
  })

  it('扣項送出失敗時提示（訊息為 undefined）；關閉彈窗清除勾選並還原預設扣項', async () => {
    await openDeduction({ SET_BATCH_SETTING_FOR_DEDUCTION: new Error('失敗') })
    fillDeductionRow(SECTION, 0, { way: '依業績%數', price: 10 }, opts)
    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    await confirmWarning('handleSubmitDeductionSetting')
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: undefined }))
    fireEvent.click(screen.getByText('關閉', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('扣項項目設定')).toBeNull())
    expect(screen.getByLabelText('選取 染髮三次卡')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 染髮三次卡'))
    fireEvent.click(barButton('編輯項目扣項'))
    await screen.findByText('扣項項目設定')
    expect(controlByLabel('業績%數', rowsUnderHeading(SECTION)[0])).toHaveValue(0)
  })
})
