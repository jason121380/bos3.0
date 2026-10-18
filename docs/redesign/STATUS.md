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

## UI 第二批（分支 `claude/ui-batch2-box`，基於 main 7cb899a，未合併）

| 項目 | 狀態 |
|---|---|
| `OrderEdit/WalletDepositModal` 標籤改上方（`Field`／`Input`，必填 `*` 依本檔提交檢查） | 已改檔 |
| `OrderCreate/AddCustomerModal` | 評估後排下一批 A3（焦點鏈＋編號重複檢查風險高，見 `TODO.md`） |
| F 批（icons-material／jss） | 未開始 |
| 驗證（eslint、verify-logic、tests、build） | **指揮者已完成，全數通過**（結果見下） |

指揮者驗證結果：
- eslint：0 error。
- verify-logic：FAIL 3 項，皆為純 presentation 差異——`slotProps` 的 `variant` 由 `standard` 改為 `outlined`；兩個 `fieldProps.label` 改為上方標籤＋`placeholder`。
- portal-root-scan：0／0。
- 全域 unit tests：17 suites，51 passed＋1 skipped（LoginForm 的 skip 待 PR #6），0 failed。
- `CI=true npm run build`：成功。
- 與 PR #7 的 OrderCreate 版 diff：僅註解與空白差異。

verify-logic 差異（純畫面）說明：移除 `TextField` import、新增 `Field`／`Input`；`label`／`variant`／`css`／`inputProps`／`fieldProps.label` 屬性消失（改 `Field label`、`placeholder`、`min`）；`DateTimePicker` 的 `css` 與 `variant: 'standard'` 移除；金額列 wrapper `div` 改 className。依賴 PR #7 對 OrderCreate 版的相同改法。

## 版本清單

| 版本 | 時間 | 內容 | PR／commit | checks |
|---|---|---|---|---|
| v3.0-1019-0232 | 2026-10-19 02:32 | 版本顯示上線：TopBar／Auth Topbar 讀 `src/version.js`（完整版本清單詳見下方） | #12 | GitHub Build/Unit pass；已 merge |

給 Jason：PR #6–#10 已 merge 的舊版畫面左上角仍只顯示寫死的 `v3.0`；從本批 merge 之後，畫面才會顯示短版號（例如 `v3.0-1019-0232`），不用回頭改舊 commit。之後每個完整 commit 都會更新 `src/version.js`。

## 進行中

