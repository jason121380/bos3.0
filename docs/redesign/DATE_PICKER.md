# 月曆 date-picker 專項（盤點＋設計）

> 專項第 1 批（2026/10/19，分支 `claude/ui-datepicker-spec-box`，v3.0-1019-0908 暫定）：**只有文件，沒有換任何元件、沒有改任何程式**。
> 專項第 2 批（試行，2026/10/19，分支 `claude/ui-datepicker-pilot-box`，v3.0-1019-0958 暫定）：已建立 `src/ui/date-picker.js` facade，並換 2 檔（`MemberCreate/index.js`、`Profile/General/GeneralSettings.js`）。**目前已換 facade 的檔數：2／37**（下方盤點數字仍是第 1 批當時口徑，其餘 35 檔仍直接用 `@mui/x-date-pickers`）。
> 依據：Jason 2026/10/19 拍版「月曆排入 `ui/date-picker` 專項，先盤點、分批進行」（見 `TODO.md` P3 第 3 點）。
> 盤點口徑：`rg` 實查 `src/`，套件 `@mui/x-date-pickers` **6.19.4**（`package.json`）。

## 一、盤點數字（實查）

| 項目 | 數量 | 說明 |
|---|---|---|
| 引用 `@mui/x-date-pickers` 的檔案 | **39** | `rg -l '@mui/x-date-pickers' src` |
| 只設定 `LocalizationProvider` 的檔案 | 2 | `src/App.js`（全域包覆）、`src/components/CustomMockedProvider.js`（測試用），皆 `AdapterDateFns`＋`date-fns/locale/zh-TW` |
| **實際使用 picker 的檔案** | **37** | 35 個 views ＋ `components/DateSelector/index.js` ＋ `components/MerchantSearchBar/DatePicker.js` |
| picker 的 JSX 標籤（實查） | **45** | `MobileDatePicker` 24、`DatePicker` 12、`DateTimePicker` 7、`MobileDateTimePicker` 2 |
| 加上包裝元件的呼叫 | 47 | `DateSelector` 內自訂的 `DatePicker` 包裝（`startDate`／`endDate`）被渲染 2 次，其內只有 1 個 `MobileDatePicker` 標籤；若把這 2 次算成 `DatePicker`，就是 DatePicker 14、合計 47（交辦數字的口徑）。**本文件以真正的 picker 標籤 45 為準，47 為含包裝呼叫的口徑** |
| 原生 `type="date"` | 3 檔 | 另列一類，見第五節 |

另有兩個「同名但不是 x-date-pickers」的 `DatePicker`：`MerchantSearchBar/DatePicker.js`（元件本身，內含 2 個 `MobileDatePicker`）與 `DateSelector` 內的區域函式 `DatePicker`，盤點時不要和 x-pickers 混為一談。

`DateSelector` 被 **9 個**頁面以 `pickerOption` 引用（AttendanceRecords、AttendanceEmployeeSchedule、IncomeStatementReport、CostAnalysisReport、EmployeePayslip、DesignersSalaryDetailReport、MerchantBankTransferReport、SalaryOverview、SalaryDetail）；`MerchantSearchBar` 的引用面更廣（牽動約 60 處，改它要另批、謹慎）。

### 兩種 picker 的行為差異（影響「鍵盤打字」結論，已查 `node_modules` 原始碼）

- **`MobileDatePicker`／`MobileDateTimePicker`（26 個）**：欄位預設 `readOnly: true`（`useMobilePicker.js`：`readOnly != null ? readOnly : true`），**不能鍵盤打字**，只能點開彈層選。其中 11 個還自訂了 `slots.field`（`<Input type='text' onClick=…>` 或 `<button>`／`<Button>`，沒有 `onChange`），本來就是「純點選」。
- **`DatePicker`／`DateTimePicker`（19 個）**：桌機（`@media (pointer: fine)`）用 Desktop 版，欄位是分段式輸入，**可以鍵盤打字**；觸控裝置自動切成 Mobile 版（唯讀＋彈層）。

## 二、逐檔盤點（37 檔）

