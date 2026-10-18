# BOS 3.0 改版盤點（步驟 A）

> 產出日期：2026/10/18　分支：`claude/upbeat-carson-pdc7rf`
> 本文件只做盤點，未修改任何程式碼。

## 1. 總覽

| 項目 | 數量 |
|---|---:|
| `src/views` 目錄/檔案 | 176 |
| `src/views` 內 .js 檔 | 756 |
| `src/routes.js` 路由 | 187（DashboardLayout 161、Customer 12、EHS 5、Line 1、無 layout 的 `/ar` `/ar2` 2、Auth 3、Error 3） |
| 側欄列出的頁面 | 90（10 個群組） |
| 側欄未列的次頁（明細 / 編輯 / 新增） | 71 |
| 引用 `@mui/*` 的檔案 | 706 |
| 引用 `@mui/icons-material` 的檔案 | 232 |
| 使用 `sx={...}` 的檔案 | 69 |
| 未被路由引用的 view | `AR`、`LinepayQRcode`、`Typography`（疑似死碼，不改版） |

技術前提：`react-scripts 5.0.1`（PostCSS 8，可直接裝 Tailwind v3）、React 17、MUI 5.15、react-router v5。

## 2. 版面（layouts）

| Layout | 檔案 | 用途 | 改版步驟 |
|---|---|---|---|
| Dashboard | `layouts/Dashboard/{index,NavBar(858 行),TopBar(1002 行),MerchantBar,MerchantList}.js` | 後台主骨架、側欄、頂欄、商家切換、釘選頁面、權限過濾選單 | C |
| DashBoardListDetail | `layouts/DashBoardListDetail/index.js` | **報表目錄**（`/dashboard-list-detail`），實際上是頁面 | D |
| Auth | `layouts/Auth/{index,Topbar}.js` | 登入 | C |
| Customer | `layouts/Customer/index.js` | 顧客端 11 頁（手機版） | 最後一批，獨立 PR |
| Line | `layouts/Line/index.js` | LINE 內嵌地圖 `/line/map/:id` | 不改版 |
| EHS | `layouts/EHS/index.js` | EHS、LINE 選單切換、隱私權 | 不改版 |
| Seat / Empty / Error | `layouts/{Seat,Empty}/index.js`、`layouts/Error.js` | 錯誤頁、空白殼 | C |

注意：`NavBar.js` 內含權限過濾（`useFetchUserPermission`、`authority` 比對）與「掛單列表」動態插入邏輯，改版時只換 JSX，這段邏輯原封保留。

## 3. 共用元件（依被引用檔案數排序）

| 引用數 | 元件 | 對應新元件（src/ui/） |
|---:|---|---|
| 181 | `Page` | 頁面外殼（保留 title/Helmet 行為） |
| 87 | `PageTitle` | `PageHeader` |
| 82 | `AdminPageHeader` | `PageHeader` |
| 61 | `DateSelector/` | `DatePicker`（Toolbar 用） |
| 29 | `TableEditBar` | `Toolbar` 批次動作列 |
| 28 | `EmployeeAutoComplete` | 外觀換 `Combobox`，查詢不動 |
| 20 | `MerchantSearchBar/` | `Toolbar` 商家篩選 |
| 11 | `SourceSelect`、`ManagementTable` | `Select`、`Table` |
| 10 | `ReferToggleButton`、`GenericMoreButton`、`CustomerAutoComplete` | `Tabs`/分段按鈕、`DropdownMenu`、`Combobox` |
| ≤8 | 其餘 40 個 AutoComplete / Modal / Bar | 隨頁面批次處理 |
| 0 | `TransferList`、`SearchField`、`AddPost` | 未被引用，不改版 |

其他：`src/elements/{label,snackbars}.js`（→ `Badge`、`Toast`）、`src/theme/`（MUI 主題，全部遷移後才移除）。

## 4. 三個驗收頁（步驟 D）

