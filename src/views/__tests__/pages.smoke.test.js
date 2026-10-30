// 保護各頁面的「載入→空資料→API 失敗不白屏」：後端回空資料時頁面要顯示標題與空狀態（0 筆、無資料），
// 不可因讀 undefined／null 而整頁拋錯進入錯誤畫面；標示 error 的頁面另驗證 API 全部失敗時仍顯示頁面框架。
// 需要登入身分的前台頁面驗證「未登入導到登入頁並帶回跳網址」。GraphQL 全由 MockedProvider（testkit 的模擬 link）回應。
import React from 'react'
import { cleanup, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT, currentLocation } from '../../__tests__/testkit.test'

jest.setTimeout(20000)

// [頁面模組, 標題, { empty: 空資料時應出現的文字（true 表示只驗標題）, error: API 失敗時也驗證 }]
const PAGES = [
  ['views/AccountingRecordCreate', '新增收借支紀錄', { empty: true, error: true }],
  ['views/AccountingRecordList', '高階收支登錄', { empty: true, error: true }],
  ['views/AccountingSubject', '收支科目明細', { empty: true, error: true }],
  ['views/AttendanceEmployeeSchedule', '考勤排班總表', { empty: '無資料' }],
  ['views/Authority', '角色權限管理', { empty: '共 0 筆', error: true }],
  ['views/AuthorityCreate', '新增角色', { empty: true, error: true }],
  ['views/BusinessAnalysisReport', '營業統計分析表', { empty: true }],
  ['views/CheckoutDaily', '每日結帳', { empty: '共 0 筆' }],
  ['views/ConsumptionAnalyticsDashboard', '消費分析儀表板', { error: true }],
  ['views/CostAnalysisReport', '費用分析表', { empty: true, error: true }],
  ['views/CustomerBonusRecord', '紅利點數紀錄', { empty: '共 0 筆' }],
  ['views/CustomerBonusRecordCreate', '新增紅利點數', { empty: true, error: true }],
  ['views/CustomerConsumptionLeaderboard', '顧客消費排行榜', { empty: true, error: true }],
  ['views/CustomerEventTicketSearch', '抽獎券查詢', { empty: true, error: true }],
  ['views/CustomerLogin', '顧客登入', { empty: true, error: true }],
  // 顧客評價連結：查不到帳單（API 失敗）時告知連結有誤
  ['views/CustomerRating', '連結有誤', { error: true }],
  // 顧客自助建檔：店家未開放（設定為空）時告知未開放
  ['views/CustomerSelfCreate', '該店未開放此功能', { empty: true }],
  ['views/CustomerWalletLeaderboard', '顧客入金排行榜', { empty: true, error: true }],
  ['views/DecreaseDetail', '互助點數明細', { empty: true, error: true }],
  ['views/DesignerMonthlyReport', '設計師業績月報表', { error: true }],
  ['views/DesignerPerformanceAnalyzeReport', '設計師業績分析表', { error: true }],
  ['views/DesignerPerformDetail', '設計師細項分析', { empty: true, error: true }],
  ['views/DesignerPerformanceReport', '設計師業績表', { empty: true }],
  ['views/DesignerRakeReport', '設計師抽成報表', { empty: '無資料', error: true }],
  ['views/DesignersSalaryDetailReport', '薪資明細表', { error: true }],
  ['views/DraftOrderManagementList', '掛單列表', { empty: '共 0 筆' }],
  ['views/EmployeeClockIn', '現場電腦打卡', { empty: true, error: true }],
  ['views/EmployeePicking', '材料自購登錄', { empty: true, error: true }],
  ['views/EmployeeResignationList', '員工離職列表', { empty: '目前沒有離職員工', error: true }],
  ['views/EmployeeSchedule', '排班表', { empty: true, error: true }],
  ['views/EventCouponIssuanceDetails', '活動發券明細', { empty: '無發券明細資料', error: true }],
  ['views/GeneralAccountingRecordCreate', '新增收借支紀錄', { empty: true, error: true }],
  ['views/GeneralAccountingRecordDetail', '收支紀錄詳細', { empty: true }],
  ['views/GeneralAccountingRecordList', '現金收支登錄', { empty: true, error: true }],
  ['views/HelperPointSettingCreate', '新增互助點數設定', { empty: true, error: true }],
  ['views/IncomeStatementReport', '損益表', { error: true }],
  ['views/InventoryWork', '盤點作業', { error: true }],
  ['views/InventoryWorkCreate', '新增盤點', { empty: true }],
  ['views/Login', '登入系統', { empty: true, error: true }],
  ['views/MainEventCreate', '建立活動', { empty: true, error: true }],
  ['views/MainEventList', '活動列表', { empty: '共 0 筆' }],
  ['views/MemberCardCategories', '會員卡分類設定', { empty: '共 0 筆', error: true }],
  ['views/MemberCardCategoryCreate', '新增會員卡分類', { empty: true, error: true }],
  ['views/MemberCardCategoryEdit', '編輯會員卡分類', { empty: true }],
  ['views/MemberCardCreate', '新增會員卡', { empty: true, error: true }],
  ['views/MemberCardEdit', '編輯會員卡', { empty: true }],
  ['views/MemberCardRecord', '會員卡列表', { empty: '共 0 筆', error: true }],
  ['views/MerchantCategorySellsRecords', '店販分類抽成明細', { empty: true, error: true }],
  ['views/MerchantParticipatingList', '活動店家參與列表', { empty: '共 0 個活動' }],
  ['views/MerchantSellsRecords', '店販抽成明細', { empty: true, error: true }],
  ['views/MerchantVendor', '廠商列表', { empty: '共 0 筆' }],
  ['views/MerchantVendorCreate', '新增廠商', { empty: true, error: true }],
  ['views/MoneyFlowDailyReport', '每日收支明細(已日結)', { error: true }],
  ['views/PaymentCreate', '新增支付方式', { empty: true, error: true }],
  ['views/PaymentEdit', '編輯支付方式', { empty: true }],
  ['views/Payments', '支付方式設定', { empty: '共 0 筆', error: true }],
  ['views/PerformanceDeductionParameter', '業績抽成參數設定', { empty: true }],
  ['views/ProductCategories', '商品分類設定', { empty: '共 0 筆', error: true }],
  ['views/ProductCategoryCreate', '新增商品分類', { empty: true, error: true }],
  ['views/ProductCategoryEdit', '編輯商品分類', { empty: true }],
  ['views/ProductInventoryList', '商品庫存表', { empty: '無資料' }],
  ['views/ProductInvoicingRecordReport', '商品進銷貨報表', { error: true }],
  ['views/ProductReserveCheck', '商品庫存盤點表', { error: true }],
  ['views/ProductRestock', '商品進貨作業', { empty: '共 0 筆' }],
  ['views/ProductRestockCreate', '新增商品進貨', { empty: '合計' }],
  ['views/ProductRestockEdit', '編輯進貨單', { empty: true }],
  ['views/Products', '商品列表', { empty: true }],
  ['views/QRcodeClockIn', '掃碼打卡', { empty: true }],
  ['views/Register', '註冊 BeautyOS', { empty: true, error: true }],
  ['views/Reservation', '預約服務', { error: true }],
  ['views/Resetpassword', '重設密碼', { empty: true, error: true }],
  ['views/SalaryDetail', '薪資明細表', { empty: '共 0 筆', error: true }],
  ['views/SalaryOverview', '薪資總表/月結', { empty: true, error: true }],
  ['views/ServiceCategories', '服務分類設定', { empty: '共 0 筆', error: true }],
  ['views/Services', '服務項目設定', { error: true }],
  ['views/Shortcut', '組合設定', { empty: '無資料' }],
  ['views/ShortcutCreate', '新增組合設定', { empty: true }],
  ['views/ShortcutEdit', '編輯組合設定', { empty: true }],
  ['views/SingleServiceSearchingReport', '單一服務項目查詢', { empty: true }],
  ['views/SystemUpdateRecord', '版本更新紀錄', { empty: true }],
  ['views/SystemUpdateRecordCreate', '新增版本紀錄', { empty: true, error: true }],
  ['views/ThirdPartyCouponCreate', '新增第三方卡券', { empty: true, error: true }],
  ['views/ThirdPartyCoupons', '第三方卡券設定', { error: true }],
  ['views/TopUpCreate', '新增入金', { empty: true }],
  ['views/TopUpEdit', '編輯入金', { empty: true }],
  ['views/WebOrderManagementList', '預約管理', { empty: true }],
]

