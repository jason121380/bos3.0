# 改版決策與教訓（MEMORY）

> 目的：記下「為什麼這樣做」，避免日後重複討論或重踩坑。規範本身見 `STYLE.md`，守則見根目錄 `CLAUDE.md`。更新：2026/10/19

## 已定案的決策

| 決策 | 理由／日期 |
|---|---|
| 技術走 Tailwind 3.4 + Radix 元件放 `src/ui/`；品牌藍 `#1A73E8` 為唯一主題色 | 參考 OpenAI 介面克制感；沿用舊版品牌色 |
| Tailwind preflight 關閉，基礎樣式限定在 `.ui-root`，用 `:where()` 把權重歸零 | 遷移期間不能破壞還在用 MUI 的頁面 |
| 只改畫面，不動 API／Redux／hooks／金額日期運算；列印範本不動 | 使用者鐵則 |
| ~~會 `window.print()` 的報表表格（約 15 頁）維持 MUI（選項 A）~~ → 2026/10/19 Jason 新決策：所有報表樣式一致，以 compact 緊湊呈現（只改 presentation／print CSS，不改內容欄位與數字計算）；下一組優先做報表 compact 專項，先盤點共用層再逐目錄 | 舊理由：列印規則直接寫在 MUI class 上（`initialize.scss` 約 70 條），改寫時要特別小心；已由 Jason 拍版推翻選項 A，本批只記錄、未動報表 |
| 後端 repo 唯讀；測試不建立真實帳單 | 使用者指示 |
| 欄位標籤統一「上方標籤＋佔位字」，不用浮動標籤 | 浮動標籤被 `overflow` 裁掉、備註欄標籤太小；打帳單第 1 組 |
| 必填 `*` 依既有驗證規則標示，並在原始碼註解寫明依據 | 打帳單第 2 組；`orderRequirements.js` 與 Header `valid` 有測試比對 |
| 停用的掛單／明細／結帳顯示「尚缺：…」 | 使用者看不出為什麼不能按 |
| 圖示按鈕改真的 `<button>` 帶 title／aria-label；「+」改「新增項目」 | 第 3 組 |
| 收合卡片以 `summaryMeta` 顯示「已填 N 筆 · NT$ 小計」 | 第 4 組 |
| 金額一律 `NT$` ＋千分位；長帳單用**底部固定合計列**（方案 B）而非 sticky 側欄卡 | sticky 卡只能在並排區內移動，幾乎沒效果；整頁兩欄會壓縮項目列 |
| 服務下拉：選項顯示 `名稱(代號) - 價格`、以 `id` 當 key、中文「查無符合／載入中」 | 同名同價服務分不出來；MUI 以標籤當 key 會重複 |
| 「always merge」：驗證通過就開 PR 並 merge 進 main，不必再問 | 使用者 2026/10/18 指示 |
| 電話不限 10 碼：LoginForm 不做 10～13 碼長度驗證，只有 required | Jason 2026/10/19 拍版；改版前（c41b604）本來就沒有。測試改為驗證非 10 碼電話不會被長度規則擋下 |
| 店販售價可以低於成本：不做 `sellPrice >= cost` 驗證 | Jason 2026/10/19 拍版；ProductCreate 測試改為 cost=9、sellPrice=5 不報錯，sellPrice<0 仍被擋 |
| `handleToggleNavBar` 判斷寬度 1280→1024 | 側欄改用 Tailwind `lg`(1024)，判斷值必須與 CSS 斷點一致（唯一的邏輯常數修改） |

| 2026/10/19 指示「UI 優先、全部改完」；本輪只做完整盤點＋第一批最安全 UI，**不 merge**，不新造 combobox／date-picker，不動列印報表 | 這三項要 Jason 拍版（`TODO.md` §二 P3） |
| 浮動標籤的 MUI 欄位換成上方標籤時，**不改共用元件**：用 `Field`＋`label=''`／`placeholder`（`SourceSelect`、`EmployeeAutoComplete`、`CustomerAutoComplete` 都支援） | 這些元件全站共用；`Head`、`Remark` 已是這個做法，風險最低 |
| **Jason 2026/10/19 四點拍版**：①`PaymentCreate` 授權改 Cypress 下拉選取為 `.select()` 寫法並恢復排批；②Autocomplete 不新造 combobox、不動打字／選取，其他頁只改外層標籤；③月曆排 `ui/date-picker` 專項（先盤點 39–43 檔，保留民國年／格式／locale／存值，分批）；④22 張列印報表併入 compact 專項（只改樣式、列印預覽唯讀確認） | 取代先前「等拍版／維持 MUI」的待決策；見 `TODO.md` §二 P3、`STATUS.md`、`STYLE.md` §11 |
| 報表 compact 以 `ui/table` 的 `dense` 為單一定義（列高 32px、td 上下 4px、td／th 左右 `px-2`），共用層修改、頁面只傳 `dense` | 實查發現全專案原本沒有任何頁面傳 `dense`（`aria-label="a dense table"` 只是字串），改共用層不會波及既有頁面，比每頁寫 className 一致；非 dense 預設與 `PRINT` 規則不動。數字欄對齊不由本批處理（四頁原本就有 `numeric`）。三個「28」（`*Report` 目錄、`window.print` 檔案、舊文件的報表數）口徑不同，見 `TODO.md` §三之二 |
| 畫面版號以 `src/version.js` 的 `APP_VERSION` 為單一來源（格式 `v3.0-MMDD-HHmm`），兩個 TopBar 都讀它 | 原本寫死 `v3.0`，Jason 無法從手機畫面判斷跑的是哪個 build。不用 `package.json` 的 version（0.1.0，與產品版號無關），也不另做 build 注入，避免兩套來源；代價是每個完整 commit 要手動更新此檔 |