| 頁面 | 路由 | 位置 | 規模 | 風險 |
|---|---|---|---:|---|
| 打帳單 | `/order/create` | `views/OrderCreate/`（22 檔 + Pannel/ + styles/） | 11,242 行 | **高**：金額計算、付款、卡券、紅利都在此；`PannelBonus` 被 OrderEdit / DraftOrderEdit / QueueOrderEdit 共用 |
| 帳單列表 | `/management/orders` | `views/OrderManagementList/` | 1,634 行 | 中 |
| 報表首頁 | `/dashboard-list-detail`（側欄「報表目錄」） | `layouts/DashBoardListDetail/index.js` | 254 行 | 低 |

## 5. 規模最大的頁面（後續分批時需拆小）

`OrderCreate` 11,242、`OrderEdit` 8,481、`DraftOrderEdit` 8,261、`EmployeeManagementDetail` 7,382、`QueueOrderEdit` 6,992、`Parameter` 6,517、`Profile` 5,810。
其中 OrderCreate / OrderEdit / DraftOrderEdit / QueueOrderEdit 結構高度重複，建議同一批處理。

## 6. 決策紀錄

| # | 議題 | 決定 |
|---|---|---|
| 1 | 測試後端 | 待提供。`init-apollo.js:59` 未設定時會 fallback 到正式環境；本機測試一律以 `REACT_APP_API_URL` 指定，未取得測試網址前只用無效位址 `http://127.0.0.1:9/graphql` 截圖 |
| 2 | 分支 | 沿用 `claude/upbeat-carson-pdc7rf` 作為改版分支，不碰 main |
| 3 | PR 粒度 | 一頁一個 PR（STYLE.md §10.3） |
| 4 | 顧客端 | `layouts/Customer` 11 頁放最後一批、獨立 PR；Line、EHS、`/ar` 不改版 |
| 5 | 報表首頁 | `/dashboard-list-detail`（報表目錄） |

## 7. 路由清單（全部）

### 櫃檯作業（11）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/checkout/daily` | `views/CheckoutDaily` | 每日結帳 | 901 |
| `/employee/picking` | `views/EmployeePicking` | 材料自購登錄 | 582 |
| `/accounting/records` | `views/AccountingRecordList` | 高階收支登錄 | 355 |
| `/general/accounting/records` | `views/GeneralAccountingRecordList` | 現金收支登錄 | 374 |
| `/order/create` | `views/OrderCreate` | 打帳單 | 11242 |
| `/management/orders` | `views/OrderManagementList` | 帳單列表 | 1634 |
| `/management/draft-orders` | `views/DraftOrderManagementList` | 掛單列表 | 1649 |
| `/employee-schedule` | `views/EmployeeSchedule` | 排班表 | 1284 |
| `/employee-clock-in` | `views/EmployeeClockIn` | 現場電腦打卡 | 632 |
| `/merchant-business-dashboard` | `views/MerchantBusinessDashboard` | 營業儀表板 | 418 |
| `/qrcode-clock-in` | `views/QRcodeClockIn` | 掃碼打卡 | 209 |

### 預約管理（3）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/management/reservation/designers/calendar` | `views/ManagementDesignersReservationRecord` | 單週預約紀錄 | 1764 |
| `/management/reservation/calendar` | `views/ManagementReservationRecord` | 單日預約紀錄 | 2684 |
| `/management/weborders` | `views/WebOrderManagementList` | 預約管理 | 467 |

