# 改版頁面檢查清單

> 自動產生（`node scripts/redesign/page-checklist.js`），產生時間：2026-10-18 13:50　改版前基準：`c41b604`
>
> 網址欄的連結指向 `http://localhost:3000`（本機執行 `npm start` 後可直接點；後端接測試機）。要換成別的網址：`node scripts/redesign/page-checklist.js --url https://你的測試網址`。有 `:id` 的頁面要從列表頁點進去。
>
> 狀態說明：🟢 已改版＝頁面的 MUI 元件已換成新元件；🟡 只換外觀＝只有色碼與圖示統一，版面是舊的；⚪ 沒改。
> 「殘留 MUI」是這個頁面目錄裡還在用 MUI 的檔案數，不為 0 不代表有問題（日期選擇器、Autocomplete、列印表格等刻意保留）。

## 總覽

| 項目 | 數量 |
|---|---|
| 頁面目錄總數 | 177 |
| 🟢 已改版 | 170 |
| 🟡 只換外觀 | 0 |
| ⚪ 沒改 | 7 |
| 有路由的頁面（網址）數 | 188 |
| 其中屬於已改版目錄的網址數 | 176 |

建議檢查順序：先看標 **金額重點** 的頁面（打帳單、帳單詳細、日結、薪資、入金），再看 **🖨 有列印** 的頁面（按列印預覽），最後走一遍選單。

## A. 後台——選單上的頁面

