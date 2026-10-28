// 查詢失敗要離開骨架，顯示可重試的錯誤狀態（與盤點作業、切換店家同一套）。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../__tests__/testkit.test'

jest.setTimeout(30000)

const PAGES = [
  ['views/SalaryOverview', '薪資總表/月結'],
  ['views/MoneyFlowTransferReport', '收支匯款表'],
  ['views/MoneyFlowCategoryReport', '收支分類明細表'],
  ['views/DesignerPerformOverview', '全店業績分析表'],
  ['views/CustomerWalletLeaderboard', '顧客入金排行榜'],
  ['views/CustomerConsumptionLeaderboard', '顧客消費排行榜'],
  ['views/CustomerFilterExport', '客資篩選匯出'],
  // 2026/10/28 稽核 C-1：報表 33 頁與列表 20 頁補 QueryFailed（主查詢失敗顯示「無法載入資料」＋「重新查詢」）
  ['views/BusinessAnalysisReport', '營業統計分析表'],
  ['views/BusinessItemsMonthlyAnalyzeReport', '營業項目月分析表'],
  ['views/ConsumptionAnalyticsDashboard', '消費分析儀表板'],
  ['views/CostAnalysisReport', '費用分析表'],
  ['views/CustomerCouponBalance', '顧客卡券餘額表'],
  ['views/CustomerWalletBalance', '顧客入金餘額表'],
  ['views/DecreaseDailyReport', '互助日報表'],
  ['views/DecreaseDetail', '互助點數明細'],
  ['views/DesignerMonthlyReport', '設計師業績月報表'],
  ['views/DesignerPerformBasic', '設計師排行榜'],
  ['views/DesignerPerformanceReport', '設計師業績表'],
  ['views/DesignerRakeReport', '設計師抽成報表'],
  ['views/EmployeeDailyReport', '設計師日報表'],
  ['views/HelperMonthlyReport', '互助月報表'],
  ['views/HelperPerformanceReport', '互助業績報表'],
  ['views/IncomeStatementReport', '損益表'],
  ['views/MembershipSellReport', '會員卡銷售報表'],
  ['views/MerchantBusinessIntervalReport', '店家區間累計表'],
  ['views/MerchantDailyPerformanceReport', '每日業績分析表'],
  ['views/MerchantDailyReport', '店家日報表'],
  ['views/MerchantLeaderBoard', '店家排行榜'],
  ['views/MerchantCategorySellsRecords', '店販分類抽成明細'],
  ['views/MerchantSellsRecords', '店販抽成明細'],
  ['views/MoneyFlowDailyReport', '每日收支明細'],
  ['views/MultiMerchantsLeaderBoard', '多店店販銷售排行'],
  ['views/NonCashDetailStatementReport', '非現金明細對帳單'],
  ['views/PaymentReport', '每日非現金明細'],
  ['views/ProductConsumeReport', '商品消耗明細'],
  ['views/ProductInventoryList', '商品庫存表'],
  ['views/ProductReserveCheck', '商品庫存盤點表'],
  ['views/ServiceDeductionDetailReport', '服務扣項明細表'],
  // SingleServiceSearchingReport 的主查詢按「搜尋」才送出，掛載時不會失敗，不列入
  ['views/HelperLeaderBoard', '互助排行榜'],
  ['views/Services', '服務項目設定'],
  ['views/CustomerManagementList', '客戶列表'],
  ['views/EmployeeManagementList', '員工列表'],
  ['views/Payments', '支付方式設定'],
  ['views/CouponList', '預收卡設定'],
  ['views/Authority', '角色權限管理'],
  ['views/WebOrderManagementList', '預約管理'],
  ['views/ThirdPartyCoupons', '第三方卡券設定'],
  ['views/MerchantVendor', '廠商列表'],
  ['views/CustomerBonusRecord', '紅利點數紀錄'],
  ['views/MainEventList', '活動列表'],
  ['views/Shortcut', '組合設定'],
  ['views/EmployeeResignationList', '員工離職列表'],
  ['views/ProductRestock', '商品進貨作業'],
  ['views/EmployeeSchedule', '排班表'],
  ['views/AttendanceEmployeeSchedule', '考勤排班總表'],
  ['views/AccountingRecordList', '高階收支登錄'],
  ['views/GeneralAccountingRecordList', '現金收支登錄'],
  ['views/EmployeePicking', '材料自購登錄'],
  ['views/Products', '商品列表'],
]

const renderModule = modulePath => {
  const Page = require(modulePath).default
  return renderPage(<Page match={{ params: { id: '1', tab: 'general' } }} location={{ pathname: '/page/1', search: '' }} />, {
    fallback: 'error',
    route: '/page/1',
  })
}

beforeAll(() => {
  if (!Element.prototype.scrollTo) Element.prototype.scrollTo = () => {}
})
beforeEach(() => loginAs())
afterEach(cleanup)

it.each(PAGES)('%s 查詢失敗：顯示錯誤與重新查詢，不是一直載入', async (modulePath, title) => {
  const utils = renderModule(modulePath)
  expect((await screen.findAllByText(title, { exact: false }))[0]).toBeInTheDocument()
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.queryByLabelText('載入中')).toBeNull()
  expect(screen.getByText('無法載入資料')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '重新查詢' })).toBeEnabled()
})
