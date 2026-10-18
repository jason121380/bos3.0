# 待辦清單（TODO）

> 更新：2026/10/19　給：Jason　規則：只改畫面、不動邏輯；驗證通過就合併進 `main`（always merge）。
> **2026/10/19 本輪（分支 `claude/ui-complete-box`，指示「UI 優先、全部改完」）**：完整重新盤點（見 §三、§四）＋第一批 UI（打帳單「異動入金」彈窗標籤統一）。本輪 PR **不 merge**，等 Jason 拍版 §二 P3。
> **本輪驗證（2026-10-19 指揮者獨立驗證）**：`inventory-scan.js` 已實跑（§三 以腳本輸出為準）；`portal-root-scan` 缺 `ui-root` 0、`ui` 元件未自帶 0（已重跑）；eslint（`eslint-check.json`，`WalletDepositModal.js`＋`inventory-scan.js`）0 error；`verify-logic`（`WalletDepositModal.js`）FAIL 3 項，皆純 presentation——`slotProps` 的 textField `variant` standard→outlined、兩個 `fieldProps` 的 `label` 改為 `Field` 上方標籤＋`placeholder`，無邏輯差異；全域 unit（本分支基於 main，未含 PR #6）17 suites，51 passed＋1 skipped（LoginForm 電話長度 skip，待 PR #6 合併後消除），0 failed；`CI=true npm run build` 成功。

---

## 一、今天完成了什麼

### 已合併進 main
| # | 內容 | PR／commit |
|---|---|---|
| 1 | 修 CI：每個 branch push 都跑 Build＋Unit tests（Node 20.12.1、`--legacy-peer-deps`） | PR #1 |
| 2 | 驗證：測試與改版前同樣 13 個既有失敗；修掉改版後才暴露的 RegisterForm 競態測試 | PR #1 |
| 3 | 側欄商家切換鈕、搜尋框框線調淡 | PR #2 |
| 4 | 訂單列表橫向捲軸常駐可見（寬表格看得出可以滑） | PR #2 |
| 5 | **打帳單第 1 組**：標籤統一為「上方標籤＋佔位字」；Accordion 換 `ui/accordion`；窄螢幕欄位換行、不再擠壓 | PR #2 |
| 6 | **打帳單第 2 組**：必填 `*`（依 Header `valid`／`billVerify`，註解寫依據）；停用按鈕顯示「尚缺：…」 | PR #2 |
| 7 | **打帳單第 3 組**：操作列重排、結帳對比提高；項目列圖示鈕改有 title／aria-label 的 button；「+」改「新增項目」；項目列可換行 | PR #2 |
| 8 | **打帳單第 4 組**：收合卡片摘要（已填 N 筆 · NT$ 小計）；金額彙總統一 NT$ 千分位、左右欄加小標題 | PR #2 |

### 本次一併合併（PR #3）
| # | 內容 |
|---|---|
| 9 | **打帳單第 5 組**：服務下拉——「查無符合的服務」「載入中…」改中文；選項顯示 `名稱(代號) - 價格`；以 `id` 當 key（消除重複 key 警告） |
| 10 | 底部固定合計列（業績合計／現金應收；lg 讓出側欄、手機讓出底部導覽、列印隱藏） |
| 11 | 窄螢幕：備註／訂單來源欄位不再超出卡片；金額彙總手機單欄 |
| 12 | 文件：新增 `CLAUDE.md`、`docs/redesign/MEMORY.md`、本檔；更新 `STYLE.md`、`README.md`、`STATUS.md` |

### 2026/10/19 產品決策（Jason 拍版，已完成）
- [x] **電話不限 10 碼**：LoginForm 不做 10～13 碼驗證（只有 required）；`LoginForm.test.js` 由 skip 改為驗證「非 10 碼電話不會被長度規則擋下」。
- [x] **店販售價可低於成本**：不做 `sellPrice >= cost` 驗證；`ProductCreate.test.js` 驗證 cost=9、sellPrice=5 不報錯，sellPrice<0 仍被擋。
- 註記：`AboutProduct.js` 的 `min.value=watchList.cost` 為死代碼（RHF v6 不重新註冊、實際只擋負數），視為過時，本批不改元件。
- 結果：相關測試 5/5；全域 17 檔／52 測試通過，0 失敗、0 skip。