- **第二層第二輪**：用新元件換掉第一輪留下的 MUI（Select、ToggleButton、Checkbox、Switch、Avatar、MUI 分頁等）。6 批，清單見 `batches/r2-*.txt`。
- **批次 7（2026/10/19，分支 `claude/ui-batch7-box`，v3.0-1019-0245，PR #14，本組 merge 中；版本列見下方「版本清單」）**：`CreateDeductionSetting/Results.js` 15 個 TextField（門檻／抽成數字欄）改 `Field`＋`Input`（標籤在上，`min={0}`、`type="number"`、`onWheel` 保留）。選批理由：建立抽成設定、欄位重複單純，無下拉／Autocomplete／日期／helperText。`ToggleButton`／`Tabs`／`Checkbox`／`FormControlLabel` 依檔案頭註解的既定範圍保留 MUI 未動。`index.js` 查無 MUI 欄位未動。前批 PR #11、#12、#13 已 merge，本批為下一組第一個。驗證：eslint 0 error；verify-logic 通過；portal-root-scan 0／0；全域單元測試 52／52 通過；`CI=true npm run build` 成功。PR #12 已 merge、TopBar 已讀 `version.js`，bundle 含版號。**外觀待實機**：Field 在 flex 列內寬度、窄螢幕換行。
- **批次 6（2026/10/19，分支 `claude/ui-batch6-box`，v3.0-1019-0241，PR #13 已 merge，merge commit 8ec6b00；版本列見下方「版本清單」）**：`AccountingSetting/AccountingItemCreate.js` 5 個 TextField 改 `Field`＋`Input`（標籤在上）。選批理由：會計設定表單、欄位單純，無下拉／Autocomplete／日期／helperText／`inputRef`。`AccountingSetting.js`、`index.js` 無 MUI 欄位未動。與 PR #11、PR #12 同組，皆已 merge。驗證：eslint 0 error；verify-logic 通過；portal-root-scan 0/0；全域單元測試 52/52 通過；`CI=true npm run build` 成功。bundle 備註：PR #12 已 merge、TopBar 已讀 version.js，本批 bundle 已含版號。**外觀待實機**：圖示與輸入框底對齊、`w-[700px]` 窄螢幕換行。
- **批次 5（分支 `claude/ui-batch5-box`，版本 v3.0-1019-0202，PR #11，commit 079a7d0，GitHub Build/Unit pass，已 merge，merge commit cfc79cd）**：`CouponEdit` 三個 About 檔的欄位標籤改為上方標籤（`Field`＋`Input`／`NativeSelect`），做法同批次 4。驗證：**指揮者已完成**。
  - eslint 3 檔 0 problems。
  - `verify-logic`：`AboutCoupon` 通過；`AboutDeduction`、`AboutAssistantSetting` 各 FAIL 一項，為 `inputLabel` ref 移除（MUI `InputLabel` 的 ref，改 `NativeSelect` 後不需要，純 presentation，其餘敘述未缺）。
  - `portal-root-scan` 0/0。
  - 全域單元測試：17 suites，51 passed＋1 skipped（待 PR #6），0 failed。
  - `CI=true npm run build` 成功。
  - 實機待看：序號 `mt-[26px]`／圖示 `marginTop` 對齊、`w-24`／`w-28` 換行、類別選單空值時顯示第一個選項（原生 select 行為，與 `CouponCreate` 相同）。
- **批次 4（2026/10/19，分支 `claude/ui-batch4-box`，PR #10）**：`CouponCreate` 三個 About 檔的欄位標籤改為上方標籤（`Field`＋`Input`／`NativeSelect`）；`CouponEdit` 已由 PR #11（v3.0-1019-0202）完成並 merge（cfc79cd，見上方批次 5）。驗證：**指揮者已完成**——eslint（改動 3 檔）0 problems（基線亦 0）；verify-logic 三檔全部通過；portal-root-scan 0/0；三檔已無 MUI TextField／Select／FormControl／InputLabel／MenuItem（僅保留註解區塊與 FormControlLabel＋Checkbox，未動）；全域單元測試 17 suites、51 passed＋1 skipped（LoginForm skip，待 PR #6）、0 failed；`CI=true npm run build` 成功。**外觀待實機**：小數字欄位 `w-24`／`w-28` 加寬，需實機瞄一下是否換行。
- **F 批（2026/10/19，`claude/ui-batch3-box`，PR #9）**：`ui/icons` 補 `CheckBox`／`CheckBoxOutlineBlank`；23 檔 `@mui/icons-material` import 換為 `ui/icons`，`src` 內歸零（25 → 0）；`AboutAssistant.js`（死碼）的 `Chip` import 改指向 `@mui/material/Chip`；jss 實查程式碼為 0 檔（舊「2 檔」更正，下方盤點寫的「jss 2 檔」以此為準）；下方盤點的 `@mui/icons-material` 25 檔是 F 批前的數字，PR #9 後 `src` 內為 0。A3 `AddCustomerModal` 刻意延後（需鍵盤實測，見 `TODO.md`）。本批實改 28 檔（src 25＋docs 3）。驗證（指揮者已完成）：`@mui/icons-material` 在 `src` 僅剩 `ui/icons.js` 一行註解；`swap-icons` 乾跑 files 0／icons 0；`git diff` 非 import 行零變更；`verify-logic` 全部通過；eslint 改動檔 1 error／67 warnings，基線（改前）2 errors／67 warnings，故 0 新增且少 1；`portal-root-scan` 0／0；全域 unit 17 suites，51 passed＋1 skipped（LoginForm skip，待 PR #6）、0 failed；`CI=true npm run build` 成功。
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

