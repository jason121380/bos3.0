# 報表 compact 複查總表

> 掃描日期：2026/10/19　版號：v3.0-1019-1005（暫定）　性質：**盤點文件，只記事實與待辦，不代表任何一頁已通過實機驗收**。
> 口徑：以 `src/views/<目錄>` 為單位；「ui/table」＝該目錄有檔案 `from 'ui/table'`；「有 dense」＝該目錄有 `Table` 實際傳 `dense`（`rg -lw dense` 命中）；「MUI 表格」＝仍有 `@mui/material` 的 Table 系列。
> **數量註記**：下列分類加總為 **42** 個目錄（已 compact 38＋仍用 MUI 4）；原指令口徑為 41，差 1 尚未對出是哪一個目錄，待核對，不影響各目錄分類。

## 一、已 compact（ui/table 且有 dense）— 38 個

BusinessAnalysisReport、BusinessItemsMonthlyAnalyzeReport、CostAnalysisReport、DecreaseDailyReport、DesignerMonthlyReport、DesignerPerforamnceAnalyzeReport、DesignerPerformanceReport、DesignerRakeReport、DesignersSalaryDetailReport、EmployeeDailyReport、HelperMonthlyReport、HelperPerformanceReport、IncomeStatementReport、MembershipSellReport、MerchantBankTransferReport、MerchantBusinessIntervalReport、MerchantDailyPerformanceReport、MerchantDailyReport、MoneyFlowCategoryReport、MoneyFlowDailyReport、MoneyFlowTransferReport、NonCashDetailStatementReport、OverallPerformanceAnalysisReport、PaymentReport、ProductConsumeReport、ProductInvoicingRecordReport、ProductLeaderBoard、SingleServiceSearchingReport、ServiceDeductionDetailReport（風險頁專批，v3.0-1019-1047 暫定）、DecreaseDetail（互助點數明細，PR #50 補）、SalaryDetail、SalaryOverview、CustomerConsumptionLeaderboard、CustomerWalletLeaderboard、MerchantCategorySellsRecords、ConsumptionAnalyticsDashboard（儀表板排行表，PR #51 補）、MerchantLeaderBoard（MUI `size=small` 轉 `ui/table` dense，v3.0-1019-1038 暫定；列印規則 `.MerchantLeaderBoardTable table` 的掛點以 `wrapperClassName` 保留在 `ui/table` 外框 div）、DesignerPerformBasic（原風險頁，v3.0-1019-1055 暫定；主表與展開列內的明細子表一併轉 `ui/table` dense，MUI `Collapse` 改條件渲染 `{isOpen(index) && …}`，動畫消失；`.DesignerPerformBasicTable` 以 `wrapperClassName` 保留、`multiMerchantsLeaderBoardCollapse` 掛在內表 `table`）。

備註：`DecreaseDailyReport`、`MerchantDailyReport` 同檔仍有 MUI `TableContainer`（下方明細卡片，列印 CSS 依 `.MuiTableContainer-root` 排版），主報表已 compact、MUI 殘留部分未動。

## 二、已補改（原漏 dense）— 7 個目錄

DecreaseDetail（PR #50）與 SalaryDetail（3 檔）、SalaryOverview、CustomerConsumptionLeaderboard、CustomerWalletLeaderboard、MerchantCategorySellsRecords、ConsumptionAnalyticsDashboard 五個 Ranking 排行表（PR #51）：主表格只加 `dense`，欄位、數字、合計列、CSV 匯出皆未動。此類漏改已清零。

## 四、仍用 MUI 表格 — 4 個

| 目錄 | 原因／備註 |
|---|---|
| AttendanceEmployeeSchedule | 排班格線、特殊 dateCell。後續：排班格線專批（格子互動與 dateCell 樣式需獨立設計，不套一般 dense），暫保留 MUI |
| EmployeePayslip | 薪資條列印、MUI `size=small`。後續：薪資條專批（列印版面為產品交付物，需實機列印比對後再轉），暫保留原因＝列印風險 |
| HelperLeaderBoard | MUI＋可展開列。後續：展開列排行榜專批，可沿用 DesignerPerformBasic 的作法（colSpan 列保留、`Collapse` 改條件渲染） |
| MultiMerchantsLeaderBoard | MUI＋展開列＋sticky。後續：展開列排行榜專批，同上作法，另需處理 sticky 表頭／欄 |

> 已移出：**DesignerPerformBasic**（原風險頁，v3.0-1019-1055 暫定）——扁平欄位主表（`tableHeadCells` 設定陣列加 `numeric` 旗標）＋展開列 `colSpan` 整列內的明細子表一併轉 `ui/table` dense；`Collapse` 改條件渲染（展開／收合動畫消失，屬可接受差異）。風險頁清零。待實機：展開列與內表欄寬、列印 `.DesignerPerformBasicTable` 規則。
>
> 已移出：**ServiceDeductionDetailReport**（原風險頁，v3.0-1019-1047 暫定）——巢狀表頭改 `ui/table` 兩列表頭（第一列 `rowSpan={2}`＋`colSpan` 3／2／7／3 分組，第二列 15 個子欄），本體與合計列攤平成 25 欄，欄序與數字不變；風險頁剩 DesignerPerformBasic 1 頁。待實機：25 欄很寬（`min-w-[650px]` 只是下限，需確認橫向捲動）、列印時兩列表頭跨頁重複與欄寬裁切、合計列。

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
