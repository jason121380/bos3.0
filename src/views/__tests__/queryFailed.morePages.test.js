// 2026/10/28 稽核收尾：其餘列表、檢視與編輯頁的主查詢失敗時，要顯示「無法載入資料」與「重新查詢」，
// 不能停在骨架、空白，或把空白表單顯示出來讓人存回去（標題寫法各頁不同，這裡不比對標題）。
import React from 'react'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../__tests__/testkit.test'

jest.setTimeout(30000)

const PAGES = [
  // 列表與檢視頁
  'views/AccountingSubject',
  'views/ServiceCategories',
  'views/ProductCategories',
  'views/MemberCardCategories',
  'views/MerchantParticipatingList',
  'views/CheckoutDaily',
  'views/DesignersSalaryDetailReport',
  'views/EmployeePayslip',
  'views/InventoryWorkReview',
  'views/MemberCardRecord',
  'views/MerchantBankTransferReport',
  'views/MerchantBusinessDashboard',
  // 帳單列表的查詢失敗已有專用提示（時間區間請選擇31日以內），不在此列
  'views/DraftOrderManagementList',
  'views/SalaryDetail',
  'views/TopUp',
  'views/ManagementReservationRecord',
  'views/ManagementDesignersReservationRecord',
  'views/EmployeeClockIn',
  'views/CustomerManagementDetails',
  'views/QRcodeClockIn',
  'views/EventCouponIssuanceDetails',
  // 依網址 id 讀單筆的編輯頁：讀不到時不顯示空白表單
  'views/AccountingRecordDetail',
  'views/GeneralAccountingRecordDetail',
  'views/AuthorityEdit',
  'views/CouponEdit',
  'views/CustomerBonusRecordEdit',
  'views/EmployeePickingEdit',
  'views/EventRuleEdit',
  'views/HelperPointSettingEdit',
  'views/InventoryWorkEdit',
  'views/MainEventEdit',
  'views/MemberCardCategoryEdit',
  'views/MemberCardEdit',
  'views/MerchantVendorEdit',
  'views/PaymentEdit',
  'views/ProductCategoryEdit',
  'views/ProductEdit',
  'views/ProductRestockEdit',
  'views/ServiceCategoryEdit',
  'views/ServiceEdit',
  'views/ShortcutEdit',
  'views/ThirdPartyCouponEdit',
  'views/TopUpEdit',
  'views/UpdateDeductionSetting',
  ['views/SalaryEdit', '?date=1730390400000'],
  'views/QueueOrderEdit',
  // 設定頁：任一設定讀不到時提示並停用儲存
  'views/Parameter',
  'views/PerformanceDeductionParameter',
]

// 項目可以是 [模組, 網址查詢字串]：薪資維護由網址的 date 取月份（正式路由一定帶）
const renderModule = entry => {
  const [modulePath, search = ''] = Array.isArray(entry) ? entry : [entry]
  const Page = require(modulePath).default
  return renderPage(
    <Page match={{ params: { id: '1', tab: 'general' } }} location={{ pathname: '/page/1', search }} history={{ push: () => {} }} />,
    {
      fallback: 'error',
      route: `/page/1${search}`,
    }
  )
}

beforeAll(() => {
  if (!Element.prototype.scrollTo) Element.prototype.scrollTo = () => {}
})
beforeEach(() => loginAs())
afterEach(cleanup)

it.each(PAGES.map(entry => [Array.isArray(entry) ? entry[0] : entry, entry]))(
  '%s 查詢失敗：顯示錯誤與重新查詢，不是空白或一直載入',
  async (_name, entry) => {
    const utils = renderModule(entry)
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect((await screen.findAllByText('無法載入資料'))[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
  }
)

// 按「搜尋」才送出主查詢的報表：送出後失敗也要顯示錯誤與重新查詢
it('views/SingleServiceSearchingReport 按搜尋後查詢失敗：顯示錯誤與重新查詢', async () => {
  const utils = renderModule('views/SingleServiceSearchingReport')
  await utils.settle()
  fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect((await screen.findAllByText('無法載入資料'))[0]).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
})