欄位說明：**元件**＝picker 標籤（括號為個數）；**format**＝顯示格式；**toolbarFormat**＝彈層標題日期格式（「預設」＝未指定）；**特殊 props**＝minDate／maxDate／disabled／readOnly／inputRef／onError／自訂 `slots.field`／焦點鏈等。存值欄一律是 handler 內的轉換（見第四節）。

### A. 共用元件（牽動範圍大，後批）

| 檔案 | 元件 | format | toolbarFormat | 特殊 props／備註 |
|---|---|---|---|---|
| `components/DateSelector/index.js` | MobileDatePicker（1，渲染起／迄各一次） | `inputFormat` prop，預設 `yyyy/MM/dd` | `M月d日` | `{...pickerOption}` 展開（呼叫端可傳 minDate／views 等）；自訂 `slots.field` 為 `<button>`（純點選）；`disabled`；`aria-label`；報表查詢情境 |
| `components/MerchantSearchBar/DatePicker.js` | MobileDatePicker（2：起／迄） | 起：`onlyMonthYear ? 'yyyy/MM' : 'yyyy/MM/dd'`；迄：`yyyy/MM/dd` | `M月d日` | `closeOnSelect`；自訂 `slots.field` 為 MUI `Button`（`ButtonGroup` 內，純點選）；**2026/10/19 起新增 `uiDateField` prop（預設 `false`）逐頁 opt-in：開啟時日期欄改為 `inputClass` 外觀的原生 `<button>`＋`CalendarDays` 圖示、容器由 `ButtonGroup` 改 flex `div`；目前僅 `DecreaseDetail` 開啟，其餘引用未動；開啟時左側快捷鈕（本月／上個月／前天／昨天／今天等）也同步換 `ui/button` 的 `secondary`＋`sm`（flex `gap-2` 容器），其餘引用快捷鈕仍為舊 MUI 樣式，排共用元件批再議**；篩選情境；**`yyyy/MM` 是月模式**，但仍是完整日 picker＋月格式顯示，與值的處理在 `handleCalendarAccept` |

### B. 一般表單頁（MobileDatePicker 群）

| 檔案 | 元件 | format | toolbarFormat | 特殊 props／備註 |
|---|---|---|---|---|
| `views/AccountingRecordCreate/General.js` | MobileDatePicker（1） | `yyyy/MM/dd` | `M月d日` | `closeOnSelect`；自訂 `slots.field`（`Input type='text'`，只有 `onClick`）；`onKeyDown` Enter → `setFocus('type1'/'type2')` ＋ `ref.focus()` **焦點鏈**；`onChange` 同時 `history.push(?date=…)`；表單 |
| `views/AccountingRecordDetail/index.js` | MobileDatePicker（1） | `yyyy/MM/dd` | `M月d日` | 同上自訂 field；`onKeyDown` 焦點鏈；表單（明細） |
| `views/CustomerBonusRecordCreate/AboutCustomerBonusRecordCreate.js`、`views/CustomerBonusRecordEdit/AboutCustomerBonusRecordEdit.js`（成對） | MobileDatePicker（各 1） | `yyyy/MM/dd` | `M月d日` | `closeOnSelect`；自訂 `slots.field`（`Input type='text'`，只有 `onClick`）；表單 |
| `views/ProductRestockCreate/General.js`、`views/ProductRestockEdit/General.js`（成對） | MobileDatePicker（各 1） | `yyyy/MM/dd` | `M月d日` | `closeOnSelect`；自訂 `slots.field`；**Edit 有 `disabled`**（並同步傳給 field 的 `readOnly`）；表單 |
| `views/MainEventCreate/General.js`、`views/MainEventEdit/General.js`（成對） | MobileDatePicker（各 2：預設起／迄） | `yyyy/MM/dd` | `M月d日` | `closeOnSelect`；`showToolbar={false}`（彈層不顯示標題）；**Edit 有 `readOnly={isReadOnly}`**；預設欄位（無自訂 field） |
| `views/EventRuleCreate/General.js`、`views/EventRuleEdit/General.js`（成對） | MobileDatePicker（各 2：起／迄） | `yyyy/MM/dd` | Create 預設；Edit `M月d日` | **`minDate={mainEvent.start}`／`maxDate={mainEvent.end}`**；`closeOnSelect`；Edit 有 `readOnly={isReadOnly}`；Create 沒有 `localeText`／`slotProps` |
| `views/CustomerSelfCreate/General.js` | MobileDatePicker（1） | `yyyy/MM/dd` | `yyyy年M月d日` | `openTo='year'`（生日）；`slotProps.textField`（`placeholder:''`、`fullWidth`）；`closeOnSelect`；已是 `Field` 上方標籤（顧客自助建檔） |
| `views/CustomerManagementDetails/General/ChoseEvent.js` | MobileDatePicker（1） | `yyyy/MM/dd` | `M月d日` | `css`；`textField.variant='standard'`；旁邊另有 `Select` 時段；預約情境，疑似 Modal 內（待實機） |
| `views/ManagementReservationRecord/ChoseEvent.js` | MobileDatePicker（1） | `yyyy/MM/dd` | `M月d日` | 同上型；旁邊 `Select`；預約情境，疑似 Modal 內（待實機） |