### 會員卡管理

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 會員卡分類設定 | [`/member-card-categories`](http://localhost:3000/member-card-categories) | 🟢 已改版 | 0 |  |
| ☐ | 會員卡列表 | [`/member-card-record`](http://localhost:3000/member-card-record) | 🟢 已改版 | 1/5 |  |

### 紅利點數設定

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 紅利點數紀錄 | [`/customer-bonus-record`](http://localhost:3000/customer-bonus-record) | 🟢 已改版 | 0 |  |

### 櫃檯作業

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 打帳單 | [`/order/create`](http://localhost:3000/order/create) | 🟢 已改版（兩輪） | 29/54 | 🖨 有列印；金額重點：折扣、付款、整單結帳 |
| ☐ | 帳單列表 | [`/management/orders`](http://localhost:3000/management/orders) | 🟢 已改版 | 1/3 | 🖨 有列印 |
| ☐ | 掛單列表（商家啟用掛單時顯示） | [`/management/draft-orders`](http://localhost:3000/management/draft-orders) | 🟢 已改版 | 1/2 | 🖨 有列印 |
| ☐ | 營業儀表板 | [`/merchant-business-dashboard`](http://localhost:3000/merchant-business-dashboard) | 🟢 已改版 | 0 |  |
| ☐ | 現金收支登錄 | [`/general/accounting/records`](http://localhost:3000/general/accounting/records) | 🟢 已改版 | 0 |  |
| ☐ | 高階收支登錄 | [`/accounting/records`](http://localhost:3000/accounting/records) | 🟢 已改版 | 0 |  |
| ☐ | 材料自購登錄 | [`/employee/picking`](http://localhost:3000/employee/picking) | 🟢 已改版 | 2/2 |  |
| ☐ | 每日結帳 | [`/checkout/daily`](http://localhost:3000/checkout/daily) | 🟢 已改版 | 0 | 金額重點：日結數字 |
| ☐ | 排班表 | [`/employee-schedule`](http://localhost:3000/employee-schedule) | 🟢 已改版 | 2/4 |  |
| ☐ | 現場電腦打卡 | [`/employee-clock-in`](http://localhost:3000/employee-clock-in) | 🟢 已改版 | 1/2 |  |
| ☐ | 掃碼打卡 | [`/qrcode-clock-in`](http://localhost:3000/qrcode-clock-in) | 🟢 已改版 | 1/2 |  |

### 預約管理

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 預約管理 | [`/management/weborders`](http://localhost:3000/management/weborders) | 🟢 已改版 | 1/2 |  |
| ☐ | 單日預約紀錄 | [`/management/reservation/calendar`](http://localhost:3000/management/reservation/calendar) | 🟢 已改版（兩輪） | 4/5 |  |
| ☐ | 單週預約紀錄 | [`/management/reservation/designers/calendar`](http://localhost:3000/management/reservation/designers/calendar) | 🟢 已改版（兩輪） | 4/5 |  |

### 報表及分析

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 報表目錄 | [`/dashboard-list-detail`](http://localhost:3000/dashboard-list-detail) | - | - |  |
| ☐ | 消費分析儀表板 | [`/consumption-analytics-dashboard`](http://localhost:3000/consumption-analytics-dashboard) | 🟢 已改版（兩輪） | 2/17 |  |
| ☐ | 店家區間累計表 | [`/merchant-business-interval-report`](http://localhost:3000/merchant-business-interval-report) | 🟢 已改版 | 1/2 | 🖨 有列印 |
| ☐ | 店家日報表 | [`/merchant-daily-report`](http://localhost:3000/merchant-daily-report) | 🟢 已改版 | 1/2 | 🖨 有列印 |
| ☐ | 店家排行榜 | [`/merchant-leader-board`](http://localhost:3000/merchant-leader-board) | 🟢 已改版（兩輪） | 1/2 | 🖨 有列印 |
| ☐ | 互助日報表 | [`/decrease-daily-report`](http://localhost:3000/decrease-daily-report) | 🟢 已改版 | 2/2 | 🖨 有列印 |
| ☐ | 互助月報表 | [`/helper-monthly-report`](http://localhost:3000/helper-monthly-report) | 🟢 已改版 | 1/2 | 🖨 有列印 |
| ☐ | 互助排行榜 | [`/helper-leaderboard`](http://localhost:3000/helper-leaderboard) | 🟢 已改版（兩輪） | 1/2 | 🖨 有列印 |
| ☐ | 互助點數明細 | [`/decrease/detail`](http://localhost:3000/decrease/detail) | 🟢 已改版 | 0 |  |
| ☐ | 互助業績報表 | [`/helper-performance`](http://localhost:3000/helper-performance) | 🟢 已改版 | 1/2 |  |
| ☐ | 全店業績分析表 | [`/designer/perform/overview`](http://localhost:3000/designer/perform/overview) | 🟢 已改版 | 0 |  |
| ☐ | 每日業績分析表 | [`/merchant-daily-performance-report`](http://localhost:3000/merchant-daily-performance-report) | 🟢 已改版 | 1/3 |  |
| ☐ | 營業統計分析表 | [`/business-analysis-report`](http://localhost:3000/business-analysis-report) | 🟢 已改版 | 1/2 | 🖨 有列印 |
| ☐ | 營業項目月分析表 | [`/business-items-monthly-analyze-report`](http://localhost:3000/business-items-monthly-analyze-report) | 🟢 已改版 | 0 | 🖨 有列印 |
| ☐ | 設計師業績表 | [`/designer-performance-report`](http://localhost:3000/designer-performance-report) | 🟢 已改版 | 1/2 | 🖨 有列印 |
| ☐ | 設計師日報表 | [`/employee-daily-report`](http://localhost:3000/employee-daily-report) | 🟢 已改版 | 2/2 | 🖨 有列印 |
| ☐ | 設計師業績分析表 | [`/designer-perforamnce-analyze-report`](http://localhost:3000/designer-perforamnce-analyze-report) | 🟢 已改版（兩輪） | 3/4 | 🖨 有列印 |
| ☐ | 設計師業績月報表 | [`/designer-monthly-report`](http://localhost:3000/designer-monthly-report) | 🟢 已改版（兩輪） | 1/2 | 🖨 有列印 |
| ☐ | 設計師抽成報表 | [`/designer-rake-report`](http://localhost:3000/designer-rake-report) | 🟢 已改版 | 1/2 | 🖨 有列印 |
| ☐ | 設計師排行榜 | [`/designer-perform-basic`](http://localhost:3000/designer-perform-basic) | 🟢 已改版（兩輪） | 1/2 | 🖨 有列印 |
| ☐ | 商品銷售排行榜 | [`/product-leader-board`](http://localhost:3000/product-leader-board) | 🟢 已改版 | 1/2 |  |
| ☐ | 商品消耗明細 | [`/product-consume-report`](http://localhost:3000/product-consume-report) | 🟢 已改版 | 1/2 |  |
| ☐ | 商品進銷貨報表 | [`/product-invoicing-record-report`](http://localhost:3000/product-invoicing-record-report) | 🟢 已改版（兩輪） | 2/2 | 🖨 有列印 |
| ☐ | 商品庫存表 | [`/product-inventoryList`](http://localhost:3000/product-inventoryList) | 🟢 已改版（兩輪） | 2/2 | 🖨 有列印 |
| ☐ | 商品庫存盤點表 | [`/product-reserve-check`](http://localhost:3000/product-reserve-check) | 🟢 已改版 | 1/2 |  |
| ☐ | 會員卡銷售報表 | [`/membership-sell-report`](http://localhost:3000/membership-sell-report) | 🟢 已改版 | 0 |  |
| ☐ | 服務扣項明細表 | [`/service-deduction-detail-report`](http://localhost:3000/service-deduction-detail-report) | 🟢 已改版 | 2/2 |  |
| ☐ | 單一服務項目查詢 | [`/single-service-report`](http://localhost:3000/single-service-report) | 🟢 已改版 | 1/2 |  |
| ☐ | 店販抽成明細 | [`/merchant/sells/records`](http://localhost:3000/merchant/sells/records) | 🟢 已改版 | 0 |  |
| ☐ | 店販分類抽成明細 | [`/merchant/category/sells/records`](http://localhost:3000/merchant/category/sells/records) | 🟢 已改版 | 1/2 |  |
| ☐ | 顧客入金餘額表 | [`/customer-wallet-balance`](http://localhost:3000/customer-wallet-balance) | 🟢 已改版 | 0 |  |
| ☐ | 顧客卡券餘額表 | [`/customer-coupon-report`](http://localhost:3000/customer-coupon-report) | 🟢 已改版 | 0 |  |
| ☐ | 每日非現金明細 | [`/payment-report`](http://localhost:3000/payment-report) | 🟢 已改版 | 0 |  |
| ☐ | 每日收支明細 | [`/money-flow-daily-report`](http://localhost:3000/money-flow-daily-report) | 🟢 已改版 | 0 |  |
| ☐ | 收支分類明細表 | [`/money-flow-category-report`](http://localhost:3000/money-flow-category-report) | 🟢 已改版 | 0 |  |
| ☐ | 收支匯款表 | [`/money-flow-transfer-report`](http://localhost:3000/money-flow-transfer-report) | 🟢 已改版 | 0 |  |
| ☐ | 非現金明細對帳單 | [`/non-cash-statement-report`](http://localhost:3000/non-cash-statement-report) | 🟢 已改版 | 1/2 |  |
| ☐ | 費用分析表 | [`/cost-analysis-report`](http://localhost:3000/cost-analysis-report) | 🟢 已改版（兩輪） | 2/2 | 🖨 有列印 |
| ☐ | 損益表 | [`/income-statement-report`](http://localhost:3000/income-statement-report) | 🟢 已改版（兩輪） | 1/2 | 🖨 有列印 |
| ☐ | 多店業績統計表 | [`/overall-performance-analysis-report`](http://localhost:3000/overall-performance-analysis-report) | 🟢 已改版 | 1/2 |  |
| ☐ | 多店店販銷售排行 | [`/multi-merchants-leader-board`](http://localhost:3000/multi-merchants-leader-board) | 🟢 已改版（兩輪） | 2/2 | 🖨 有列印 |
| ☐ | 顧客消費排行榜 | [`/customer-consumption-leaderboard`](http://localhost:3000/customer-consumption-leaderboard) | 🟢 已改版 | 1/3 |  |
| ☐ | 顧客入金排行榜 | [`/customer-wallet-leaderboard`](http://localhost:3000/customer-wallet-leaderboard) | 🟢 已改版 | 1/3 |  |

### 客戶管理

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 客戶列表 | [`/management/customers`](http://localhost:3000/management/customers) | 🟢 已改版 | 2/2 |  |
| ☐ | 客資篩選匯出 | [`/management/customer-filter-export`](http://localhost:3000/management/customer-filter-export) | 🟢 已改版 | 2/2 |  |
| ☐ | 卡券管理 | [`/management/coupons`](http://localhost:3000/management/coupons) | 🟢 已改版 | 2/3 |  |
| ☐ | 入金管理 | [`/topup`](http://localhost:3000/topup) | 🟢 已改版 | 2/4 | 金額重點：入金 |

### 員工及薪資

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 員工列表 | [`/management/employee`](http://localhost:3000/management/employee) | 🟢 已改版 | 2/4 |  |
| ☐ | 員工離職列表 | [`/employee-resignation-list`](http://localhost:3000/employee-resignation-list) | 🟢 已改版 | 1/2 |  |
| ☐ | 全店打卡記錄 | [`/attendance/records`](http://localhost:3000/attendance/records) | 🟢 已改版 | 2/2 |  |
| ☐ | 考勤排班總表 | [`/attendance-employee-schedule`](http://localhost:3000/attendance-employee-schedule) | 🟢 已改版 | 3/3 |  |
| ☐ | 每月薪資維護 | [`/salary/overview`](http://localhost:3000/salary/overview) | 🟢 已改版 | 2/3 | 金額重點：薪資總表 |
| ☐ | 薪資條 | [`/employee-payslip`](http://localhost:3000/employee-payslip) | 🟢 已改版 | 2/2 | 🖨 有列印 |
| ☐ | 薪資明細表 | [`/designers-salary-detail`](http://localhost:3000/designers-salary-detail) | 🟢 已改版 | 1/2 | 🖨 有列印 |
| ☐ | 薪資轉帳明細 | [`/merchant-bank-transfe-report`](http://localhost:3000/merchant-bank-transfe-report) | 🟢 已改版（兩輪） | 2/3 | 🖨 有列印 |

### 商品管理

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 商品分類設定 | [`/product/categories`](http://localhost:3000/product/categories) | 🟢 已改版 | 0 |  |
| ☐ | 商品列表 | [`/products`](http://localhost:3000/products) | 🟢 已改版 | 4/7 |  |
| ☐ | 商品進貨作業 | [`/product/restock`](http://localhost:3000/product/restock) | 🟢 已改版 | 1/2 |  |
| ☐ | 廠商列表 | [`/merchant-vendor`](http://localhost:3000/merchant-vendor) | 🟢 已改版 | 0 |  |
| ☐ | 盤點作業 | [`/inventory-work`](http://localhost:3000/inventory-work) | 🟢 已改版 | 1/2 |  |

### 資料設定

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 服務分類設定 | [`/service/categories`](http://localhost:3000/service/categories) | 🟢 已改版 | 0 |  |
| ☐ | 服務項目設定 | [`/services`](http://localhost:3000/services) | 🟢 已改版 | 2/4 |  |
| ☐ | 預收卡設定 | [`/coupons`](http://localhost:3000/coupons) | 🟢 已改版 | 3/5 |  |
| ☐ | 組合設定 | [`/shortcut`](http://localhost:3000/shortcut) | 🟢 已改版 | 0 |  |
| ☐ | 系統參數設定 | [`/parameter`](http://localhost:3000/parameter) | 🟢 已改版（兩輪） | 20/55 | 設定很多，逐分頁點開 |
| ☐ | 業績抽成參數設定 | [`/performanceDeductionParameter`](http://localhost:3000/performanceDeductionParameter) | 🟢 已改版 | 2/13 |  |
| ☐ | 收支科目設定 | [`/accountingSetting`](http://localhost:3000/accountingSetting) | 🟢 已改版 | 1/3 |  |
| ☐ | 支付方式設定 | [`/payments`](http://localhost:3000/payments) | 🟢 已改版 | 0 |  |
| ☐ | 第三方卡券設定 | [`/third-party-coupons`](http://localhost:3000/third-party-coupons) | 🟢 已改版 | 0 |  |
| ☐ | 角色權限管理 | [`/authority`](http://localhost:3000/authority) | 🟢 已改版 | 1/2 |  |

### 行銷工具

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 活動列表 | [`/main-event-list`](http://localhost:3000/main-event-list) | 🟢 已改版 | 0 |  |
| ☐ | 活動店家參與列表 | [`/merchant-participating-list`](http://localhost:3000/merchant-participating-list) | 🟢 已改版 | 1/2 |  |
| ☐ | 活動發券明細 | [`/event-coupon-issuance-details`](http://localhost:3000/event-coupon-issuance-details) | 🟢 已改版 | 0 |  |

## B. 後台——新增／編輯／明細等子頁面（從列表頁點進去）

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 切換選單 | [`/manager/memberChangeLineMenu`](http://localhost:3000/manager/memberChangeLineMenu) | ⚪ 沒改 | 4/4 |  |
| ☐ | 切換選單 | [`/manager/temp/attendanceRecord`](http://localhost:3000/manager/temp/attendanceRecord) | ⚪ 沒改 | 4/4 |  |
| ☐ | 收支科目明細 | [`/accounting/subject`](http://localhost:3000/accounting/subject) | 🟢 已改版 | 0 |  |
| ☐ | 編輯材料自購 | `/employee/picking/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 新增材料自購 | [`/employee/picking/create`](http://localhost:3000/employee/picking/create) | 🟢 已改版 | 2/3 |  |
| ☐ | 薪資明細表 | [`/salary/detail`](http://localhost:3000/salary/detail) | 🟢 已改版 | 1/5 |  |
| ☐ | 薪資維護 | `/salary/edit/:id` | 🟢 已改版 | 5/9 | 金額重點：薪資計算；需帶 ID，從列表點進去 |
| ☐ | 編輯入金 | `/topup/edit/:id` | 🟢 已改版 | 1/4 | 金額重點：入金；需帶 ID，從列表點進去 |
| ☐ | 新增入金 | [`/topup/create`](http://localhost:3000/topup/create) | 🟢 已改版 | 1/4 | 金額重點：入金 |
| ☐ | 設計師細項分析 | [`/designer/perform/detail`](http://localhost:3000/designer/perform/detail) | 🟢 已改版 | 2/10 |  |
| ☐ | 新增收借支紀錄 | [`/accounting/create`](http://localhost:3000/accounting/create) | 🟢 已改版 | 1/3 |  |
| ☐ | 新增收借支紀錄 | [`/general/accounting/create`](http://localhost:3000/general/accounting/create) | 🟢 已改版 | 1/3 |  |
| ☐ | 收支紀錄詳細 | `/general/accounting/deatil/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 收支紀錄詳細 | `/accounting/deatil/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 新增商品 | [`/product/create`](http://localhost:3000/product/create) | 🟢 已改版 | 2/4 |  |
| ☐ | 編輯商品 | `/product/edit/:id` | 🟢 已改版 | 2/4 | 需帶 ID，從列表點進去 |
| ☐ | 編輯商品（複製） | `/product/duplicate/:id` | 🟢 已改版 | 2/4 | 需帶 ID，從列表點進去 |
| ☐ | 新增商品分類 | [`/product/category/create`](http://localhost:3000/product/category/create) | 🟢 已改版 | 1/3 |  |
| ☐ | 編輯商品分類 | `/product/category/edit/:id` | 🟢 已改版 | 1/3 | 需帶 ID，從列表點進去 |
| ☐ | 新增商品進貨 | [`/product/restock/create`](http://localhost:3000/product/restock/create) | 🟢 已改版 | 2/3 |  |
| ☐ | 編輯進貨單 | `/product/restock/edit/:id` | 🟢 已改版 | 2/3 | 需帶 ID，從列表點進去 |
| ☐ | 新增支付方式 | [`/payment/create`](http://localhost:3000/payment/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 編輯支付方式 | `/payment/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 新增服務分類 | [`/service/category/create`](http://localhost:3000/service/category/create) | 🟢 已改版 | 1/3 |  |
| ☐ | 編輯服務分類 | `/service/category/edit/:id` | 🟢 已改版 | 1/3 | 需帶 ID，從列表點進去 |
| ☐ | 新增服務項目 | [`/service/create`](http://localhost:3000/service/create) | 🟢 已改版 | 5/6 |  |
| ☐ | 編輯服務項目 | `/service/edit/:id` | 🟢 已改版 | 5/6 | 需帶 ID，從列表點進去 |
| ☐ | 編輯服務項目（複製） | `/service/duplicate/:id` | 🟢 已改版 | 5/6 | 需帶 ID，從列表點進去 |
| ☐ | 變更帳戶資訊 | `/profile/:tab` | 🟢 已改版（兩輪） | 11/20 | 🖨 有列印；需帶 ID，從列表點進去 |
| ☐ | 新增卡券項目 | [`/coupon/create`](http://localhost:3000/coupon/create) | 🟢 已改版 | 3/4 |  |
| ☐ | 編輯預收卡 | `/coupon/edit/:id` | 🟢 已改版 | 3/4 | 需帶 ID，從列表點進去 |
| ☐ | 編輯預收卡（複製） | `/coupon/duplicate/:id` | 🟢 已改版 | 3/4 | 需帶 ID，從列表點進去 |
| ☐ | 新增員工 | [`/employee/create`](http://localhost:3000/employee/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 員工個人設定 | `/management/employee/:id` | 🟢 已改版（兩輪） | 12/23 | 🖨 有列印；需帶 ID，從列表點進去 |
| ☐ | 員工個人設定 | `/management/employee/:id/:tab` | 🟢 已改版（兩輪） | 12/23 | 🖨 有列印；需帶 ID，從列表點進去 |
| ☐ | 新增客戶 | [`/management/customer/create`](http://localhost:3000/management/customer/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 客戶詳細資料 | `/management/customers/:id` | 🟢 已改版 | 12/22 | 需帶 ID，從列表點進去 |
| ☐ | 客戶詳細資料 | `/management/customers/:id/:tab` | 🟢 已改版 | 12/22 | 需帶 ID，從列表點進去 |
| ☐ | 帳單詳細 | `/order/:id` | 🟢 已改版（兩輪） | 28/30 | 金額重點：帳單修改後數字；需帶 ID，從列表點進去 |
| ☐ | 掛單詳細 | `/draft-order/:id` | 🟢 已改版（兩輪） | 26/29 | 🖨 有列印；金額重點；需帶 ID，從列表點進去 |
| ☐ | 新手指南 | [`/getting-started`](http://localhost:3000/getting-started) | 🟢 已改版 | 0 |  |
| ☐ | 新增第三方卡券 | [`/thirdPartyCoupon/create`](http://localhost:3000/thirdPartyCoupon/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 編輯第三方卡券 | `/thirdPartyCoupon/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 新增角色 | [`/role/create`](http://localhost:3000/role/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 編輯角色 | `/role/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 編輯會員卡 | `/member-card/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 編輯會員卡分類 | `/member-card-category/edit/:id` | 🟢 已改版 | 0 | 需帶 ID，從列表點進去 |
| ☐ | 新增會員卡 | [`/member-card/create`](http://localhost:3000/member-card/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 新增會員卡分類 | [`/member-card-category/create`](http://localhost:3000/member-card-category/create) | 🟢 已改版 | 0 |  |
| ☐ | 重新開單（排隊單） | `/queue-order-edit/:id` | 🟢 已改版（兩輪） | 24/28 | 金額重點；需帶 ID，從列表點進去 |
| ☐ | 版本紀錄 | [`/system-update-record`](http://localhost:3000/system-update-record) | 🟢 已改版 | 1/2 |  |
| ☐ | 新增版本更新紀錄 | [`/system-update-record/create`](http://localhost:3000/system-update-record/create) | 🟢 已改版 | 0 |  |
| ☐ | 編輯版本紀錄 | `/system-update-record/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 抽成方式設定 | [`/deduction-setting`](http://localhost:3000/deduction-setting) | 🟢 已改版 | 1/2 |  |
| ☐ | 抽成方式設定 | `/update-deduction-setting/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 新增廠商 | [`/merchant-vendor/create`](http://localhost:3000/merchant-vendor/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 編輯廠商 | `/merchant-vendor/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 新增互助點數設定 | [`/helper-point-setting-create`](http://localhost:3000/helper-point-setting-create) | 🟢 已改版 | 1/2 |  |
| ☐ | 編輯互助點數設定 | `/helper-point-setting-edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 新增紅利點數 | [`/customer-bonus-record/create`](http://localhost:3000/customer-bonus-record/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 新增紅利點數 | `/customer-bonus-record/create/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 編輯紅利點數紀錄 | `/customer-bonus-record/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 新增盤點 | [`/inventory-work/create`](http://localhost:3000/inventory-work/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 編輯盤點 | `/inventory-work/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 盤點紀錄 | `/inventory-work/review/:id` | 🟢 已改版 | 2/2 | 🖨 有列印；需帶 ID，從列表點進去 |
| ☐ | 建立活動 | [`/main-event-create`](http://localhost:3000/main-event-create) | 🟢 已改版 | 1/2 |  |
| ☐ | 編輯活動 | `/main-event-edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 建立規則 | `/event-rule-create/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 編輯規則 | `/event-rule-edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 新增組合設定 | [`/shortcut/create`](http://localhost:3000/shortcut/create) | 🟢 已改版 | 1/2 |  |
| ☐ | 編輯組合設定 | `/shortcut/edit/:id` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |

## C. 顧客端（手機版）

> 這些頁面給顧客用，請用手機或手機寬度檢查。

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 清除快取（顧客端） | [`/customer/clearstorage`](http://localhost:3000/customer/clearstorage) | 🟢 已改版 | 0 |  |
| ☐ | 顧客端會員卡 | [`/customer/member/card`](http://localhost:3000/customer/member/card) | 🟢 已改版 | 0 |  |
| ☐ | 成為會員 | [`/customer/member/create`](http://localhost:3000/customer/member/create) | 🟢 已改版 | 1/1 |  |
| ☐ | 預約管理 | [`/customer/reservation/list`](http://localhost:3000/customer/reservation/list) | 🟢 已改版 | 0 |  |
| ☐ | 預約服務 | `/customer/reservation/:id` | 🟢 已改版 | 1/5 | 需帶 ID，從列表點進去 |
| ☐ | 預約服務 | [`/customer/login`](http://localhost:3000/customer/login) | 🟢 已改版 | 0 |  |
| ☐ | 消費記錄 | [`/customer/consumption/records`](http://localhost:3000/customer/consumption/records) | 🟢 已改版 | 0 |  |
| ☐ | 顧客自助建檔 | `/customer/self-create/:id` | 🟢 已改版 | 1/3 | 需帶 ID，從列表點進去 |
| ☐ | 顧客轉贈活動券 | `/customer/send-event-ticket/:id` | 🟢 已改版 | 1/1 | 需帶 ID，從列表點進去 |
| ☐ | 顧客評論 | `/customer/rating/:orderId/:rank` | 🟢 已改版 | 1/2 | 需帶 ID，從列表點進去 |
| ☐ | 抽獎券查詢 | [`/customer/event-ticket-search`](http://localhost:3000/customer/event-ticket-search) | 🟢 已改版 | 1/2 |  |
| ☐ | 抽獎券查詢 | [`/ets`](http://localhost:3000/ets) | 🟢 已改版 | 1/2 |  |

## D. 登入／註冊

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 登入 | [`/auth/login`](http://localhost:3000/auth/login) | 🟢 已改版 | 0 |  |
| ☐ | 註冊 | [`/auth/register`](http://localhost:3000/auth/register) | 🟢 已改版 | 0 |  |
| ☐ | 重設密碼 | [`/auth/resetpassword`](http://localhost:3000/auth/resetpassword) | 🟢 已改版 | 0 |  |

## E. 錯誤頁

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 錯誤頁 401 | [`/errors/error-401`](http://localhost:3000/errors/error-401) | 🟢 已改版 | 1/1 |  |
| ☐ | 錯誤頁 404 | [`/errors/error-404`](http://localhost:3000/errors/error-404) | 🟢 已改版 | 1/1 |  |
| ☐ | 錯誤頁 500 | [`/errors/error-500`](http://localhost:3000/errors/error-500) | 🟢 已改版 | 1/1 |  |

## F. LINE／EHS（決定不改版）

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 切換選單 | [`/changelinemenu/index2`](http://localhost:3000/changelinemenu/index2) | ⚪ 沒改 | 4/4 |  |
| ☐ | 切換選單 | [`/changelinemenu/default`](http://localhost:3000/changelinemenu/default) | ⚪ 沒改 | 4/4 |  |
| ☐ | 加入會員 | [`/ehs2/ehs`](http://localhost:3000/ehs2/ehs) | ⚪ 沒改 | 2/3 |  |
| ☐ | 加入會員 | [`/ehs2/ehs2`](http://localhost:3000/ehs2/ehs2) | ⚪ 沒改 | 2/3 |  |
| ☐ | 加入會員 | [`/ehs2/privacy`](http://localhost:3000/ehs2/privacy) | ⚪ 沒改 | 2/3 |  |

## G. 其他（決定不改版）

| 檢查 | 頁面 | 網址 | 改版狀態 | 殘留 MUI 檔數／檔案數 | 檢查重點 |
|---|---|---|---|---|---|
| ☐ | 打卡系統 | `/line/map/:id` | ⚪ 沒改 | 0 | 需帶 ID，從列表點進去 |
| ☐ | 打卡記錄 | [`/ar`](http://localhost:3000/ar) | ⚪ 沒改 | 1/1 |  |
| ☐ | 打卡記錄 | [`/ar2`](http://localhost:3000/ar2) | ⚪ 沒改 | 1/1 |  |

## H. 沒改的頁面目錄

- ~~`AR`~~（沒有被任何路由使用，2026/10/21 已刪除）
- `AR2`
- `ChangeLineMenuPage`
- `EHS2Page`
- `Line`
- ~~`LinepayQRcode`~~（沒有被任何路由使用，2026/10/21 已刪除）
- `Typography`（沒有被任何路由使用，疑似舊程式碼）

## I. 沒有被任何路由使用的頁面目錄（不會出現在網站上）

- ~~`AR`~~　已刪除（2026/10/21，PR #224）
- ~~`LinepayQRcode`~~　已刪除（2026/10/21，PR #224）
- `Typography`　⚪ 沒改
