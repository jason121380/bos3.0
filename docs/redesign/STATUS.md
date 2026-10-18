# BOS 3.0 改版進度

> 更新：2026/10/19　分支：`claude/ui-complete-box`（基於 main 7cb899a；先前 PR #1～#5 已合併；本輪 PR 未 merge）　規範：根目錄 `STYLE.md`　遷移規則：`MIGRATION_GUIDE.md`　待辦：`TODO.md`

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
| 測試修復與產品決策（2026/10/19） | 電話不限 10 碼（LoginForm 無長度驗證）、店販售價可低於成本（不做 sellPrice>=cost）；`LoginForm.test.js`、`ProductCreate.test.js` 已依決策改寫。全域 17 檔／52 測試全數通過（0 失敗、0 skip） |

## 進行中

- **第二層第二輪**：用新元件換掉第一輪留下的 MUI（Select、ToggleButton、Checkbox、Switch、Avatar、MUI 分頁等）。6 批，清單見 `batches/r2-*.txt`。
- **2026/10/19 重新盤點（口徑與細節見 `TODO.md` §三、§四；本檔舊寫的 414／340、約 16 個檔缺 `ui-root` 已更新）**：
  - 數字以 `inventory-scan.js` 實跑為準（已實跑，2026-10-19 指揮者驗證）：`@mui/*`：`src` 415 檔、`src/views` 341 檔（`src/views` 第一層 177 項，137 項仍有 MUI、40 項完全沒有；含單檔，扣單檔的「約 133 個目錄」為推估）；`@mui/material` 411 檔；`@mui/icons-material` 25 檔；`@mui/x-date-pickers` 39 檔；emotion 473 檔；舊 `src/theme` 247 檔；jss 2 檔（rg）。
  - 已用 `src/ui` 的檔案 571 個（`src/views` 537）；177 項 views 目錄中 169 項至少有一檔用到 `ui`。
  - 缺 `ui-root`：0、`ui` 元件未自帶 0（`portal-root-scan` 本輪已重跑）。舊「約 16 個待修」已不成立。
  - 第二輪 r2-04（15 目錄／54 檔）、r2-06（63 目錄）**在這個 repo 找不到成果**（原 worktree 不在），main 上仍是 MUI，視為未做、需重做。
  - 還沒搬到 `src/ui` 的主要區塊：`OrderEdit`(28 檔)／`DraftOrderEdit`(26)／`QueueOrderEdit`(24)／`Parameter`(20)／`OrderCreate`(15)／`EmployeeManagementDetail`(12)／`CustomerManagementDetails`(12)／`Profile`(11)，其後是約 125 個各 1～3 檔的小目錄。
  - 列印：`window.print` 在 28 個檔案（22 個報表 index）。
  - 剩餘批次估計約 12～17 批（不含 combobox／date-picker／列印報表），見 `TODO.md` §四。
- **本輪改動（批次 A）**：打帳單「異動入金」彈窗（`OrderCreate/WalletDepositModal.js`）6 個欄位的浮動／外框標籤全部改為上方標籤（`Field`＋`Input`；設計師／顧客的 Autocomplete、日期時間選擇器、`NativeSelect` 保留原元件，只移除 `label` 改放外面並加 `placeholder`），必填 `*` 依 `handleSubWalletDeposit`。至此 `OrderCreate` 只剩 `AddCustomerModal` 仍用浮動標籤。**驗證狀態（2026-10-19 指揮者獨立驗證）**：
  - `portal-root-scan`：缺 `ui-root` 0、`ui` 元件未自帶 0（已重跑）。
  - eslint（`eslint-check.json`，`WalletDepositModal.js`＋`inventory-scan.js`）：0 error。
  - `verify-logic`（`WalletDepositModal.js`）：FAIL 3 項，皆純 presentation——`slotProps` 的 textField `variant` standard→outlined、兩個 `fieldProps` 的 `label` 改為 `Field` 上方標籤＋`placeholder`；無邏輯差異。
  - 全域 unit（本分支基於 main，未含 PR #6）：17 suites，51 passed＋1 skipped（LoginForm 電話長度 skip，待 PR #6 合併後消除），0 failed。
  - `CI=true npm run build`：成功。
  - `inventory-scan.js`：已實跑，數字見上方盤點。