### 驗證結果
- Build 成功（本機 `CI=true` 與 GitHub CI）。
- 測試：7 檔、13 個失敗，與改版前基準相同，**無新增失敗**；OrderCreate 與 `src/ui` 18 個測試全過。
- verify-logic：打帳單相關檔案通過；第 4 組 5 個 FAIL 為刻意的 `bill` 解構與 `formatMoney` 顯示改動。

---

## 二、接下來要做（依建議優先順序）

### P1 — 影響使用者的問題
- [x] **`ui` 元件放在 MUI Dialog／Popper 內缺 `.ui-root`**：已讓 `Button`、`Card`、`Checkbox`／`CheckboxField`、`Switch`、`Input`／`Textarea`／`Field`／`Label`、`Badge`、`Avatar`、`Table*` 共 8 個 `src/ui` 檔的根元素自帶 `ui-root`。
  掃描（`node scripts/redesign/portal-root-scan.js`）：修前 25 個畫面檔缺 `ui-root`，修後 **0**；8 個 ui 元件檔全數自帶。
  舊清單「約 16 個」是手動整理，與掃描不一致：其中 9 個在掃描內（`GeneralAccountingRecordDetail/AccountingSubjectModal`、`MainEventList/ComfirmDialog`、`Parameter` 4 檔、`Products/PublishedDialog`、`Products/VendorDialog`、`Profile/General/ProfileDetails`）；另 7 個（兩個 `Management*ReservationRecord/index`、`MemberCardRecord/EditMemberCardRecordModal`、`OrderEdit/Header`、`Products/EditProductsCategoryModal`、`Services/AboutDeductionEditModal`、`Services/AssistantSettingEditModal`）檔內本來就有 `ui-root`，掃描不列入；掃描另外多找出 16 個舊清單沒有的檔案。
  待辦：實機／截圖各 Modal 確認外觀（尚未做）。
- [ ] **非打帳單頁面的手機擠壓**：設計師績效頁「搜尋」按鈕被推出畫面、日期輸入框只剩 24px、薪資單儲存格換行等（全站審計結果在 `scratchpad/audit-*.json`）。
- [~] **打帳單其餘彈窗仍是浮動標籤的 MUI**：2026/10/19 掃描（`label=`）後，`OrderCreate` 只剩 2 個檔案有浮動／外框標籤：
  - [x] `WalletDepositModal`（異動入金，OrderCreate 版）：6 個欄位標籤全部移到上方，必填 `*` 依 `handleSubWalletDeposit` 檢查（PR #7）。
  - [x] `OrderEdit/WalletDepositModal.js`（孿生檔，UI 第二批 PR #8）：7 欄（日期／金額／設計師／顧客／付款方式／手續費負擔方／備註）改上方標籤，用 `Field`／`Input`；必填 `*` 依本檔 `handleSubWalletDeposit`。DateTimePicker／Autocomplete／NativeSelect 本體與所有 handler、state、GraphQL、金額邏輯不變。（註：本檔原本就有傳 `identity` 給 `WalletDepositToggleButton`，與先前假設不同，未動。）
  - [ ] **A3 `AddCustomerModal`（新增／編輯顧客，676 行，約 17 欄）**：評估後排後續——(1) Enter 跳欄焦點鏈：每欄 `inputRef`＋`onKeyDown → setFocus('下一欄')`，換 `ui/input` 需逐欄確認 ref 轉發；(2) 客戶編號重複檢查的 `error`／`helperText`＋`endAdornment`（轉圈／勾／警告）屬 helperText 邏輯，風險高；(3) 混用 Select、民國年／月／日、偏好設計師 Autocomplete。需獨立一批，逐欄保留焦點順序並以鍵盤 Enter 實測。
    - 範圍：`OrderCreate`／`OrderEdit`／`DraftOrderEdit`／`QueueOrderEdit` 各一份。**F 批（PR #9）刻意不做，排後續。** Dialog 內含 MUI Autocomplete／DatePicker，須保留 MUI Dialog。
    - 驗收條件（需**真實瀏覽器鍵盤實測**，headless 截圖不足）：① 由第一欄起連按 Enter 依原順序逐欄跳焦，最後一欄行為與改版前一致；② 各必填欄留空送出，`helperText` 位置與文字不變、不被標籤擠壓；③ Tab／Shift+Tab 順序不變；④ Autocomplete／日期選擇器可開關、可選取；⑤ 窄螢幕不橫向溢出；⑥ `verify-logic` 的 FAIL 僅限純畫面差異。
  - 注意：`ui/native-select` 的 `label` 是「外框上緣標籤」，與「上方標籤」規範不同；全站 25 檔引用、21 處有傳 `label`。是否整批改成 `Field` 上方標籤需決定（見 §二 P3 第 4 項）。
