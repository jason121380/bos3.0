# 第二層遷移指南：把頁面中的相容元件換成 `src/ui/`

> 給執行改版的工程師（含 AI 代理）。規範以根目錄 `STYLE.md` 為準。
> 參考範例 commit：`27de2d2`（帳單列表，完整替換）、`a718658`（打帳單，大型頁結構替換）、`66f5d92`（報表目錄）。
> **下文批次是歷史／已過時。** 版號、測試總數、CI、健康分、後端債只看 [`docs/CURRENT.md`](../CURRENT.md)（健康分程式 `v3.10241717`，CI 為 `frontend-ci.yml`）。不要假設 Actions 已停用。
> **2026/10/23 快照**：`package.json` 已無 MUI 套件。最後一批完成後，相容元件頁面使用檔案 2 → 0，日期選擇器內部亦不再引用 modal／overlay-compat；歷史批次與列印證據保留於下文。日期時間沿用 `lib/business-timezone.js`，不得自行加時區換算。下文未標為歷史的「MUI 元件」是遷移當時的叫法，不可重新安裝或引入 `@mui/*`。

> 正式站僅供唯讀查看；寫入、送出及列印測試只用 mock／隔離測試資料。刪檔先經 Jason 同意。

## 0. 鐵則（違反任何一條，該頁不得 commit）

1. **只改畫面**：JSX 結構、樣式、import。**不得**修改任何 state、hooks、handler、useEffect、GraphQL query/mutation、Redux、驗證、權限、金額或日期運算、路由跳轉、localStorage／cookie。
2. **不得修改指派範圍以外的檔案**。特別是 `src/ui/`、`src/components/`、`src/layouts/`、`src/theme/`、`src/hooks/`、`package.json`、`scripts/`。缺元件就在回報中提出，不要自己加。
3. **列印範本不動**：`id="printMain"`、`id="printThermal"`、任何會被 `innerHTML` 複製到列印視窗的區塊、`className` 含 `forPrint` / `print` 的元素，一律原封保留（包含 inline style 與相容元件）。
4. **保留所有 `data-testid`、`id`、`name`、`ref`、`key`、`aria-*`**。
5. **不自行安裝套件**。第 4 節是局部檢查；合併前仍須在本機完成 `npm run lint`、`npm run test:nowatch`、`npm run build`。CI 是否在跑見 [`docs/CURRENT.md`](../CURRENT.md)，不要假設 Actions 已停用。
6. 文案維持原樣；只允許移除純裝飾的英文 overline。

## 1. 可用元件（`src/ui/`，import 路徑以 `ui/xxx` 開頭）

| 檔案 | 匯出 | 備註 |
|---|---|---|
| `ui/button` | `Button` | `variant`: primary（主題藍，每頁最多一個）/ secondary（淺灰實心）/ ghost / danger；`size`: sm / md / lg / icon；`asChild` 可包 `RouterLink` |
| `ui/input` | `Input`, `Textarea`, `Label`, `Field` | `Field label required hint error htmlFor`；`Input invalid` |
| `ui/select` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel` | Radix：`value` 必須是**非空字串**，用 `onValueChange(v)`。舊值若為數字／物件／可為空字串，**保留既有 Select 相容元件** |
| `ui/table` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TablePagination` | `TableHead/TableCell numeric` 右對齊＋等寬數字；`TablePagination` 與 MUI 同名 props（`count page rowsPerPage onPageChange(e, p) rowsPerPageOptions onRowsPerPageChange(e)`） |
| `ui/card` | `Card`, `CardHeader`（`action` prop 放右側按鈕）, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | 取代 MUI Card / Paper |
| `ui/page-header` | `PageHeader`（`title description actions`）, `Toolbar`, `ToolbarSpacer` | 頁首。`AdminPageHeader`、`PageTitle` 已於 2026/10/28 刪除，一律用 `PageHeader`（報表頁加同檔的 `ReportToolbar`） |
| `ui/dialog` | `Dialog`(`open onOpenChange`), `DialogContent`(`size` sm/md/lg), `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`, `DialogClose` | `onClose={fn}` → `onOpenChange={o => !o && fn()}`。**共用圖層（MEMORY #195）**：可包含正式／相容日期、Autocomplete、Select、Popover，亦可與 compat Dialog 雙向堆疊；焦點／指標使用 Radix 共用圖層，`ui/layer-stack` 管理視覺順序並同步交接 Esc。原無 `onClose` 者維持不傳 `onOpenChange`＋`hideClose`；有 `onClose` 者映射，沒有舊關閉鈕則加 `hideClose`。保持 `onOpenAutoFocus`／外部事件的 preventDefault。不要自行改成 `modal={false}` |
| `ui/tabs` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | 值必須是字串；舊值為數字或 handler 用到 event 時，保留既有 Tabs 相容元件 |
| `ui/badge` | `Badge`（`variant`: neutral / success / warning / danger / accent） | 取代不可點的 Chip、狀態文字 |
| `ui/checkbox` | `Checkbox`（原生，支援 `indeterminate`） | 表格勾選；`onChange` 簽名與原生相同 |
| `ui/skeleton` | `Skeleton` | 取代 CircularProgress / LinearProgress 的整區載入 |
| `ui/empty-state` | `EmptyState`（`title description action icon`） | 無資料畫面 |
| `ui/dropdown-menu` | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`(`onSelect`, `danger`), `DropdownMenuSeparator` | 取代 MUI Menu（簡單選單） |
| `ui/popover` | `Popover`, `PopoverTrigger`, `PopoverAnchor`, `PopoverContent` | |
| `ui/format` | `formatNumber`, `formatMoney` | 數字顯示加千分位：`{formatNumber(原運算式)}`，原運算式一字不改 |
| `ui/icons` | 與 `@mui/icons-material` 同名 | 已全站替換；新寫的圖示直接用 `lucide-react`（`strokeWidth={1.75}`） |
| `ui/utils` | `cn`, `focusRing` | |

## 2. 替換對照

| MUI | 換成 | 注意 |
|---|---|---|
| `Container`, `Grid`, `Box`（排版用） | `div` + Tailwind（`flex`、`grid grid-cols-*`、`gap-*`） | 頁面外距由 `#printContainer` 提供，**頁面根元素不要再加 padding**；`<Page className="ui-root" title=…>` |
| `Card`, `CardHeader`, `CardContent`, `CardActions`, `Paper` | `ui/card` | |
| `Typography` | `h2`/`p`/`span` + 字級 class | 頁面標題 `text-title`（每頁一個，`h1` 需加 `!font-bold`）、區塊 `text-heading`、內文 `text-body`、欄名 `text-label`、說明 `text-caption text-text-secondary` |
| `Button`, `IconButton` | `ui/button` | `component={RouterLink} to=…` → `<Button asChild><RouterLink to=…>…</RouterLink></Button>`；`IconButton` → `size="icon"` 並加 `aria-label` |
| `Table*`, `TablePagination` | `ui/table` | 數字欄加 `numeric` |
| `Divider` | `<div className="h-px bg-border" />` | |
| `Chip`（僅顯示） | `ui/badge` | 可刪除的選取值用 `ui/tag`；見項目 4 |
| `Collapse in={x}` | `{x && (…)}` | 若內容有 ref / 需要保留 state，保留 MUI Collapse |
| `CircularProgress`（按鈕內） | `<LoaderCircle className="animate-spin" />`（lucide） | |
| `Checkbox`（表格勾選） | `ui/checkbox` | 表單內配 `FormControlLabel` 的可保留既有相容元件 |
| `Dialog*`（簡單確認框） | `ui/dialog` | 見上表限制；危險操作確認框按鈕用 `variant="danger"`，說明寫出後果 |

### 歷史：當時可保留既有相容元件（橋接主題已套新外觀）

`TextField`（有 `select`、`InputProps` adornment、`helperText` 邏輯者）、`Autocomplete`、所有日期／時間選擇器、`Switch`、`Radio`/`RadioGroup`、`FormControlLabel`、`Slider`、`Tooltip`、`Menu`（複雜者）、`Drawer`、`TreeView`、`Stepper`、含上述元件的 `Dialog`。
簡單的 `TextField`（只有 `value onChange label placeholder type disabled error helperText`）請換成 `Field` + `Input`；`onChange` 一律原樣沿用（原生 event 與 MUI 相同）。

## 3. 大型頁面（> 2,500 行）

比照打帳單（`a718658`）：先換頁首、外框、卡片、按鈕、表格、區塊標題；深層的表單細節保留 MUI。寧可少換，不可改壞。

## 4. 每頁的檢查（全部通過才 commit）

