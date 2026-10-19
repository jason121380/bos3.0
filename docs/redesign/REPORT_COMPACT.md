# 報表 compact 複查總表

> 掃描日期：2026/10/19　版號：v3.0-1019-1005（暫定）　性質：**盤點文件，只記事實與待辦，不代表任何一頁已通過實機驗收**。
> 口徑：以 `src/views/<目錄>` 為單位；「ui/table」＝該目錄有檔案 `from 'ui/table'`；「有 dense」＝該目錄有 `Table` 實際傳 `dense`（`rg -lw dense` 命中）；「MUI 表格」＝仍有 `@mui/material` 的 Table 系列。
> **數量註記**：下列分類加總為 **42** 個目錄（已 compact 35＋仍用 MUI 7）；原指令口徑為 41，差 1 尚未對出是哪一個目錄，待核對，不影響各目錄分類。

## 一、已 compact（ui/table 且有 dense）— 35 個

BusinessAnalysisReport、BusinessItemsMonthlyAnalyzeReport、CostAnalysisReport、DecreaseDailyReport、DesignerMonthlyReport、DesignerPerforamnceAnalyzeReport、DesignerPerformanceReport、DesignerRakeReport、DesignersSalaryDetailReport、EmployeeDailyReport、HelperMonthlyReport、HelperPerformanceReport、IncomeStatementReport、MembershipSellReport、MerchantBankTransferReport、MerchantBusinessIntervalReport、MerchantDailyPerformanceReport、MerchantDailyReport、MoneyFlowCategoryReport、MoneyFlowDailyReport、MoneyFlowTransferReport、NonCashDetailStatementReport、OverallPerformanceAnalysisReport、PaymentReport、ProductConsumeReport、ProductInvoicingRecordReport、ProductLeaderBoard、SingleServiceSearchingReport、DecreaseDetail（互助點數明細，PR #50 補）、SalaryDetail、SalaryOverview、CustomerConsumptionLeaderboard、CustomerWalletLeaderboard、MerchantCategorySellsRecords、ConsumptionAnalyticsDashboard（儀表板排行表，PR #51 補）。

備註：`DecreaseDailyReport`、`MerchantDailyReport` 同檔仍有 MUI `TableContainer`（下方明細卡片，列印 CSS 依 `.MuiTableContainer-root` 排版），主報表已 compact、MUI 殘留部分未動。

## 二、已補改（原漏 dense）— 7 個目錄

DecreaseDetail（PR #50）與 SalaryDetail（3 檔）、SalaryOverview、CustomerConsumptionLeaderboard、CustomerWalletLeaderboard、MerchantCategorySellsRecords、ConsumptionAnalyticsDashboard 五個 Ranking 排行表（PR #51）：主表格只加 `dense`，欄位、數字、合計列、CSV 匯出皆未動。此類漏改已清零。

## 四、仍用 MUI 表格 — 7 個

| 目錄 | 原因／備註 |
|---|---|
| AttendanceEmployeeSchedule | 排班格線、特殊 dateCell |
| EmployeePayslip | 薪資條列印、MUI `size=small` |
| HelperLeaderBoard | MUI＋可展開列 |
| MerchantLeaderBoard | MUI `size=small`，待轉 `ui/table` |
| MultiMerchantsLeaderBoard | MUI＋展開列＋sticky |
| **DesignerPerformBasic**（風險頁） | 巢狀表；方案：以分段表格或 facade 逐列群組呈現 compact，需專批，**不得硬套 dense 到巢狀結構** |
| **ServiceDeductionDetailReport**（風險頁） | 同上（巢狀表） |

## 五、逐頁待實機列印清單

全部**未實機**，不可宣稱驗收。每頁需目視：

1. 雙線（`ui/table` 的 `print:` 格線與舊 `initialize.scss` 列印規則是否疊成雙線）
2. 紅字變黑（負數／警示色在列印時是否被轉黑）
3. 欄寬裁切（compact `px-2` 後欄位是否被裁、是否超出紙張）
4. sticky 表頭（列印時是否錯位）
5. 跨頁 `thead` 重複
6. 合計列只出現一次（不得每頁重複或被切斷）

## 六、互助點數明細專節

- **日期欄**：屬共用 `components/MerchantSearchBar/DatePicker.js`（月曆專項 `DATE_PICKER.md` 排在第 4 批共用元件批）。本批以**逐頁 opt-in** 提前處理這一頁：`DatePicker` 與 `MerchantSearchBar` 新增 `uiDateField` prop（預設 `false`），僅 `DecreaseDetail/index.js` 傳入。共用層預設不變，其餘約 23 個引用檔仍是 MUI contained Button。
- **新樣式**：日期顯示為原生 `<button type="button">`（`inputClass` 外觀＋右側 `CalendarDays` 圖示），`onClick` 與顯示文字 `format(value, format)` 與舊版相同；兩個 `MobileDatePicker` 本體、`format`、`closeOnSelect`、`onChange=handleCalendarAccept` 不動。
- **ButtonGroup**：舊版兩顆日期鈕在 MUI `ButtonGroup variant="contained"` 內。`uiDateField` 時改以 `div.flex.gap-2` 容器取代 `ButtonGroup`（`uiDateField=false` 仍是原 `ButtonGroup`），避免群組的 contained／邊框相連樣式與 `cloneElement` 套用到自訂 button。
- **快捷鈕**（上個月／本月／前天／昨天／今天…）：原為 MUI 藍色 contained `ButtonGroup`；**v3.0-1019-1022 起，僅在 `uiDateField` 開啟時（目前只有本頁）改為 `ui/button` 的 `secondary`＋`sm`（flex `gap-2` 容器）**，顯示條件、文字、handler 不變；其他頁（`uiDateField` 預設 `false`）未動。
- **表格**：原無 `dense`，本批補上（見第二節）。
- 待實機：日期欄新樣式（寬度 140px、圖示、focus ring、與快捷鈕的高度對齊與間距）、快捷鈕不變、表格列高、列印。