- [ ] **實機確認**：訂單列表捲軸、底部固定合計列（桌機／手機）、列印不出現合計列。

### P2 — 改版收尾
- [x] **批次 4（`claude/ui-batch4-box`，PR #10，2026/10/19；指揮者驗證已完成；外觀待實機：小數字欄位 `w-24`／`w-28` 加寬需瞄換行）**：`CouponCreate` 表單標籤改版。
  - 選批理由：範圍明確、低風險——無 Autocomplete、無日期選擇器、無 `window.print`、無 helperText／error 特殊驗證，TextField／Select 皆可直接 reuse 既有 `src/ui`。
  - 本批完成：`AboutCoupon.js`、`AboutDeduction.js`、`AboutAssistantSetting.js` 的 TextField → `Field`＋`Input`（標籤在上）、單選 Select → `Field`＋`NativeSelect`；`index.js` 本來就沒有 MUI 欄位，未動。`Checkbox`／`FormControlLabel`（分指定／互助均分）仍是 MUI，不在本批範圍。
  - **`CouponEdit`**（`CouponCreate` 的平行孿生目錄）：已由 PR #11（v3.0-1019-0202）完成、待下一組 merge；本分支文件先標「已開 PR #11」。
  - 剩餘批次：盤點總表已併入（PR #7，見 §三、§四），這裡不重寫。
- [ ] **合併第二輪未完成批次**：`r2-04`（表單頁，清單 15 頁，13 個 commit，worktree `agent-a7e481ba90389d29b`）與 `r2-06`（其他 63 頁，中途中止，worktree `agent-af60fcc4359cfd91c`）——需先 rebase 到最新 main、重新驗證再合併。
  **2026/10/19 現況**：本機 `git branch -a` 與 `git worktree list` 都找不到這兩個 worktree／分支（只有 `main`、`claude/*-box`、`origin/claude/upbeat-carson-pdc7rf`），**成果不在這個 repo**。r2-04 清單 15 個目錄**全部**在 `main` 上仍引用 `@mui/*`（合計 54 個檔案，例如 CustomerManagementDetails 12、ServiceCreate／ServiceEdit／SalaryEdit 各 5、Products 4）；r2-06 清單 63 個目錄抽查前 15 個也全部仍有 MUI。判定為「未合併」。若找不回 worktree，這 78 頁要重做（見 §四 批次 B）。
- [ ] **階段 4 半遷移盤點**（見下方「盤點結果」），決定 MUI 何時可移除。
- [ ] 把打帳單的做法（欄位標籤、必填、停用原因、摘要、NT$）套用到 **帳單編輯／草稿／排隊帳單**（`OrderEdit`、`DraftOrderEdit`、`QueueOrderEdit`）——它們共用 `ServicesAutoComplete`，下拉已受益，但版面尚未對齊。