### 報表及分析（43）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/merchant/sells/records` | `views/MerchantSellsRecords` | 店販抽成明細 | 374 |
| `/merchant/category/sells/records` | `views/MerchantCategorySellsRecords` | 店販分類抽成明細 | 644 |
| `/decrease/detail` | `views/DecreaseDetail` | 互助點數明細 | 327 |
| `/designer/perform/overview` | `views/DesignerPerformOverview` | 全店業績分析表 | 441 |
| `/designer-perform-basic` | `views/DesignerPerformBasic` | 設計師排行榜 | 707 |
| `/merchant-business-interval-report` | `views/MerchantBusinessIntervalReport` | 店家區間累計表 | 629 |
| `/employee-daily-report` | `views/EmployeeDailyReport` | 設計師日報表 | 1174 |
| `/designer-rake-report` | `views/DesignerRakeReport` | 設計師抽成報表 | 457 |
| `/cost-analysis-report` | `views/CostAnalysisReport` | 費用分析表 | 392 |
| `/income-statement-report` | `views/IncomeStatementReport` | 損益表 | 366 |
| `/service-deduction-detail-report` | `views/ServiceDeductionDetailReport` | 服務扣項明細表 | 449 |
| `/decrease-daily-report` | `views/DecreaseDailyReport` | 互助日報表 | 577 |
| `/helper-leaderboard` | `views/HelperLeaderBoard` | 互助排行榜 | 461 |
| `/product-leader-board` | `views/ProductLeaderBoard` | 商品銷售排行榜 | 209 |
| `/customer-wallet-balance` | `views/CustomerWalletBalance` | 顧客入金餘額表 | 203 |
| `/payment-report` | `views/PaymentReport` | 每日非現金明細 | 239 |
| `/money-flow-category-report` | `views/MoneyFlowCategoryReport` | 收支分類明細表 | 252 |
| `/money-flow-transfer-report` | `views/MoneyFlowTransferReport` | 收支匯款表 | 204 |
| `/designer-perforamnce-analyze-report` | `views/DesignerPerforamnceAnalyzeReport` | 設計師業績分析表 | 960 |
| `/merchant-daily-report` | `views/MerchantDailyReport` | 店家日報表 | 904 |
| `/money-flow-daily-report` | `views/MoneyFlowDailyReport` | 每日收支明細 | 319 |
| `/product-consume-report` | `views/ProductConsumeReport` | 商品消耗明細 | 326 |
| `/designer-monthly-report` | `views/DesignerMonthlyReport` | 設計師業績月報表 | 472 |
| `/dashboard-list-detail` | `layouts/DashBoardListDetail` | 報表目錄 | 254 |
| `/helper-monthly-report` | `views/HelperMonthlyReport` | 互助月報表 | 227 |
| `/helper-performance` | `views/HelperPerformanceReport` | 互助業績報表 | 400 |
| `/merchant-leader-board` | `views/MerchantLeaderBoard` | 店家排行榜 | 628 |
| `/single-service-report` | `views/SingleServiceSearchingReport` | 單一服務項目查詢 | 550 |
| `/non-cash-statement-report` | `views/NonCashDetailStatementReport` | 非現金明細對帳單 | 444 |
| `/business-analysis-report` | `views/BusinessAnalysisReport` | 營業統計分析表 | 361 |
| `/customer-coupon-report` | `views/CustomerCouponBalance` | 顧客卡券餘額表 | 326 |
| `/overall-performance-analysis-report` | `views/OverallPerformanceAnalysisReport` | 多店業績統計表 | 423 |
| `/designer-performance-report` | `views/DesignerPerformanceReport` | 設計師業績表 | 534 |
| `/consumption-analytics-dashboard` | `views/ConsumptionAnalyticsDashboard` | 消費分析儀表板 | 2339 |
| `/product-invoicing-record-report` | `views/ProductInvoicingRecordReport` | 商品進銷貨報表 | 371 |
| `/business-items-monthly-analyze-report` | `views/BusinessItemsMonthlyAnalyzeReport` | 營業項目月分析表 | 264 |
| `/multi-merchants-leader-board` | `views/MultiMerchantsLeaderBoard` | 多店店販銷售排行 | 391 |
| `/product-inventoryList` | `views/ProductInventoryList` | 商品庫存表 | 424 |
| `/membership-sell-report` | `views/MembershipSellReport` | 會員卡銷售報表 | 247 |
| `/product-reserve-check` | `views/ProductReserveCheck` | 商品庫存盤點表 | 353 |
| `/customer-consumption-leaderboard` | `views/CustomerConsumptionLeaderboard` | 顧客消費排行榜 | 368 |
| `/customer-wallet-leaderboard` | `views/CustomerWalletLeaderboard` | 顧客入金排行榜 | 317 |
| `/merchant-daily-performance-report` | `views/MerchantDailyPerformanceReport` | 每日業績分析表 | 362 |

