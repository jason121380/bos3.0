# BOS 3.0 改版進度

> 更新：2026/10/18　分支：`claude/upbeat-carson-pdc7rf`（已合併 PR #1、#2、#3）　規範：根目錄 `STYLE.md`　遷移規則：`MIGRATION_GUIDE.md`　待辦：`TODO.md`

## 已完成

| 範圍 | 內容 |
|---|---|
| 基礎 | Tailwind（preflight 關閉）、tokens、`src/ui/` 元件：Button、Input／Field、Select、NativeSelect（任意值）、Table（dense、列印格線）／TablePagination、Dialog（手機為底部面板）、Badge、Card、Tabs、ToggleGroup、Switch、Checkbox／CheckboxField、Avatar、Stat／StatGrid／StatCard、Toast、EmptyState、Skeleton、Popover、DropdownMenu、Sidebar、PageHeader、Toolbar |
| 骨架 | 側欄、頁首、登入／錯誤頁外框；全站 MUI 橋接主題（`src/ui/mui-theme.js`） |
| 手機版 App 化 | 底部分頁列（釘選頁優先）、App 式頂部列（返回／捲動後顯示頁名）、底部面板對話框、40px 觸控尺寸、iOS 16px 輸入框、安全區、PWA（可加到主畫面） |
| 共用元件 | DateSelector、TableEditBar、MerchantSearchBar、AdminPageHeader、PageTitle、ManagementTable、ReferToggleButton、WalletDepositToggleButton |
| 第一層外觀統一 | 全部後台頁：舊色碼改 tokens、MUI 圖示改 lucide、MUI 字級對應新字級 |
| 第二層第一輪（元件替換） | 11 批、約 230 頁，一頁一個 commit；顧客端 11 頁（手機版）也已完成 |
| 打帳單 UI 修復（第 1～5 組） | 標籤統一、必填 `*`、停用原因、操作列與按鈕文字、收合摘要、NT$ 千分位、底部固定合計列、服務下拉中文化與顯示代號 |
| CI | 每個 branch push 跑 Build＋Unit tests |

## 進行中

- **第二層第二輪**：用新元件換掉第一輪留下的 MUI（Select、ToggleButton、Checkbox、Switch、Avatar、MUI 分頁等）。6 批，清單見 `batches/r2-*.txt`。
- 目前 `src/views` 仍有 340 個檔案引用 `@mui/*`（全 `src` 414 個）；第二輪 r2-04／r2-06 尚未合併。盤點細節與移除時程見 `TODO.md`。
- 約 16 個檔案的 `ui` 元件放在 MUI 彈出層內缺 `.ui-root`（待修，見 `TODO.md`）。

## 刻意不改（需另外決定）

| 項目 | 原因 |
|---|---|
| 會直接 `window.print()` 的報表表格（約 15 頁，例如店家區間累計表、費用分析表、損益表、日報表明細卡片、設計師抽成報表、商品庫存表等） | `src/initialize.scss` 約 70 條列印規則直接寫在 MUI class 上；要換就得改寫列印規則，與鐵則「列印範本不動」衝突 |
| 列印範本（`#printMain`、`#printThermal`、`printCard`、`forPrint*`、`merchantNamePrint`） | 鐵則 |
| LINE（`layouts/Line`、`ChangeLineMenuPage`）、EHS（`EHS2Page`）、`/ar`、`LinepayQRcode`、`Typography` | 決策：不改版或疑似死碼 |
| 沒被任何地方引用的檔案（如 `Profile/Group.js`、`SalaryEdit/General.js`、`ServiceEdit/AboutAssistant.js` 等） | 死碼 |
| `TextField`（helperText 邏輯／adornment／inputRef）、`Autocomplete`、日期選擇器、`Radio`、`Slider`、`Tooltip`、`Drawer`、`Accordion` | 無對應新元件或替換會動到邏輯；橋接主題已套新外觀 |

## 需要使用者決定

1. Services（服務項目設定）的篩選按鈕：舊版因 prop 名稱錯誤從未顯示，目前維持隱藏。要顯示嗎？
2. ~~直接列印的報表是否改版~~ → 已決定：維持現狀（選項 A），報表表格繼續用 MUI。

## 發現但未修的既有問題（修了會動到邏輯）

- 功能釘選分頁 `_` 未 import（已開建議任務）。
- `SalaryEdit` 日期只在模組載入時計算一次。
- `UpdateDeductionSetting` 刪除級距時把 event 當 index。
- `CustomerBonusRecordEdit` 對字串呼叫 `splice`。
- `AdminPageHeader` 的 `primaryAction.disabled` 沒有作用（舊版即如此）。
- `OrderEdit` 的 `_.cloneDeep` 未 import；三個帳單編輯頁的 `handlePannelClick` 未定義。
- 多頁直接使用全域 `location`、hooks 呼叫順序違規（eslint 舊錯誤）。

## 驗收方式

- 本機 `npm start`（`.env.development.local` 指向測試機 crt-test）。
- 每頁：`verify-logic.js` 通過（FAIL 只允許已審視的純畫面差異）、`eslint-check.json` 0 error。
- 既有測試：改版前即有 7 個測試檔（13 個測試）失敗，改版後維持同樣 7 個，無新增失敗；`src/ui` 與 OrderCreate 測試 18/18 通過。
- Production build：通過（無錯誤、無警告）。
- 實機待驗：列印（設計師業績表、互助月報表、店家日報表各一頁）、iPhone 加到主畫面、打帳單／帳單編輯／預約流程。
