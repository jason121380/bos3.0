// 保護「服務項目設定」列表的勾選、分頁、匯出與批次編輯：
// - 全選只選啟用中的服務（全選框以可選取筆數判斷）、再按一次全部取消；單筆勾選可取消
// - 刪除密碼對話框可取消；刪除成功後提示、重抓列表、清除勾選
// - 分頁：換頁送出 pageOffset、改每頁筆數送出 pageLimit 並把頁碼歸 0（並重抓）
// - 報表匯出內容（代號、名稱、類別、價格、扣項／互助數量「無扣項／無設定」、變更日期以台灣時間）
// - 批次編輯互助點數／項目扣項：先跳「會覆蓋原先設定」確認，確認後才送 SET_BATCH_SETTING_FOR_HELPER／_FOR_DEDUCTION，
//   送出的是勾選的服務 id 與彈窗內的設定（互助去掉畫面用的 deductionWay／isDesignate）；關閉彈窗清除勾選
// - 服務列表查詢失敗時不整頁壞
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
  sectionOf,
  rowsOf,
  buttonIn,
  fillDeductionRow,
  addDeductionRow,
} from '../../ServiceCreate/__tests__/itemFormKit.test'
import Services from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const service = (overrides = {}) => ({
  id: 's1',
  no: 'S01',
  name: '精緻剪髮',
  price: 1200,
  isUsing: true,
  serviceDeductionCount: 2,
  helperDeductionCount: 1,
  serviceCategory: { id: 'c1', name: '剪髮' },
  helperDeductionSetting: [],
  bindedThirdPartTicket: null,
  isBindedThirdPartTicketLocked: false,
  // 台灣時間 2026/10/1 00:30（UTC 為 9/30）：匯出日期要是 10/01
  updatedAt: new Date(2026, 9, 1, 0, 30).getTime(),
  isLocked: false,
  isNoCash: false,
  ...overrides,
})

const SERVICES = [
  service(),
  service({ id: 's2', no: 'S02', name: '頭皮護理', price: 2500, serviceDeductionCount: 0, helperDeductionCount: 0, serviceCategory: null }),
  service({ id: 's3', no: 'S03', name: '舊方案', isUsing: false }),
]

const fixtures = (overrides = {}) => ({
  FETCH_SERVICES: v => ({
    services: { totalCount: 120, pageOffset: v.input.pageOffset, pageLimit: v.input.pageLimit, data: SERVICES },
  }),
  ServiceCategories: { serviceCategories: [{ id: 'c1', no: 'C1', name: '剪髮' }] },
  MERCHANT_COMMISSION_WAY: {
    merchantCommissionWay: [
      { id: 'cw-1', name: '系統預設' },
      { id: 'cw-2', name: '設計師抽成' },
    ],
  },
  MERCHANT_HELPER_ITEMS: {
    merchantHelperItems: [
      { type: '洗髮', name: '洗髮' },
      { type: '吹整', name: '吹整' },
    ],
  },
  MERCHANT_DEDUCTION_ITEMS: { merchantDeductionItems: [] },
  GET_MERCHANT_PASSWORD: { merchantPassword: { deleteService: { password: '', isUsing: true } } },
  DEL_COUPONS: { deleteService: true },
  SET_BATCH_SETTING_FOR_HELPER: { batchSettingForHelper: true },
  SET_BATCH_SETTING_FOR_DEDUCTION: { batchSettingForDeduction: true },
  ...overrides,
})

const setup = overrides => renderPage(<Services />, { fixtures: fixtures(overrides), route: '/services' })
const ready = async settle => {
  await screen.findByText('共 120 筆')
  await settle()
}
const toolbar = () => screen.getByRole('toolbar', { hidden: true })
const barButton = text => within(toolbar()).getByText(text, { selector: 'button, button *' })
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