### 客戶管理（4）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/management/coupons` | `views/ManagementCoupons` | 卡券管理 | 612 |
| `/topup` | `views/TopUp` | 入金管理 | 531 |
| `/management/customers` | `views/CustomerManagementList` | 客戶列表 | 606 |
| `/management/customer-filter-export` | `views/CustomerFilterExport` | 客資篩選匯出 | 803 |

### 員工及薪資（8）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/salary/overview` | `views/SalaryOverview` | 每月薪資維護 | 1012 |
| `/management/employee` | `views/EmployeeManagementList` | 員工列表 | 1846 |
| `/attendance/records` | `views/AttendanceRecords` | 全店打卡記錄 | 1198 |
| `/attendance-employee-schedule` | `views/AttendanceEmployeeSchedule` | 考勤排班總表 | 783 |
| `/employee-payslip` | `views/EmployeePayslip` | 薪資條 | 562 |
| `/designers-salary-detail` | `views/DesignersSalaryDetailReport` | 薪資明細表 | 441 |
| `/merchant-bank-transfe-report` | `views/MerchantBankTransferReport` | 薪資轉帳明細 | 374 |
| `/employee-resignation-list` | `views/EmployeeResignationList` | 員工離職列表 | 222 |

### 商品管理（5）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/products` | `views/Products` | 商品列表 | 1072 |
| `/product/categories` | `views/ProductCategories` | 商品分類設定 | 304 |
| `/product/restock` | `views/ProductRestock` | 商品進貨作業 | 556 |
| `/merchant-vendor` | `views/MerchantVendor` | 廠商列表 | 293 |
| `/inventory-work` | `views/InventoryWork` | 盤點作業 | 318 |

### 資料設定（10）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/parameter` | `views/Parameter` | 系統參數設定 | 6517 |
| `/payments` | `views/Payments` | 支付方式設定 | 249 |
| `/accountingSetting` | `views/AccountingSetting` | 收支科目設定 | 406 |
| `/service/categories` | `views/ServiceCategories` | 服務分類設定 | 262 |
| `/services` | `views/Services` | 服務項目設定 | 1867 |
| `/coupons` | `views/CouponList` | 預收卡設定 | 1986 |
| `/third-party-coupons` | `views/ThirdPartyCoupons` | 第三方卡券設定 | 239 |
| `/authority` | `views/Authority` | 角色權限管理 | 309 |
| `/performanceDeductionParameter` | `views/PerformanceDeductionParameter` | 業績抽成參數設定 | 1393 |
| `/shortcut` | `views/Shortcut` | 組合設定 | 322 |

### 行銷工具（3）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/main-event-list` | `views/MainEventList` | 活動列表 | 638 |
| `/merchant-participating-list` | `views/MerchantParticipatingList` | 活動店家參與列表 | 304 |
| `/event-coupon-issuance-details` | `views/EventCouponIssuanceDetails` | 活動發券明細 | 369 |

### 會員卡管理（2）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/member-card-record` | `views/MemberCardRecord` | 會員卡列表 | 739 |
| `/member-card-categories` | `views/MemberCardCategories` | 會員卡分類設定 | 290 |

### 紅利點數設定（1）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/customer-bonus-record` | `views/CustomerBonusRecord` | 紅利點數紀錄 | 275 |

### Line（3，其中 `/ar` `/ar2` 實際無 layout）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/line/map/:id` | `LineMap` |  | 0 |
| `/ar` | `AR2` |  | 0 |
| `/ar2` | `AR2` |  | 0 |