### C. 一般表單頁（DatePicker 群，桌機可打字）

| 檔案 | 元件 | format | toolbarFormat | 特殊 props／備註 |
|---|---|---|---|---|
| `views/MemberCreate/index.js`（**試行批**） | DatePicker（1） | `yyyy/MM/dd` | `yyyy年M月d日` | `openTo='year'`；`slotProps.textField`（outlined、fullWidth）；`onChange={handleFieldChange}` 與其他欄位共用 handler；已是 `Field` 標籤；無列印、無 Modal 焦點鏈、無自訂 slots |
| `views/Profile/General/GeneralSettings.js`（**試行批**） | DatePicker（1） | `yyyy/MM/dd` | `yyyy年M月d日` | `openTo='year'`、`orientation='portrait'`；`value` 為 `null` 時傳 `""`；`css`；`textField.variant='standard'`；`onChange={handleBirthday}`；無列印／Modal／自訂 slots |
| `views/EmployeeManagementDetail/General/GeneralSettings.js` | DatePicker（2：出生、到職） | `yyyy/MM/dd` | 預設 | `value={x \|\| null}`；`css`；`textField` outlined／fullWidth；無 `localeText`；表單 |
| `views/Reservation/Basic.js` | DatePicker（1） | `yyyy/MM/dd` | `yyyy年M月d日` | `onChange` 內自己擋 `null`／`Invalid Date`（`!isNaN(new Date(event)) && event !== null`）；預約表單 |
| `views/GeneralAccountingRecordCreate/General.js` | DatePicker（1） | `yyyy/MM/dd` | `yyyy年M月d日` | `textField.onKeyDown` Enter → `setFocus('type1'/'type2')` ＋ `ref.focus()` **焦點鏈**；`onChange` 同時 `history.push(?date=…)`，`setDate(e)` 存的是 picker 回傳值（Date）；表單 |
| `views/GeneralAccountingRecordDetail/index.js` | DatePicker（1） | `yyyy/MM/dd` | `yyyy年M月d日` | `textField.onKeyDown` 焦點鏈；`setDate(e)`；表單（明細） |
| `views/EmployeePickingCreate/General.js` | DatePicker（1） | `yyyy/MM/dd` | `yyyy年M月d日` | **`disableFuture`**；**`onError` → `setErrorText('時間有誤')`＋`textField.helperText`**（無效值擋法）；`css`；standard；表單 |
| `views/EmployeePickingEdit/General.js` | DatePicker（1） | `yyyy/MM/dd` | `yyyy年M月d日` | `onKeyDown`（掛在 picker 上）Enter → `setFocus('product')`；`onChange={dateHandler}`；`css`；standard；表單 |
| `views/CustomerFilterExport/index.js` | DatePicker（3：最後消費起／迄、基準日） | `yyyy/MM/dd` | 預設 | **`disabled={disable[0\|1]}`**（隨篩選模式啟停）；無 `localeText`／`slotProps`；篩選匯出情境 |

### D. DateTime 群（含時間，format 含 `HH:mm`）