### P3 — 需要你決定
1. `Services`（服務項目設定）的篩選按鈕：舊版因 prop 名稱錯誤從未顯示，要顯示嗎？
2. 直接列印的報表是否要改版（目前決定維持 MUI）。2026/10/19 實測：`window.print` 出現在 28 個檔案，其中 22 個是報表目錄的 `index`（約 15 頁是舊口徑，實際更多），另 6 個是 `OrderManagementList/ResultsV2`、`DraftOrderManagementList/ResultsV2`、`DraftOrderEdit/Footer`、`OrderCreate/OrderDetailModal`、`InventoryWorkReview/General`、`ProductInventoryList/Results`。
3. 是否要新增 `ui/combobox`（取代 56 個 `<Autocomplete>`）與 `ui/date-picker`（`@mui/x-date-pickers` 39 檔、`<DatePicker>` 12＋`<DateTimePicker>` 7）——這是移除 MUI 的前提，但會是較大的元件工程。**本輪未新造，等你拍版。**
4. `ui/native-select` 的 `label`（外框上緣標籤）要不要整批改成「`Field` 上方標籤」？目前 25 檔引用、約 21 處有傳 `label`，與 STYLE「標籤在上」不一致；改法機械但檔案分散，建議納入 §四 批次 E。

### P4 — 既有問題（修了會動邏輯，需你同意才改）
- 功能釘選分頁 `_` 未 import；`SalaryEdit` 日期只在模組載入時計算一次；`UpdateDeductionSetting` 刪除級距把 event 當 index；`CustomerBonusRecordEdit` 對字串呼叫 `splice`；`OrderEdit` 的 `_.cloneDeep` 未 import；三個帳單編輯頁的 `handlePannelClick` 未定義；`AdminPageHeader` 的 `primaryAction.disabled` 無作用。
- `ServicesAutoComplete`：排序直接改動原陣列、`a.no - b.no` 遇非數字代號為 NaN、代號只支援完全比對。
- [x] 測試：原 13 個既有失敗（ProductCreate、ServiceCategoryEdit／Create、AccountingSubjectsAutocomplete、LoginForm、Products/Results、AccountingRecordCreate/Header）已清零（PR #5 與 2026/10/19 決策改寫），全域 52/52 通過。

---

## 三、階段 4：半遷移盤點結果（2026/10/19 重新掃描，取代 10/18 舊數字）

**掃描口徑（2026/10/19，基準 `main` 7cb899a）**：對 `src` 做純文字比對，只算 `*.js`、排除 `*.test.js`；「檔案數」＝符合的檔案數，「標籤數」＝`<Tag` 出現次數。腳本 `scripts/redesign/inventory-scan.js` 可重跑同口徑——**已實跑（2026-10-19 指揮者驗證）**，下表數字**以腳本實跑輸出為準**；先前工作階段（無法執行 `node`）用 `rg` 取得的數字與腳本有小差異（例如 `@mui/*` 414→415），已改為腳本值。標「（rg）」或「（推估）」者不是腳本輸出，不可與腳本數字混用。**F 批（PR #9，2026/10/19）之後**：`@mui/icons-material` 與 jss 兩列已更正，見下表註記與「F 批更新」。