describe('服務項目設定：勾選與刪除', () => {
  it('全選只選啟用中的服務；再按一次全部取消；單筆可取消勾選', async () => {
    const { settle } = setup()
    await ready(settle)
    const all = screen.getByLabelText('全選')
    fireEvent.click(all)
    expect(screen.getByLabelText('選取 精緻剪髮')).toBeChecked()
    expect(screen.getByLabelText('選取 頭皮護理')).toBeChecked()
    expect(screen.getByLabelText('選取 舊方案')).not.toBeChecked()
    expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('選取 頭皮護理'))
    expect(screen.getByText('已選 1 筆')).toBeInTheDocument()
    // Jason 2026/10/22：全選框以「可選取（啟用中）的筆數」判斷，含停用服務時全選後全選框為勾選，再按一次全部取消
    fireEvent.click(all)
    expect(all).toBeChecked()
    expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
    fireEvent.click(all)
    expect(all).not.toBeChecked()
    expect(screen.getByLabelText('選取 精緻剪髮')).not.toBeChecked()
    expect(screen.getByLabelText('選取 頭皮護理')).not.toBeChecked()
  })

  it('全部都是啟用中的服務時，全選框可勾選並再按一次全部取消', async () => {
    const { settle } = setup({
      FETCH_SERVICES: { services: { totalCount: 120, pageOffset: 0, pageLimit: 50, data: SERVICES.slice(0, 2) } },
    })
    await ready(settle)
    const all = screen.getByLabelText('全選')
    fireEvent.click(all)
    expect(all).toBeChecked()
    fireEvent.click(all)
    expect(all).not.toBeChecked()
    expect(screen.getByLabelText('選取 精緻剪髮')).not.toBeChecked()
  })

  it('沒有服務時全選框停用', async () => {
    const { settle } = setup({ FETCH_SERVICES: { services: { totalCount: 0, pageOffset: 0, pageLimit: 50, data: [] } } })
    await screen.findByText('共 0 筆')
    await settle()
    expect(screen.getByLabelText('全選')).toBeDisabled()
  })

  it('刪除密碼對話框可取消（不送出）；確認刪除成功後提示、重抓列表、清除勾選', async () => {
    const { calls, settle } = setup()
    await ready(settle)
    fireEvent.click(screen.getByLabelText('選取 精緻剪髮'))
    fireEvent.click(barButton('刪除'))
    fireEvent.click(await screen.findByText('取消', { selector: 'button' }))
    await wait(() => expect(screen.queryByTestId('delete-password')).toBeNull())
    expect(callsOf(calls, 'DEL_COUPONS')).toHaveLength(0)
    fireEvent.click(barButton('刪除'))
    fireEvent.change(await screen.findByTestId('delete-password'), { target: { value: 'pw' } })
    const fetches = callsOf(calls, 'FETCH_SERVICES').length
    fireEvent.click(screen.getByTestId('confirm'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除服務', variant: 'success' }))
    expect(callsOf(calls, 'DEL_COUPONS')[0].variables).toEqual({ itemIds: ['s1'], password: 'pw' })
    await wait(() => expect(callsOf(calls, 'FETCH_SERVICES').length).toBeGreaterThan(fetches))
    expect(screen.getByLabelText('選取 精緻剪髮')).not.toBeChecked()
  })
})

describe('服務項目設定：其他狀態', () => {
  it('刪除密碼對話框按 Esc 關閉、不送出', async () => {
    const { calls, settle } = setup()
    await ready(settle)
    fireEvent.click(screen.getByLabelText('選取 精緻剪髮'))
    fireEvent.click(barButton('刪除'))
    const pwd = await screen.findByTestId('delete-password')
    fireEvent.keyDown(pwd, { key: 'Escape' })
    await wait(() => expect(screen.queryByTestId('delete-password')).toBeNull())
    expect(callsOf(calls, 'DEL_COUPONS')).toHaveLength(0)
  })

  it('沒有目前店家（localStorage 無 userMerchant）時列表仍可顯示', async () => {
    loginAs({ merchant: null })
    const { settle } = setup()
    await ready(settle)
    expect(screen.getByText('精緻剪髮')).toBeInTheDocument()
  })

  it('抽成方式尚未回來時開關扣項彈窗不會壞（回來後才產生扣項）', async () => {
    const utils = renderPage(<Services />, { fixtures: fixtures(), route: '/services', delays: { MERCHANT_COMMISSION_WAY: 1500 } })
    await screen.findByText('共 120 筆')
    fireEvent.click(screen.getByLabelText('選取 精緻剪髮'))
    fireEvent.click(barButton('編輯項目扣項'))
    await screen.findByText('扣項項目設定')
    fireEvent.click(screen.getByText('關閉', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('扣項項目設定')).toBeNull())
    await utils.settle()
    fireEvent.click(screen.getByLabelText('選取 精緻剪髮'))
    fireEvent.click(barButton('編輯項目扣項'))
    expect(await screen.findByText('項目扣項設定 - 系統預設')).toBeInTheDocument()
  })
})

describe('服務項目設定：分頁與匯出', () => {
  it('換頁送出 pageOffset、改每頁筆數送出 pageLimit', async () => {
    const { calls, settle } = setup()
    await ready(settle)
    expect(callsOf(calls, 'FETCH_SERVICES')[0].variables.input).toEqual({ pageLimit: 50, pageOffset: 0, keyword: '', categoryIds: [] })
    fireEvent.click(screen.getByLabelText('下一頁'))
    await wait(() => expect(callsOf(calls, 'FETCH_SERVICES').some(c => c.variables.input.pageOffset === 1)).toBe(true))
    await settle()
    pick(screen.getByLabelText('每頁筆數'), '25')
    await wait(() => expect(callsOf(calls, 'FETCH_SERVICES').some(c => c.variables.input.pageLimit === 25)).toBe(true))
    // Jason 2026/10/22：改每頁筆數時頁碼歸 0
    expect(callsOf(calls, 'FETCH_SERVICES').find(c => c.variables.input.pageLimit === 25).variables.input.pageOffset).toBe(0)
  })

  it('報表匯出：代號、名稱、類別、參考價格、扣項／互助數量（0 顯示無扣項／無設定）、變更時間（台灣日期）', async () => {
    const { settle } = setup()
    await ready(settle)
    const link = screen.getByText('報表匯出').closest('a')
    expect(link).toHaveAttribute('download', '服務項目.csv')
    const csv = decodeURIComponent(link.getAttribute('href'))
    expect(csv).toContain('"代號","名稱","類別","參考價格","扣項設定數量","互助設定數量","變更時間"')
    expect(csv).toContain('"S01","精緻剪髮","剪髮","1200","2","1","2026/10/01"')
    expect(csv).toContain('"S02","頭皮護理","","2500","無扣項","無設定","2026/10/01"')
  })

  it('服務列表查詢失敗時不整頁壞（不顯示表格）', async () => {
    const { settle } = setup({ FETCH_SERVICES: new Error('壞了') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('服務項目設定', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.queryByText('所有營業服務')).toBeNull()
  })
})

describe('服務項目設定：批次編輯互助點數', () => {
  const open = async () => {
    const utils = setup()
    await ready(utils.settle)
    fireEvent.click(screen.getByLabelText('選取 精緻剪髮'))
    fireEvent.click(screen.getByLabelText('選取 頭皮護理'))
    fireEvent.click(barButton('編輯互助點數'))
    await screen.findByText('互助點數設定')
    return utils
  }
  const helperRows = () => rowsOf(screen.getByText('互助點數設定').closest('[role="dialog"]').querySelector('.overflow-y-auto'))

  it('確認後才送出：勾選的服務 id 與互助設定（數字、去掉 deductionWay／isDesignate），成功後關閉並清除勾選', async () => {
    const { calls } = await open()
    // 第 1 列：扣業績、洗髮、2 人、依點數 1.5
    pick(controlByLabel('類別', helperRows()[0]), '洗髮')
    pick(controlByLabel('協助人員人數', helperRows()[0]), '2')
    pick(controlByLabel('扣項方式', helperRows()[0]), '依點數')
    fireEvent.change(controlByLabel('點數', helperRows()[0]), { target: { value: '1.5' } })
    // 第 2 列：扣薪水、吹整、1 人、依業績%數分指定 10／5
    fireEvent.click(buttonIn(helperRows()[0], '新增互助設定'))
    pick(controlByLabel('扣項類別', helperRows()[1]), '扣薪水')
    pick(controlByLabel('類別', helperRows()[1]), '吹整')
    pick(controlByLabel('協助人員人數', helperRows()[1]), '1')
    pick(controlByLabel('扣項方式', helperRows()[1]), '依業績%數')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRows()[1]))
    expect(controlByLabel('指定業績%數', helperRows()[1])).toHaveValue(0)
    fireEvent.change(controlByLabel('指定業績%數', helperRows()[1]), { target: { value: '10' } })
    fireEvent.change(controlByLabel('不指定業績%數', helperRows()[1]), { target: { value: '5' } })
    expect(controlByLabel('指定業績%數', helperRows()[1])).toHaveValue(10)
    expect(checkboxByLabel('互助均分', helperRows()[1])).toBeDisabled()
    // 第 3 列：依固定金額 均分 300，之後清除再刪除
    fireEvent.click(buttonIn(helperRows()[1], '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRows()[2]), '依固定金額')
    fireEvent.change(controlByLabel('固定金額', helperRows()[2]), { target: { value: '300' } })
    expect(controlByLabel('固定金額', helperRows()[2])).toHaveValue(300)
    fireEvent.click(checkboxByLabel('互助均分', helperRows()[2]))
    expect(checkboxByLabel('分指定/不指定', helperRows()[2])).toBeDisabled()
    fireEvent.click(buttonIn(helperRows()[2], '清除此互助設定'))
    expect(selectedText(controlByLabel('扣項方式', helperRows()[2]))).toBe('')
    fireEvent.click(buttonIn(helperRows()[2], '刪除此互助設定'))
    expect(helperRows()).toHaveLength(2)

    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_HELPER')).toHaveLength(0)
    const warning = await confirmWarning('handleSubmitHelperDeductionSetting')
    expect(warning.serviceHelperGroupEdit).toBe(true)
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '批次服務互助修改完成' }))
    const zero = {
      point: 0,
      cash: 0,
      percent: 0,
      designatePoint: 0,
      designateCash: 0,
      designatePercent: 0,
      nonDesignatePoint: 0,
      nonDesignateCash: 0,
      nonDesignatePercent: 0,
    }
    expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_HELPER')[0].variables).toEqual({
      input: {
        ids: ['s1', 's2'],
        helperDeductionSetting: [
          { ...zero, type: '洗髮', helperDeductionType: 'onSales', nameList: ['1', '2'], peopleCount: 2, point: 1.5, isSplitted: false },
          {
            ...zero,
            type: '吹整',
            helperDeductionType: 'onSalary',
            nameList: ['1'],
            peopleCount: 1,
            designatePercent: 10,
            nonDesignatePercent: 5,
            isSplitted: false,
          },
        ],
      },
    })
    await wait(() => expect(screen.queryByText('互助點數設定')).toBeNull())
    expect(screen.getByLabelText('選取 精緻剪髮')).not.toBeChecked()
  })

  it('分指定的點數、固定金額與單一欄位的業績%數都轉成數字；取消分指定時數值歸 0', async () => {
    const { calls } = await open()
    pick(controlByLabel('扣項方式', helperRows()[0]), '依點數')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRows()[0]))
    fireEvent.change(controlByLabel('指定點數', helperRows()[0]), { target: { value: '2.5' } })
    fireEvent.change(controlByLabel('不指定點數', helperRows()[0]), { target: { value: '1.5' } })
    expect(controlByLabel('指定點數', helperRows()[0])).toHaveValue(2.5)
    expect(controlByLabel('不指定點數', helperRows()[0])).toHaveValue(1.5)
    fireEvent.click(buttonIn(helperRows()[0], '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRows()[1]), '依固定金額')
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRows()[1]))
    fireEvent.change(controlByLabel('指定固定金額', helperRows()[1]), { target: { value: '80' } })
    fireEvent.change(controlByLabel('不指定固定金額', helperRows()[1]), { target: { value: '60' } })
    expect(controlByLabel('指定固定金額', helperRows()[1])).toHaveValue(80)
    expect(controlByLabel('不指定固定金額', helperRows()[1])).toHaveValue(60)
    fireEvent.click(buttonIn(helperRows()[1], '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRows()[2]), '依業績%數')
    fireEvent.change(controlByLabel('業績%數', helperRows()[2]), { target: { value: '7' } })
    expect(controlByLabel('業績%數', helperRows()[2])).toHaveValue(7)
    fireEvent.click(buttonIn(helperRows()[2], '新增互助設定'))
    pick(controlByLabel('扣項方式', helperRows()[3]), '依點數')
    fireEvent.change(controlByLabel('點數', helperRows()[3]), { target: { value: '4' } })
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRows()[3]))
    fireEvent.click(checkboxByLabel('分指定/不指定', helperRows()[3]))
    expect(controlByLabel('點數', helperRows()[3])).toHaveValue(0)
    // 數字欄位捲動滑鼠時失焦
    ;[controlByLabel('指定點數', helperRows()[0]), controlByLabel('不指定點數', helperRows()[0]), controlByLabel('業績%數', helperRows()[2])].forEach(
      field => {
        field.focus()
        fireEvent.wheel(field)
        expect(document.activeElement).not.toBe(field)
      }
    )
    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    await confirmWarning('handleSubmitHelperDeductionSetting')
    await wait(() => expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_HELPER')).toHaveLength(1))
    const sent = callsOf(calls, 'SET_BATCH_SETTING_FOR_HELPER')[0].variables.input.helperDeductionSetting
    expect(sent[0]).toMatchObject({ designatePoint: 2.5, nonDesignatePoint: 1.5 })
    expect(sent[1]).toMatchObject({ designateCash: 80, nonDesignateCash: 60 })
    expect(sent[2]).toMatchObject({ percent: 7 })
    expect(sent[3]).toMatchObject({ point: 0 })
    sent.forEach(s => {
      expect(s).not.toHaveProperty('deductionWay')
      expect(s).not.toHaveProperty('isDesignate')
    })
  })

  // Jason 2026/10/22：批次送出失敗時以 err.message 提示
  it('送出失敗時以錯誤訊息提示；彈窗不關閉', async () => {
    const utils = setup({ SET_BATCH_SETTING_FOR_HELPER: new Error('批次失敗') })
    await ready(utils.settle)
    fireEvent.click(screen.getByLabelText('選取 精緻剪髮'))
    fireEvent.click(barButton('編輯互助點數'))
    await screen.findByText('互助點數設定')
    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    await confirmWarning('handleSubmitHelperDeductionSetting')
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '批次失敗' }))
    expect(screen.getByText('互助點數設定')).toBeInTheDocument()
  })

  it('關閉彈窗：不送出、清除勾選，再開時是空白設定', async () => {
    const { calls } = await open()
    pick(controlByLabel('扣項方式', helperRows()[0]), '依點數')
    fireEvent.click(screen.getByText('關閉', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('互助點數設定')).toBeNull())
    expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_HELPER')).toHaveLength(0)
    expect(screen.getByLabelText('選取 精緻剪髮')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 精緻剪髮'))
    fireEvent.click(barButton('編輯互助點數'))
    await screen.findByText('互助點數設定')
    expect(selectedText(controlByLabel('扣項方式', helperRows()[0]))).toBe('')
  })
})

