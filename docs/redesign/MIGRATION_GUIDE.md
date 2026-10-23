# 第二層遷移指南：把頁面中的相容元件換成 `src/ui/`

> 給執行改版的工程師（含 AI 代理）。規範以根目錄 `STYLE.md` 為準。
> 參考範例 commit：`27de2d2`（帳單列表，完整替換）、`a718658`（打帳單，大型頁結構替換）、`66f5d92`（報表目錄）。
> **現況（2026/10/23）**：`package.json` 已無 MUI 套件。相容元件仍有 59 個使用檔案（頁面層 53 檔／38 個目錄，共用層 6 檔）；本指南用於逐步收尾並換成正式 `ui` 元件。尚待處理：結帳（billing）4 頁、報表列印、選擇器（pickers）與全域 toast。Autocomplete（PR #178–#181）與滑桿泡泡（PR #197）已自製完成。日期時間以 `lib/business-timezone.js` 固定為台灣時間，改版時不要自行加時區換算。下文未標為歷史的「MUI 元件」均指目前輸出同名 class 的相容元件，不可重新安裝或引入 `@mui/*`。

> 正式站僅供唯讀查看；寫入、送出及列印測試只用 mock／隔離測試資料。刪檔先經 Jason 同意。

## 0. 鐵則（違反任何一條，該頁不得 commit）

1. **只改畫面**：JSX 結構、樣式、import。**不得**修改任何 state、hooks、handler、useEffect、GraphQL query/mutation、Redux、驗證、權限、金額或日期運算、路由跳轉、localStorage／cookie。
2. **不得修改指派範圍以外的檔案**。特別是 `src/ui/`、`src/components/`、`src/layouts/`、`src/theme/`、`src/hooks/`、`package.json`、`scripts/`。缺元件就在回報中提出，不要自己加。
3. **列印範本不動**：`id="printMain"`、`id="printThermal"`、任何會被 `innerHTML` 複製到列印視窗的區塊、`className` 含 `forPrint` / `print` 的元素，一律原封保留（包含 inline style 與相容元件）。
4. **保留所有 `data-testid`、`id`、`name`、`ref`、`key`、`aria-*`**。
5. **不自行安裝套件**。第 4 節是局部檢查；合併前仍須在本機完成 `npm run lint`、`npm run test:nowatch`、`npm run build`。Node.js CI 已手動停用，不可省略本機驗證。
6. 文案維持原樣；只允許移除純裝飾的英文 overline。

## 1. 可用元件（`src/ui/`，import 路徑以 `ui/xxx` 開頭）

| 檔案 | 匯出 | 備註 |
|---|---|---|
| `ui/button` | `Button` | `variant`: primary（主題藍，每頁最多一個）/ secondary（淺灰實心）/ ghost / danger；`size`: sm / md / lg / icon；`asChild` 可包 `RouterLink` |
| `ui/input` | `Input`, `Textarea`, `Label`, `Field` | `Field label required hint error htmlFor`；`Input invalid` |
| `ui/select` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel` | Radix：`value` 必須是**非空字串**，用 `onValueChange(v)`。舊值若為數字／物件／可為空字串，**保留既有 Select 相容元件** |
| `ui/table` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TablePagination` | `TableHead/TableCell numeric` 右對齊＋等寬數字；`TablePagination` 與 MUI 同名 props（`count page rowsPerPage onPageChange(e, p) rowsPerPageOptions onRowsPerPageChange(e)`） |
| `ui/card` | `Card`, `CardHeader`（`action` prop 放右側按鈕）, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | 取代 MUI Card / Paper |
| `ui/page-header` | `PageHeader`（`title description actions`）, `Toolbar`, `ToolbarSpacer` | 頁首。既有 `AdminPageHeader` 已是新外觀，可保留不換 |
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
| `Chip`（僅顯示） | `ui/badge` | 可點擊／可刪除的 Chip 保留 MUI |
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

Part B 共 17 個頁面／共用 importers；B1 已完成 9 檔，B2 留待後續 8 檔：