| 檔案 | 元件 | format | toolbarFormat | 特殊 props／備註 |
|---|---|---|---|---|
| `views/TopUpCreate/General.js`、`views/TopUpEdit/General.js`（成對） | MobileDateTimePicker（各 1） | `yyyy/MM/dd HH:mm` | 預設 | `closeOnSelect`；`css`；自訂 `slots.field`（`Input type='text'`，只有 `onClick`）；表單 |
| `views/AttendanceRecords/index.js` | DateTimePicker（1） | `yyyy/MM/dd HH:mm` | 預設 | **`maxDateTime={Date.now()}`**；`sx width 100%`；`onChange` 處理 `'Invalid Date'`；補打卡表單（頁內另有 `DateSelector`）；是否在 Dialog 內待實機 |

### E. 訂單三頁／訂單周邊（C 批，含焦點鏈，最後做）

| 檔案 | 元件 | format | toolbarFormat | 特殊 props／備註 |
|---|---|---|---|---|
| `views/OrderCreate/Head.js` | DateTimePicker（1） | `yyyy/MM/dd HH:mm` | 預設 | 已有 `Field` 上方標籤；`css`；`slotProps.textField`（`onFocus: handleFocus`、`name:'date'`、outlined small）；與 `Header.js` 的 `valid`（缺 `bill.date` 停用結帳）連動；訂單頁 |
| `views/OrderEdit/Head.js`、`views/QueueOrderEdit/Head.js`（成對） | DateTimePicker（各 1） | `yyyy/MM/dd HH:mm` | `M月d日` | `label="帳單日期"`；`css`；`textField.variant='standard'`；**原碼 `ocaleText` 拼錯（`localeText` 沒生效），屬既有問題，本專項不順手改**；訂單頁 |
| `views/DraftOrderEdit/Head.js` | DateTimePicker（1） | `yyyy/MM/dd HH:mm` | 預設 | `label="帳單日期"`；只有 `css`；訂單頁 |
| `views/OrderCreate/MemberShipCardSells.js`、`views/OrderEdit/MemberShipCardSells.js`、`views/QueueOrderEdit/MemberShipCardSells.js`、`views/DraftOrderEdit/MemberShipCardSells.js`（四檔同型） | MobileDatePicker（各 1） | `yyyy/MM/dd` | 預設 | **`inputRef={dateRef}` 焦點鏈**；**`minDate=addDays(bill.date,1)`／`maxDate=addYears(bill.date,50)`**；**`disabled={…expiryDate===null}`**；`autoFocus={focus==='date'}`；**`onError` → `setDateError`＋`helperText`**；`textField.onFocus`／`onKeyDown(handleKeyDown nextField)` 跳欄；訂單頁卡券到期日 |
| `views/OrderCreate/WalletDepositModal.js`、`views/OrderEdit/WalletDepositModal.js`（成對） | DateTimePicker（各 1） | `yyyy/MM/dd HH:mm` | `M月d日 HH:mm` | **Modal 內**；已有 `Field required` 上方標籤；`textField` outlined small；Dialog 與 picker 彈層疊放（焦點／`pointer-events` 待實機） |

### 清點

逐組檔數（A 2 ＋ B 13 ＋ C 9 ＋ D 3 ＋ E 10 ＝ 37）：

- A：2（DateSelector、MerchantSearchBar/DatePicker）
- B：AccountingRecordCreate、AccountingRecordDetail、CustomerBonusRecordCreate、CustomerBonusRecordEdit、ProductRestockCreate、ProductRestockEdit、MainEventCreate、MainEventEdit、EventRuleCreate、EventRuleEdit、CustomerSelfCreate、CustomerManagementDetails/ChoseEvent、ManagementReservationRecord/ChoseEvent ＝ 13
- C：MemberCreate、Profile/GeneralSettings、EmployeeManagementDetail/GeneralSettings、Reservation/Basic、GeneralAccountingRecordCreate、GeneralAccountingRecordDetail、EmployeePickingCreate、EmployeePickingEdit、CustomerFilterExport ＝ 9
- D：TopUpCreate、TopUpEdit、AttendanceRecords ＝ 3
- E：OrderCreate/Head、OrderEdit/Head、QueueOrderEdit/Head、DraftOrderEdit/Head、四個 MemberShipCardSells、兩個 WalletDepositModal ＝ 10