```bash
# 1) 邏輯保留：舊檔每段非 JSX 程式、每個事件/資料屬性在新檔都必須還在
node scripts/redesign/verify-logic.js <改到的檔案…>
# 2) 靜態檢查：未宣告元件、import 名稱錯誤、無法解析的路徑
npx eslint --quiet --no-eslintrc -c scripts/redesign/eslint-check.json <改到的檔案…>
```

- `verify-logic` 的 FAIL 項目只允許是**純畫面**的差異（例如移除 Grid 欄寬、把 `Collapse in={x}` 改成 `{x && …}`、`onClose={fn}` 變成 `onOpenChange={o => !o && fn()}` 這類被判定為外層包裝的情況工具會自動通過）。每一條保留的 FAIL 都要寫進 commit 說明的「已審視的差異」，並說明為何不影響行為。若無法說明，就回復該處修改。
- 文字遺失的警告：確認是刻意移除的裝飾（如英文 overline），否則補回。

## 5. Commit（一頁一個 commit）

```
feat(ui): 第二層改版——<頁面中文名>（<views 目錄名>）

改了哪些
- …（換了哪些元件）

未變更的邏輯
- verify-logic 通過（或：除下列已審視差異外通過）
- eslint-check 0 error
- 未動 API、Redux、hooks、驗證、權限、金額計算、列印範本

已審視的差異（如有）
- <FAIL 原文>：<為何是純畫面>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BUenXFDZo7NpQzri398TMd
```

---

# 第二輪：換掉剩下的 MUI（基準 commit：見各批次檔）

第一輪為了保住邏輯而留下的 MUI，多數是因為缺元件。這些元件現在都有了，第二輪就是把這些 MUI 換掉。**第 0 節鐵則全部照舊。**

## 6. 新元件與替換方式

| MUI | 換成 | 規則 |
|---|---|---|
| `FormControl` + `InputLabel` + `Select` + `MenuItem`（單選） | `ui/native-select` 的 `NativeSelect` + `NativeSelectOption` | `value`、`onChange`、`name`、`disabled`、`error`、`required` 原樣搬過去；InputLabel 的文字放 `label`；`MenuItem value={x}` → `NativeSelectOption value={x}`（值型別不變）。`onChange(event)` 與 MUI 相同，`event.target.value` 是原始值。**以下保留 MUI**：`multiple`、`renderValue`、`MenuProps`、handler 用到第二個參數（child）、用 `inputRef` / `inputProps.ref` 註冊（react-hook-form）、MenuItem 內含圖示 / Checkbox 等非純文字內容 |
| `TextField select` | 同上 | 只在沒有 `helperText` 邏輯、`InputProps` adornment、`inputRef` 時才換 |
| `ToggleButtonGroup` + `ToggleButton` | `ui/toggle-group` 的 `ToggleGroup` + `ToggleGroupItem` | `value`、`exclusive`、`onChange(event, newValue)`、`disabled` 原樣；`size="small"` 可保留；`color`、`orientation` 刪除。handler 一字不改 |
| 單獨的 `ToggleButton selected onChange`、用 secondary Button 拼出來的篩選鈕 | `ToggleGroupItem selected onChange` | 外觀為篩選鈕（選取時主題色） |
| `FormControlLabel control={<Checkbox …/>} label=…` | `ui/checkbox` 的 `CheckboxField label=… checked onChange` | `onChange(event, checked)` 與 MUI 相同；`name`、`value`、`disabled`、`inputProps` 內的 `data-testid` 改放到 CheckboxField 上（會傳給 input） |
| `Switch`、`FormControlLabel control={<Switch/>}` | `ui/switch` 的 `Switch`（可加 `label`、`labelPlacement`） | `onChange(event, checked)` 與 MUI 相同 |
| `Avatar` | `ui/avatar` | `src`、`alt`、children 原樣；`sx` 尺寸改 `size` sm / md / lg 或 className |
| MUI `TablePagination` | `ui/table` 的 `TablePagination` | 現在支援 `ref`、`labelRowsPerPage`、`{ value, label }` 選項；原本的 `ref={pageRef}` 與 `pagenationLabel` effect 原樣保留（找不到 MUI 元素時不動作） |
| 統計格（標題＋數值）、單一大數字卡片 | `ui/stat` 的 `StatGrid` + `Stat`、`StatCard` | 數值運算式一字不改，可包 `formatNumber` |
| `components/ManagementTable` 的內容列 | 可直接放 `ui/table` 的 `TableBody` / `TableRow` / `TableCell`，`tableHead` 放 `TableHead` | ManagementTable 已改版，不需要再在頁內展開 |
| 密集表格 | `<Table dense>` | 列高 32px |
| 第一輪留下的 `Card` / `Typography` / `Grid` / `Button` / `IconButton` / `Divider` / `CircularProgress` / `Collapse` / `Paper` / `Container` | 依第 2 節對照表 | 第一輪因為「大型頁只換結構」而留下的，這一輪可以繼續往深層換，但仍以「寧可少換」為原則 |

## 7. 歷史：第二輪仍然保留 MUI 的情況

- **列印**：第 0 節第 3 條，加上 **`src/initialize.scss` 的 `@media print` 規則選取到的元素**。改任何區塊前，先用 `grep -n "<該區塊的 className>" src/initialize.scss` 檢查；列印規則若寫在 `.MuiCard-root`、`.MuiTableContainer-root`、`.MuiTableCell-root`、`.MuiGrid-item`、`.MuiContainer-root`、`.MuiPaper-root`、`.MuiCardHeader-root`、`.MuiCardContent-root` 底下，且該頁會 `window.print()`，該頁的這些元件**整段保留**。
- `TextField`（有 `helperText` 邏輯、adornment、`inputRef`、`onWheel` 等）、`Autocomplete`、日期／時間選擇器、`Radio`、`Slider`、`Tooltip`、`Drawer`、`Tabs`（handler 用 event）、`Accordion`、含上述元件的 `Dialog` / `Modal`、`Menu`（複雜）。
- 打帳單／帳單編輯類頁面（OrderCreate、OrderEdit、DraftOrderEdit、QueueOrderEdit）：**只換第 6 節的表單元件（Select、ToggleButton、Checkbox、Switch）與純裝飾的 Typography / Divider**，不動排版結構。金額、折扣、付款相關的欄位若 handler 讀 `event.target.value` 後直接計算，替換前確認 NativeSelect 回傳的型別與原本相同（相同就可換）。

## 8. 第二輪的檢查與 commit

與第 4、5 節相同。commit 標題改為：`feat(ui): 第二輪——<頁面中文名>（<views 目錄名>）`。

### Dialog 共用圖層 Part A（2026/10/23）

`ui/dialog`、正式 Popover／Select／DropdownMenu 與相容 Modal／Popper 共用 Radix 行為堆疊。相容層以獨立行為節點登記，內容保持原 DOM，避免 keepMounted／Fade 在開關時重掛載。`layer-stack` 管理視覺順序與較晚圖層的外部事件防護；不可用全域 Branch 包住整個舊視窗，否則上層浮層點回下層不會關閉。相容層的實際 pointer-events 跟隨 Radix 行為節點，不能固定 auto 繞過上層 modal。

本批遷移七檔：`elements/snackbars`、`components/PasswordDialog`、`OrderShared/ReCheckoutPasswordDialog`、`OrderShared/WalletDepositModal`、`DesignerPerforamnceAnalyzeReport/CompareFilter`、`Products/VendorDialog`、`Products/PublishedDialog`。不新增關閉路徑，不改 handlers／後端值；舊有 500／900px 特例保留並註解。PasswordDialog 原無 onClose，因此 Esc／背景仍不關閉。

離線真瀏覽器 harness（不安裝瀏覽器、不連後端）：

```bash
ESBUILD=$PWD/node_modules/esbuild node scripts/redesign/compat-harness/build.js scripts/redesign/compat-harness/e2e/dialog-layers-entry.js /tmp/dialog-layers-harness
printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > /tmp/dialog-layers-tailwind.css
node_modules/.bin/tailwindcss -i /tmp/dialog-layers-tailwind.css -o /tmp/dialog-layers-harness/tailwind.css --minify
NODE_PATH=/home/box/.npm/_npx/e41f203b7505f1fb/node_modules node scripts/redesign/compat-harness/e2e/dialog-layers-run.js /tmp/dialog-layers-harness
```

腳本使用 `/usr/bin/google-chrome`，DNS 規則為 `MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1`；route 僅提供本機靜態內容。此 sandbox 無法啟動 Chrome；已透過 Jason 提供的外部 runner 反覆實跑，十一個情境連續兩輪全數通過（原九種＋真實 PasswordDialog 巢狀重開＋compat → ui/dialog → 桌機／手機日期）。驗證包含原觸發鈕焦點還原、keepMounted 輸入保留，以及全部關閉後 pointer-events／捲動鎖／overflow 解除。Jest 不能代替這些瀏覽器驗收。