- 注意：`ui/native-select` 的 `label` 是外框上緣標籤，與「標籤在上」規範不同，列入待決策（`TODO.md` §二 P3-4）。

## 刻意不改（需另外決定）

| 項目 | 原因 |
|---|---|
| 會直接 `window.print()` 的報表表格（10/18 估約 15 頁，10/19 實測 22 個報表 index，例如店家區間累計表、費用分析表、損益表、日報表明細卡片、設計師抽成報表、商品庫存表等） | `src/initialize.scss` 約 70 條列印規則直接寫在 MUI class 上；要換就得改寫列印規則，與鐵則「列印範本不動」衝突 |
| 列印範本（`#printMain`、`#printThermal`、`printCard`、`forPrint*`、`merchantNamePrint`） | 鐵則 |
| LINE（`layouts/Line`、`ChangeLineMenuPage`）、EHS（`EHS2Page`）、`/ar`、`LinepayQRcode`、`Typography` | 決策：不改版或疑似死碼 |
| 沒被任何地方引用的檔案（如 `Profile/Group.js`、`SalaryEdit/General.js`、`ServiceEdit/AboutAssistant.js` 等） | 死碼 |
| `TextField`（helperText 邏輯／adornment／inputRef）、`Autocomplete`、日期選擇器、`Radio`、`Slider`、`Tooltip`、`Drawer`、`Accordion` | 無對應新元件或替換會動到邏輯；橋接主題已套新外觀 |

## 需要使用者決定

1. Services（服務項目設定）的篩選按鈕：舊版因 prop 名稱錯誤從未顯示，目前維持隱藏。要顯示嗎？
2. 直接列印的報表是否改版：10/18 曾決定維持 MUI（選項 A）；10/19 指示「全部改完」，故重新請 Jason 拍版（實測 28 檔含 22 個報表 index，比舊寫「約 15 頁」多）。拍版前維持現狀、不動。
3. 是否新增 `ui/combobox`（56 個 Autocomplete）與 `ui/date-picker`（39 檔）。拍版前不新造。
4. `ui/native-select` 外框標籤是否整批改上方標籤（約 21 處）。

## 發現但未修的既有問題（修了會動到邏輯）

- 功能釘選分頁 `_` 未 import（已開建議任務）。
- `SalaryEdit` 日期只在模組載入時計算一次。
- `UpdateDeductionSetting` 刪除級距時把 event 當 index。
- `CustomerBonusRecordEdit` 對字串呼叫 `splice`。
- `AdminPageHeader` 的 `primaryAction.disabled` 沒有作用（舊版即如此）。
- `OrderEdit` 的 `_.cloneDeep` 未 import；三個帳單編輯頁的 `handlePannelClick` 未定義。
- `AboutProduct.js` 的 `min.value=watchList.cost` 為過時死代碼（RHF v6 不重新註冊，實際只擋負數；售價可低於成本已決策），本批不改元件。
- 多頁直接使用全域 `location`、hooks 呼叫順序違規（eslint 舊錯誤）。

## 驗收方式

- 本機 `npm start`（`.env.development.local` 指向測試機 crt-test）。
- 每頁：`verify-logic.js` 通過（FAIL 只允許已審視的純畫面差異）、`eslint-check.json` 0 error。
- 測試：改版前有 7 檔 13 個既有失敗；PR #5 與 2026/10/19 兩項產品決策的測試改寫後，全域 17 檔／52 測試全數通過（0 失敗、0 skip）。
- Production build：通過（無錯誤、無警告）。
- 實機待驗：列印（設計師業績表、互助月報表、店家日報表各一頁）、iPhone 加到主畫面、打帳單／帳單編輯／預約流程。