| 項目 | 本輪數字（10/19） | 舊數字（為何不同） |
|---|---|---|
| `src` 非測試 `.js` 檔 | 1,497（`src/views` 716）（腳本 `srcFiles`／`viewsFiles`） | — |
| 引用 `@mui/*` 的檔案 | **415**（`src/views` **341**） | 10/18 的 414／340 與腳本差 1（先前 rg 值）；INVENTORY 的 706／232 是改版前基準（含已換掉的檔案） |
| 引用 `@mui/material` 的檔案 | 411（`src/views` 340） | 先前 rg 為 410／339 |
| 引用 `@mui/icons-material` 的檔案 | **25**（F 批前）→ **0**（PR #9 後，`src` 僅剩 `ui/icons.js` 一行註解） | 舊 TODO「icons-material 50」是 import 次數，不是檔案數 |
| 引用 `@mui/x-date-pickers`／`x-tree-view` 的檔案 | 39／6（腳本） | 舊 41 是 import 次數 |
| 引用 `@mui/styles`／`lab`／`system`／`utils`／`base` | 0 | — |
| 使用 emotion（`@emotion`）的檔案 | 473（腳本） | 舊 481 含測試或 css 字串，口徑不同 |
| `css={` 檔案／`sx={` 檔案 | 361／22（腳本 `cssProp`／`sxProp`） | — |
| 使用 makeStyles／withStyles（jss）的檔案 | ~~2~~ → **0**（F 批實查更正；僅剩 jest mock 與測試註解，程式碼 0 檔） | 舊「2 檔」是把 mock／註解算進去 |
| 引用舊 `src/theme` 的檔案 | **247**（腳本 `themeRef`；先前 rg 兩種 regex 為 245、246） | 舊 187 口徑不明（可能漏了相對路徑寫法） |
| 缺 `ui-root`（portal-root-scan） | 0；`ui` 元件未自帶 0（本輪已重跑，2026-10-19 指揮者驗證） | 舊 TODO 約 16 → 實際曾為 25 |
| 已用 `src/ui` 的檔案（不含 `src/ui` 自身） | 571（`src/views` 537）（腳本 `uiUserFiles`／`uiUserFilesViews`） | — |
| `src/views` 目錄總數／有任何檔用 `ui` 的目錄 | 177／169（腳本 `viewDirs`／`viewDirsWithUi`；取第一層，單檔如 `Error404.js` 也算一項） | 先前 rg 估 172，口徑不同，以腳本為準 |
| `src/views` 中仍有 MUI 檔案的第一層項目 | **137**（＝177 − 40；含 4 個單檔：`Typography.js`、`Error401/404/500.js`）。「約 133 個真正的目錄」是扣掉單檔的**推估**，非腳本輸出 | — |
| 完全沒有 MUI 的 views 目錄 | **40**（腳本 `viewDirsZeroMui`） | 先前推估 39（172 − 133），口徑不同 |
| `window.print` 檔案 | 28（腳本 `windowPrintFiles`；22 個報表 index＋6 個其他，見 §二 P3-2） | 舊「約 15 頁」偏少 |
| 含 `printMain`／`printThermal`／`forPrint`／`printCard`／`merchantNamePrint` 的檔案 | 28（腳本 `printTemplateFiles`） | — |
| `<TextField` | `src` 515 個標籤、182 檔（腳本 `textFieldTags`／`textFieldFiles`；`src/views` 479 個標籤為先前 rg 值，腳本未輸出） | 舊 TextField「183／99」＝標籤數／目錄數，本輪 183 是「檔案數」，單位不同 |
| `<Autocomplete` 標籤 | `src` 84（腳本）、`src/views` 56（rg，腳本未輸出） | 舊 69（口徑不明，視為次數）；本輪不比較 |
| 日期選擇器（`DatePicker`／`DateTimePicker`／`TimePicker` 字樣）檔案 | 43（腳本 `datePickerFiles`） | 舊 41 |

> 備註：上表凡未標「rg」「推估」者皆為腳本實跑值；「172」「約 133」「約 39」「約 125」等是先前 rg 推估，僅作參考。上表「舊數字」欄是為了讓 STATUS／INVENTORY／舊 TODO 的寫法能對上本輪結果；之後一律以本表為準，更新時註明日期與口徑。「舊數字」欄凡寫「口徑不明」者是推測，未回頭驗證舊版掃描方式。`styled(` 未單獨統計。

**views 目錄中仍有 MUI 檔案數最多的前 12 個**（檔案數）：OrderEdit 28、DraftOrderEdit 26、QueueOrderEdit 24、Parameter 20、OrderCreate 15、EmployeeManagementDetail 12、CustomerManagementDetails 12、Profile 11、ServiceEdit 5、ServiceCreate 5、SalaryEdit 5，其後 Products／ManagementReservationRecord／ManagementDesignersReservationRecord／ChangeLineMenuPage 各 4。其餘約 125 個目錄各 1～3 檔。

**標籤使用量（`src/views`，含 `ui` 與 MUI 同名標籤，故只供參考）**：Button 752、TableRow 749、TextField 479、Card 370、Grid 314、MenuItem 269、FormControl 198、InputLabel 186、Select 185、Checkbox 163、FormControlLabel 79、Typography 69、Autocomplete 56、ToggleButton 53、Dialog 47、Accordion 34、Switch 14、DatePicker 12、Tooltip 10、Slider 9、Tabs 8、Radio 7、DateTimePicker 7。