2 ＋ 13 ＋ 9 ＋ 3 ＋ 10 ＝ **37**（35 views ＋ 2 components）。

## 三、格式分布

**顯示 `format`（只有三種）**

| format | 用在 | 備註 |
|---|---|---|
| `yyyy/MM/dd` | 絕大多數（日期型） | 含 MerchantSearchBar 的迄日、DateSelector 預設 |
| `yyyy/MM/dd HH:mm` | 全部 DateTime 群＋訂單 Head／WalletDepositModal | 24 小時制 |
| `yyyy/MM` | 僅 `MerchantSearchBar/DatePicker.js` 起日，`onlyMonthYear` 月模式 | 仍是日 picker，只是顯示截到月 |

**`toolbarFormat`（彈層標題）有三種，逐檔保留、不統一**：`M月d日`（多數）、`yyyy年M月d日`（生日／預約／EmployeePicking／GeneralAccounting 等）、`M月d日 HH:mm`（兩個 WalletDepositModal）。另有數檔未指定（用套件預設）：EventRuleCreate、EmployeeManagementDetail、CustomerFilterExport、TopUp ×2、AttendanceRecords、OrderCreate/Head、DraftOrderEdit/Head、四個 MemberShipCardSells。

`localeText.toolbarTitle` 各檔文字不同（`選擇日期`、`選擇生日`、`預設起始時間`、`起始時間`、`進貨日期` …），同樣逐檔保留。全域 `LocalizationProvider`（`App.js`）另設 `cancelButtonLabel: '取消'`、`okButtonLabel: '確認'`，新元件不得移除。

## 四、結論（請先讀）

### 1. 民國年：現況沒有對應實作

- **全數 picker 顯示皆為西元 `yyyy`**；全 repo 的 picker `format`／`toolbarFormat` 字串**沒有任何民國年**（`yyy`）或「年 − 1911」的寫法（`rg -i '1911|\byyy\b' src` 無任何日期格式命中）。
- 因此先前拍版文字「必須保留民國年」在 **picker 範圍內沒有對應實作可保留**。
- 全 repo 唯一的民國年是**非 picker** 的生日輸入：以 `label="民國年"` ＋「月」＋「日」三個 `TextField` 組成（`components/SearchBar/SearchV2.js`、`views/CustomerCreate/AboutCustomer.js`、`views/CustomerManagementDetails/General/CustomerEditModal.js`、`OrderCreate`／`OrderEdit`／`DraftOrderEdit`／`QueueOrderEdit` 的 `AddCustomerModal.js`，共 7 檔）。它們不在本專項範圍，但若 Jason 想的是這一類，請另指定。
- **若要把 picker 改成民國年顯示，屬於顯示格式變更**，須 Jason 指定範圍與欄位（哪些頁、顯示或輸入或兩者、年份前綴「民國」或「中華民國」、是否影響列印與匯出）。**拍板前本專項維持西元顯示，不擅自改。**

### 2. 存值：onChange 回傳 Date，各頁自行轉

- picker 的 `onChange` 收到 **`Date` 物件或 `null`**（輸入未完成／無效時可能是 `Invalid Date`）。
- 各頁 handler 自行轉成存值：多數 `new Date(value).getTime()`（毫秒時間戳）；少數直接存 Date（`GeneralAccountingRecordCreate`／`Detail` 的 `setDate(e)`）；`value` 傳入的也可能是時間戳、`null` 或 `""`（Profile）。
- **新元件必須原樣回傳 `Date`／`null`，不得改成字串或時間戳**，也不得自行加 `getTime()`，否則上下游約 60 處（含 `MerchantSearchBar`／`DateSelector` 的引用端）會壞。`value` 也要原樣接受時間戳、Date、`null`、`""`。
- 各頁既有的防呆照舊：`Reservation/Basic` 自己擋 `null`／`Invalid Date`、`AttendanceRecords` 判斷 `'Invalid Date'`、`EmployeePickingCreate` 的 `onError`＋`helperText`、`MemberShipCardSells` 的 `onError`＋`minDate`／`maxDate`、`disableFuture`、`maxDateTime`。

### 3. 鍵盤打字：照現況保留，不新增也不移除