describe('服務項目設定：批次編輯項目扣項', () => {
  const SECTION = '項目扣項設定 - 系統預設'
  const OTHER = '項目扣項設定 - 設計師抽成'
  const opts = { getRows: rowsUnderHeading, wayLabel: '抽成方式' }
  const open = async overrides => {
    const utils = setup(overrides)
    await ready(utils.settle)
    fireEvent.click(screen.getByLabelText('選取 頭皮護理'))
    fireEvent.click(barButton('編輯項目扣項'))
    await screen.findByText('扣項項目設定')
    return utils
  }

  it('依店家抽成方式列出扣項；編輯後確認才送出勾選的服務與扣項設定，成功後關閉並清除勾選', async () => {
    const { calls } = await open()
    expect(rowsUnderHeading(SECTION)).toHaveLength(1)
    expect(rowsUnderHeading(OTHER)).toHaveLength(1)
    fillDeductionRow(SECTION, 0, { way: '依業績%數', price: 10 }, opts)
    addDeductionRow(SECTION, opts)
    fillDeductionRow(SECTION, 1, { type: '扣業績', way: '依固定金額', special: true, designate: 50, nonDesignate: 30, ref: '1' }, opts)
    // Jason 2026/10/22：只有最後一列有「新增扣項」（比照新增頁），避免重複順序編號
    expect(buttonIn(rowsUnderHeading(SECTION)[0], '新增扣項')).toBeNull()
    fireEvent.click(buttonIn(rowsUnderHeading(SECTION)[1], '新增扣項'))
    expect(rowsUnderHeading(SECTION)).toHaveLength(3)
    // 扣薪水的列沒有刪除鈕；扣業績的非第一列才有
    fillDeductionRow(SECTION, 2, { type: '扣薪水' }, opts)
    expect(buttonIn(rowsUnderHeading(SECTION)[2], '刪除此扣項')).toBeNull()
    fillDeductionRow(SECTION, 2, { type: '扣業績' }, opts)
    fireEvent.click(buttonIn(rowsUnderHeading(SECTION)[2], '刪除此扣項'))
    expect(rowsUnderHeading(SECTION)).toHaveLength(2)
    expect(buttonIn(rowsUnderHeading(SECTION)[0], '刪除此扣項')).toBeNull()
    // 另一張卡：設定後清除
    fillDeductionRow(OTHER, 0, { type: '扣薪水', way: '依固定金額', price: 99 }, opts)
    fireEvent.click(buttonIn(rowsUnderHeading(OTHER)[0], '清除此扣項'))
    expect(selectedText(controlByLabel('扣項類別', rowsUnderHeading(OTHER)[0]))).toBe('扣業績')
    expect(controlByLabel('業績%數', rowsUnderHeading(OTHER)[0])).toHaveValue(0)

    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_DEDUCTION')).toHaveLength(0)
    const warning = await confirmWarning('handleSubmitDeductionSetting')
    expect(warning.serviceHelperGroupEdit).toBeUndefined()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '批次服務扣項修改完成' }))
    const base = {
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
    expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_DEDUCTION')[0].variables).toEqual({
      input: {
        ids: ['s2'],
        serviceDeductionItems: [
          {
            type: '系統預設',
            itemSettings: [
              { ...base, deductionWay: '扣趴數', price: 10 },
              {
                ...base,
                deductionWay: '扣固定金額',
                isSpecial: true,
                designatePrice: 50,
                nonDesignatePrice: 30,
                deductionOrder: 2,
                deductionReference: 1,
              },
            ],
          },
          { type: '設計師抽成', itemSettings: [base] },
        ],
      },
    })
    await wait(() => expect(screen.queryByText('扣項項目設定')).toBeNull())
    expect(screen.getByLabelText('選取 頭皮護理')).not.toBeChecked()
  })

  it('分指定的%數與單一欄位的固定金額標籤；取消分指定回到單一欄位；數字欄位捲動滑鼠時失焦', async () => {
    await open()
    fillDeductionRow(SECTION, 0, { way: '依業績%數', special: true, designate: 5, nonDesignate: 3 }, opts)
    expect(controlByLabel('指定%', rowsUnderHeading(SECTION)[0])).toHaveValue(5)
    expect(controlByLabel('不指定%', rowsUnderHeading(SECTION)[0])).toHaveValue(3)
    const fields = [controlByLabel('指定%', rowsUnderHeading(SECTION)[0]), controlByLabel('不指定%', rowsUnderHeading(SECTION)[0])]
    fireEvent.click(checkboxByLabel('分指定/不指定', rowsUnderHeading(SECTION)[0]))
    expect(controlsByLabel('指定%', rowsUnderHeading(SECTION)[0])).toHaveLength(0)
    fillDeductionRow(OTHER, 0, { way: '依固定金額', price: 20 }, opts)
    fields.push(controlByLabel('固定金額', rowsUnderHeading(OTHER)[0]))
    fireEvent.click(checkboxByLabel('分指定/不指定', rowsUnderHeading(SECTION)[0]))
    fields.splice(0, 2, controlByLabel('指定%', rowsUnderHeading(SECTION)[0]), controlByLabel('不指定%', rowsUnderHeading(SECTION)[0]))
    fields.forEach(field => {
      field.focus()
      fireEvent.wheel(field)
      expect(document.activeElement).not.toBe(field)
    })
  })

  // Jason 2026/10/22：失敗提示讀 err.message
  it('送出失敗時以錯誤訊息提示、彈窗不關閉；關閉彈窗清除勾選', async () => {
    const { calls } = await open({ SET_BATCH_SETTING_FOR_DEDUCTION: new Error('批次失敗') })
    fireEvent.click(screen.getByText('儲存', { selector: 'button' }))
    await confirmWarning('handleSubmitDeductionSetting')
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '批次失敗' }))
    expect(screen.getByText('扣項項目設定')).toBeInTheDocument()
    fireEvent.click(screen.getByText('關閉', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('扣項項目設定')).toBeNull())
    expect(screen.getByLabelText('選取 頭皮護理')).not.toBeChecked()
    expect(callsOf(calls, 'SET_BATCH_SETTING_FOR_DEDUCTION')).toHaveLength(1)
  })
})
