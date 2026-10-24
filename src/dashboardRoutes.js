// 後台（DashboardLayout）路由表：自 routes.js 的萬用路由（route: '*'）原樣搬出（2026/10/21）。
// 陣列順序即 renderRoutes 的比對順序，最後一筆為 404 導向，新增路由請放在它之前。
import React from 'react'
import { Redirect } from 'react-router-dom'
import { lazyWithRetry as lazy } from 'lib/lazy-with-retry'

export default [
  {
    path: '/management/reservation/designers/calendar',
    exact: true,
    component: lazy(() => import('views/ManagementDesignersReservationRecord')),
  },
  {
    path: '/management/reservation/calendar',
    exact: true,
    component: lazy(() => import('views/ManagementReservationRecord')),
  },
  {
    path: '/management/coupons',
    exact: true,
    component: lazy(() => import('views/ManagementCoupons')),
  },
  {
    path: '/accounting/subject',
    exact: true,
    component: lazy(() => import('views/AccountingSubject')),
  },
  {
    path: '/merchant/sells/records',
    exact: true,
    component: lazy(() => import('views/MerchantSellsRecords')),
  },
  {
    path: '/merchant/category/sells/records',
    exact: true,
    component: lazy(() => import('views/MerchantCategorySellsRecords')),
  },
  {
    path: '/decrease/detail',
    exact: true,
    component: lazy(() => import('views/DecreaseDetail')),
  },
  {
    path: '/designer/perform/overview',
    exact: true,
    component: lazy(() => import('views/DesignerPerformOverview')),
  },
  {
    path: '/checkout/daily',
    exact: true,
    component: lazy(() => import('views/CheckoutDaily')),
  },
  {
    path: '/employee/picking/edit/:id',
    exact: true,
    component: lazy(() => import('views/EmployeePickingEdit')),
  },
  {
    path: '/employee/picking/create',
    exact: true,
    component: lazy(() => import('views/EmployeePickingCreate')),
  },
  {
    path: '/employee/picking',
    exact: true,
    component: lazy(() => import('views/EmployeePicking')),
  },
  {
    path: '/salary/detail',
    exact: true,
    component: lazy(() => import('views/SalaryDetail')),
  },
  {
    path: '/salary/edit/:id',
    exact: true,
    component: lazy(() => import('views/SalaryEdit')),
  },
  {
    path: '/salary/overview',
    exact: true,
    component: lazy(() => import('views/SalaryOverview')),
  },
  {
    path: '/topup/edit/:id',
    exact: true,
    component: lazy(() => import('views/TopUpEdit')),
  },
  {
    path: '/topup/create',
    exact: true,
    component: lazy(() => import('views/TopUpCreate')),
  },
  {
    path: '/topup',
    exact: true,
    component: lazy(() => import('views/TopUp')),
  },
  {
    path: '/designer/perform/detail',
    exact: true,
    component: lazy(() => import('views/DesignerPerformDetail')),
  },
  {
    path: '/accounting/create',
    exact: true,
    component: lazy(() => import('views/AccountingRecordCreate')),
  },
  {
    path: '/general/accounting/create',
    exact: true,
    component: lazy(() => import('views/GeneralAccountingRecordCreate')),
  },
  {
    path: '/general/accounting/deatil/:id',
    exact: true,
    component: lazy(() => import('views/GeneralAccountingRecordDetail')),
  },
  {
    path: '/accounting/deatil/:id',
    exact: true,
    component: lazy(() => import('views/AccountingRecordDetail')),
  },
  {
    path: '/accounting/records',
    exact: true,
    component: lazy(() => import('views/AccountingRecordList')),
  },
  {
    path: '/general/accounting/records',
    exact: true,
    component: lazy(() => import('views/GeneralAccountingRecordList')),
  },
  {
    path: '/order/create',
    exact: true,
    component: lazy(() => import('views/OrderCreate')),
  },
  {
    path: '/parameter',
    exact: true,
    component: lazy(() => import('views/Parameter')),
  },
  {
    path: '/products',
    exact: true,
    component: lazy(() => import('views/Products')),
  },
  {
    path: '/product/create',
    exact: true,
    component: lazy(() => import('views/ProductCreate')),
  },
  {
    path: '/product/edit/:id',
    exact: true,
    component: lazy(() => import('views/ProductEdit')),
  },
  {
    path: '/product/duplicate/:id',
    exact: true,
    component: lazy(() => import('views/ProductEdit')),
  },
  {
    path: '/product/categories',
    exact: true,
    component: lazy(() => import('views/ProductCategories')),
  },
  {
    path: '/product/category/create',
    exact: true,
    component: lazy(() => import('views/ProductCategoryCreate')),
  },
  {
    path: '/product/category/edit/:id',
    exact: true,
    component: lazy(() => import('views/ProductCategoryEdit')),
  },
  {
    path: '/product/restock',
    exact: true,
    component: lazy(() => import('views/ProductRestock')),
  },
  {
    path: '/product/restock/create',
    exact: true,
    component: lazy(() => import('views/ProductRestockCreate')),
  },
  {
    path: '/product/restock/edit/:id',
    exact: true,
    component: lazy(() => import('views/ProductRestockEdit')),
  },
  {
    path: '/payments',
    exact: true,
    component: lazy(() => import('views/Payments')),
  },
  {
    path: '/accountingSetting',
    exact: true,
    component: lazy(() => import('views/AccountingSetting')),
  },
  {
    path: '/payment/create',
    exact: true,
    component: lazy(() => import('views/PaymentCreate')),
  },
  {
    path: '/payment/edit/:id',
    exact: true,
    component: lazy(() => import('views/PaymentEdit')),
  },
  {
    path: '/service/categories',
    exact: true,
    component: lazy(() => import('views/ServiceCategories')),
  },
  {
    path: '/service/category/create',
    exact: true,
    component: lazy(() => import('views/ServiceCategoryCreate')),
  },
  {
    path: '/service/category/edit/:id',
    exact: true,
    component: lazy(() => import('views/ServiceCategoryEdit')),
  },
  {
    path: '/services',
    exact: true,
    component: lazy(() => import('views/Services')),
  },
  {
    path: '/service/create',
    exact: true,
    component: lazy(() => import('views/ServiceCreate')),
  },
  {
    path: '/service/edit/:id',
    exact: true,
    component: lazy(() => import('views/ServiceEdit')),
  },
  {
    path: '/service/duplicate/:id',
    exact: true,
    component: lazy(() => import('views/ServiceEdit')),
  },
  {
    path: '/profile/:tab',
    exact: true,
    component: lazy(() => import('views/Profile')),
  },
  {
    path: '/coupon/create',
    exact: true,
    component: lazy(() => import('views/CouponCreate')),
  },
  {
    path: '/coupon/edit/:id',
    exact: true,
    component: lazy(() => import('views/CouponEdit')),
  },
  {
    path: '/coupons',
    exact: true,
    component: lazy(() => import('views/CouponList')),
  },
  {
    path: '/coupon/duplicate/:id',
    exact: true,
    component: lazy(() => import('views/CouponEdit')),
  },
  {
    path: '/management/employee',
    exact: true,
    component: lazy(() => import('views/EmployeeManagementList')),
  },
  {
    path: '/employee/create',
    exact: true,
    component: lazy(() => import('views/EmployeeCreate')),
  },
  {
    path: '/management/employee/:id',
    exact: true,
    component: lazy(() => import('views/EmployeeManagementDetail')),
  },
  {
    path: '/management/employee/:id/:tab',
    exact: true,
    component: lazy(() => import('views/EmployeeManagementDetail')),
  },
  {
    path: '/management/customers',
    exact: true,
    component: lazy(() => import('views/CustomerManagementList')),
  },
  {
    path: '/management/customer-filter-export',
    exact: true,
    component: lazy(() => import('views/CustomerFilterExport')),
  },
  {
    path: '/management/customer/create',
    exact: true,
    component: lazy(() => import('views/CustomerCreate')),
  },
  {
    path: '/management/customers/:id',
    exact: true,
    component: lazy(() => import('views/CustomerManagementDetails')),
  },
  {
    path: '/management/customers/:id/:tab',
    exact: true,
    component: lazy(() => import('views/CustomerManagementDetails')),
  },
  {
    path: '/management/orders',
    exact: true,
    component: lazy(() => import('views/OrderManagementList')),
  },
  {
    path: '/management/draft-orders',
    exact: true,
    component: lazy(() => import('views/DraftOrderManagementList')),
  },
  {
    path: '/management/weborders',
    exact: true,
    component: lazy(() => import('views/WebOrderManagementList')),
  },
  {
    path: '/order/:id',
    exact: true,
    component: lazy(() => import('views/OrderEdit')),
  },
  {
    path: '/draft-order/:id',
    exact: true,
    component: lazy(() => import('views/DraftOrderEdit')),
  },
  {
    path: '/getting-started',
    exact: true,
    component: lazy(() => import('views/GettingStarted')),
  },
  {
    path: '/attendance/records',
    exact: true,
    component: lazy(() => import('views/AttendanceRecords')),
  },
  {
    path: '/attendance-employee-schedule',
    exact: true,
    component: lazy(() => import('views/AttendanceEmployeeSchedule')),
  },
  {
    path: '/designer-perform-basic',
    exact: true,
    component: lazy(() => import('views/DesignerPerformBasic')),
  },
  {
    path: '/merchant-business-interval-report',
    exact: true,
    component: lazy(() => import('views/MerchantBusinessIntervalReport')),
  },
  {
    path: '/employee-schedule',
    exact: true,
    component: lazy(() => import('views/EmployeeSchedule')),
  },
  {
    path: '/employee-daily-report',
    exact: true,
    component: lazy(() => import('views/EmployeeDailyReport')),
  },
  {
    path: '/designer-rake-report',
    exact: true,
    component: lazy(() => import('views/DesignerRakeReport')),
  },
  {
    path: '/employee-clock-in',
    exact: true,
    component: lazy(() => import('views/EmployeeClockIn')),
  },
  {
    path: '/cost-analysis-report',
    exact: true,
    component: lazy(() => import('views/CostAnalysisReport')),
  },
  {
    path: '/employee-payslip',
    exact: true,
    component: lazy(() => import('views/EmployeePayslip')),
  },
  {
    path: '/income-statement-report',
    exact: true,
    component: lazy(() => import('views/IncomeStatementReport')),
  },
  {
    path: '/service-deduction-detail-report',
    exact: true,
    component: lazy(() => import('views/ServiceDeductionDetailReport')),
  },
  {
    path: '/decrease-daily-report',
    exact: true,
    component: lazy(() => import('views/DecreaseDailyReport')),
  },
  {
    path: '/third-party-coupons',
    exact: true,
    component: lazy(() => import('views/ThirdPartyCoupons')),
  },
  {
    path: '/thirdPartyCoupon/create',
    exact: true,
    component: lazy(() => import('views/ThirdPartyCouponCreate')),
  },
  {
    path: '/thirdPartyCoupon/edit/:id',
    exact: true,
    component: lazy(() => import('views/ThirdPartyCouponEdit')),
  },
  {
    path: '/authority',
    exact: true,
    component: lazy(() => import('views/Authority')),
  },
  {
    path: '/role/create',
    exact: true,
    component: lazy(() => import('views/AuthorityCreate')),
  },
  {
    path: '/role/edit/:id',
    exact: true,
    component: lazy(() => import('views/AuthorityEdit')),
  },
  {
    path: '/designers-salary-detail',
    exact: true,
    component: lazy(() => import('views/DesignersSalaryDetailReport')),
  },
  {
    path: '/merchant-business-dashboard',
    exact: true,
    component: lazy(() => import('views/MerchantBusinessDashboard')),
  },
  {
    path: '/helper-leaderboard',
    exact: true,
    component: lazy(() => import('views/HelperLeaderBoard')),
  },
  {
    path: '/merchant-bank-transfe-report',
    exact: true,
    component: lazy(() => import('views/MerchantBankTransferReport')),
  },
  {
    path: '/product-leader-board',
    exact: true,
    component: lazy(() => import('views/ProductLeaderBoard')),
  },
  {
    path: '/customer-wallet-balance',
    exact: true,
    component: lazy(() => import('views/CustomerWalletBalance')),
  },
  {
    path: '/payment-report',
    exact: true,
    component: lazy(() => import('views/PaymentReport')),
  },
  {
    path: '/money-flow-category-report',
    exact: true,
    component: lazy(() => import('views/MoneyFlowCategoryReport')),
  },
  {
    path: '/money-flow-transfer-report',
    exact: true,
    component: lazy(() => import('views/MoneyFlowTransferReport')),
  },
  {
    path: '/designer-perforamnce-analyze-report',
    exact: true,
    component: lazy(() => import('views/DesignerPerforamnceAnalyzeReport')),
  },
  {
    path: '/merchant-daily-report',
    exact: true,
    component: lazy(() => import('views/MerchantDailyReport')),
  },
  {
    path: '/money-flow-daily-report',
    exact: true,
    component: lazy(() => import('views/MoneyFlowDailyReport')),
  },
  {
    path: '/product-consume-report',
    exact: true,
    component: lazy(() => import('views/ProductConsumeReport')),
  },
  {
    path: '/designer-monthly-report',
    exact: true,
    component: lazy(() => import('views/DesignerMonthlyReport')),
  },
  {
    path: '/dashboard-list-detail',
    exact: true,
    component: lazy(() => import('layouts/DashBoardListDetail')),
  },
  {
    path: '/helper-monthly-report',
    exact: true,
    component: lazy(() => import('views/HelperMonthlyReport')),
  },
  {
    path: '/helper-performance',
    exact: true,
    component: lazy(() => import('views/HelperPerformanceReport')),
  },
  {
    path: '/merchant-leader-board',
    exact: true,
    component: lazy(() => import('views/MerchantLeaderBoard')),
  },
  {
    path: '/single-service-report',
    exact: true,
    component: lazy(() => import('views/SingleServiceSearchingReport')),
  },
  {
    path: '/non-cash-statement-report',
    exact: true,
    component: lazy(() => import('views/NonCashDetailStatementReport')),
  },
  {
    path: '/business-analysis-report',
    exact: true,
    component: lazy(() => import('views/BusinessAnalysisReport')),
  },
  {
    path: '/member-card-record',
    exact: true,
    component: lazy(() => import('views/MemberCardRecord')),
  },
  {
    path: '/member-card-categories',
    exact: true,
    component: lazy(() => import('views/MemberCardCategories')),
  },
  {
    path: '/member-card/edit/:id',
    exact: true,
    component: lazy(() => import('views/MemberCardEdit')),
  },
  {
    path: '/member-card-category/edit/:id',
    exact: true,
    component: lazy(() => import('views/MemberCardCategoryEdit')),
  },
  {
    path: '/member-card/create',
    exact: true,
    component: lazy(() => import('views/MemberCardCreate')),
  },
  {
    path: '/member-card-category/create',
    exact: true,
    component: lazy(() => import('views/MemberCardCategoryCreate')),
  },
  {
    path: '/customer-coupon-report',
    exact: true,
    component: lazy(() => import('views/CustomerCouponBalance')),
  },
  {
    path: '/queue-order-edit/:id',
    exact: true,
    component: lazy(() => import('views/QueueOrderEdit')),
  },
  {
    path: '/system-update-record',
    exact: true,
    component: lazy(() => import('views/SystemUpdateRecord')),
  },
  {
    path: '/system-update-record/create',
    exact: true,
    component: lazy(() => import('views/SystemUpdateRecordCreate')),
  },
  {
    path: '/system-update-record/edit/:id',
    exact: true,
    component: lazy(() => import('views/SystemUpdateRecordEdit')),
  },
  {
    path: '/overall-performance-analysis-report',
    exact: true,
    component: lazy(() => import('views/OverallPerformanceAnalysisReport')),
  },
  {
    path: '/performanceDeductionParameter',
    exact: true,
    component: lazy(() => import('views/PerformanceDeductionParameter')),
  },
  {
    path: '/deduction-setting',
    exact: true,
    component: lazy(() => import('views/CreateDeductionSetting')),
  },
  {
    path: '/update-deduction-setting/:id',
    exact: true,
    component: lazy(() => import('views/UpdateDeductionSetting')),
  },
  {
    path: '/designer-performance-report',
    exact: true,
    component: lazy(() => import('views/DesignerPerformanceReport')),
  },
  {
    path: '/merchant-vendor',
    exact: true,
    component: lazy(() => import('views/MerchantVendor')),
  },
  {
    path: '/merchant-vendor/create',
    exact: true,
    component: lazy(() => import('views/MerchantVendorCreate')),
  },
  {
    path: '/merchant-vendor/edit/:id',
    exact: true,
    component: lazy(() => import('views/MerchantVendorEdit')),
  },
  {
    path: '/helper-point-setting-create',
    exact: true,
    component: lazy(() => import('views/HelperPointSettingCreate')),
  },
  {
    path: '/helper-point-setting-edit/:id',
    exact: true,
    component: lazy(() => import('views/HelperPointSettingEdit')),
  },
  {
    path: '/consumption-analytics-dashboard',
    exact: true,
    component: lazy(() => import('views/ConsumptionAnalyticsDashboard')),
  },
  {
    path: '/product-invoicing-record-report',
    exact: true,
    component: lazy(() => import('views/ProductInvoicingRecordReport')),
  },
  {
    path: '/business-items-monthly-analyze-report',
    exact: true,
    component: lazy(() => import('views/BusinessItemsMonthlyAnalyzeReport')),
  },
  {
    path: '/multi-merchants-leader-board',
    exact: true,
    component: lazy(() => import('views/MultiMerchantsLeaderBoard')),
  },
  {
    path: '/customer-bonus-record',
    exact: true,
    component: lazy(() => import('views/CustomerBonusRecord')),
  },
  {
    path: '/customer-bonus-record/create',
    exact: true,
    component: lazy(() => import('views/CustomerBonusRecordCreate')),
  },
  {
    path: '/customer-bonus-record/create/:id',
    exact: true,
    component: lazy(() => import('views/CustomerBonusRecordCreate')),
  },
  {
    path: '/customer-bonus-record/edit/:id',
    exact: true,
    component: lazy(() => import('views/CustomerBonusRecordEdit')),
  },
  {
    path: '/product-inventoryList',
    exact: true,
    component: lazy(() => import('views/ProductInventoryList')),
  },
  {
    path: '/employee-resignation-list',
    exact: true,
    component: lazy(() => import('views/EmployeeResignationList')),
  },
  {
    path: '/inventory-work',
    exact: true,
    component: lazy(() => import('views/InventoryWork')),
  },
  {
    path: '/inventory-work/create',
    exact: true,
    component: lazy(() => import('views/InventoryWorkCreate')),
  },
  {
    path: '/inventory-work/edit/:id',
    exact: true,
    component: lazy(() => import('views/InventoryWorkEdit')),
  },
  {
    path: '/inventory-work/review/:id',
    exact: true,
    component: lazy(() => import('views/InventoryWorkReview')),
  },
  {
    path: '/main-event-list',
    exact: true,
    component: lazy(() => import('views/MainEventList')),
  },
  {
    path: '/main-event-create',
    exact: true,
    component: lazy(() => import('views/MainEventCreate')),
  },
  {
    path: '/main-event-edit/:id',
    exact: true,
    component: lazy(() => import('views/MainEventEdit')),
  },
  {
    path: '/event-rule-create/:id',
    exact: true,
    component: lazy(() => import('views/EventRuleCreate')),
  },
  {
    path: '/event-rule-edit/:id',
    exact: true,
    component: lazy(() => import('views/EventRuleEdit')),
  },
  {
    path: '/merchant-participating-list',
    exact: true,
    component: lazy(() => import('views/MerchantParticipatingList')),
  },
  {
    path: '/event-coupon-issuance-details',
    exact: true,
    component: lazy(() => import('views/EventCouponIssuanceDetails')),
  },
  {
    path: '/membership-sell-report',
    exact: true,
    component: lazy(() => import('views/MembershipSellReport')),
  },
  {
    path: '/product-reserve-check',
    exact: true,
    component: lazy(() => import('views/ProductReserveCheck')),
  },
  {
    path: '/customer-consumption-leaderboard',
    exact: true,
    component: lazy(() => import('views/CustomerConsumptionLeaderboard')),
  },
  {
    path: '/customer-wallet-leaderboard',
    exact: true,
    component: lazy(() => import('views/CustomerWalletLeaderboard')),
  },
  {
    path: '/qrcode-clock-in',
    exact: true,
    component: lazy(() => import('views/QRcodeClockIn')),
  },
  {
    path: '/merchant-daily-performance-report',
    exact: true,
    component: lazy(() => import('views/MerchantDailyPerformanceReport')),
  },
  {
    path: '/shortcut',
    exact: true,
    component: lazy(() => import('views/Shortcut')),
  },
  {
    path: '/shortcut/create',
    exact: true,
    component: lazy(() => import('views/ShortcutCreate')),
  },
  {
    path: '/shortcut/edit/:id',
    exact: true,
    component: lazy(() => import('views/ShortcutEdit')),
  },
  {
    component: () => <Redirect to="/errors/error-404" />,
  },
]
