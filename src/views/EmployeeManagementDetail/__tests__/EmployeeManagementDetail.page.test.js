// 保護「員工資料」頁的外框：
// - 分頁依登入者角色「編輯員工」區塊逐頁開放（以角色 id 比對，helper/rolePageAuthority）；沒開放的分頁不出現；點分頁以 history.push 切換。
// - 標題顯示員工姓名與目前分頁；預約表在店家開啟報到功能時有「報到模式」開關。
// - 網址分頁不在清單內（如 permission、沒帶分頁）時導回「基本資料」；預約歷史設定查詢失敗時照常顯示（Jason 2026/10/22）。
// GraphQL 全由模擬 link 回應，不連後端。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs, callsOf, PAGE_CRASH_TEXT, currentLocation } from '../../../__tests__/testkit.test'
import { renderDetail, editEmployeeSection, TAB_LABELS, EMP_ID } from './employeeDetailKit.test'

jest.setTimeout(20000)

jest.mock('socket.io-client', () => () => ({ on: () => {}, off: () => {}, emit: () => {}, disconnect: () => {} }))
// 預約表分頁的週曆讀店家營業時間（匿名查詢，模擬 link 無法依名稱回應），與週曆元件自己的測試相同以 mock 提供
jest.mock('hooks/useFetchMerchant', () => ({
  ...jest.requireActual('hooks/useFetchMerchant'),
  __esModule: true,
  default: () => ({ loading: false, data: { merchant: { id: 'merchant-1', openingHours: '10:00:00', closingHours: '20:00:00' } } }),
}))

const tabList = () => screen.getByRole('tablist', { name: '員工設定分類' })
const tabNames = () => within(tabList()).getAllByRole('tab').map(t => t.textContent)

beforeEach(() => loginAs())
afterEach(cleanup)

describe('員工資料：分頁與權限', () => {
  it('依登入者角色開放的分頁顯示；標題為員工姓名與目前分頁；以登入者角色 id 比對', async () => {
    const { settle, calls } = renderDetail('security')
    await settle()
    await wait(() => expect(tabNames()).toEqual(TAB_LABELS))
    expect(screen.getByText('王小美 - 個人設定')).toBeInTheDocument()
    expect(screen.getAllByText('密碼與安全').length).toBeGreaterThan(1)
    expect(callsOf(calls, 'DESIGNER')[0].variables).toEqual({ designerId: EMP_ID })
  })

  it('沒開放的分頁不出現', async () => {
    const { settle } = renderDetail('security', { section: editEmployeeSection({ 薪資條: false, 抽成報表: false }) })
    await settle()
    await wait(() => expect(tabNames()).toContain('基本資料'))
    expect(tabNames()).not.toContain('薪資條')
    expect(tabNames()).not.toContain('抽成報表')
  })

  it('點分頁以 history.push 切換到該分頁', async () => {
    const { settle, history } = renderDetail('security')
    await settle()
    const tab = await within(tabList()).findByRole('tab', { name: '薪資條' })
    fireEvent.mouseDown(tab, { button: 0 })
    expect(history.push).toHaveBeenCalledWith('paySlip')
  })

  it('預約表：店家開啟報到功能時有「報到模式」開關，可切換', async () => {
    const { settle } = renderDetail('reservation', {
      fixtures: {
        GET_CHECKIN_SETTING_FOR_CALENDAR: { getMerchantCheckinSettings: { isBookingCheckinEnabled: true, isUnDoneBookingManualNotify: false } },
      },
    })
    await settle()
    const toggle = await screen.findByRole('switch', { name: '報到模式' })
    expect(toggle).not.toBeChecked()
    fireEvent.click(toggle)
    expect(toggle).toBeChecked()
  })

  it('預約表：未開啟報到功能時沒有報到模式', async () => {
    const { settle } = renderDetail('reservation')
    await settle()
    expect(screen.getAllByText('預約表').length).toBeGreaterThan(1)
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByRole('switch', { name: '報到模式' })).toBeNull()
  })

  // 網址分頁不在分頁清單時導回「基本資料」（Jason 2026/10/22；修正前 findTabName 讀 undefined.label 整頁錯誤）。
  // permission 分頁（Permission.js）自初版起就不在分頁清單、角色「編輯員工」區塊也沒有對應的頁面權限，
  // 依既有權限判斷不開放，同樣導回基本資料。
  it('網址分頁不在清單內（permission、沒帶分頁）時導回基本資料', async () => {
    renderDetail('permission')
    await wait(() => expect(currentLocation()).toBe(`/management/employee/${EMP_ID}/general`))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    cleanup()
    renderDetail(undefined)
    await wait(() => expect(currentLocation()).toBe(`/management/employee/${EMP_ID}/general`))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })

  // 預約歷史設定查詢失敗時以 false（不顯示）為預設，頁面照常顯示（Jason 2026/10/22；修正前整頁錯誤）。
  it('預約歷史設定查詢失敗時頁面照常顯示', async () => {
    const { settle } = renderDetail('security', { fixtures: { GET_BOOKING_HISTORY_DISPLAY: new Error('網路錯誤') } })
    await settle()
    await wait(() => expect(tabNames()).toEqual(TAB_LABELS))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