**瀏覽器回歸的必要修正**：Radix 的 passive effect 在 combobox 重開時可能尚未交接 Esc；共享登記改以 ref 同步判斷頂層，Dialog 只處理自己擁有的 Esc。Select 關閉後會把內容保存在 DocumentFragment、ref 未必清除，須以公開 open 狀態解除登記；closed／離線節點不擁有鍵盤。Dialog 必須在 Root 開啟轉換、Portal 掛載前記錄觸發焦點，不能等第二次 FocusScope autofocus 才讀 activeElement（當時可能已是 body）。keepMounted Popper 在 Scope 清理後才失焦，還原須等下層 Scope 恢復後執行，且不搶走已移到其他欄位的焦點。

**Harness 修正理由**：Select／Popover／Dropdown 與外層視窗必須等待退場節點真正卸載再送下一次 Esc，不能用固定 150ms 推測動畫完成。Toaster 位於被 aria-hidden 隱藏的應用程式根節點，getByRole 查不到既有 alert；改用 CSS role 定位，仍檢查可見性與 elementFromPoint 的實際命中。新增手機日期欄位使用明確 id 定位，避免把 facade 顯示標籤誤當輸入框的 aria-label。

Part B 共 17 個頁面／共用 importers；B1 已完成 9 檔，B2 完成 7 檔，列印檔 1 檔保留：

| 檔案（`src/` 下，省略 `.js`） | 類型與風險 |
|---|---|
| `components/FastCheckOrdersModal` | **B2 完成**；Dialog；DateSelector／人員搜尋、xl 寬與 sticky 表格 |
| `views/AttendanceRecords/index` | **B2 完成**；Dialog；日期時間／搜尋、原 onClose、hidden 篩選狀態 |
| `views/CustomerFilterExport/index` | **B2 完成**；Dialog；多日期／Select、響應式 fullScreen |
| `views/EmployeeManagementList/ProfileImportModal` | **B1 完成**；Dialog → `ui/dialog`；Select，無 onClose |
| `views/Parameter/OuterLinkModal` | **B1 完成**；Dialog → `ui/dialog`；搜尋、MuiDialog 後代樣式掛點，無 onClose |
| `views/CustomerManagementDetails/General/CustomerInfo` | **B2 完成**；Dialog；ChoseEvent 的日期／搜尋／Select 與另一個編輯窗 |
| `views/ManagementReservationRecord/OrderTable` | **B2 完成**；Dialog；ChoseEvent 與 PasswordDialog，須父子聯測 |
| `views/ManagementDesignersReservationRecord/OrderTable` | **B2 完成**；Dialog；NewChoseEvent／PasswordDialog／公休窗共存 |
| `views/CustomerManagementDetails/General/CustomerEditModal` | **B2 完成**；Modal；Select、表單 refs／驗證、原 onClose |
| `views/OrderCreate/AddCustomerModal` | **B1 完成**；Modal → `ui/dialog`；搜尋／Select、refs／鍵盤跳欄，無 onClose |
| `views/OrderEdit/AddCustomerModal` | **B1 完成**；Modal → `ui/dialog`；日期／Select、既有顧客資料，無 onClose |
| `views/DraftOrderEdit/AddCustomerModal` | **B1 完成**；Modal → `ui/dialog`；日期／Select，測試已改 role=dialog，無 onClose |
| `views/QueueOrderEdit/AddCustomerModal` | **B1 完成**；Modal → `ui/dialog`；Select，測試已改 role=dialog，無 onClose |
| `views/EmployeeSchedule/AddDesignersModal` | **B1 完成**；Modal → `ui/dialog`；人員搜尋，無 onClose |
| `views/Services/AboutDeductionEditModal` | **B1 完成**；Modal → `ui/dialog`；Select／抽成數值，無 onClose |
| `views/Services/AssistantSettingEditModal` | **B1 完成**；Modal → `ui/dialog`；Select／助理抽成數值，無 onClose |
| `views/OrderCreate/OrderDetailModal` | **項目 3 第三批完成**；Dialog；列印 refs 與動畫外殼分開，無 onOpenChange，詳見第三批 |

另有 `ui/date-picker`、`ui/misc-compat`、`ui/overlay-compat` 三個內部使用者，與頁面遷移分開計數。

### Dialog 共用圖層 Part B1（2026/10/23）

上表 B1 九檔僅換 `ui/dialog` 外殼；無 `onOpenChange`＋`hideClose`，Esc／背景不關閉，原按鈕、表單 refs／Enter 跳欄與後端值不變。保留 700px（顧客）、500px（排班）、912px（服務設定）、600px（身份導入／外部連結）特例。開窗沿用舊 Modal 面板聚焦策略，已有欄位焦點時不搶走。正式 Dialog 手機採底部面板，長表單內容獨立捲動。

OuterLink 原 MuiDialog 後代樣式逐項移至 DialogContent／Header／Body／Footer：保留可見 overflow、標題 16px、內容 24／16px 內距及底部兩側對齊／換行／10px 間距；不留下失效的 MuiDialog 選擇器。B2、列印及 `src/ui` 不動。既有頁面測試只調整外殼選擇器；新增九檔 picker 選值與不關閉回歸，以及新增顧客 Enter 焦點鏈。

離線 harness 新增 `customer-form`（第十二種）：無 onOpenChange 的正式 Dialog 內含 combobox、相容原生 Select、日期；選值後保持開窗，picker Esc 只關 picker、面板 Esc／背景不關，取消後檢查指標與捲動鎖解除。

驗證：`CI=true` 指定八個頁面測試目錄＋`src/ui` 共 107 suites／1,352 tests；首輪 2 suites 的 5 個失敗皆為舊 Card／absolute 外殼定位，僅改 selector helper 後 Services（2 suites／23 tests）與 EmployeeSchedule（1 suite／27 tests）重跑全過。新增 picker 10 tests、網路封鎖 3 tests、版號 1 test 通過；`npm run lint` 通過。外部 Chrome 原 11 種＋customer-form 共 12/12 通過（exit 0）。未跑全站 suite，未連真實後端。

### Dialog 共用圖層 Part B2（2026/10/23）

七檔僅換外殼，沿用舊 Modal 開窗先聚焦面板（已有欄位焦點則保留），handlers／state／GraphQL／refs／驗證／後端值原樣保留；未修改 `src/ui`。FastCheckOrdersModal 保留 xl 1536px 與寬 sticky 表格；AttendanceRecords 保留 onClose 與 hidden 篩選掛載；CustomerFilterExport 保留 600px 與原 md 以下全高視窗；CustomerEditModal 保留 700px、表單 refs 與原 onClose；CustomerInfo 保留 600px、無 onOpenChange＋hideClose；兩個 OrderTable 保留 xs 444px、樣式掛點及原公休窗。正式 Dialog 採既有圓角／遮罩／退場動畫及手機底部面板；沒有新增 X 關閉路徑。

**OrderDetailModal 的 B2 延後原因與第三批完成補註（2026/10/23）**：B2 當時保留原檔，是因為舊 Modal 關閉立即卸載，而正式 Dialog 的 Portal 掛載及退場動畫會改變列印 refs 存活時間。`useOrderDetailCheckout` 先同步檢查兩個 ref（缺少回傳 `null dom`，F8 仍可重試），mutation 成功後才由 `printDiv()` 讀 innerHTML，500ms 後 closeModal。Jason 於項目 3 第三批核准處理收據後，已完成 `ui/dialog`／`ui/card` 遷移：兩塊隱藏收據放在動畫 Content 外，仍以 `ready && openOrderDetail` 同步掛載／卸載，不使用 forceMount。按鈕可操作前 refs 已掛上，成功回呼仍可讀，關閉同次 commit 即清 refs；Header 既有條件亦會卸載整個元件。保留 hideClose、無 onOpenChange、開窗聚焦面板及全部 checkout handlers；printDiv／document.write／hooks 均未改。完整 HTML fixture、瀏覽器流程與比較證據見下方「項目 3／第三批」。

頁面已無 modal-compat importer；內部仍有 ui/date-picker、ui/misc-compat、ui/overlay-compat，分開計數。B2 原驗證結果如下，第三批結果另列。