### （側欄未列，次頁/明細/編輯）（71）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/manager/memberChangeLineMenu` | `views/ChangeLineMenuPage/memberChangeLineMenu` |  | 108 |
| `/manager/temp/attendanceRecord` | `views/ChangeLineMenuPage/temp` |  | 44 |
| `/accounting/subject` | `views/AccountingSubject` |  | 429 |
| `/employee/picking/edit/:id` | `views/EmployeePickingEdit` |  | 459 |
| `/employee/picking/create` | `views/EmployeePickingCreate` |  | 1219 |
| `/salary/detail` | `views/SalaryDetail` |  | 1058 |
| `/salary/edit/:id` | `views/SalaryEdit` |  | 2532 |
| `/topup/edit/:id` | `views/TopUpEdit` |  | 409 |
| `/topup/create` | `views/TopUpCreate` |  | 299 |
| `/designer/perform/detail` | `views/DesignerPerformDetail` |  | 1094 |
| `/accounting/create` | `views/AccountingRecordCreate` |  | 827 |
| `/general/accounting/create` | `views/GeneralAccountingRecordCreate` |  | 778 |
| `/general/accounting/deatil/:id` | `views/GeneralAccountingRecordDetail` |  | 906 |
| `/accounting/deatil/:id` | `views/AccountingRecordDetail` |  | 941 |
| `/product/create` | `views/ProductCreate` |  | 700 |
| `/product/edit/:id` | `views/ProductEdit` |  | 670 |
| `/product/duplicate/:id` | `views/ProductEdit` |  | 670 |
| `/product/category/create` | `views/ProductCategoryCreate` |  | 162 |
| `/product/category/edit/:id` | `views/ProductCategoryEdit` |  | 151 |
| `/product/restock/create` | `views/ProductRestockCreate` |  | 1193 |
| `/product/restock/edit/:id` | `views/ProductRestockEdit` |  | 1170 |
| `/payment/create` | `views/PaymentCreate` |  | 257 |
| `/payment/edit/:id` | `views/PaymentEdit` |  | 277 |
| `/service/category/create` | `views/ServiceCategoryCreate` |  | 225 |
| `/service/category/edit/:id` | `views/ServiceCategoryEdit` |  | 224 |
| `/service/create` | `views/ServiceCreate` |  | 1820 |
| `/service/edit/:id` | `views/ServiceEdit` |  | 2152 |
| `/service/duplicate/:id` | `views/ServiceEdit` |  | 2152 |
| `/profile/:tab` | `views/Profile` |  | 5810 |
| `/coupon/create` | `views/CouponCreate` |  | 1461 |
| `/coupon/edit/:id` | `views/CouponEdit` |  | 1771 |
| `/coupon/duplicate/:id` | `views/CouponEdit` |  | 1771 |
| `/employee/create` | `views/EmployeeCreate` |  | 276 |
| `/management/employee/:id` | `views/EmployeeManagementDetail` |  | 7382 |
| `/management/employee/:id/:tab` | `views/EmployeeManagementDetail` |  | 7382 |
| `/management/customer/create` | `views/CustomerCreate` |  | 438 |
| `/management/customers/:id` | `views/CustomerManagementDetails` |  | 3822 |
| `/management/customers/:id/:tab` | `views/CustomerManagementDetails` |  | 3822 |
| `/order/:id` | `views/OrderEdit` |  | 8481 |
| `/draft-order/:id` | `views/DraftOrderEdit` |  | 8261 |
| `/getting-started` | `views/GettingStarted` |  | 52 |
| `/thirdPartyCoupon/create` | `views/ThirdPartyCouponCreate` |  | 193 |
| `/thirdPartyCoupon/edit/:id` | `views/ThirdPartyCouponEdit` |  | 222 |
| `/role/create` | `views/AuthorityCreate` |  | 167 |
| `/role/edit/:id` | `views/AuthorityEdit` |  | 221 |
| `/member-card/edit/:id` | `views/MemberCardEdit` |  | 589 |
| `/member-card-category/edit/:id` | `views/MemberCardCategoryEdit` |  | 120 |
| `/member-card/create` | `views/MemberCardCreate` |  | 493 |
| `/member-card-category/create` | `views/MemberCardCategoryCreate` |  | 122 |
| `/queue-order-edit/:id` | `views/QueueOrderEdit` |  | 6992 |
| `/system-update-record` | `views/SystemUpdateRecord` |  | 192 |
| `/system-update-record/create` | `views/SystemUpdateRecordCreate` |  | 215 |
| `/system-update-record/edit/:id` | `views/SystemUpdateRecordEdit` |  | 237 |
| `/deduction-setting` | `views/CreateDeductionSetting` |  | 1248 |
| `/update-deduction-setting/:id` | `views/UpdateDeductionSetting` |  | 1295 |
| `/merchant-vendor/create` | `views/MerchantVendorCreate` |  | 226 |
| `/merchant-vendor/edit/:id` | `views/MerchantVendorEdit` |  | 238 |
| `/helper-point-setting-create` | `views/HelperPointSettingCreate` |  | 282 |
| `/helper-point-setting-edit/:id` | `views/HelperPointSettingEdit` |  | 306 |
| `/customer-bonus-record/create` | `views/CustomerBonusRecordCreate` |  | 221 |
| `/customer-bonus-record/create/:id` | `views/CustomerBonusRecordCreate` |  | 221 |
| `/customer-bonus-record/edit/:id` | `views/CustomerBonusRecordEdit` |  | 235 |
| `/inventory-work/create` | `views/InventoryWorkCreate` |  | 405 |
| `/inventory-work/edit/:id` | `views/InventoryWorkEdit` |  | 474 |
| `/inventory-work/review/:id` | `views/InventoryWorkReview` |  | 267 |
| `/main-event-create` | `views/MainEventCreate` |  | 263 |
| `/main-event-edit/:id` | `views/MainEventEdit` |  | 307 |
| `/event-rule-create/:id` | `views/EventRuleCreate` |  | 839 |
| `/event-rule-edit/:id` | `views/EventRuleEdit` |  | 960 |
| `/shortcut/create` | `views/ShortcutCreate` |  | 287 |
| `/shortcut/edit/:id` | `views/ShortcutEdit` |  | 347 |

