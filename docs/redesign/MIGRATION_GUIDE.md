# 第二層遷移指南：把頁面中的 MUI 換成 `src/ui/`

> 給執行改版的工程師（含 AI 代理）。規範以根目錄 `STYLE.md` 為準。
> 參考範例 commit：`27de2d2`（帳單列表，完整替換）、`a718658`（打帳單，大型頁結構替換）、`66f5d92`（報表目錄）。
> **現況（2026/10/21）**：MUI 套件已於 2026/10/20 全數移除。尚未重新設計的頁面改 import `src/ui/*-compat`（如 `ui/modal-compat`、`ui/card-compat`、`ui/grid-compat`，輸出 MUI 同名 class、外觀不變）；本指南現在用於把這些相容元件換成正式的 `ui` 元件，下文的「MUI 元件」請讀作「相容層元件」，對照與鐵則不變。日期時間已由 `lib/business-timezone.js` 固定為台灣時間，改版時不要自行加時區換算。

## 0. 鐵則（違反任何一條，該頁不得 commit）

1. **只改畫面**：JSX 結構、樣式、import。**不得**修改任何 state、hooks、handler、useEffect、GraphQL query/mutation、Redux、驗證、權限、金額或日期運算、路由跳轉、localStorage／cookie。
2. **不得修改指派範圍以外的檔案**。特別是 `src/ui/`、`src/components/`、`src/layouts/`、`src/theme/`、`src/hooks/`、`package.json`、`scripts/`。缺元件就在回報中提出，不要自己加。
3. **列印範本不動**：`id="printMain"`、`id="printThermal"`、任何會被 `innerHTML` 複製到列印視窗的區塊、`className` 含 `forPrint` / `print` 的元素，一律原封保留（包含 inline style 與 MUI 元件）。
4. **保留所有 `data-testid`、`id`、`name`、`ref`、`key`、`aria-*`**。
5. **不安裝套件、不啟動 dev server、不跑 build**（記憶體不足會讓環境重啟）。只跑下面第 4 節的檢查。
6. 文案維持原樣；只允許移除純裝飾的英文 overline。

## 1. 可用元件（`src/ui/`，import 路徑以 `ui/xxx` 開頭）

| 檔案 | 匯出 | 備註 |
|---|---|---|
| `ui/button` | `Button` | `variant`: primary（主題藍，每頁最多一個）/ secondary（淺灰實心）/ ghost / danger；`size`: sm / md / lg / icon；`asChild` 可包 `RouterLink` |
| `ui/input` | `Input`, `Textarea`, `Label`, `Field` | `Field label required hint error htmlFor`；`Input invalid` |
| `ui/select` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel` | Radix：`value` 必須是**非空字串**，用 `onValueChange(v)`。舊值若為數字／物件／可為空字串，**保留 MUI Select** |
| `ui/table` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TablePagination` | `TableHead/TableCell numeric` 右對齊＋等寬數字；`TablePagination` 與 MUI 同名 props（`count page rowsPerPage onPageChange(e, p) rowsPerPageOptions onRowsPerPageChange(e)`） |
| `ui/card` | `Card`, `CardHeader`（`action` prop 放右側按鈕）, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | 取代 MUI Card / Paper |
| `ui/page-header` | `PageHeader`（`title description actions`）, `Toolbar`, `ToolbarSpacer` | 頁首。既有 `AdminPageHeader` 已是新外觀，可保留不換 |
| `ui/dialog` | `Dialog`(`open onOpenChange`), `DialogContent`(`size` sm/md/lg), `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`, `DialogClose` | `onClose={fn}` → `onOpenChange={o => !o && fn()}`。**Dialog 內若有 MUI Autocomplete / Select / DatePicker / Menu，保留 MUI Dialog**（Radix 會擋住 MUI 彈出層的點擊） |
| `ui/tabs` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | 值必須是字串；舊值為數字或 handler 用到 event 時，保留 MUI Tabs |
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
| `Checkbox`（表格勾選） | `ui/checkbox` | 表單內配 `FormControlLabel` 的可保留 MUI |
| `Dialog*`（簡單確認框） | `ui/dialog` | 見上表限制；危險操作確認框按鈕用 `variant="danger"`，說明寫出後果 |

### 可以保留 MUI（橋接主題已套新外觀）

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

## 7. 第二輪仍然保留 MUI 的情況

- **列印**：第 0 節第 3 條，加上 **`src/initialize.scss` 的 `@media print` 規則選取到的元素**。改任何區塊前，先用 `grep -n "<該區塊的 className>" src/initialize.scss` 檢查；列印規則若寫在 `.MuiCard-root`、`.MuiTableContainer-root`、`.MuiTableCell-root`、`.MuiGrid-item`、`.MuiContainer-root`、`.MuiPaper-root`、`.MuiCardHeader-root`、`.MuiCardContent-root` 底下，且該頁會 `window.print()`，該頁的這些元件**整段保留**。
- `TextField`（有 `helperText` 邏輯、adornment、`inputRef`、`onWheel` 等）、`Autocomplete`、日期／時間選擇器、`Radio`、`Slider`、`Tooltip`、`Drawer`、`Tabs`（handler 用 event）、`Accordion`、含上述元件的 `Dialog` / `Modal`、`Menu`（複雜）。
- 打帳單／帳單編輯類頁面（OrderCreate、OrderEdit、DraftOrderEdit、QueueOrderEdit）：**只換第 6 節的表單元件（Select、ToggleButton、Checkbox、Switch）與純裝飾的 Typography / Divider**，不動排版結構。金額、折扣、付款相關的欄位若 handler 讀 `event.target.value` 後直接計算，替換前確認 NativeSelect 回傳的型別與原本相同（相同就可換）。

## 8. 第二輪的檢查與 commit

與第 4、5 節相同。commit 標題改為：`feat(ui): 第二輪——<頁面中文名>（<views 目錄名>）`。