## 版本號規則

- 格式 `v3.0-MMDD-HHmm`（時區 Asia/Taipei）。commit 訊息第一行開頭與 PR 標題都要帶版本號。
- 正式格式 v3.0-MMDD-HHmm（Asia/Taipei，不寫年份，年份只在日期欄；不自行升大版號）。
- #6–#10 為規則建立前已 push 的 commit，**不 amend**；下表依 commit 時間對照版本。
- merge 組別：#6–#10 為第一組（五個完整 commit），已於 2026-10-19 merge（merge commits：#6 c9a8c8c、#7 503f4fa、#8 f32bf0e、#9 3f7b35f、#10 29630fa）；批次 5（#11）已 merge（cfc79cd），版本顯示批 v3.0-1019-0232（#12）已 merge，批次 6（#13）已 merge（8ec6b00），批次 7（#14）已 merge（20ded5b）；批次 8（#15）本組 merge 中。

| 版本 | 時間（Asia/Taipei） | 內容 | PR | commit | checks |
|---|---|---|---|---|---|
| v3.0-1019-0109 | 2026-10-19 01:09 | 規則前已 push（對照） | #6 | 已 push，不 amend | GitHub Build/Unit pass；第一組已於 2026-10-19 merge（c9a8c8c） |
| v3.0-1019-0124 | 2026-10-19 01:24 | 規則前已 push（對照） | #7 | 已 push，不 amend | GitHub Build/Unit pass；第一組已於 2026-10-19 merge（503f4fa） |
| v3.0-1019-0131 | 2026-10-19 01:31 | 規則前已 push（對照） | #8 | 已 push，不 amend | GitHub Build/Unit pass；第一組已於 2026-10-19 merge（f32bf0e） |
| v3.0-1019-0142 | 2026-10-19 01:42 | 規則前已 push（對照） | #9 | 已 push，不 amend | GitHub Build/Unit pass；第一組已於 2026-10-19 merge（3f7b35f） |
| v3.0-1019-0152 | 2026-10-19 01:52 | 規則前已 push（對照） | #10 | 已 push，不 amend | GitHub Build/Unit pass；第一組已於 2026-10-19 merge（29630fa） |
| v3.0-1019-0202 | 2026-10-19 02:02 | UI 批次5 CouponEdit | #11 | 079a7d0 | GitHub Build/Unit pass；已 merge（merge commit cfc79cd） |
| v3.0-1019-0232 | 2026-10-19 02:32 | 版本顯示上線（`src/version.js`） | #12 | bca2950 | 已 merge |
| v3.0-1019-0241 | 2026-10-19 02:41 | 批次 6：AccountingSetting 表單標籤改版 | #13 | 8ec6b00 | 已 merge（merge commit 8ec6b00）；eslint 0 error／verify-logic 通過／portal 0/0／全域 52/52／build 成功 |
| v3.0-1019-0245 | 2026-10-19 02:45 | 批次 7：CreateDeductionSetting/Results 15 欄標籤改版 | #14 | 4d37654 | 已 merge（merge commit 20ded5b）；eslint 0 error／verify-logic 通過／portal 0/0／測試 52/52／build 成功 |
| v3.0-1019-0303 | 2026-10-19 03:03 | UI 批次8（替代 Payment）：UpdateDeductionSetting/Results.js 15 個 TextField → `Field`＋`Input`；本批在本組 merge 中（前為 #13、#14 已 merge）；版號由 0258 校正為 0303 | #15 | commit 待補 | 驗證：eslint 0 error、verify-logic 通過、portal-root-scan 0/0、全域測試 52/52、build 成功；該次 build 的 bundle 含校正前版號字串 `v3.0-1019-0258`（校正僅字串差異），commit 後以最終版號 0303 重 build 由指揮者確認 |

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