- 先前要求「鍵盤打字必須保留（`yyyy/MM/dd`，含時間者 `HH:mm`），不得只有點選」——**現況並非所有欄位都能打字**（見第一節末）：
  - **能打字**：19 個 `DatePicker`／`DateTimePicker`（桌機 fine pointer 時；觸控裝置自動變唯讀彈層）。
  - **本來就只能點選**：26 個 `Mobile*`，其中 11 個用自訂 `slots.field`（沒有 `onChange`）。
- **規則：逐檔保留現況**。能打字的，新元件必須仍可打 `yyyy/MM/dd`（含時間者 `yyyy/MM/dd HH:mm`）；原本只能點選的，不因換元件變成可打字（避免引入未驗證的新輸入路徑），除非 Jason 另行要求。
- 無效輸入維持各頁既有的 `onError`／擋法，不統一、不新增驗證。

## 五、原生 `type="date"`（另列一類，不併入第一階段）

| 檔案 | 備註 |
|---|---|
| `components/MerchantSearchBar/Requirement.js` | 原生 `<input type="date">` |
| `views/SystemUpdateRecordCreate/General.js` | 同上 |
| `views/SystemUpdateRecordEdit/General.js` | 同上 |

原生控制項的顯示格式與 locale 由瀏覽器／作業系統決定（不是 `yyyy/MM/dd`），值是 `yyyy-MM-dd` 字串，與 picker 的 `Date` 存值不同；換成 `ui/date-picker` 會同時改顯示、存值與行為，**另議，不併入本專項第一階段**。

## 六、`ui/date-picker` 設計方向

**檔案**：`src/ui/date-picker.js`（第 2 批已建立）。

**第一階段＝外觀門面（facade）**

- 內部**仍用 `@mui/x-date-pickers` 6.19.4** 的元件，以及既有的 `LocalizationProvider`（`App.js`）與橋接主題（`src/ui/mui-theme`，已有 `MuiPickersDay` 等覆寫）。
- 只改外觀：標籤改成 `Field` 上方標籤；輸入框套 `ui/input` 的視覺規格（STYLE §6：高 36px、`rounded-md`、1px `border-strong`、focus 2px `accent`、錯誤 `danger`）。
- **props 全相容並透傳**：`label`／`value`／`onChange`／`format`／`minDate`／`maxDate`／`minDateTime`／`maxDateTime`／`disabled`／`readOnly`／`closeOnSelect`／`openTo`／`views`／`disableFuture`／`onError`／`inputRef`／`localeText`／`slotProps`／`slots`（含 `slots.field` 自訂欄位）／`showToolbar`／`orientation`／`css`／`sx`。元件種類（Mobile／Desktop／Date／DateTime）由呼叫端決定或以 prop 選擇，不在門面內偷偷改變（否則等於改變可否打字）。
- 彈層（Popper／Dialog）在 MUI Portal 內，門面要自帶 `ui-root`（見 CLAUDE.md 踩雷），並實機確認被 MUI Dialog／Modal 包住時不被擋（`pointer-events`、focus trap、z-index）。

**為何不一次全自寫月曆**：格線、鍵盤解析（分段輸入）、時間選擇、月／年切換、無障礙、locale（zh-TW 週起始與月名）、`minDate`／`maxDate` 與 `onError` 協定，都要重做並重測；而且會碰到存值（Date／null／Invalid Date）與訂單頁的焦點鏈（`inputRef`、`autoFocus`、`onKeyDown` 跳欄），風險與測試成本過高。門面作法**可逐檔驗證、可回退**（換一檔、驗一檔，出問題改回 `@mui/x-date-pickers` 的原寫法即可）。

**彈層主題（日曆 B 批，2026/10/19，v3.0-1019-1030 暫定）**