### Customer（12）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/customer/clearstorage` | `views/ClearStorage` |  | 7 |
| `/customer/member/card` | `MemberCard` |  | 0 |
| `/customer/member/create` | `MemberCreate` |  | 0 |
| `/customer/reservation/list` | `ReservationList` |  | 0 |
| `/customer/reservation/:id` | `ReservationPage` |  | 0 |
| `/customer/login` | `views/CustomerLogin` |  | 157 |
| `/customer/consumption/records` | `views/ConsumptionRecords` |  | 213 |
| `/customer/self-create/:id` | `CustomerSelfCreate` |  | 0 |
| `/customer/send-event-ticket/:id` | `CustomerSendEventTicket` |  | 0 |
| `/customer/rating/:orderId/:rank` | `CustomerRating` |  | 0 |
| `/customer/event-ticket-search` | `CustomerEventTicketSearch` |  | 0 |
| `/ets` | `CustomerEventTicketSearch` |  | 0 |

### EHSLayout（5）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/changelinemenu/index2` | `views/ChangeLineMenuPage/index` |  | 96 |
| `/changelinemenu/default` | `views/ChangeLineMenuPage/defaultMenu` |  | 94 |
| `/ehs2/ehs` | `views/EHS2Page/ehs` |  | 220 |
| `/ehs2/ehs2` | `views/EHS2Page/ehs2` |  | 63 |
| `/ehs2/privacy` | `views/EHS2Page/privacy` |  | 233 |

### AuthLayout（3）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/auth/login` | `views/Login` |  | 350 |
| `/auth/register` | `views/Register` |  | 188 |
| `/auth/resetpassword` | `views/Resetpassword` |  | 273 |

### ErrorLayout（3）

| 路由 | 元件 | 側欄名稱 | 行數 |
|---|---|---|---:|
| `/errors/error-401` | `views/Error401` |  | 61 |
| `/errors/error-404` | `views/Error404` |  | 61 |
| `/errors/error-500` | `views/Error500` |  | 61 |