const renderModule = (modulePath, fallback) => {
  const Page = require(modulePath).default
  return renderPage(<Page match={{ params: { id: '1' } }} location={{ pathname: '/page/1', search: '' }} />, {
    fallback,
    route: '/page/1',
  })
}

const expectPageShown = async (utils, title) => {
  expect((await screen.findAllByText(title, { exact: false }))[0]).toBeInTheDocument()
  // 等所有查詢（含依結果再發的查詢）都回應後再確認沒有進入錯誤畫面
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(screen.getAllByText(title, { exact: false })[0]).toBeInTheDocument()
}

beforeAll(() => {
  // jsdom 沒有 Element.scrollTo（版本紀錄的 Markdown 編輯器會呼叫）
  if (!Element.prototype.scrollTo) Element.prototype.scrollTo = () => {}
})

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('後端回空資料：顯示頁面標題與空狀態，不進錯誤畫面', () => {
  PAGES.filter(([, , o]) => o.empty).forEach(([modulePath, title, { empty }]) => {
    it(`${title}（${modulePath.replace('views/', '')}）`, async () => {
      const utils = renderModule(modulePath, 'empty')
      await expectPageShown(utils, title)
      if (typeof empty === 'string') {
        expect(screen.getAllByText(empty, { exact: false })[0]).toBeInTheDocument()
      }
    })
  })
})

describe('API 全部失敗：仍顯示頁面框架（不白屏）', () => {
  PAGES.filter(([, , o]) => o.error).forEach(([modulePath, title]) => {
    it(`${title}（${modulePath.replace('views/', '')}）`, async () => {
      const utils = renderModule(modulePath, 'error')
      await expectPageShown(utils, title)
    })
  })
})

describe('前台頁面：顧客未登入時導到顧客登入頁，登入後回到原頁', () => {
  it.each([
    ['views/ConsumptionRecords', '/customer/consumption/records'],
    ['views/MemberCard', '/customer/member/card'],
    ['views/MemberCreate', '/customer/member/create'],
    ['views/ReservationList', '/customer/reservation/list'],
  ])('%s', async (modulePath, back) => {
    renderModule(modulePath, 'empty')
    await screen.findByTestId('testkit-location')
    await wait(() => expect(currentLocation()).toMatch(/^\/customer\/login\?/))
    expect(decodeURIComponent(currentLocation())).toContain(`redirect=${back}`)
  })
})

describe('導頁', () => {
  it('顧客詳細沒有指定分頁時，導到「基本資料」分頁', async () => {
    renderModule('views/CustomerManagementDetails', 'empty')
    await wait(() => expect(currentLocation()).toBe('/management/customers/1/general'))
  })

  it('LINE 選單的出勤紀錄入口：以登入者 id 導到自己的出勤紀錄', async () => {
    renderModule('views/ChangeLineMenuPage/temp', 'empty')
    await wait(() => expect(currentLocation()).toBe('/management/employee/user-1/AttendanceRecord'))
  })
})
