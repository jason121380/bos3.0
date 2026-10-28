// 保護「預約管理」列表：
// - 預設查詢本月 1 日 00:00 到 90 天後 23:59:59.999（台灣時間）、1000 筆、不篩報到狀態；快速選擇日期只改區間
// - 店家開啟報到功能時才有報到欄與「報到狀態」篩選（報到成功＝true、未報到＝false、無＝null）；開啟未來預約確認時才有「未來預訂(待確認)」欄
// - 每筆：狀態、時間、顧客（已刪除顯示「客資已刪除」）、指定、設計師（無設計師／不指定設計師）、來源；已完成的連到帳單、未完成的連到預約
// - 刪除（取消預約）：只能勾未完成的預約；店家設刪除密碼時先輸入密碼；送出的 orderIds 與密碼正確，成功後清空勾選、重抓
// - 匯出：比照帳單列表依店家設定遮罩客資（只有設定查詢成功且為 false 才不遮罩）；「來源」欄與表格同讀 source（Jason 2026/10/22）
// - 報到設定、刪除密碼設定查詢失敗時仍顯示列表（Jason 2026/10/22）；刪除密碼設定讀不到時一律先要求密碼（Codex review PR #270）
// GraphQL 全由 testkit 的模擬 link 回應，不刪除真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { addDays, endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT, MERCHANT_ID } from '../../../__tests__/testkit.test'
import WebOrderManagementList from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const BOOKINGS = [
  {
    id: 'b1', no: 'R001', isDesignate: true, date: new Date(2026, 9, 22, 14, 30).getTime(), status: '已預約', source: 'LINE',
    isCheckin: true, isCusCheckRequired: true, customer: { name: '陳小姐', cellphone: '0912345678', isAlive: true },
    designer: { name: '王小美', designerNo: '01' }, isDone: false, createdOrderId: null,
  },
  {
    id: 'b2', no: 'R002', isDesignate: false, date: new Date(2026, 9, 21, 9, 0).getTime(), status: '已完成', source: '現場',
    isCheckin: false, isCusCheckRequired: false, customer: { name: '林先生', cellphone: '0922000111', isAlive: false },
    designer: { name: null, designerNo: null }, isDone: true, createdOrderId: 'o-9',
  },
  {
    id: 'b3', no: 'R003', isDesignate: false, date: new Date(2026, 9, 23, 18, 0).getTime(), status: '已預約', source: '電話',
    isCheckin: null, isCusCheckRequired: false, customer: null, designer: null, isDone: false, createdOrderId: null,
  },
  {
    id: 'b4', no: 'R004', isDesignate: true, date: new Date(2026, 9, 24, 11, 0).getTime(), status: '已預約', source: '網站',
    isCheckin: null, isCusCheckRequired: false, customer: { name: '張小姐', cellphone: '0933', isAlive: true },
    designer: { name: '阿明', designerNo: null }, isDone: false, createdOrderId: null,
  },
]

const fixtures = (extra = {}) => ({
  GET_BOOKING_MANAGEMENT: { bookingManagement: { pageLimit: 1000, pageOffset: 0, totalCount: 4, bookings: BOOKINGS } },
  GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST: { getMerchantCheckinSettings: { isBookingCheckinEnabled: true } },
  GET_IS_BOOKING_CUS_CHECK_USING: { getIsBookingCusCheckUsing: true },
  GET_DELETE_ORDER_USING: { merchantPassword: { deleteOrder: { isUsing: false } } },
  DELETE_ORDER: { deleteOrder: true },
  ...extra,
})
const setup = (extra = {}, options = {}) =>
  renderPage(<WebOrderManagementList />, { fixtures: fixtures(extra), route: '/management/web-orders', ...options })

beforeEach(() => loginAs())
afterEach(cleanup)