**10/18 版：單檔 MUI import 行數前 10（未重掃，僅供參考）**：AttendanceRecords/index(5)、ProductInvoicingRecordReport/index(4)、ManagementReservationRecord/ChoseEvent(4)、EmployeeSchedule/ScheduleCard(4)、EmployeeClockIn/index(4)、SingleServiceSearchingReport/index(3)、QueueOrderEdit/Head(3)、Profile/Reservation/HolidayEdit(3)、ProductReserveCheck/index(3)、Parameter/OuterLinkModal(3)。

**何時能移除**
| 要移除 | 前提 | 估計 |
|---|---|---|
| `@mui/icons-material` | 全站圖示改走 `ui/icons`（已是轉接層） | **已完成（F 批，PR #9，2026/10/19）**：`src` 的 import 25 → 0，僅剩 `ui/icons.js` 註解提及；可從 `package.json` 移除相依（待指揮者確認 build 後另批） |
| jss | 無（實查程式碼 0 檔） | 已無須處理，只剩 jest mock／測試註解／scss 舊 class 名（見下 F 批更新） |
| `@mui/x-date-pickers` | 先做 `ui/date-picker`（39 檔） | 中 |
| `@mui/material`（含 Select／Autocomplete／TextField） | 先做 `ui/combobox`、完成 r2-04／r2-06 與高 MUI 頁、並決定 22 個列印報表（目前決定保留 MUI） | **只要列印報表維持 MUI，就無法完全移除** |
| emotion（473 檔） | 所有 `css=` 改 Tailwind；與 MUI 橋接一起處理 | 最後一步 |
| 舊 `src/theme`（約 245 檔引用） | MUI 與 emotion 移除後 | 最後一步 |

結論：短期可移除的只有 icons-material 與 jss（兩者 `src` 內皆已於 F 批、PR #9 歸零）；MUI 本體取決於「列印報表」與「Autocomplete／日期選擇器」兩個決定（見 P3）。

#### F 批更新（2026/10/19，PR #9，分支 `claude/ui-batch3-box`，基於 main `7cb899a`）
- **icons-material**：實查 `rg "@mui/icons-material" src` 為 25 檔（非舊盤點的 50 次／232 檔，那是改版前／含轉接層的口徑）：snackbars 5 個圖示 1 檔、CheckBox＋CheckBoxOutlineBlank 22 檔（Autocomplete 的 `icon`／`checkedIcon`）、`ServiceEdit/AboutAssistant.js` 的 `Chip` 1 檔。
  - 在 `src/ui/icons.js` 補轉接：`CheckBox`（Lucide `SquareCheck`）、`CheckBoxOutlineBlank`（Lucide `Square`）。
  - 23 檔 import 換成 `ui/icons`（只改 import 行；`AboutSettingFunction.js` 併入既有 `ui/icons` import）。
  - `AboutAssistant.js` 的 `Chip`：該檔**無任何檔案 import**（路由與 `ServiceEdit/index.js` 用的是 `AboutAssistantSetting`），為死碼；且 `@mui/icons-material/Chip` 本就不存在、JSX 實際把它當 MUI Chip 用。僅把 import 來源改成正確的 `@mui/material/Chip`，不改邏輯、不刪檔，其餘留待死碼清理批。
  - 結果：`@mui/icons-material` 在 `src` 的 import **25 → 0**。
- **jss**：實查（2026/10/19）`rg "makeStyles|withStyles|@mui/styles|@material-ui/styles" src`，排除 scss 舊 class 名後，僅剩 `src/__mocks__/@material-ui/styles.js`（jest mock）與 `AccountingRecordCreate/__test__/index.test.js` 的**註解**，**程式碼 0 檔**。舊「jss 2 檔」說法不成立（應是把這兩處算進去）；不需改程式。`initialize*.scss` 內的 `.makeStyles-*` 是舊 jss 產生的 class 名選擇器，已無對應元素，屬死 CSS，另批清理（動它們要確認列印規則，故不在 F 批）。
- **盤點總表**已在 PR #7（上方 §三）；其 `@mui/icons-material` 25 檔、jss 2 檔兩列為 F 批前數字，已在表內註記更正。

---

## 四、剩餘工作分類與批次建議（2026/10/19）