瀏覽器：離線 harness 新增 reservation（ui/dialog → ui/dialog＋combobox／日期 → 真實 PasswordDialog），外部 runner 13/13 通過（exit 0）。picker Esc 只關 picker；PasswordDialog 原無 onClose，Esc 不關任何父窗，取消後還原預約觸發鈕焦點，再按 Esc 才關預約窗。保留原 12 個情境及全部關閉後的捲動／指標鎖檢查。Jest 加強真實 OrderTable → ChoseEvent → PasswordDialog 的 Esc 隔離與取消返回，並新增真實查帳日期／人員搜尋及顧客 Select 回歸；不連真實後端，網路 guard 原樣保留。

驗證結果：`CI=true` 限定 touched 頁面＋src/ui＋src/components（含原 OrderCreate 列印測試）首輪 87 suites／1,145 tests，唯一失敗為未修改的 CustomerTracking 單項 20 秒逾時；獨立重跑 2 suites／10 tests 全過，沒有修改該檔或斷言。保留開窗聚焦行為後，相關六個頁面目錄與 B2 picker 最終重跑 16 suites／188 tests 全過；新增 picker 四項、真實預約父子流程皆通過。網路 guard／版號 2 suites／4 tests 全過；最終 `npm run lint` 與 `git diff --check` 通過。OrderDetailModal 與 HEAD 逐位元組相同（SHA-256：39eb7a8f3e5119c8fd6bc1710fd982dd4e7646ce08c1d389fe75d705871fd525）。合併前全站 `CI=true npm run test:nowatch` 單獨執行（未與 build 並行）371 suites／4,332 tests 全過；`npm run build` 通過；外部 Chrome 13/13 重跑通過。頁面 compat importer 35 → 29（CustomerFilterExport 仍用 misc-compat 的 useMediaQuery，非彈窗，留待後續）。


## 9. 項目 4：Tree／Rating／可刪除 Tag（2026/10/23）

本批可拆成兩個 PR，沒有修改或刪除 `tree-compat`／`misc-compat`，不動列印、GraphQL、state、搜尋與確認／取消 handlers，不連任何真實後端。

**Phase 1：新元件與離線 harness**

- `src/ui/tree.js`：`TreeView` 接受 `expanded`／`defaultExpanded`、`onToggle(event, ids)`、`selected`／`defaultSelected`、`onSelect(event, nodeId)`、`defaultExpandIcon`／`defaultCollapseIcon`；`TreeItem` 接受 `nodeId`、自訂 `label` 節點、個別 `selected`、`disabled`、`onClick`、`icon`／`expandIcon`／`collapseIcon`、`groupClassName`／`contentClassName`。`tree`／`treeitem`／`group`、`aria-expanded`／`aria-selected`、單一可見 Tab 入口；↑↓略過停用項目、←→收合／展開或移至父／子、Home／End、Enter／Space 走列 click。滑鼠回呼的 `currentTarget` 是列 div，方向鍵展開回呼為 treeitem li；兩者第一個 span 皆是原標籤，原 `handleNodeFocus` 不必改。收合卸載子層；重複出現在「全部」與分類的同一資料，DOM id／焦點以節點實例區分。未實作可選的 type-ahead。
- `src/ui/rating.js`：`value`／`defaultValue`、`onChange(event, number|null)`、`readOnly`／`disabled`、`size=small|medium|large`、`max`、`name`、`aria-label`；本批僅整數星等（接受舊 `precision={1}`，不提供半星）。radio 每星名稱「N 星」，方向鍵循環、Space 選取／清空、hover 預覽；點目前值只通知一次 null。唯讀不進 Tab 順序；未提供 name 時每個實例自動產生獨立群組名。
- `src/ui/tag.js`：`Tag` 接受 `label`、可選 `onDelete(event)`／`deleteLabel`；刪除為獨立具名 button，本體 Tab 聚焦後 Backspace／Delete 在 keyup 觸發；純顯示無 Tab 停點。複合 label 可另給 `deleteLabel`。
- 新增三個 `src/ui/__test__/{tree,rating,tag}.test.js` 與 `scripts/redesign/compat-harness/e2e/ui-components-{entry,run}.js`。建置／route／host resolver／Chrome 路徑完全沿用 dialog-layers；只供應本機靜態內容，不建立後端 client。情境為 tree-mouse、tree-keyboard、rating、tag；逐項印 PASS，失敗 exit 非零。樹的 Esc 不攔截，交給 Dialog；方向鍵不關閉 Dialog。

**Phase 2：使用端與回歸**

- 四個樹使用檔：`components/MerchantListAutocpmpleteForPinnedTable/MerchantsListModal`、`components/MerchantsListModal/index`（包含一般／管理兩個入口）、`components/ProductListTreeView/ProductListModal`、`views/Profile/PinnedTable`。只改 import、`onNodeToggle` → `onToggle`、群組排列 props、葉節點 `selected`；保留 `.onSelect`、標籤 span id 與全部 handler。根 `aria-multiselectable="true"` 宣告多選，`selected={null}` 避免把最後點過的群組當作業務選值高亮。移除所有 MuiTreeItem／MuiCollapse 後代覆寫。
- `views/CustomerRating/index` 只換 Rating import；原 handler 忽略 null，因此再點目前星仍保留目前提交值。`views/CustomerManagementDetails/CustomerTracking/TrackingEditModal` 只換 Tag 名稱／import，刪除索引與提交內容原樣。
- 測試只調整原英文星等 accessible name、標籤定位與搜尋框線 class；搜尋仍驗證正確項目加框／其他項目無框，不再以含 `outline` 字串判定（新元件有 `outline-none`）。新增一般／管理／釘選店家與商品的鍵盤展開→選取→確認、釘選儲存、星等鍵盤送出數字值、標籤滑鼠／Backspace 刪除後 GraphQL variables 回歸。

Phase 2 測試檔：`components/MerchantsListModal/__tests__/merchantLists.test.js`、新增 `treeMigration.test.js`、`components/ProductListTreeView/__tests__/ProductListTreeView.test.js`、`views/Profile/__tests__/Profile.pinnedTable.test.js`、`views/CustomerRating/__tests__/CustomerRating.page.test.js`、`views/CustomerManagementDetails/__tests__/CustomerTracking.test.js`。文件為本節、STATUS、TODO、STYLE；版號在 `src/version.js`。MEMORY 沒有新增通則，不修改。

視覺差異：列高 38px 提高至 40px；樹群組排列與 24／20px 縮排保留，MUI wrapper 移除。星形改 lucide 的 1.75 線寬與 warning token（不是舊固定金色），每星操作區至少 40px。可刪除 Tag 高度與刪除區為 40px，因此髮況多標籤欄位可能比舊 Chip 高；沿用淡底／字色／圓角。此為觸控目標規範帶來的預期差異。

限定 `CI=true` Jest **77 suites／882 tests 全過**（src/ui＋src/components＋Profile／CustomerRating／CustomerManagementDetails＋網路 guard），另版號 **1 test 通過**；`npm run lint`、`git diff --check` 與 production build 通過。Build 仍有既有帳單／Parameter 未修改檔案的重複鍵警告。外部 Chrome 最終 **ui-components 4/4、dialog-layers 13/13，exit 0**；ui-components 額外檢查選取底色 accent 12%，等待 transition 到達最終色再斷言。合併前全站 `CI=true npm run test:nowatch` 單獨執行（未與 build 並行）**375 suites／4,350 tests 全過**；之後 `npm run build` 通過。PinnedTable 補回原 `.Mui-expanded` 的 12px 群組列下距（改以 `aria-expanded` 選取）；ui-components 的 tree-mouse 同時等待底色與字色 transition 到終值（曾因字色仍在過渡而偶發失敗），連跑三輪 4/4。首輪限定 Jest 的未修改 itemAutocompletes 曾逾時並影響後續測試，獨立重跑 27/27，最終整輪重跑亦全過，沒有改該測試或放寬斷言。

邏輯檢查：原 verify-logic 因 sandbox 中 Node 啟動 git 受限而 SKIP；改由 shell 匯出 HEAD 快照，使用同一分析器在 /tmp 重跑。Rating／Tag 使用端 OK；四個樹檔的 FAIL 全部只有移除／替換的樣式常數（treeClass／ulGroup*／itemClass／outlineClass／spanClass／defaultTreeClasses／managementTreeClasses），沒有遺失 handler、資料敘述或事件／值運算式，已逐項審視。

compat importer 以 `rg "from 'ui/[a-z-]*-compat'" src` 排除 src/ui 與測試檔，29 → **23 檔**（檔案數，不是 import 行數）；保留者多為列印與 misc-compat 的 useMediaQuery。


## 項目 3：列印相依頁面移除相容層（Jason 2026/10/23）