- 改動集中在 `src/ui/mui-theme.js` 的 `MuiPickers*` 覆寫，只動 `styleOverrides` 視覺值，不碰選取行為、format、回傳型別。
- 新增／補強：`MuiPickersPopper.paper`（圓角 12、1px `border`、浮層陰影、`background`）；`MuiPickersDay`（13 字級、hover `surfaceHover`、選中 accent 底白字＋600、disabled `textTertiary`）；`MuiPickersCalendarHeader`（月份標籤 14/600、`text` 色、切換檢視鈕 hover）；`MuiPickersArrowSwitcher`（箭頭鈕 hover）；`MuiPickersYear.yearButton`／`MuiPickersMonth.monthButton`（圓角 8、hover、選中 accent）；`MuiDigitalClock.item`／`MuiMultiSectionDigitalClockSection.item`（14 字級、圓角 8、hover、選中 accent）。元件名稱已對照 `node_modules/@mui/x-date-pickers` 6.19.4 的 `themeAugmentation/overrides.d.ts` 與各元件 `styled` 的 `name`／`slot`。手機 Dialog 版沿用既有 `MuiPickersLayout`／`MuiPickersToolbar`（主題藍底白字）與 `MuiDialog` paper 覆寫，本批未另改。
- 影響範圍：所有包在 `MuiScope` 內的 picker（facade 與既有共用元件）；未包 `MuiScope` 的舊頁面仍用舊主題，逐頁換 facade 後才套用。
- **待實機**：深色模式、手機 Dialog 版、年選擇（`openTo='year'`）、時間選擇（DateTime）。

**頂欄主題化（2026/10/19，Jason 拍版「改的跟主題符合」，v3.0-1019-1350）**

- 只改 `src/ui/mui-theme.js`：`MuiPickersToolbar.root` 由主題藍底白字改為 `background` 底、`text` 字色、底部 1px `border`；新增 `MuiPickersToolbarText`（未選 `textSecondary`／選取 `text`）與 `MuiPickersToolbarButton`（`inherit` 色、hover `surfaceHover`）；`src/ui/date-picker.js` 只補檔首註解。選取日／今天／hover／年月時間選取／Dialog 確認鈕維持既有 accent 小面積點綴。
- 不改選取行為、format、回傳 `Date`／`null`、可否打字現況；桌面 Popper 與手機 Dialog 共用同一橋接主題（Portal 仍走 React context 的 MuiScope 主題）。
- 影響範圍：包在 `MuiScope` 內的 picker——含 Dashboard／Customer／Auth 版面、facade、`DateSelector`、`MerchantSearchBar`；未包 `MuiScope` 且自帶舊 `ThemeProvider` 的孤立元件不在本批保證內，不宣稱全站每一處皆已套用。
- **待實機抽查**：消費分析、每日業績、互助點數明細（手機 Dialog 頂欄白底／淺色、深色模式、DateTime 時間欄）。

**第二階段（全自寫）**：待第一階段全數換完，並實機驗證鍵盤輸入與各情境後再評估，不預先承諾。

## 七、分批計畫