「頁數」以 views 目錄計；「檔案數」＝該範圍內仍引用 `@mui/*` 的檔案。估計為量級，不是承諾；每批仍依鐵則「只改畫面」，一批一個 PR、驗證通過再 merge（本輪不 merge）。

| 批次 | 範圍 | 規模 | 風險 | 備註 |
|---|---|---|---|---|
| **A（本輪已做）** | P1：打帳單 `WalletDepositModal` 標籤統一 | 1 檔 | 低 | 見 STATUS「本輪改動」 |
| A2 | P1：~~`OrderEdit/WalletDepositModal`（孿生檔）~~ ✅ 已完成（PR #8）；`OrderCreate/AddCustomerModal` 未做（即 A3） | 1 檔（剩 AddCustomerModal） | 低／中 | AddCustomerModal 有 Enter 跳欄焦點鏈與編號重複檢查，需逐欄對照，建議拆成單獨一批 |
| B1 | P1：非打帳單頁面手機擠壓共用修正（設計師績效頁搜尋鈕被推出、日期欄只剩 24px、薪資單儲存格換行） | 估 5～10 頁；審計資料在 `scratchpad/audit-*.json`（不在 repo，**需重跑審計**） | 低～中 | 多為 `flex-wrap`／`min-w-0` 這類共用修正，要用 Playwright 手機寬度確認；本輪未做，原因：審計來源不在 repo，無法在無法執行 `node`／瀏覽器的階段安全修 |
| B2 | P2：`r2-04` 表單頁 | 15 目錄／54 檔 | 中 | 清單 `batches/r2-04-forms.txt`；原 worktree 找不到，需重做；表單有驗證與送出，逐頁 verify-logic |
| B3 | P2：`r2-06` 其他頁 | 63 目錄（檔案數未全掃） | 中 | 清單 `batches/r2-06-misc.txt`；同上 |
| C | P2：高 MUI 頁 `OrderEdit`(28)／`DraftOrderEdit`(26)／`QueueOrderEdit`(24) 套用打帳單做法 | 78 檔、3 頁 | **高** | 金額／付款／卡券邏輯都在；三頁結構高度重複，建議先做 `OrderEdit` 一頁當樣板，每次一頁一個 PR |
| D | 其他大頁：`Parameter`(20)、`EmployeeManagementDetail`(12)、`CustomerManagementDetails`(12，已在 r2-04 清單)、`Profile`(11) | 約 55 檔、4 頁 | 中 | 設定與會員資料，表單為主；`CustomerManagementDetails` 併入 B2 |
| E | 一般頁面長尾：約 125 個目錄各 1～3 檔（設定／報表／會員／商品／服務），含 `ui/native-select` 外框標籤改上方標籤（約 21 處） | 約 130 目錄（與 B2／B3 重疊） | 低～中 | 依 `PAGE_CHECKLIST.md` 的順序處理；先處理沒有列印的頁 |
| **F（已完成，PR #9，2026/10/19）** | `@mui/icons-material` 殘留 25 檔 → 0；jss 實查程式碼 0 檔（原「2 檔」更正） | 23 檔換 import＋`ui/icons` 補 2 個轉接＋1 檔死碼改指向 | 低 | 可讓 icons-material 套件移除（另批）；`initialize*.scss` 的 `.makeStyles-*` 死 CSS 與 `AboutAssistant.js` 死碼留待清理批 |
| **P3（待決策）** | `ui/combobox`（取代 56 個 Autocomplete）、`ui/date-picker`（39 檔）、22 個列印報表是否改版、Services 篩選鈕 | combobox／date-picker 各為一個元件工程（中）；列印報表約 22 頁（高，需改 `initialize.scss` 約 70 條列印規則） | 高 | **等 Jason 拍版，未動** |

**預估批數**：A2 1 批；B1 1～2 批；B2 1～2 批；B3 3～5 批；C 3 批；D 2～3 批；E 與 B2／B3 合併計；F 已完成（PR #9）。合計約 **11～16 批**（不含 P3 的元件與列印報表）。MUI 本體要完全移除，另需 P3 三項定案後再加 combobox、date-picker 與列印報表各一批以上。