本項目限定放寬 CLAUDE.md 規則 2：允許調整列印 CSS／`print:`，但每份報表必須使用 `scripts/redesign/compat-harness/e2e/print-compare.sh <repoTree> <outDir>` 比較修改前後。只改 JSX／樣式，保留資料、GraphQL、state、handlers、文字與測試掛點；不修改相容層本身。`src/ui` 沒有獨立 separator，使用原生 `hr` 與既有 border token。

### 第一批：8 檔、6 張報表與分析比較模式

| 檔案（`src/views/` 下） | 替換 | 列印差異 |
|---|---|---|
| `CostAnalysisReport/Results.js` | card-compat → ui/card；CardHeader title 改 children；明確保留表格灰線、表頭水平線及列印底部內距 0 | 無；cost |
| `CostAnalysisReport/index.js` | grid-compat → div；保留 printGrid 並明確 print:hidden | 無；cost |
| `IncomeStatementReport/Results.js` | card-compat → ui/card；保留列印表頭水平線、儲存格灰色底線及黑色直線 | 無；income |
| `DesignerPerforamnceAnalyzeReport/Compare.js` | card-compat → ui/card；保留 printLongCard 與原始內距、欄寬 | 無；compare |
| `DesignerPerforamnceAnalyzeReport/Results.js` | grid-compat → flex／div；card-compat → ui/card；明確保留卡片標題框線、30px 卡片間距與避免跨頁 | 無；analysis |
| `DesignerRakeReport/Results.js` | card-compat → ui/card；Divider → 原生 hr；保留 printCard、標題置中與最後內容底距 | 無；rake |
| `MerchantBusinessIntervalReport/Results.js` | grid-compat → flex／div；card-compat → ui/card；保留 900／1200px 原始斷點、負外距、欄寬與列印黑框 | 無；interval |
| `HelperMonthlyReport/index.js` | grid-compat → div；保留 printGrid 並明確 print:hidden | 無；helper |

### 離線比較工具與證據

- 入口 `print-compare-entry.js`：費用、損益、抽成、區間累計、互助月報渲染真實 index，使用無 HttpLink 的 Apollo 模擬 client；分析一般／比較模式以 index 傳入的 props 渲染 Results／Compare，重現列印頁首。僅用「測試門市A／設計師甲」等假資料、整數、固定 2026/01/01～2026/01/31，Date 固定在 2026/01/01 08:00 台灣時間。財務 36 列、互助 50 列、分析／抽成各 6 張卡片，涵蓋跨頁。
- `print-compare.sh` 使用指定樹的 build.js／esbuild、Tailwind 設定、tokens.css、main.scss、initialize.scss 與捲軸 CSS；Tailwind cwd 為該樹。**入口先從本腳本目錄複製到 /tmp**，避免入口所在工作樹的 jsconfig.baseUrl 優先於 build.js.nodePaths，導致 before 誤用 after 的 src。不可直接拿工作樹內的絕對入口路徑建置另一棵樹。相同入口只 import 兩樹皆存在的模組。
- runner 以 Playwright context.route 供應本機靜態檔；非本機一律 abort，Chrome DNS 封鎖所有外部主機，service worker 停用，不開伺服器、不連後端。逐份檢查載入完成與 console／page errors，輸出 print PNG（794px）、A4 PDF（含背景）、pdftoppm 80dpi 全頁 PNG、screen PNG（1280px）；錯誤結束碼非 0。
- 外部 Chrome 最終結果：before／after 各 **7/7，exit 0**。輸出根目錄 `/workspace/bos3-print-compare/batch1/{before,after}`。已目視並以 Pillow 比對 **30 張 PNG，全部尺寸與像素相同**；包含 7 張 print、7 張 screen、16 張 PDF 頁面。PDF 二進位不作比對（可能含中繼資料時間差）。

| 報表／key | 影像名稱（兩側同名） | PDF 頁數 | 可見差異 |
|---|---|---:|---|
| 費用分析 cost | `cost-print.png`、`cost-screen.png`、`cost-pdf-1.png`～`cost-pdf-2.png` | 2 | 無 |
| 損益 income | `income-print.png`、`income-screen.png`、`income-pdf-1.png`～`income-pdf-2.png` | 2 | 無 |
| 設計師業績分析 analysis | `analysis-print.png`、`analysis-screen.png`、`analysis-pdf-1.png`～`analysis-pdf-3.png` | 3 | 無 |
| 分析比較 compare | `compare-print.png`、`compare-screen.png`、`compare-pdf-1.png`～`compare-pdf-2.png` | 2 | 無 |
| 設計師抽成 rake | `rake-print.png`、`rake-screen.png`、`rake-pdf-1.png`～`rake-pdf-3.png` | 3 | 無 |
| 店家區間累計 interval | `interval-print.png`、`interval-screen.png`、`interval-pdf-1.png`～`interval-pdf-2.png` | 2 | 無 |
| 互助月報 helper | `helper-print.png`、`helper-screen.png`、`helper-pdf-1.png`～`helper-pdf-2.png` | 2 | 無 |

驗證：指定六個 view 目錄＋src/ui 的 Jest 39 suites／436 tests 全過；npm run lint、dialog-layers 13/13（exit 0）通過；verify-logic 8 檔全過（沙箱內 Node 啟動 git 受限，使用 shell 匯出的 origin/main 原檔作為同一檢查器的基準）。另跑相關測試 `--changedSince=origin/main` 10 suites／102 tests 與 `npm run build` 皆通過（依 Jason 2026/10/23 指示，全站 suite 改為當日最終合併前統一跑一次）；未連真實後端。相容 importer 依指定 rg 口徑為 **15（原 23）**。

限制：這是固定假資料的 Chrome 比較，尚未實機紙本驗收。分析比較模式的 650px 最小表寬在 A4 雙欄下會裁切右側欄位；比較／抽成長卡片仍可能跨頁，均為修改前既有輸出，本批保留，沒有額外改版。後續批次仍須自行提供 before／after 證據。

### 第二批：9 檔、8 份報表

同第一批，只替換 JSX／樣式；未修改 `initialize.scss` 或任何 compat 檔案。卡片改 `ui/card`；相容表格改 `ui/table`，明確保留舊儲存格內距、字色、水平線與表頭語意，避免新表格預設列印黑字／全格線改變輸出。Grid 改 Tailwind flex／div，沿用原 600／900／1200px 斷點與 24px 間距；Paper／Typography 改普通元素，Divider 改原生 `hr`。

| 檔案（`src/views/` 下） | 替換與列印樣式 | 列印差異／影像名稱 |
|---|---|---|
| `DecreaseDailyReport/Results.js` | grid／card／Paper／table → flex、ui/card、div、ui/table；四欄卡片標題黑框、表格水平黑線、內容底距 0 | 無；`decrease-print.png`、`decrease-pdf-1.png`～`decrease-pdf-4.png` |
| `MerchantDailyReport/Results.js` | grid／card／Paper／Divider／table → flex、ui/card、div、hr、ui/table；保留一般及合併明細兩種框線 | 無；`merchantDaily-print.png`、`merchantDaily-pdf-1.png`～`merchantDaily-pdf-2.png` |
| `EmployeePayslip/Results.js` | grid／card／Paper／Divider／table → div、ui/card、div、hr、ui/table；保留薪資條不跨頁、15px 容器底距與既有欄位樣式 | 無；`payslip-print.png`、`payslip-pdf-1.png`～`payslip-pdf-2.png` |
| `MerchantBankTransferReport/TransferDetail.js` | grid／Typography／card／standard-input TextField → flex、div、ui/card、ui/input 的 Input；保留輸入框寬度、底線、內距與行內對齊 | 無；`transfer-print.png`、`transfer-pdf-1.png`～`transfer-pdf-2.png` |
| `Profile/RakeReport.js` | card／Paper／Divider／table → ui/card、div、hr、ui/table；保留原抽成卡片內距與 8px 表格容器圓角 | 無；`profileRake-print.png`、`profileRake-pdf-1.png`～`profileRake-pdf-3.png` |
| `EmployeeManagementDetail/RakeReport.js` | 同個人頁抽成報表，保留原日期列與卡片排列 | 無；`employeeRake-print.png`、`employeeRake-pdf-1.png`～`employeeRake-pdf-3.png` |
| `Profile/DesignerSelfRecord.js` | card／Paper／table → ui/card、div、ui/table；明確保留 categoryPrint 儲存格原內距，不改欄位隱藏規則 | 無；`selfRecord-print.png`、`selfRecord-pdf-01.png`～`selfRecord-pdf-12.png` |
| `EmployeeDailyReport/Results.js` | grid／card → flex、ui/card；保留四欄列印卡片黑框、內容底距 0；原 ui/table 不動 | 無；`employeeDaily-print.png`、`employeeDaily-pdf-1.png`～`employeeDaily-pdf-4.png` |
| `EmployeeDailyReport/index.js` | grid → flex／div；保留列印頁首、報表根掛點與螢幕負外距 | 無；同 `employeeDaily` |

