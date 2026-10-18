# 待辦清單（TODO）

> 更新：2026/10/18　給：Jason　規則：只改畫面、不動邏輯；驗證通過就合併進 `main`（always merge）。

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
- [ ] **打帳單其餘彈窗仍是浮動標籤的 MUI**（新增顧客 Modal 等），要統一為上方標籤。
- [ ] **實機確認**：訂單列表捲軸、底部固定合計列（桌機／手機）、列印不出現合計列。

### P2 — 改版收尾
- [ ] **合併第二輪未完成批次**：`r2-04`（表單頁，13 個 commit，worktree `agent-a7e481ba90389d29b`）與 `r2-06`（其他 63 頁，中途中止，worktree `agent-af60fcc4359cfd91c`）——需先 rebase 到最新 main、重新驗證再合併。
- [ ] **批次 5 [v3.0-1019-0202]（`claude/ui-batch5-box`，指揮者已驗證，待開 PR）**：`CouponEdit` 表單標籤改版，做法同批次 4 的 `CouponCreate`（PR #10）。
  - 本批完成：`AboutCoupon.js`、`AboutDeduction.js`、`AboutAssistantSetting.js` 的 TextField → `Field`＋`Input`（標籤在上）、單選 Select → `Field`＋`NativeSelect`；`index.js` 沒有 MUI 欄位，未動。三檔都沒有 helperText／error、Autocomplete、日期、鍵盤焦點鏈或列印，所以三檔皆在範圍內。`Checkbox`／`FormControlLabel`（分指定／互助均分）仍是 MUI。
  - **與 `CouponCreate` 不對稱處（不可從孿生目錄照抄）**：
    - `AboutCoupon`：Edit 的服務類別 `value={loading ? '' : coupon.ServiceCategoryId}` 有載入中防護（Create 沒有），已保留；價格／次數有 `onWheel` blur，已保留。
    - `AboutDeduction`：Edit 的 `onChange` key 是小寫 `serviceDeductionItems`（Create 是 `ServiceDeductionItems`），handler 一字未動；標題 `系統預設` 有 `text-danger`；清除／刪除／新增是 `ui/icons` 的圖示（帶 `data-testid`），本批**不**像 Create 改成 `Button`，只留原圖示（`marginTop:30px` 剛好對齊上方標籤版型的輸入框）。
    - `AboutAssistantSetting`：Edit 的新增列初始值（`isDesignate:false`、`peopleCount:1`）與清除（無 `isSplitted`）和 Create 不同，handler 未動；圖示同上沒改成 `Button`。
  - 外觀待實機：圖示 `marginTop` 對齊、序號 `mt-[26px]` 對齊、`w-24`／`w-28` 小數字欄位換行、類別選單空值顯示第一選項（原生行為，同 Create）。
  - 後續（不在本批）：Edit／Create 的圖示列統一成 `Button`（含 `aria-label`）可另開一批；剩餘批次：盤點總表在 PR #7，待合併後對齊，這裡不重寫整份盤點。
- [ ] **階段 4 半遷移盤點**（見下方「盤點結果」），決定 MUI 何時可移除。
- [ ] 把打帳單的做法（欄位標籤、必填、停用原因、摘要、NT$）套用到 **帳單編輯／草稿／排隊帳單**（`OrderEdit`、`DraftOrderEdit`、`QueueOrderEdit`）——它們共用 `ServicesAutoComplete`，下拉已受益，但版面尚未對齊。

### P3 — 需要你決定
1. `Services`（服務項目設定）的篩選按鈕：舊版因 prop 名稱錯誤從未顯示，要顯示嗎？
2. 約 15 個直接列印的報表是否要改版（目前決定維持 MUI）。
3. 是否要新增 `ui/combobox`（取代 69 處 Autocomplete）與 `ui/date-picker`（取代 41 處日期選擇器）——這是移除 MUI 的前提，但會是較大的元件工程。

### P4 — 既有問題（修了會動邏輯，需你同意才改）
- 功能釘選分頁 `_` 未 import；`SalaryEdit` 日期只在模組載入時計算一次；`UpdateDeductionSetting` 刪除級距把 event 當 index；`CustomerBonusRecordEdit` 對字串呼叫 `splice`；`OrderEdit` 的 `_.cloneDeep` 未 import；三個帳單編輯頁的 `handlePannelClick` 未定義；`AdminPageHeader` 的 `primaryAction.disabled` 無作用。
- `ServicesAutoComplete`：排序直接改動原陣列、`a.no - b.no` 遇非數字代號為 NaN、代號只支援完全比對。
- 測試：13 個既有失敗（ProductCreate、ServiceCategoryEdit／Create、AccountingSubjectsAutocomplete、LoginForm、Products/Results、AccountingRecordCreate/Header）——修完 CI 的 Unit tests 才會轉綠。

---

## 三、階段 4：半遷移盤點結果（2026/10/18）

| 項目 | 數字 |
|---|---|
| `src/views` 仍引用 `@mui/*` 的檔案 | **340**（`src` 全部 414 個） |
| `@mui` 套件分佈（import 次數） | material 474、icons-material 50（多為轉接層以外的殘留）、x-date-pickers 41、x-tree-view 6 |
| 使用 emotion／`css=` 的檔案 | 481 |
| 使用 jss／makeStyles／withStyles 的檔案 | 2 |
| 引用舊 `src/theme` 的檔案 | 187 |

**使用最多的 MUI 元件（次數／涵蓋目錄）**：TextField 183／99、FormControl 79／59、InputLabel 74／56、MenuItem 73／53、Select 73／53、Autocomplete 69／63、Checkbox 67／52、Card 66／28、Button 65／28、TableRow 58／39。

**單檔 MUI import 行數前 10**：AttendanceRecords/index(5)、ProductInvoicingRecordReport/index(4)、ManagementReservationRecord/ChoseEvent(4)、EmployeeSchedule/ScheduleCard(4)、EmployeeClockIn/index(4)、SingleServiceSearchingReport/index(3)、QueueOrderEdit/Head(3)、Profile/Reservation/HolidayEdit(3)、ProductReserveCheck/index(3)、Parameter/OuterLinkModal(3)。

**何時能移除**
| 要移除 | 前提 | 估計 |
|---|---|---|
| `@mui/icons-material` | 全站圖示改走 `ui/icons`（已是轉接層） | 最容易，掃一遍殘留即可 |
| jss（2 檔） | 改寫那 2 檔 | 很快 |
| `@mui/x-date-pickers` | 先做 `ui/date-picker`（41 處） | 中 |
| `@mui/material`（含 Select／Autocomplete／TextField） | 先做 `ui/combobox`、完成 r2-04／r2-06、並決定 15 個列印報表（目前決定保留 MUI） | **只要列印報表維持 MUI，就無法完全移除** |
| emotion（481 檔） | 所有 `css=` 改 Tailwind；與 MUI 橋接一起處理 | 最後一步 |
| 舊 `src/theme`（187 檔引用） | MUI 與 emotion 移除後 | 最後一步 |

結論：短期可移除的只有 icons-material 與 jss；MUI 本體取決於「列印報表」與「Autocomplete／日期選擇器」兩個決定（見 P3）。