const lastInput = calls => {
  const list = callsOf(calls, 'GET_BOOKING_MANAGEMENT')
  return list[list.length - 1].variables.input
}
const rowByTime = (time, day) =>
  screen.getAllByText(time).map(el => el.closest('tr')).find(tr => within(tr).queryByText(day))
const headers = () => [...document.querySelectorAll('thead th')].map(th => th.textContent)
const exportedCsv = () => decodeURIComponent(screen.getByText('報表匯出').closest('a').getAttribute('href'))
const checkinSelect = () => screen.getAllByLabelText('報到狀態').find(el => el.tagName === 'SELECT' || el.hasAttribute('data-ui-select'))

describe('預約管理', () => {
  it('預設查本月 1 日到 90 天後整天、1000 筆、不篩報到狀態；新預約連到本店預約頁', async () => {
    const { calls, settle } = setup()
    await settle()
    expect(callsOf(calls, 'GET_BOOKING_MANAGEMENT')[0].variables.input).toEqual({
      dateRange: { startDate: startOfMonth(new Date()).getTime(), endDate: endOfDay(addDays(new Date(), 90)).getTime() },
      pageLimit: 1000,
      pageOffset: 0,
      isCheckin: null,
    })
    expect(screen.getByText('新預約').closest('a').getAttribute('href')).toBe(`/customer/reservation/${MERCHANT_ID}?usingLineLogin=0`)
  })

  it('沒有目前店家時，新預約連結不帶店家 id', async () => {
    loginAs({ merchant: null })
    const { settle } = setup()
    await settle()
    expect(screen.getByText('新預約').closest('a').getAttribute('href')).toBe('/customer/reservation/?usingLineLogin=0')
  })

  it('列出每筆預約的狀態、報到、時間、顧客、指定、待確認、設計師、來源與連結', async () => {
    const { settle } = setup()
    await settle()
    expect(screen.getByText('共 4 筆')).toBeInTheDocument()
    expect(headers()).toEqual(['', '操作', '訂單狀態', '報到狀態', '預約日期及時間', '客戶資訊', '指定/不指定', '未來預訂(待確認)', '設計師', '來源'])
    const cells = tr => within(tr).getAllByRole('cell').map(c => c.textContent)
    expect(cells(rowByTime('14:30', '2026/10/22')).slice(1)).toEqual([
      ' 修改 ', '已預約', '報到成功', '14:302026/10/22', '陳小姐0912345678', '指定', '是', '王小美 / 01', 'LINE',
    ])
    expect(cells(rowByTime('09:00', '2026/10/21')).slice(1)).toEqual([
      '查看帳單', '已完成', '未報到', '09:002026/10/21', '客資已刪除', '不指定', '', '無設計師', '現場',
    ])
    expect(cells(rowByTime('18:00', '2026/10/23')).slice(1)).toEqual([
      ' 修改 ', '已預約', '', '18:002026/10/23', '客資已刪除', '不指定', '', '不指定設計師', '電話',
    ])
    expect(cells(rowByTime('11:00', '2026/10/24'))[8]).toBe('阿明')
    expect(screen.getByText('查看帳單').closest('a').getAttribute('href')).toBe('/order/o-9')
    expect(within(rowByTime('14:30', '2026/10/22')).getByText('修改', { exact: false }).closest('a').getAttribute('href')).toBe('/order/b1')
    // 已完成的預約不能勾選
    expect(within(rowByTime('09:00', '2026/10/21')).getByLabelText('選取此筆預約')).toBeDisabled()
  })

  it('店家未開啟報到與未來預約確認時，不顯示這兩欄、匯出也沒有報到狀態', async () => {
    const { settle } = setup({
      GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST: { getMerchantCheckinSettings: { isBookingCheckinEnabled: false } },
      GET_IS_BOOKING_CUS_CHECK_USING: { getIsBookingCusCheckUsing: false },
    })
    await settle()
    expect(headers()).not.toContain('報到狀態')
    expect(headers()).not.toContain('未來預訂(待確認)')
    await wait(() => expect(exportedCsv()).toContain('預約日期及時間'))
    expect(exportedCsv()).not.toContain('報到狀態')
  })

  it('報到狀態篩選：報到成功送 true、未報到送 false、選「無」送 null；再按篩選收起', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    fireEvent.change(checkinSelect(), { target: { value: '1' } })
    await wait(() => expect(lastInput(calls).isCheckin).toBe(true))
    await settle()
    fireEvent.change(checkinSelect(), { target: { value: '2' } })
    await wait(() => expect(lastInput(calls).isCheckin).toBe(false))
    await settle()
    fireEvent.change(checkinSelect(), { target: { value: '0' } })
    await wait(() => expect(lastInput(calls).isCheckin).toBeNull())
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    expect(screen.queryByLabelText('報到狀態')).toBeNull()
  })

  it('快速選擇「昨天」只改查詢區間，保留筆數與報到篩選', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.keyDown(screen.getByRole('combobox', { name: '快速選擇日期區間' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('option', { name: '昨天' }), { key: 'Enter' })
    await wait(() =>
      expect(lastInput(calls)).toEqual({
        dateRange: { startDate: startOfDay(subDays(new Date(), 1)).getTime(), endDate: endOfDay(subDays(new Date(), 1)).getTime() },
        pageLimit: 1000,
        pageOffset: 0,
        isCheckin: null,
      })
    )
  })

  it('全選只勾未完成的預約；取消預約送出勾選的 id，成功後清空勾選並重抓', async () => {
    const { calls, settle } = setup()
    await settle()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText('已選 3 筆')).toBeInTheDocument()
    expect(screen.getByLabelText('全選').checked).toBe(true)
    fireEvent.click(within(rowByTime('18:00', '2026/10/23')).getByLabelText('選取此筆預約'))
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    const before = callsOf(calls, 'GET_BOOKING_MANAGEMENT').length
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    await wait(() => expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'DELETE_ORDER')[0].variables).toEqual({ orderIds: ['b1', 'b4'], password: '' })
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: ' 成功刪除預約', variant: 'success' }))
    await wait(() => expect(callsOf(calls, 'GET_BOOKING_MANAGEMENT').length).toBeGreaterThan(before))
    // 批次列在沒有勾選時隱藏（仍在 DOM）
    expect(screen.getByText('已選 0 筆')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('全選'))
    fireEvent.click(screen.getByLabelText('全選'))
    expect(within(rowByTime('14:30', '2026/10/22')).getByLabelText('選取此筆預約').checked).toBe(false)
  })

  it('店家設刪除預約密碼：先輸入密碼再送出；取消不送；失敗時提示錯誤', async () => {
    const { calls, settle } = setup({
      GET_DELETE_ORDER_USING: { merchantPassword: { deleteOrder: { isUsing: true } } },
      DELETE_ORDER: new Error('密碼錯誤'),
    })
    await settle()
    fireEvent.click(within(rowByTime('14:30', '2026/10/22')).getByLabelText('選取此筆預約'))
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    let dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('刪除預約')).toBeInTheDocument()
    fireEvent.click(dialog.getByText('取消'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(0)
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    dialog = within(screen.getByRole('dialog'))
    fireEvent.change(dialog.getByLabelText('刪除預約密碼'), { target: { value: '9999' } })
    fireEvent.click(dialog.getByText('確認'))
    await wait(() => expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(1))
    expect(callsOf(calls, 'DELETE_ORDER')[0].variables).toEqual({ orderIds: ['b1'], password: '9999' })
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('密碼錯誤') }))
    )
    // 失敗時勾選保留、對話框仍開著可重試
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('已選 1 筆')).toBeInTheDocument()
  })

  it('匯出檔預設遮罩客資（姓名依長度遮、手機留前 4 後 3），「來源」欄讀 source（Jason 2026/10/22）', async () => {
    // 遮罩設定沒回（null）＝遮罩；與帳單列表、掛單列表同一套規則
    const { settle } = setup()
    await settle()
    await wait(() => expect(exportedCsv()).toContain('#R001(2026/10/22 14:30:00)'))
    const csv = exportedCsv()
    expect(csv).toContain('"陳*姐(0912***678)"')
    expect(csv).toContain('"張*姐(0933***)"')
    expect(csv).not.toContain('陳小姐')
    expect(csv).not.toContain('0912345678')
    expect(csv).toContain('"客資已刪除"')
    expect(csv).toContain('"王小美 / 01"')
    expect(csv).toContain('"無設計師"')
    expect(csv).toContain('"不指定設計師"')
    expect(csv).toContain('"報到成功"')
    expect(csv).toContain('"未報到"')
    expect(csv).toContain('"LINE"')
    expect(csv).toContain('"現場"')
  })

  it('店家設定不遮罩客資時前端 CSV 仍遮罩；設定查詢失敗時也遮罩', async () => {
    const { settle } = setup({ GET_CUSTOMER_DATA_MARKED: { getCustomerDataMarkedDefault: false } })
    await settle()
    await wait(() => expect(exportedCsv()).toContain('"陳*姐(0912***678)"'))
    expect(exportedCsv()).not.toContain('0912345678')
    cleanup()
    const failed = setup({ GET_CUSTOMER_DATA_MARKED: new Error('查詢失敗') })
    await failed.settle()
    await wait(() => expect(exportedCsv()).toContain('"陳*姐(0912***678)"'))
  })

  it('遮罩時姓名、手機缺漏不會拋錯', async () => {
    const { settle } = setup({
      GET_BOOKING_MANAGEMENT: {
        bookingManagement: {
          pageLimit: 1000, pageOffset: 0, totalCount: 2,
          bookings: [
            { ...BOOKINGS[0], id: 'n1', no: 'N1', customer: { name: null, cellphone: null, isAlive: true } },
            { ...BOOKINGS[0], id: 'n2', no: 'N2', customer: { name: '歐陽小明', cellphone: '0911222333', isAlive: true } },
          ],
        },
      },
    })
    await settle()
    await wait(() => expect(exportedCsv()).toContain('#N1('))
    expect(exportedCsv()).toContain('"()"')
    expect(exportedCsv()).toContain('"歐陽*明(0911***333)"')
  })

  it('載入中顯示骨架', async () => {
    const { settle } = setup({}, { delays: { GET_BOOKING_MANAGEMENT: 50 } })
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await settle()
    expect(screen.queryByLabelText('載入中')).toBeNull()
  })

  it('預約查詢失敗時不顯示列表、不進錯誤畫面', async () => {
    const { settle } = setup({ GET_BOOKING_MANAGEMENT: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText('預約管理列表')).toBeNull()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })

  it('報到設定查詢失敗時不顯示報到欄，列表照常顯示（Jason 2026/10/22）', async () => {
    const { settle } = setup({ GET_CHECKIN_SETTING_FOR_MANAGEMENT_LIST: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('預約管理列表')).toBeInTheDocument()
    expect(headers()).not.toContain('報到狀態')
  })

  it('刪除密碼設定查詢失敗時列表照常顯示，取消預約一律先要求密碼（fail closed，Codex review PR #270 P1）', async () => {
    const { calls, settle } = setup({ GET_DELETE_ORDER_USING: new Error('查詢失敗') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('預約管理列表')).toBeInTheDocument()
    fireEvent.click(within(rowByTime('14:30', '2026/10/22')).getByLabelText('選取此筆預約'))
    fireEvent.click(screen.getByText('取消訂單(預約)'))
    expect(await screen.findByLabelText('刪除預約密碼')).toBeInTheDocument()
    expect(callsOf(calls, 'DELETE_ORDER')).toHaveLength(0)
  })
})