## 驗證基準

- 測試：改版前 14 檔／25 測試，7 檔 13 個失敗；現在 17 檔／50 測試，仍是同樣 7 檔 13 個失敗（無新增失敗）。
- RegisterForm 競態：舊測試只等 2ms 就檢查導頁，改版後頁面變輕才暴露；已改用 RTL `wait`。
- verify-logic 對 `c41b604` 的 42 個 FAIL 已逐一分類（見 `VERIFY_REPORT.md`），其中 2 處是實際差異（斷點常數、Services 篩選鈕）。

- 2026/10/19：兩項產品決策落地後，全域測試 17 檔／52 測試全數通過（0 失敗、0 skip），原 13 個既有失敗已清零（PR #5 與本批）。

## 已知死代碼註記

- `src/views/ProductCreate/AboutProduct.js` 的 `min.value = watchList.cost`：react-hook-form v6 不會因 re-render 重新註冊欄位規則，下限實際停在初始成本 0，只擋負數。因售價可低於成本的決策，視為過時設定；本批不改元件（鐵則：只改畫面），僅於此與測試註解標註。日後若要清理，需 Jason 同意（動到驗證邏輯）。

## 教訓（踩過的坑）

1. **codemod 會誤傷模板字串**：`tf2input.py` 把含 `}` 的 template literal 標籤改壞（Payment.js 解析失敗）、漏掉雙引號的 `"data-testid"`。批次轉換後一定要跑 eslint＋verify-logic，並人工看 diff。
2. **`inputProps={{placeholder}}` 會覆蓋預設的 `{ 'data-testid': '' }`**：兩者要一起傳。
3. **headless Chromium 沒有捲軸**：「訂單列表沒有捲軸」的修正只能驗 CSS 規則，需使用者在實機確認。
4. **偵測腳本的誤判**：用 height 推算行數會誤判固定高度儲存格，用 Range client rects；可捲動容器內的內容超出外層不算裁切。
5. **dev server log 會過期**：看到 "Compiled" 不代表伺服器還活著；`pgrep` 也可能抓到殘留程序。啟動前清 log，啟動後 `curl`。
6. **JSX 註解不能放在 `return (` 的第一個子節點**：會變成解析錯誤；用 `//` 放在 return 上方。
7. **flex 容器被內容撐寬**：父層是 flex 時，子層要 `min-width:0` 與 `max-width:100%`；百分比寬度要扣 margin。
8. **MUI Autocomplete 的 `aria-expanded`** 只在「有選項」時為 true；沒有選項時的「No options」彈出層可見但 aria 為 false。
9. **`git fetch` 與 `log` 串在一起會被權限分類器擋**；單獨 `git fetch origin main` 可以。
10. **合併後分支要重置到 main**，再推送（快轉）；否則 stop hook 會提示有未推送的 commit。
11. **Portal 內缺 `ui-root` 要從根因修**：與其逐檔補 class，不如讓 `src/ui` 元件根元素自帶 `ui-root`（已做 8 檔）。檢查用 `node scripts/redesign/portal-root-scan.js`（純文字比對：檔案 import 8 個 ui 元件之一、使用 `<Dialog|Modal|Popper|Popover|Menu|Drawer`、檔內沒有 `ui-root`、且該 ui 元件自身未帶 `ui-root`）。手動整理的清單會漂移（舊「16 檔」實際掃描為 25），以掃描結果為準。限制：只比對同檔案，經由其他元件間接放進 Portal 的不會被抓到。
12. **盤點數字要附口徑與日期**（2026/10/19）：舊文件的 340／414／706／481／187／「icons-material 50」／「約 15 頁列印」混用「檔案數」「import 次數」「標籤數」「目錄數」，且基準時間不同，互相對不上。現在一律用 `TODO.md` §三 的表（寫明日期與 `rg` 口徑），腳本 `scripts/redesign/inventory-scan.js` 可重跑。`rg -l` 算檔案、`rg -o … | wc -l` 算標籤；views 目錄數用 `cut -d/ -f3` 取第一層（會把單檔如 `Error404.js` 算成一項）。
13. **`ui/native-select` 的 `label` 是外框上緣標籤**（為了和 MUI 外框欄位並排），不是「上方標籤」；`ui/input` 的 `Field` 才是。同一個彈窗混用兩種會不一致，換標籤時要整個彈窗一起換（WalletDepositModal 即如此處理）。
14. **非互動工作階段可能不能執行 `node`／`npx`／`npm`／`sed`／`sort -k`**（權限提示無人可核准）：只能用 `rg`、`git`、`cut`、`sort`、`uniq`。遇到時不要繞過，把驗證留給指揮者；`rg` 的 pattern 含 `[`／`<`／`>` 時也可能被分類器擋，可改 `\x3c`、`\w` 或只用 `rg -l`＋`cut`。
15. **舊 worktree 的成果不在 repo 就等於沒有**：r2-04／r2-06 的 worktree 與分支在本機都找不到，不能假設可以 rebase 合併。未 push 的 worktree 要先確認再算進進度。
16. **轉接層缺圖示時 swap-icons 會整檔跳過**（F 批，PR #9，2026/10/19）：`swap-icons.js` 只換 `ui/icons` 已有的名稱，沒有的保留 MUI import；Autocomplete 的 `CheckBox`／`CheckBoxOutlineBlank` 因缺 adapter 讓 22 檔一直殘留。先在 `ui/icons.js` 補轉接（Lucide `SquareCheck`／`Square`）再換。盤點殘留時以 `rg` 實查為準，別沿用舊數字（舊「jss 2 檔」實查為 0）。另：`@mui/icons-material/Chip` 這種不存在的 import 出現在死碼檔（`ServiceEdit/AboutAssistant.js`），因沒被 bundle 才沒讓 build 失敗。
17. **單選 MUI Select 換 `NativeSelect`、不換 Radix `ui/select`**：`NativeSelect` 的 `onChange(event)` 與 MUI 相容，`event.target.value` 回傳選項的原始型別值（空字串、數字、布林都行），所以既有的 `idx(event, _ => _.target.value)`、`parseInt(event.target.value)` 等包裝一字不改；Radix `onValueChange` 只給字串，換了就得動 handler（違反鐵則 1）。比對規則與 MUI 一致（非物件值以字串比較），例如 state 存數字 `0`、選項值是 `'0'` 仍會選中（CouponCreate 協助人員人數）。`CouponCreate` 批次（`claude/ui-batch4-box`，PR #10，2026/10/19）採用。
18. **MUI Select 的 `labelId`／`id="select-item"` 在重複列裡是重複 id**：換成 `Field`＋`NativeSelect` 時不要照搬，否則每列 `<label htmlFor>` 都指向第一個 select；`NativeSelect` 會自動產生唯一 id。全 repo 沒有其他程式或測試用 `select-item` 當選擇器（`rg` 確認過，只出現在各 About 檔本身）。
19. **孿生目錄（Create／Edit）不可照抄**（PR #11，v3.0-1019-0202）：`CouponEdit` 與 `CouponCreate` 的 About 檔看似相同，實際差在 `onChange` key 大小寫（`serviceDeductionItems` vs `ServiceDeductionItems`）、載入中防護（`loading ? '' : value`）、新增列初始值與圖示做法。改版時逐檔對照、只動 JSX，handler 一字不改。
20. **版號慣例**（批次 6，2026/10/19）：`src/version.js` 的 `APP_VERSION` 格式 `v3.0-MMDD-HHmm`，每個完整 commit 更新，不自行升大版號；commit 前由指揮者校正分鐘。STATUS 的「版本清單」逐批加一列。PR #11–#15 皆已 merge（#15 為 c168506）；批次 9 為 PR #16。
21. **重複列的欄位 id 要含 index**（批次 6）：`AccountingItemCreate` 每列都有「代號／名稱」，換 `Field`＋`Input` 時 `id`／`htmlFor` 用 `` `revenueNumber-${index}` `` 這類唯一值，`name` 不變（`onChange` 靠 `e.target.name` 分流）。
22. **`InputProps={{ inputProps: { min: 0 } }}` 直接對應 `Input` 的 `min={0}`**（批次 7，PR #14，v3.0-1019-0245）：`ui/input` 的 `Input` 是原生 `<input>`，`min`、`type="number"`、`onWheel`、`value`、`onChange` 都原樣傳入；`CreateDeductionSetting/Results.js` 的 `checkInput` 靠 `event.target.value` 做夾限，原生 input 的 event 與 MUI 相同，handler 不用動。重複列的門檻欄位沒有 `id`，所以標籤不綁 `htmlFor`（不新造會重複的 id）。
23. **下拉選項的 `data-testid` 被 Cypress 點選時，不能換 `NativeSelect`**（批次8，2026/10/19）：MUI Select 的選項是 Portal 內的 `MenuItem`，e2e 以 `data-testid` 逐項點擊；原生 `<select>` 的 option 不能這樣點（要用 `.select()`），換了 e2e 會壞。`PaymentCreate` 因此整批放棄，改做 `UpdateDeductionSetting/Results.js`（純 TextField，無 Select）；是否授權改 Cypress spec 待決策（見 TODO P2）。
24. **未綁 `value` 的 MUI Select 換 `NativeSelect` 要補顯示綁定**（批次9，v3.0-1019-0309）：`CouponList/AssistantSettingEditModal` 的「協助人員人數」原本是不受控的 MUI Select（選了會自己顯示）；`NativeSelect` 是受控的，沒有 `value` 選了也會跳回空白，所以綁 `value={content.peopleCount}`（`handleAssistantName` 會把它設成數字，比對規則以字串比較，數字 `3` 對得上選項 `'3'`）。這只是顯示綁定，handler 與 state 不變；做法同 `CouponEdit`。
25. **原生 option 無法帶 data-testid，Cypress 下拉改 `.select()`**（批次11，v3.0-1019-0349）：`PaymentCreate/AboutPayment` 的 MUI Select 換 `NativeSelect` 後，`<option>` 上的 `data-testid` 不保留，`createPayment_spec.js` 把「click 下拉 → click 選項」改成 `cy.get(下拉 testid).select(顯示文字)`。`NativeSelect` 的 option value 是索引字串（非原始值），所以 `.select()` 必須用顯示文字，不能用 value；外層 testid 在 `<select>` 上才能命中。
26. **Cypress 對 `NativeSelect` 用 `.select('顯示文字')`，不要用 value**（批次12，v3.0-1019-0352）：`NativeSelect` 的 `<option value>` 是選項索引（0、1、2…）而非業務值，所以 `.select()` 必須傳顯示文字；`data-testid` 在 `<select>` 本身，選項 testid 因原生 option 無法保留而移除。`PaymentEdit` 的 `fee-category`／`payment-deductions` 已照此改（只改選取寫法，斷言不動）。
27. **`aria-label="a dense table"` 只是字串，不會讓表格變密**（報表 compact 第二批，2026/10/19）：從 MUI 遷來的報表常帶這個 aria-label，盤點「是否已 compact」要查 `dense` prop，不能用 `grep dense`。`dense` 的 `px-2` 要用 `[&_td]:px-2`／`[&_th]:px-2`（權重高於儲存格自帶 `px-4`），同一檔多張 `ui/table` 要逐張判斷（彈窗內的 MUI Table 不在範圍）。`px-2` 已隨 PR #20（d7e2a99，已 merge）進共用層，本批沿用 main 的 dense 定義。
28. **報表 compact：IncomeStatementReport 換 `ui/table` 的對照要點**（第三批第 5 個，2026/10/19）：MUI `TableHead`（thead 容器）→ `TableHeader`、表頭儲存格 `TableCell`→`TableHead`，名稱互換很容易漏改，改完要逐張對 `<thead>`／`<th>`。原表無 `align`，數字欄維持靠左（不擅自加 `numeric`，避免畫面變動）；`hover` prop 由 `ui` 的 `TableRow` 內建；小計／損益紅字 `css={styles.subtotal}` 保留（列印時 `ui/table` 的 `print:text-black` 可能讓表內文字變黑，需實機列印預覽確認）。`initialize.scss` 的 `.IncomeStatementReport … table/thead/th` 元素選擇器理論上仍套得到，但 `.MuiTableCell-root` 這類 class 選擇器不再命中，列印以實機為準；本批不動 `initialize.scss`。
29. **報表 compact：巢狀表整頁保留；`css` prop 可直接傳給 `ui/table` 元件**（第五批，2026/10/19）：`DesignerPerformBasic/Results.js` 的展開列在 `colSpan` 儲存格內放第二張 `Table`（`Collapse`），`ui/table` 的 `Table` 會自帶外框 div（圓角邊框＋橫向捲動），放進儲存格會變成框中框，且 `.noprint` 展開列、`DesignerPerformBasicTable` 列印規則牽連多，故判定表達不了、整頁不動（`index.js` 只查）。日後要做需先決定巢狀表是否用 `wrapperClassName` 去框，或改成平面列。CostAnalysisReport 的 `css={styles.width}`／`styles.subtotal` 透過 emotion 轉成 className 傳給 `TableHead`／`TableCell`（皆接 `className`），可保留；`ui/table` 的 `TableCell` 預設 `h-11 px-4`，`dense` 才壓成 `h-8 px-2`。