| 批 | 範圍 | 說明 |
|---|---|---|
| 1（本批） | 盤點＋設計文件 | 只有文件，未換元件 |
| 2（試行，**已做**） | `MemberCreate/index.js`、`Profile/General/GeneralSettings.js` | 各只有 1 個 `yyyy/MM/dd` DatePicker、toolbarFormat `yyyy年M月d日`、無列印、無 Modal 焦點鏈、無自訂 `slots`。**注意**：兩檔都有 `openTo='year'`，Profile 另有 `orientation='portrait'`、`value` 為 `null` 時傳 `""`、`handleBirthday`；MemberCreate 的 `handleFieldChange` 與其他欄位共用——換時 handler 與值型別一概不動。**已做（v3.0-1019-0958 暫定）**：建立 `src/ui/date-picker.js`（匯出 `DatePicker`／`MobileDatePicker`／`DateTimePicker`／`MobileDateTimePicker`），並換上述 2 檔。facade 作法：①內部仍是 x-date-pickers 6.19.4 同名元件，整個包在 `MuiScope`；②不取代 MUI 的 field（桌機版為分段鍵盤輸入，自寫 input 會破壞打字）；③新增 `label`／`required`／`fieldClassName`，`label` 不傳給 MUI，改用 `ui/input` 的 `Field` 放欄位上方，無 label 時直接渲染 picker；④`slotProps` 透傳並合併，只有 `textField` 被強制 `variant:'outlined'`（呼叫端傳的 variant 以 outlined 覆蓋；`textField` 是函式時先呼叫再合併），其餘 `fullWidth`／`helperText`／`onKeyDown` 等照舊；`slots`（含自訂 `slots.field`）與其他 props 一律 `...props` 原樣傳給 MUI；⑤存值原樣（Date／null），不轉型。**決定：textField 統一 outlined。** `MemberCreate` 本來就是 outlined，外層重複的 `Field label="生日"` 改為 facade 的 `label`；`Profile` 原為 `variant:'standard'`，統一成 outlined 是本批預期的視覺改變（`styles.datePicker` 的 `& input.MuiInput-input` 規則在 outlined 下不命中，無害，保留未動）。待實機：生日欄鍵盤打字、`openTo='year'` 選年、彈層、手機 |
| 3 | 一般表單頁：MobileDatePicker 群（B 組）＋DatePicker 群（C 組）；先無焦點鏈者（BonusRecord、ProductRestock、MainEvent、EventRule、CustomerSelfCreate、EmployeeManagementDetail、Reservation、CustomerFilterExport），再有焦點鏈者（AccountingRecord ×2、GeneralAccountingRecord ×2、EmployeePicking ×2） | 自訂 `slots.field` 的 11 個要特別處理（門面需支援自訂欄位或明確取代並保留 `onClick`／`onKeyDown` 焦點鏈） |
| 4 | 篩選／共用元件：`DateSelector`、`MerchantSearchBar/DatePicker.js` | 牽動 9 個報表頁與約 60 處引用，**另批、謹慎**，逐一驗報表查詢仍可選日、區間邏輯不變。**進度（2026/10/19）**：`DecreaseDetail` 已透過 `uiDateField` 逐頁 opt-in 提前處理（共用層預設不變、其餘引用未動）；其餘引用的預設換法與是否移除 opt-in 旗標，**仍排獨立一批** |
| 5 | DateTime 群：TopUp ×2、AttendanceRecords | `HH:mm` 時間選擇與 `maxDateTime` |
| 6（C 批，最後） | 訂單三頁 Head（OrderCreate／OrderEdit／QueueOrderEdit／DraftOrderEdit）、四個 MemberShipCardSells、兩個 WalletDepositModal | 含 `inputRef` 焦點鏈、`minDate`／`maxDate`、`onError`、Modal 內彈層；與打帳單 `Header.js` 的 `valid` 連動，最後做 |
| 另議 | 原生 `type="date"` 3 檔 | 見第五節 |
| 另議（待 Jason） | 民國年顯示 | 見第四節 1 |

每批照 CLAUDE.md 流程：`verify-logic` FAIL 逐項說明為純畫面差異、eslint 0 新增 error、build 成功、測試全數通過。

## 八、待實機清單

1. **民國年／西元年顯示確認**：實機各頁確認目前皆為西元；請 Jason 確認是否需要民國年顯示、範圍與欄位。
2. **鍵盤打字輸入與無效值**：桌機 `DatePicker`／`DateTimePicker` 打 `yyyy/MM/dd`（含時間 `yyyy/MM/dd HH:mm`）；打到一半、超出 `minDate`／`maxDate`、`disableFuture` 時的 `onError`／`helperText`／頁面擋法是否維持。
3. **月曆彈層在 MUI Dialog／Modal 內是否被擋**：`WalletDepositModal` ×2、`ChoseEvent` ×2、補打卡等（`pointer-events`、focus trap、z-index、`ui-root` 重置）。
4. **手機版面**：`Mobile*` 彈層（全螢幕 Dialog）、`DatePicker` 在觸控裝置自動切 Mobile 版、`orientation='portrait'`、`openTo='year'` 選年份是否好操作。
5. **焦點鏈**：Enter 跳欄（AccountingRecord、GeneralAccountingRecord、EmployeePickingEdit、MemberShipCardSells）換外觀後仍可跳。
6. **自訂 `slots.field` 欄位**：`DateSelector` 的 `<button>`、`MerchantSearchBar` 的 `Button`、各表單的 `Input type='text'`（只有 `onClick`）外觀換新後仍能點開、`disabled`／`readOnly` 樣式。
7. **列印／匯出**：本專項不碰列印範本，但確認含日期欄的頁面列印預覽沒有受影響。