第二批 harness：新增 `decrease,merchantDaily,payslip,transfer,profileRake,employeeRake,selfRecord,employeeDaily`；原第一批七個 key 保留。runner 的 `PRINT_KEYS` 可傳逗號分隔清單，未設定時跑全部 15 個 key。互助／店家／薪資條／轉帳／設計師日報渲染真實 index，包含其頁首與外框；個人／員工抽成與個人日報依頁面傳入相同 props 渲染元件。所有模擬回覆由無 HttpLink 的 Apollo client 依正式 query 選取欄位產生，未知查詢會報錯；補齊個人日報搜尋列的 `getAccountingType`，不略過未完成查詢。Date 固定 2026/01/01，搜尋區間 2026/01/01～01/31；6 位假資料、每位 18 筆日報／互助紀錄、50 筆轉帳明細，涵蓋跨頁。轉帳單另斷言七個輸入框預設值，實際輸入假金額 1000 並確認保留，再比照點列印按鈕時移開焦點並等待底線動畫退場，避免 PDF 閃爍游標干擾像素比較。

輸出根目錄 `/workspace/bos3-print-compare/batch2/{before,after}`；before 為 `origin/main`（不含第一批），after 為本工作樹。各 key 另有同名 `*-screen.png`；`*-dom.json` 記錄列印 computed style 與位置，失敗時另存 `*-error.png`，錯誤影像不列入成功比較。只比對本次 key 的 print／screen／PDF 全頁 PNG，避免把歷次失敗診斷圖誤計為報表差異。PDF 二進位不作比較。

最終外部 Chrome before／after 各 **15/15，exit 0**；Pillow 比較 **78 張 PNG**：**15 張 print 與 48 張 PDF 全頁 PNG 全部尺寸、像素相同**；15 張 screen 中 14 張像素相同，僅 `payslip-screen.png` 的後續卡片圓角有 **247 個淡灰抗鋸齒像素差異、單通道最大差 8**，沒有尺寸、文字或欄位位置差異。此為正式 Card 加入 ui-root 後的螢幕圓角繪製差異，本批保留；薪資條 print／PDF 仍完全相同。第二批八份報表共 48 張 PNG，第一批七個 key 共 30 張 PNG。已目視第二批八份報表的並排預覽與差異區域。

限定 Jest **53 suites／573 tests 全過**，另版號 **1 test 通過**；轉帳頁無獨立 Jest 測試，七欄預設值與金額輸入由上述 Chrome harness 斷言；`npm run lint`、`git diff --check`、`dialog-layers` **13/13（exit 0）** 通過，未跑全站 suite 或 build。資料／GraphQL／state／handlers／文字／測試掛點保留；同一 verify-logic 分析器搭配 shell 匯出的 HEAD 原檔，9 檔全部通過。相容 importer 依指定 rg 口徑 **15 → 6**。剩餘六檔屬後續批次，未修改或刪除相容層。這是離線 Chrome 固定假資料證據，尚未實機紙本驗收；既有個人日報長表分頁、薪資條密集欄位與長卡片分頁維持原輸出。

**第二批補充驗證（審查時加跑）**：審查後再整理重複 class 為常數（不改 class 集合），重跑比較 15/15、print／PDF 63 張 PNG 仍像素相同。`--changedSince=origin/main` 相關測試 24 suites／237 tests、`npm run lint`、`npm run build` 通過（依 Jason 2026/10/23 指示，全站 suite 於當日最終合併前統一跑一次）。


### 第三批：收據列印流程（2026/10/23）

本批疊在第二批之上（第二批先合併）；收據比較使用獨立的 receipt-compare 工具，沒有修改 print-compare-entry.js／print-compare-run.js／print-compare.sh。

| 檔案（`src/views/` 下） | 替換 | 收據 key／差異 |
|---|---|---|
| `OrderCreate/OrderDetailModal.js` | modal-compat → ui/dialog；card-compat → ui/card；Divider → 原生 hr | order-detail；三種紙寬 HTML／影像相同 |
| `DraftOrderEdit/Footer.js` | Divider → 原生 hr | draft-footer；三種紙寬 HTML／影像相同 |
| `DraftOrderManagementList/ResultsV2.js` | Divider → 原生 hr | draft-list；三種紙寬 HTML／影像相同 |
| `OrderManagementList/ResultsV2.js` | Divider → 原生 hr | order-list；三種紙寬 HTML／影像相同 |

**生命週期選擇**：收據維持兩塊原本的隱藏 div／ref，移到 Dialog 的動畫 Content 外，以開啟狀態控制；不使用 forceMount，避免關閉後仍留下舊收據。正式 Dialog 無 onOpenChange＋hideClose，Esc／背景仍不關閉；onOpenAutoFocus preventDefault 後聚焦 panelRef，aria-describedby={undefined}，DialogTitle 保留「消費明細」，寬度 !max-w-[500px] 與原陰影／捲動上限保留。Card 改成 ui/card，手機沿用正式 Dialog 底部面板。收據不繼承 ui-root，複製到新視窗後本來也沒有 app CSS。原生 hr 刻意保留原 MuiDivider-root／MuiDivider-fullWidth 字串與 width:100% inline style：這是為了完整 HTML 逐字一致，沒有再引用 compat 模組。沒有改任何收據文字、資料、計算、id、既有 ref、GraphQL 或 printDiv／document.write。

**比較工具**：新增 `scripts/redesign/compat-harness/e2e/receipt-compare-{entry,run}.js` 與 `receipt-compare.sh <repoTree> <outDir>`，入口先複製到 /tmp，再以指定樹建置；`PRINT_KEYS=order-detail,draft-footer,draft-list,order-list` 可選子集。Apollo 只有記憶體 link，未知根查詢失敗；假資料固定測試門市A／測試客戶甲／設計師甲／整數金額／2026/01/01 08:00。window.open 攔截真實列印流程的 document.write 原字串，保存 HTML，再以全新頁面 setContent 重播，僅移除 onload window.print，不載入 app CSS。print media 螢幕 PNG、A4 或 78／56mm PDF、pdftoppm 80dpi PNG；網路 route／DNS guard 保留，圖片 fetch 僅供應登記的記憶體空白圖。

輸出根目錄 `/workspace/bos3-print-compare/batch3/{before,after}`，before 為 origin/main。每列 `{main,t78,t56}` 分別代表 A4、78mm、56mm；PDF 每份一頁，PDF 二進位不比較中繼資料。

| 收據 | 完整 HTML（兩側同名） | 影像（兩側同名） | 結果 |
|---|---|---|---|
| 打帳單 | `order-detail-{main,t78,t56}.html` | `order-detail-{main,t78,t56}-print.png`、`order-detail-{main,t78,t56}-pdf-1.png` | HTML 逐字相同；PNG 0 像素差 |
| 掛單詳細 | `draft-footer-{main,t78,t56}.html` | `draft-footer-{main,t78,t56}-print.png`、`draft-footer-{main,t78,t56}-pdf-1.png` | HTML 逐字相同；PNG 0 像素差 |
| 掛單列表 | `draft-list-{main,t78,t56}.html` | `draft-list-{main,t78,t56}-print.png`、`draft-list-{main,t78,t56}-pdf-1.png` | HTML 逐字相同；PNG 0 像素差 |
| 帳單列表 | `order-list-{main,t78,t56}.html` | `order-list-{main,t78,t56}-print.png`、`order-list-{main,t78,t56}-pdf-1.png` | HTML 逐字相同；PNG 0 像素差 |

**測試證據**：`OrderDetailModal.timing.test.js` 的完整 expected HTML 字串，於編輯前以 origin/main 的 OrderDetailModal 另存基準元件實跑產生（暫存元件已移至 /tmp，沒有留在 src）；逐字比對開窗／mutation 成功時 main 與 thermal innerHTML，以及三種紙寬的 document.write。真實 checkout hook＋延後完成的假 mutation，涵蓋 F8 載入未完成可重試、重按只送一次、直接點結帳並列印、成功仍可讀 refs、列印後 499ms 不關／500ms 關閉、關閉後即使 hook 仍掛載亦不印舊資料。既有列印測試只改 Modal 外殼 selectors，未刪減斷言。瀏覽器 harness 使用真實 OrderDetailModal 開窗 → F8 兩次 → mutation 成功 → print capture → 500ms 關閉 → F8 不再送出／列印。