| 檔案（`src/` 下，省略 `.js`） | 類型與風險 |
|---|---|
| `components/FastCheckOrdersModal` | Dialog；DateSelector／人員搜尋、xl 寬與 sticky 表格 |
| `views/AttendanceRecords/index` | Dialog；日期時間／搜尋、原 onClose、hidden 篩選狀態 |
| `views/CustomerFilterExport/index` | Dialog；多日期／Select、響應式 fullScreen |
| `views/EmployeeManagementList/ProfileImportModal` | **B1 完成**；Dialog → `ui/dialog`；Select，無 onClose |
| `views/Parameter/OuterLinkModal` | **B1 完成**；Dialog → `ui/dialog`；搜尋、MuiDialog 後代樣式掛點，無 onClose |
| `views/CustomerManagementDetails/General/CustomerInfo` | Dialog；ChoseEvent 的日期／搜尋／Select 與另一個編輯窗 |
| `views/ManagementReservationRecord/OrderTable` | Dialog；ChoseEvent 與 PasswordDialog，須父子聯測 |
| `views/ManagementDesignersReservationRecord/OrderTable` | Dialog；NewChoseEvent／PasswordDialog／公休窗共存 |
| `views/CustomerManagementDetails/General/CustomerEditModal` | Modal；Select、表單 refs／驗證、原 onClose |
| `views/OrderCreate/AddCustomerModal` | **B1 完成**；Modal → `ui/dialog`；搜尋／Select、refs／鍵盤跳欄，無 onClose |
| `views/OrderEdit/AddCustomerModal` | **B1 完成**；Modal → `ui/dialog`；日期／Select、既有顧客資料，無 onClose |
| `views/DraftOrderEdit/AddCustomerModal` | **B1 完成**；Modal → `ui/dialog`；日期／Select，測試已改 role=dialog，無 onClose |
| `views/QueueOrderEdit/AddCustomerModal` | **B1 完成**；Modal → `ui/dialog`；Select，測試已改 role=dialog，無 onClose |
| `views/EmployeeSchedule/AddDesignersModal` | **B1 完成**；Modal → `ui/dialog`；人員搜尋，無 onClose |
| `views/Services/AboutDeductionEditModal` | **B1 完成**；Modal → `ui/dialog`；Select／抽成數值，無 onClose |
| `views/Services/AssistantSettingEditModal` | **B1 完成**；Modal → `ui/dialog`；Select／助理抽成數值，無 onClose |
| `views/OrderCreate/OrderDetailModal` | Modal；**列印範本禁止動**、結帳及確認疊層，無 onClose |

另有 `ui/date-picker`、`ui/misc-compat`、`ui/overlay-compat` 三個內部使用者，與頁面遷移分開計數。

### Dialog 共用圖層 Part B1（2026/10/23）

上表 B1 九檔僅換 `ui/dialog` 外殼；無 `onOpenChange`＋`hideClose`，Esc／背景不關閉，原按鈕、表單 refs／Enter 跳欄與後端值不變。保留 700px（顧客）、500px（排班）、912px（服務設定）、600px（身份導入／外部連結）特例。開窗沿用舊 Modal 面板聚焦策略，已有欄位焦點時不搶走。正式 Dialog 手機採底部面板，長表單內容獨立捲動。

OuterLink 原 MuiDialog 後代樣式逐項移至 DialogContent／Header／Body／Footer：保留可見 overflow、標題 16px、內容 24／16px 內距及底部兩側對齊／換行／10px 間距；不留下失效的 MuiDialog 選擇器。B2、列印及 `src/ui` 不動。既有頁面測試只調整外殼選擇器；新增九檔 picker 選值與不關閉回歸，以及新增顧客 Enter 焦點鏈。

離線 harness 新增 `customer-form`（第十二種）：無 onOpenChange 的正式 Dialog 內含 combobox、相容原生 Select、日期；選值後保持開窗，picker Esc 只關 picker、面板 Esc／背景不關，取消後檢查指標與捲動鎖解除。

驗證：`CI=true` 指定八個頁面測試目錄＋`src/ui` 共 107 suites／1,352 tests；首輪 2 suites 的 5 個失敗皆為舊 Card／absolute 外殼定位，僅改 selector helper 後 Services（2 suites／23 tests）與 EmployeeSchedule（1 suite／27 tests）重跑全過。新增 picker 10 tests、網路封鎖 3 tests、版號 1 test 通過；`npm run lint` 通過。外部 Chrome 原 11 種＋customer-form 共 12/12 通過（exit 0）。未跑全站 suite，未連真實後端。
