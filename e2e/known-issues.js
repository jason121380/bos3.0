// 已知問題清單：掃描發現、尚未修的頁面。這份清單應該要清空——修好一項就刪掉一項。
// 每筆：route（完整路徑，含假參數）、viewports（"mobile"／"desktop"／"all"＝手機＋桌機含深色／"failAll"＝所有查詢失敗情境）、
// skip（略過的檢查：crash／hScroll／console）、reason。
// 「假資料不足」：頁面用假 GraphQL 畫不出來（沒有 schema，清單／欄位形狀猜不到），不是頁面 bug；補 e2e/fake-graphql.js 的 FIXTURES
//   或重跑 e2e/learn-shapes.js 後刪掉。這些頁面仍必須通過「所有查詢失敗」情境。
// 「真 bug」：後端失敗時整頁錯誤（白頁），修好程式後刪掉。
module.exports = [
  {
    "route": "/salary/edit/id-1?date=1790784000000",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：RangeError: Invalid time value（薪資資料的日期欄位形狀）"
  },
  {
    "route": "/accounting/deatil/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'name')"
  },
  {
    "route": "/accounting/detail/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'name')"
  },
  {
    "route": "/business-items-monthly-analyze-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'serviceCategoriesPerformance')"
  },
  {
    "route": "/consumption-analytics-dashboard",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: idx(...).slice is not a function"
  },
  {
    "route": "/customer-bonus-record/edit/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：RangeError: Invalid time value"
  },
  {
    "route": "/customer-coupon-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/customer-wallet-balance",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/dashboard-list-detail",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/decrease-daily-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/deduction-setting",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/designer-monthly-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/designer-perforamnce-analyze-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符（舊拼字網址，導向 /designer-performance-analyze-report）"
  },
  {
    "route": "/designer-performance-analyze-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/designer-perform-basic",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/designer/perform/overview",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'categoryData')"
  },
  {
    "route": "/designers-salary-detail",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/employee/create",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/event-rule-create/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: (idx(...) || []).map is not a function"
  },
  {
    "route": "/event-rule-edit/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: (idx(...) || []).map is not a function"
  },
  {
    "route": "/general/accounting/deatil/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'name')"
  },
  {
    "route": "/general/accounting/detail/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'name')"
  },
  {
    "route": "/helper-leaderboard",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/helper-performance",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/helper-point-setting-edit/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'map')"
  },
  {
    "route": "/income-statement-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/inventory-work",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'length')"
  },
  {
    "route": "/main-event-edit/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of null (reading 'allMerchants')"
  },
  {
    "route": "/management/coupons",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/management/customers",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of null (reading 'loading')"
  },
  {
    "route": "/management/reservation/calendar",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: merchant.data.merchant.openingHours.slice.split is not a function or its return value is not iterable"
  },
  {
    "route": "/management/reservation/designers/calendar",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: _.data.merchant.openingHours.slice(...).split is not a function"
  },
  {
    "route": "/membership-sell-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/merchant-bank-transfe-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/merchant-daily-performance-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: (merchantDailyPerformanceReport || []).some is not a function"
  },
  {
    "route": "/merchant-vendor/edit/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/money-flow-category-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/money-flow-transfer-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/multi-merchants-leader-board",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/non-cash-statement-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'map')"
  },
  {
    "route": "/parameter",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/payment-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of null (reading 'map')"
  },
  {
    "route": "/product-invoicing-record-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/product-leader-board",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/queue-order-edit/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of null (reading 'serviceOrders')"
  },
  {
    "route": "/service-deduction-detail-report",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/service/category/create",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/service/category/edit/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/system-update-record/edit/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：TypeError: Cannot read properties of undefined (reading 'content')"
  },
  {
    "route": "/third-party-coupons",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/thirdPartyCoupon/edit/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  },
  {
    "route": "/update-deduction-setting/id-1",
    "viewports": "all",
    "skip": [
      "crash",
      "console"
    ],
    "reason": "假資料不足：自動補齊的回應形狀與頁面預期不符"
  }
]