外部 Chrome 收據 before／after 各 **12/12，exit 0**；Pillow 比對 **24 張 PNG 尺寸與每個像素完全相同**，diff／位元組比較 **12 份 HTML 完全相同**。指定六個目錄＋networkGuard＋version 最終 Jest **83 suites／1,028 tests 全過**（含新增六項 timing 回歸）；`npm run lint` 通過。外部 Chrome `dialog-layers` **13/13，exit 0**（desktop、mobile、combobox、select、popover、compat-radix、radix-compat、keep-mounted、dropdown、nested-password、nested-date、customer-form、reservation）。verify-logic 原指令因 Node 內啟動 git 受限而 SKIP；改由 shell 匯出 origin/main 快照後使用同一 AST 分析器，四檔均沒有遺失舊敘述或邏輯運算式。`git diff --check` 通過。指定範圍以外不跑全套，不執行應用 build。既有風險：57mm 設定實際使用 56mm，原生瀏覽器字型、長明細分頁、實體印表機不可列印邊界仍須隔離假資料紙本驗收；本批沒有重排範本。React 17 成功 setState 後同步讀 HTML 的既有契約保留，升 React 18 時須另外處理。compat importer 本分支 **15 → 11**（排除 src/ui 與測試）；第二批亦落地後剩 **2**：OrderEdit/Header、CustomerFilterExport。

**第三批補充驗證（審查時加跑）**：`--changedSince=origin/main` 相關測試 40 suites／560 tests、`npm run lint`、`npm run build` 通過（依 Jason 2026/10/23 指示，全站 suite 於當日最終合併前統一跑一次）。消費明細視窗畫面另截 `order-detail-dialog-screen.png`（batch3 before／after）：版面、文字與按鈕相同；差異僅為（1）開窗焦點改落在面板，舊版焦點停在「返回」而顯示灰底，新版「返回」無灰底；（2）遮罩改為 ui/dialog 的半透明色，略淺；（3）內容整體位移 1～3px。皆為螢幕外觀，不影響收據列印。


## 最後一批（2026/10/23）

Jason 核准範圍：最後兩個頁面 importer 與日期選擇器內部浮層。頁面使用檔案 **2 → 0**，非測試產品程式在相容檔以外已無 `*-compat` import；不得將 `ui/compat-layer.js` 視為待刪相容模組，它仍為 combobox 提供共用 DismissableLayer／FocusScope。

- `CustomerFilterExport/index.js`：用既有 default export `hooks/useMediaQuery`，只在呼叫處以相容層同一個 `/^@media( ?)/m` 移除前綴，查詢仍為 `(max-width:899.95px)`，不是 Tailwind md；無 matchMedia 時仍為 false。共用 hook 不改。
- `OrderEdit/Header.js`：PopoverAnchor 以 virtualRef 錨定原 RowIconButton；該按鈕沒有 forwardRef，不可直接作為 asChild 錨點。原 label、aria-describedby／expanded、handleClick toggle、Card／Table 文字與浮層 id `simple-popper` 保留，下方置中並保留原 10px 間距。舊 Popper 的 CompatLayer 會阻止外點關閉，未提供 Esc handler 時也不會關閉；本批採用 Jason 允許的 UX 改善：非 modal Popover 外點／Esc 只清空 anchorEl，不動帳單狀態。點回錨點不先 dismiss，避免同一個 click 重新打開。視覺順序沿用共用 layer-stack（1300 起），不硬寫舊 zIndex=1；舊 Popper 實際也由 layer-stack 覆蓋為此順序。
- `ui/date-picker.js` 桌機：正式 Popover、rootRef virtual anchor、bottom-start、sideOffset=4（原 mt-1 視覺間距），paperRef 留在 role=dialog／aria-label 面板。保留原 document mousedown effect；面板／欄位內不關閉，焦點移出及額外 pointerdown 不新增關閉路徑。Esc preventDefault 後 dismiss，不關下層 Dialog；onOpenChange 僅將 false 對映到 dismiss，由原 openProp 契約決定是否真的關閉。關閉後還原開啟焦點，但不搶已點到其他欄位的焦點。
- 手機：正式 Dialog／DialogContent，hideClose、min-w-[320px]，保留 ui-dialog-centered 並以 Tailwind 覆寫手機底部面板的定位、圓角及滑動動畫。aria-label 使用原 title，aria-labelledby／describedby 明確為 undefined；日視圖保持自身 autofocus，關閉焦點還原至開啟欄位。只在 open 時掛載整個 Root，取消／確認／dismiss 同步卸載，不因 Radix exit Presence 留下舊日期內容；不使用 forceMount。選值立即 onChange、取消還原、確認 onAccept、背景／Esc 保留當前值、closeOnSelect、受控 open 皆保留。

保留的相容模組（及對應 CSS／測試），**Jason 已於 2026/10/23 23:33 核准刪除，清單與保留項目見下節**：`button-compat`、`card-compat`、`display-compat`、`feedback-compat`、`grid-compat`、`misc-compat`、`modal-compat`、`overlay-compat`、`standard-input-compat`、`table-compat`、`tree-compat`。它們只由相容檔本身、相容／圖層測試與歷史 `scripts/redesign/compat-harness/**` 引用；歷史工具未改。Harness 直接 import 的檔案為 table-entry、misc-entry、overlay-entry、display-entry、feedback-entry、tree-entry、dialog-entry，及 e2e/misc-entry、e2e/modal-layers-entry、e2e/dialog-layers-entry（皆 `.js`）。

檢查：

```bash
rg -n "compat'" src scripts --glob '!**/__test*/**' --glob '!**/*.test.js' --glob '!src/ui/*-compat.*'
```

結果只剩歷史 compat-harness（其中部分是字串而非 import）；產品程式為 0。Jest 涵蓋全部 ui、日期選擇器及 rg 找出的 DatePicker／MobileDatePicker／DateTimePicker 使用測試，另加 Header 與 CustomerFilterExport 回歸。舊測試僅因 Radix 背景改用 pointerdown／click 與新 selector 調整操作，原關閉斷言保留；fake timers 先推進 0ms，讓 Radix 外點監聽安裝。另測取消還原、確認接受、Esc／背景保留值、受控 open、日視圖焦點、巢狀 Dialog Esc 及還原焦點。離線 Chrome dialog-layers e2e 13/13（手機案例焦點選擇器 `.MuiDialog-paper` → `[role="dialog"]`，僅改選擇器）；日期選擇器前後截圖 `/workspace/bos3-print-compare/final-datepicker/pairs/`，版面相同，僅遮罩較淺。

**靜態檢查差異**：`verify-logic` 的 Node 子程序在本沙箱遇到 `spawnSync git EPERM`，原工具會誤報「無基準版本」而略過。以 shell `git show HEAD:<path>` 匯出原始快照到 `/tmp`，僅替換工具的基準讀取後重跑相同分析：date-picker 通過；其餘兩項預期 FAIL 已逐項審視：CustomerFilterExport 的 useMediaQuery 引數加入相同的 @media 正規化；Header 的 TransitionProps render function 隨 Popper／Fade 換為 PopoverContent 而移除。兩者皆屬本批明確核准的畫面相容遷移，不涉及帳單／日期值運算。

**驗證**：全套 Jest 377 suites／4,372 tests 全過（`--maxWorkers=50%`，合併前最終一次）；補充焦點案例後，最終指定範圍（全部 ui＋rg 找出的 picker 使用測試＋Header）55 suites／670 tests 全過，版本／網路 guard 2 suites／4 tests 全過；最終 lint、build、git diff --check 通過。唯讀審查未發現需修正問題。build 仍有既有重複 object key 與 Browserslist 資料過舊提示，未擴大修改。


## 相容層刪除（2026/10/23，Jason 核准）

Jason 於 23:33 核准移除下列未使用檔案。本次先整理仍保留的程式與測試，實體檔案由審查者執行 `git rm`；代理不刪檔、不 commit。上節的「保留」與歷史 harness 引用清單代表刪除準備前狀態。

- `src/ui/button-compat.js`
- `src/ui/card-compat.js`
- `src/ui/display-compat.js`
- `src/ui/feedback-compat.js`
- `src/ui/grid-compat.js`
- `src/ui/misc-compat.js`
- `src/ui/modal-compat.js`
- `src/ui/overlay-compat.js`
- `src/ui/standard-input-compat.js`
- `src/ui/table-compat.js`
- `src/ui/tree-compat.js`
- `src/ui/accordion-compat.css`
- `src/ui/display-compat.css`
- `src/ui/feedback-compat.css`
- `src/ui/grid-compat.css`
- `src/ui/misc-compat.css`
- `src/ui/modal-compat.css`
- `src/ui/overlay-compat.css`
- `src/ui/standard-input-compat.css`
- `src/ui/table-compat.css`
- `src/ui/tree-compat.css`
- `src/ui/__test__/button-compat.test.js`
- `src/ui/__test__/card-compat.test.js`
- `src/ui/__test__/display-compat.test.js`
- `src/ui/__test__/grid-compat.test.js`
- `src/ui/__test__/list-feedback-compat.test.js`
- `src/ui/__test__/misc-compat.test.js`
- `src/ui/__test__/misc-compat-more.test.js`
- `src/ui/__test__/modal-compat.test.js`
- `src/ui/__test__/modal-compat-focus.test.js`
- `src/ui/__test__/overlay-compat.test.js`
- `src/ui/__test__/standard-input-compat.test.js`
- `src/ui/__test__/table-compat.test.js`
- `src/ui/__test__/tree-compat.test.js`
- `src/ui/__test__/tree-compat-keyboard.test.js`
- `scripts/redesign/compat-harness/dialog-entry.js`
- `scripts/redesign/compat-harness/display-entry.js`
- `scripts/redesign/compat-harness/feedback-entry.js`
- `scripts/redesign/compat-harness/misc-entry.js`
- `scripts/redesign/compat-harness/overlay-entry.js`
- `scripts/redesign/compat-harness/table-entry.js`
- `scripts/redesign/compat-harness/tree-entry.js`
- `scripts/redesign/compat-harness/e2e/misc-entry.js`
- `scripts/redesign/compat-harness/e2e/misc-run.js`
- `scripts/redesign/compat-harness/e2e/modal-layers-entry.js`
- `scripts/redesign/compat-harness/e2e/modal-layers-run.js`
- `scripts/redesign/compat-harness/e2e/tree-run.js`
- `scripts/redesign/gen-grid-css.py`

保留 `src/ui/compat-layer.js`：combobox 仍使用其共用 DismissableLayer／FocusScope；它不是待刪模組。
保留 harness 的 build.js、run.js、mui-theme.js、e2e/print-entry.js、print-px.js、date-picker-entry/run、dialog-layers-entry/run、ui-components-entry/run、print-compare*、receipt-compare*。

混合測試僅移除相容元件案例；Switch inputRef 與 Slider valueLabelDisplay 的原始案例／斷言複製至 switch-slider-extra.test.js。圖層測試的正式元件改以 ui/dialog 為外殼，雙向相容堆疊整併成 Radix 雙層堆疊；keepMounted、相容 Esc 順序與相容 Popper 外部事件案例移除。Chrome runner 移除 compat-radix、radix-compat、keep-mounted，保留十種正式情境與原斷言；nested-password／nested-date 下層改 radix helper。Chrome 實跑 9／10 通過：nested-password 改正式下層後於「取消後焦點回到觸發鈕」斷言失敗（正式 Autocomplete 選單開啟時點同窗按鈕，焦點落到對話框容器；既有行為、原由相容下層掩蓋），斷言保留、待另案修正。

`ui-sheet-in` 已無保留程式使用；本次只更新註解，仍保留 keyframe 規則。

### 移除案例明細（保留檔案）

以下案例只驗證已退役模組的 API、MUI class 或生命週期；正式元件案例與其斷言保留。

**`src/ui/__test__/controls.test.js`**：button-compat 的 variant／color／尺寸對映。

- contained＋secondary／inherit 為次要按鈕；未知尺寸退回 medium
- text／outlined＋error 以紅字標示危險操作；fullWidth 撐滿

**`src/ui/__test__/form-inputs.test.js`**：standard-input-compat 的 MUI class 與事件轉接。

- 預設 medium；停用與錯誤輸出 MUI 同名 class
- 聚焦／離開時照常呼叫頁面的 onFocus／onBlur

**`src/ui/__test__/tables.test.js`**：table-compat 的 MUI class、context 預設值與語意轉接。

- 預設 medium／normal；表頭 th 帶 scope=col；區段外的儲存格為 body
- stickyHeader 傳到每個儲存格；selected／footer 列；排序欄位標 aria-sort
- Table 的 size／padding 為 null 時儲存格退回 medium／normal（不輸出 sizeNull）

**`src/ui/__test__/theme.test.js`**：misc-compat 的 useMediaQuery 包裝，非現行 hooks/useMediaQuery。

- 接受 @media 字串，第一次渲染為 false、掛載後為實際結果

**`src/ui/__test__/compat-display.test.js`**：display-compat 的 Paper／Typography／Container 及 card-compat CardHeader。

- Paper variant=outlined 輸出 MuiPaper-outlined（不帶 elevation class）
- Typography 預設 body1＝<p>；paragraph 一律 <p>；未知 variant 退回 span
- Container 預設 maxWidth=lg；maxWidth=false 不輸出寬度 class
- 有 avatar 時畫 MuiCardHeader-avatar（排在標題左側）

**`src/ui/__test__/overlay-feedback-layout.test.js`**：overlay／feedback／grid 相容模組的 portal、動畫、計時、MUI class 與 inline fallback。

- anchorEl 可為函式；container 可為函式；ref 交給呼叫端
- disablePortal 時畫在原地；keepMounted 關閉時保留節點但 display:none
- 進場先 opacity 0、下一個 frame 變 1，並呼叫 onEnter；離場以 exit 時間後呼叫 onExited 並隱藏
- 沒給 in 時預設隱藏；timeout 物件缺值時退回 MUI 預設 225／195ms
- 預設 anchor=left、temporary 且關閉；permanent 不做滑動
- SnackbarContent 有 action 時畫動作區
- 滑鼠移出後以 resumeHideDuration 重新計時；onMouseEnter／onMouseLeave 照常回呼；ref 可為物件或函式
- Alert 預設 success；iconMapping 優先；未知 severity 用成功圖示；icon=false 不畫圖示
- Alert 有 action 時不畫關閉鈕；只有 onClose 時畫關閉鈕並回呼
- 未知 justify／align 與非預設 gap（數字以 8px 為單位、字串原樣）
- zeroMinWidth、wrap 與 flexWrap 輸出對應 class
- Snackbar 計時結束或點外部時若 onClose 已被拿掉，不拋錯
- Fade 離場沒有 onExited 時照樣隱藏
- grid-compat：非 xs 斷點的非整數欄寬不輸出 class 也不加 inline 寬度

**`src/ui/__test__/dialog-layers.test.js`**：相容 Popper 外部事件與相容 Dialog 的 root Esc／onClose 順序。

- 較晚開啟的相容 Popper 不觸發下層的外部點擊或焦點事件
- 相容層 Esc 保留 root 按鍵回呼先於 onClose 的順序

`dialog-layers.test.js` 另移除參數化案例：

- `%s keepMounted 關閉後不占焦點或 Esc`（相容彈窗、相容浮層）：只驗證 Compat Modal／Popper 隱藏後的焦點與 Esc 解除。
- `%s 開關重開保留 DOM、未受控輸入與子元件狀態`（Modal、Popper、Popper 淡出）：只驗證相容 keepMounted／Fade 保留 DOM 契約。
- `%s 關閉再開啟後仍高於下層` 僅移除「相容彈窗」參數，正式 Dialog／Popover／Select 三參數與斷言不變。
- 原 `雙向堆疊：上層為 Radix=%s，焦點與 Esc 只屬於最上層` 的兩個相容方向改為 `Radix 雙層堆疊：焦點與 Esc 只屬於最上層`，保留全部原斷言，避免正式元件組合重複兩次。

轉換案例：`正式 Dialog 內 Popover 點回下層內容會關閉浮層`、`正式 Dialog 內 Dropdown 開啟時禁用下層 pointer，關閉後還原`、`正式 Dialog 內 Select 開啟時禁用下層 pointer，關閉後還原`、`實際 PasswordDialog 在正式窗內開關兩次，Esc 不關窗且每次還原原焦點`，均只替換外殼並保留斷言；沒有因正式 Dialog 語意而無法保留的斷言。

驗證：刪檔後完整 `CI=true npx react-scripts test --watchAll=false --maxWorkers=50%`：364 suites／4,236 tests 全過（刪檔前 377／4,372；差額＝14 個相容專屬測試檔 103 tests＋混合檔移除 35 個相容案例－新增 switch-slider-extra 2 tests）；`npm run lint`、`npm run build` 通過。刪檔後全 repo（排除文件）對已刪模組／工具零引用，`compat-layer` 僅 combobox 引用。dialog-layers Chrome 9／10（nested-password 見上）。
