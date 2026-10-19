# BOS 3.0 設計規範（STYLE.md）

> 方向：現代、簡約、清楚。參考 OpenAI 產品介面的克制感——大量留白、中性色、黑白灰為底、以品牌藍為唯一主題色點綴、極少陰影。
> 技術：Tailwind CSS + shadcn/ui（Radix）。本文件是所有新畫面的唯一依據；與本文件衝突的舊樣式一律以本文件為準。

---

## 1. 原則

1. **內容優先**：畫面上只放完成任務需要的東西；裝飾、漸層、插圖一律不用。
2. **一致勝過巧思**：同一種資訊永遠用同一種元件、同一個位置、同一種寫法。
3. **層級靠字重與間距，不靠顏色**：顏色只用來表達狀態（成功 / 警告 / 錯誤 / 選取）。
4. **可掃讀**：表格、表單對齊網格；數字右對齊並使用等寬數字。
5. **只改畫面，不改行為**：改版不得更動 API 呼叫、欄位、驗證規則、權限判斷、金額計算。

## 2. 色彩（Design Tokens）

以 CSS 變數定義於 `src/styles/tokens.css`，Tailwind 透過 `theme.extend.colors` 引用。禁止在元件中寫死 hex 色碼。

| Token | 淺色 | 深色 | 用途 |
|---|---|---|---|
| `--canvas` | `#F7F7F8` | `#0A0A0A` | 頁面底色（卡片靠底色差浮出） |
| `--background` | `#FFFFFF` | `#171717` | 卡片、輸入框、浮層底色 |
| `--surface` | `#F2F2F3` | `#1C1C1C` | 側欄、次要區塊、表頭 |
| `--surface-hover` | `#E9E9EB` | `#262626` | 列 hover、選單 hover、次要按鈕底色 |
| `--surface-active` | `#DEDEE1` | `#323232` | 次要按鈕 hover |
| `--border` | `#E5E5E5` | `#2E2E2E` | 裝飾性邊框：卡片框、分隔線、表格線 |
| `--border-strong` | `#C2C2C2` | `#484848` | 可操作元件邊框：輸入框、下拉、日期欄位（hover `#949494`） |
| `--text` | `#0D0D0D` | `#ECECEC` | 主要文字 |
| `--text-secondary` | `#5D5D5D` | `#B4B4B4` | 說明、標籤、欄位名 |
| `--text-tertiary` | `#8F8F8F` | `#8F8F8F` | placeholder、停用 |
| `--primary` | `#1A73E8` | `#1A73E8` | 主題色（沿用舊版品牌藍）：主要按鈕、勾選、選取狀態 |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | 主要按鈕文字 |
| `--accent` | `#1A73E8` | `#4C8DF6` | 主題色點綴：連結、焦點框、進度、側欄目前頁、Tabs 底線 |
| `--success` | `#10A37F` | `#19C37D` | 成功、已付款 |
| `--warning` | `#B7791F` | `#F0B429` | 待處理、即將到期 |
| `--danger` | `#D92D20` | `#F97066` | 錯誤、刪除、退款 |

規則：
- 「能點、能輸入」的元件用 `border-strong` 或實心底；「純裝飾」的卡片框與分隔線用 `border`，維持淡雅但不混淆。
- 狀態色只用在 **Badge、圖示、細邊框**，不做大面積底色；底色一律用該色 8% 透明度（`bg-success/8`）。
- 一個畫面最多一個 `primary` 實心按鈕。

## 3. 字型

- 字體：沿用全站既有字型 `Roboto`（英數）＋ `"Noto Sans TC"`（中文），後備 `Helvetica, Arial, sans-serif`；不另外載入新字型。
  （既有設定見 `src/assets/scss/main.scss`，以 `!important` 套用全站；字重只用 400 / 500 / 700。）
- 數字一律加 `font-variant-numeric: tabular-nums`（Tailwind `tabular-nums`）。

| 名稱 | 大小 / 行高 | 字重 | 用途 |
|---|---|---|---|
| `display` | 28 / 36 | 700 | 儀表板大數字 |
| `title` | 20 / 28 | 700 | 頁面標題（每頁一個） |
| `heading` | 16 / 24 | 700 | 區塊標題、卡片標題 |
| `body` | 14 / 20 | 400 | 內文、表格內容、表單值 |
| `label` | 13 / 18 | 500 | 欄位名稱、表頭 |
| `caption` | 12 / 16 | 400 | 輔助說明、時間戳 |

不使用 12px 以下字級；不使用全大寫英文標題。

## 4. 間距與版面

- 基準 4px。只用：`4 8 12 16 20 24 32 40 48 64`。
- 頁面外距：桌機 `px-8 py-6`，平板 `px-6`，手機 `px-4`。
- 區塊之間 `gap-6`；表單欄位之間 `gap-4`；標籤與輸入框 `gap-1.5`。
- 內容最大寬度：列表頁滿版；表單頁 `max-w-3xl`；設定頁 `max-w-4xl`。
- 斷點沿用 Tailwind：`sm 640 / md 768 / lg 1024 / xl 1280`。

### 頁面骨架（所有頁面必須一致）

```
┌ Sidebar (240px, surface) ┬───────────────────────────────────┐
│ Logo / 商家切換           │ PageHeader: 標題 + 說明 + 右側主要動作 │
│ 導覽群組                  ├───────────────────────────────────┤
│ …                        │ Toolbar: 搜尋 / 篩選 / 日期 / 次要動作 │
│                          ├───────────────────────────────────┤
│ 使用者選單（底部）         │ Content: Table / Form / Cards        │
└──────────────────────────┴───────────────────────────────────┘
```

## 5. 形狀與層次

| Token | 值 | 用途 |
|---|---|---|
| `rounded-md` | 8px | 輸入框、小按鈕、Badge |
| `rounded-lg` | 12px | 卡片、彈窗、下拉選單 |
| `rounded-full` | 9999px | 主要按鈕、頭像、篩選 Chip |
| 陰影 | 只用於浮層 | `shadow-[0_4px_16px_rgba(0,0,0,0.08)]`；卡片不用陰影，用 `border` |

## 6. 元件規範（shadcn/ui 為基礎，放在 `src/ui/`）

| 元件 | 規則 |
|---|---|
| **Button** | 變體只有 `primary`（主題藍底白字、圓角 full）、`secondary`（淺灰實心 `surface-hover`、無框，與輸入框區分）、`ghost`（無框）、`danger`；尺寸 `sm 32px / md 36px / lg 40px`。圖示 16px，與文字間距 6px。 |
| **Input / Select / DatePicker** | 高 36px、`rounded-md`、1px `border-strong`（hover 加深）；focus 為 2px `accent` 外框。錯誤時 border 變 `danger`，下方 caption 顯示訊息。日期區間一律用 `DateSelector`：「快速選擇」下拉 ＋ 一個日期區間欄位，不平鋪多顆按鈕。月曆 date-picker 專項方向：標籤放欄位上方；`format`／存值（`onChange` 原樣回傳 `Date`／`null`）／鍵盤輸入逐檔保留；內部第一階段沿用 `@mui/x-date-pickers` 做外觀門面，詳見 `docs/redesign/DATE_PICKER.md`。月曆彈層（日格、表頭、年／月／時間選擇）的視覺統一歸 `src/ui/mui-theme.js` 的 `MuiPickers*` 覆寫，不逐頁寫樣式。彈層頂欄（手機 Dialog 實際為 `MuiPickersToolbar`＋`MuiDatePickerToolbar`／`MuiDateTimePickerToolbar`／`MuiTimePickerToolbar`，DateTime 才出現時間欄）跟隨主題：`background` 底、`text` 字色、底部 1px `border`，**不要大面主題藍底白字**，且覆寫須用 `!important` 壓過後載入的舊全域 CSS（`initialize.scss` 不得再寫死藍底白字）；主題色 `accent` 只保留在選取日、今天邊框、年／月／時間選取與確認按鈕等小面積。 |
| **Form** | 標籤在上；必填以「*」標在標籤後；一列最多 2 欄（桌機）。底部固定動作列：右側「取消 / 儲存」。<br>**標籤只有一種寫法：標籤在欄位上方＋佔位字**，不使用浮動（卡在框線上）的小標籤；備註欄也一樣。<br>**必填 `*` 要有依據**：依該頁既有的驗證規則（例如 `valid`、`billVerify`），並在原始碼註解寫明；空列會被丟掉的欄位，只在該列有填任一欄時才標必填。<br>**按鈕停用要說明原因**：在按鈕旁以文字（`role="status"`）與 `title` 寫出「尚缺：…」。 |
| **Table** | 表頭 `surface` 底、`label` 字級；列高 44px；hover `surface-hover`；數字欄右對齊；空狀態置中顯示說明＋主要動作。分頁固定在表格下方右側。 |
| **Badge** | 狀態專用；文字＋8% 底色；不加邊框陰影。 |
| **Card** | `rounded-lg`、1px border、內距 20px；標題用 `heading`。 |
| **Accordion（可展開卡片）** | 用 `ui/accordion`（與 MUI 介面相容）。收合時標題右側以 `summaryMeta` 顯示摘要（「已填 N 筆 · NT$ 小計」，沒填就不顯示），一眼看得到內容概況。 |
| **圖示按鈕** | 一律是真的 `<button>`，帶 `title` 與 `aria-label`；「新增」類動作要有文字（例如「新增項目」），不能只放「+」。 |
| **總計列** | 長表單的「業績合計／現金應收」另放底部固定列（`fixed`，lg 以上讓出 240px 側欄、手機讓出 56px 底部導覽、列印隱藏），不靠 `sticky` 側欄卡。 |
| **Dialog** | 寬 480 / 640 / 800；標題、內容、底部動作三段；危險操作需二次確認並寫出後果。 |
| **樹狀選擇（TreeView）** | 共用選店等樹狀窗保留 `@mui/x-tree-view` 行為時只做視覺覆寫：列高 38px compact、整列 hover `surface-hover`、層級縮排 24px、展開箭頭 16px 置中對齊、勾選框 `ui` Checkbox 16px、群組／店家圖示 16px＋間距 6px；搜尋用 `ui` Input、頂部動作 ghost 描邊 `sm` 同高、底部關閉 `secondary`／確認 `primary`。不為換而換自寫樹，避免勾選／展開／搜尋行為回歸。 |
| **Toast** | 右下角；成功 3 秒自動消失，錯誤需手動關閉。 |
| **Sidebar** | 240px；群組標題 `caption` + `text-tertiary`；項目高 36px、`rounded-md`；選取為主題色 8% 底（`bg-accent/8`）+ 主題色文字 + 字重 500。 |
| **Tabs** | 底線式；選取為 `text` + 2px 主題色底線，未選 `text-secondary`。 |
| **Radio** | 用 `ui/radio` 的 `Radio`／`RadioField`（原生 `<input type="radio">`，16px 圓點、`accent` 主色 `primary`、focus 2px `accent` 外框、disabled 40% 透明）：保留圓點外觀，不改成分段按鈕；`RadioField` 以 `<label>` 包覆使點文字可選，`onChange(event, value)` 對齊 MUI `RadioGroup` 簽名（只讀 `event.target.value` 的 handler 亦相容）。同組必須給相同 `name`，互斥、方向鍵移動＋選取、Tab 只停已選／第一顆、空白鍵選取皆由原生行為保留；未選狀態以 `checked` 皆 false 表示，不以空字串另設狀態。 |
| **Empty / Loading** | 一律用 `EmptyState`、`Skeleton` 元件，不得各頁自寫。不定值載入轉圈用 lucide `LoaderCircle`＋`animate-spin`＋`strokeWidth={1.75}`：置中大圈 `h-10 w-10 text-accent`（對原 MUI `CircularProgress` 預設 40px 與主題色）、欄位小圈依原尺寸（如 20px），原置中容器與間距不動；定值進度（線／圓＋%）另案，不以轉圈冒充。 |

## 7. 文案

- 使用繁體中文、動詞開頭的按鈕：「新增帳單」「儲存」「匯出」。
- 金額：`NT$ 1,234`；日期：`2026/10/18`；時間：`14:05`。**同一個畫面的所有金額格式一致**（千分位＋NT$），不要只有部分欄位有。
- 彈出層預設的英文（例如 MUI 的「No options」「Loading…」）要改成中文。
- 錯誤訊息說清楚原因與下一步，不顯示技術代碼給使用者。

## 8. 圖示

- 使用 `lucide-react`，線寬 1.75，尺寸 16 / 20。
- 不混用其他圖示庫；舊的 `@mui/icons-material` 隨頁面改版移除。

## 9. 無障礙

- 文字對比 ≥ 4.5:1；所有可點元素有可見 focus 樣式；觸控目標 ≥ 40px。
- 圖示按鈕必須有 `aria-label`。

## 10. 遷移規則（MUI → Tailwind + shadcn）

1. Tailwind 關閉 `preflight`（`corePlugins.preflight: false`），避免在遷移期間破壞仍使用 MUI 的頁面；全部遷移完成後再開啟。
2. 新元件一律放 `src/ui/`；頁面不得直接 import `@mui/*`（已遷移的頁面）。
3. **一頁一個 PR**：只改 JSX 與樣式，資料取得（Apollo query / mutation）、Redux、hooks、驗證邏輯原封不動；PR 說明需列出「未變更的邏輯」。
4. 每頁遷移後在預覽環境（接測試後端）驗收：功能逐項點過、與舊版比對欄位與數字一致。
5. 全部頁面完成後：移除 MUI、emotion、jss 相依套件與 `src/theme/`。
6. **`.ui-root`**：preflight 關閉，基礎樣式（box-sizing、邊框重置、字型）只作用在 `.ui-root` 之內。`ui` 元件放在 **MUI Dialog／Popper 等 Portal 內**時不在頁面的 `.ui-root` 底下，外層要自己加 `ui-root`（`ui/accordion`、`ui/native-select`、`ui/toggle-group` 已自帶）。
7. **版面不可靠擠壓或超出**：欄位列用 `flex-wrap` 換行，不要讓操作鈕被推出可視範圍；flex 子層加 `min-width:0`／`max-width:100%`，並扣掉 `margin`；`overflow-x:auto` 會裁掉上方溢出的內容（浮動標籤），所以標籤才統一放上方。
8. **層級（z-index）**：手機頂／底列 1100；側欄 1190/1200；MUI modal／popper 與 Radix Dialog 1300；Radix select／popover／dropdown 與 MUI snackbar 1400；toast 與 MUI tooltip 1500；底部固定合計列 1050。
9. **驗證**：每次改動跑 `scripts/redesign/verify-logic.js`（FAIL 必須逐項說明是純畫面差異）、`eslint-check.json`（0 新增 error）、`CI=true npm run build`，測試不得有新增失敗（基準 13 個既有失敗）。
10. **MUI Typography 字級映射**（以 `src/ui/mui-theme.js` 橋接字級為準，對照 §3）：`h1`→`text-display`、`h3`→`text-title`、`h5`→`text-heading`、`subtitle1`→`text-body font-medium`、`subtitle2`→`text-label`（色 `text-text-secondary`）、`body1`→`text-body`、`caption`→`text-caption`（色 `text-text-secondary`）、`overline`→`text-caption font-medium`（色 `text-text-secondary`、不全大寫）；主色用 `text-text`、`color="textSecondary"` 改 `text-text-secondary`。`h2`（24px）、`h4`（18px）、`h6`（15px）、`body2`（13px/20px/400）在 §3 無對應級距，**不硬套**，留原 Typography 或另案拍版；`gutterBottom` 以 `mb-[0.35em]` 保留。`Box` 純排版改原生 div（系統 props 逐鍵轉 className/style）；`Paper` 改 `rounded-md bg-background` 原生 div（橋接主題 elevation 預設 0、paper 底色即 background token，陰影不保留），原 emotion `css` 掛點保留。

## 11. 報表 compact 規格

Jason 2026-10-19 拍版：**所有報表樣式一致，以 compact 緊湊呈現**。範圍只限 presentation／print CSS；欄位、數字、計算、查詢、列印觸發（`window.print`、`#printMain` 等）一律不動。本節只寫「已有的能力」與「待盤點」，沒落地的不當成已實作。22 張會直接列印的報表同樣適用 compact（Jason 2026-10-19 拍版併入專項），只改樣式、不改欄位與數字，列印預覽僅唯讀確認。

### 已有能力（以 `src/ui/table.js`、`src/ui/format.js` 為準）

| 項目 | 規則 |
|---|---|
| 字級 | 只用 §3 既有級距：表格內容 `body`（14）、表頭 `label`（13）、輔助／備註 `caption`（12）；不為了塞更多資料放大或新增級距，也不使用 12px 以下。 |
| 列高與內距 | `<Table dense>`：`td`／`th` 高 32px、`td` 上下內距 4px、`td`／`th` 左右內距 8px（`px-2`）（一般表格為 44px／左右 16px）。報表一律用 `dense`；`aria-label="a dense table"` 只是字串，不等於 `dense` prop。 |
| 表頭 | `TableHeader`（`surface` 底）＋ `TableHead`（`label` 字級、`text-secondary`、不換行、底線 1px `border`）；各報表不自訂表頭顏色與字級。 |
| 數字欄 | 數字欄用 `numeric`（`TableHead`／`TableCell`）：右對齊＋`tabular-nums`。 |
| 金額 | 一律 `formatMoney`（`NT$ 1,234`，千分位）；數量用 `formatNumber`；同一畫面格式一致（§7）。 |
| 列印 | `Table` 內建 `print:`：黑色細格線、白底黑字、表頭／表尾底色透明、外框不裁切（`print:overflow-visible`）；頁面自己的 `@media print` 權重較高，仍以頁面為準。 |
| 分頁 | `TablePagination` 固定在表格下方右側。 |

### 待盤點（尚未實作，不得寫進頁面當成既有）

- `dense` 以 `Table` 層級的後代選擇器實作，**沒有** `TableHead`／`TableCell` 層級的 compact prop（水平內距 `px-2` 已於報表 compact 第一批補上，PR #20）。2026/10/19 全面複查 41 個報表目錄（詳 `docs/redesign/REPORT_COMPACT.md`）：已 compact 35 目錄（含互助點數明細與本批漏改補正），其餘 7 目錄仍用 MUI 表格（排班格線、薪資條、排行榜展開列等）與 2 個巢狀表風險頁待專批；欄寬變窄對列印版面的影響待實機列印預覽確認。
- **篩選／工具列密度**：目前沒有共用的報表工具列元件；各報表篩選列的間距、控制項高度（36px／32px）尚未統一，待盤點後訂規格。
- **列印邊界（`@page` margin）與換頁**：尚無共用規則；`thead` 跨頁重複、`tr` 避免被切斷、表尾合計只出現一次，皆待盤點現有 `initialize.scss` 列印規則後再訂，且不得動 `#printMain`／`#printThermal` 與 `className` 含 `print` 的元素。
- 各報表目前仍有 MUI Table 與自訂 CSS 混用；逐目錄改為 `ui/table` 時，先對照舊版欄位與數字一致（§10 第 4 點）。

## 12. 設定頁樣板（OpenAI 設定頁式，Jason 2026/10/19 拍版）

Jason 提供 OpenAI「安全性與登入」截圖拍版：**設定類頁面**比照其設計語言統一。本節只適用設定類（系統參數、個人檔案內的設定分頁、業績／抽成參數等），**報表、帳單四兄弟、列印頁不適用**——那些維持 §11 compact 與既有合計／列印規範，不得因本節改成寬鬆留白。

### 版面（共用元件 `src/ui/settings-nav.js`）

| 部位 | 規則 |
|---|---|
| 頁首 | 沿用 `PageHeader`（頁面標題一個）；不在右側內容區再重複大標題。 |
| 左選單（桌機 `md` 以上） | 頁內窄選單寬 `w-60`（240px）、`sticky top-6`；項目高 36px、`rounded-md`、左圖示 16px（lucide）＋標籤；未選 `text-secondary`＋hover `surface-hover`；選中比照 §6 Sidebar：`bg-accent/8`＋`text-accent`＋字重 500。**不用截圖的粉紅色**，開關與選取一律既有品牌藍 token。 |
| 左選單（手機） | 不做第二套側欄：退回頁面頂部橫向可捲動的分頁列（底線式，與 `ui/tabs` 既有呈現一致），避免 390px 擠壓；觸控目標仍 ≥40px 由分頁列高度承擔。 |
| 右內容 | `min-w-0 flex-1`；先一段分段標題（`heading`，即目前分類名），其下既有卡片以 `gap-6` 直疊。每張卡片沿用 §6 Card（`rounded-lg`、1px `border`、`bg-background`、內距 20px、無陰影）；卡片內每列維持「標題／說明在左、控制在右」的既有表單結構，本樣板不發明新欄位列元件。 |
| 容器寬度 | 有頁內左選單的設定頁容器上限 `max-w-6xl`（選單 240＋內容約 880），內容卡片內的欄位寬度維持各頁既有值；無頁內選單的表單頁仍依 §4 `max-w-3xl`／設定頁 `max-w-4xl`。 |

### 紅線

1. 只改版面結構／呈現：分頁欄位 `value`、切換 handler、表單欄位存值、儲存 handler、權限判斷、開關 `checked`／`onChange` 一字不動；分頁沿用 `ui/tabs`（含 `activationMode="manual"` 等既有轉接），`settings-nav` 只提供選單 className，不自帶狀態。
2. 截圖的右側箭頭／數值／粉紅開關只是版式參考：bos3.0 不新增假連結列；既有可點列才可點，開關沿用 `ui/switch` 品牌色，不換色。
3. 推廣方式：先做 1–2 頁樣板給 Jason 看，確認後才逐頁（一頁一 PR）推廣到其他設定頁；未確認前不得宣稱設定類已全數統一。

### 推廣紀錄

- 2026/10/19 Jason 確認 Parameter 樣板（回覆「可以」）後，推廣第一批（`claude/ui-settings-promo1-box`）：
  - `/performanceDeductionParameter`：本頁原無頁級分頁、四區直疊（盤點文件寫 Tabs 與現況不符，已更正）。新增純呈現的分類選單（服務扣項方式命名／人員身分類別／抽成方式設定／互助點數設定），各區以 `hidden` 保留掛載、不卸載，避免切換時編輯中欄位的 local state 被重置；子元件 props 與儲存 handler 全原樣。
  - `/profile/:tab`：僅設定性分頁（基本資料 `general`／密碼設定 `security`／功能釘選 `pinnedTable`）套左選單＋`max-w-6xl`＋分段標題，選單仍列全部有權限分頁、不刪導覽；其餘個人報表分頁維持原 `max-w-[1200px]`＋頂部分頁＋compact，本批不套。
  - `/deduction-setting` 與 `/update-deduction-setting/:id` **本批跳過**：兩頁皆為單一卡片表單、卡內已有動態屬性分頁，且含 `min-w-[995px]` 的抽成門檻寬表；套左選單只剩單一項目（等於假選單）且會擠壓寬表，故維持原版面，日後如要處理只依 §4 表單頁容器另批評估，不在本樣板批硬套。
- 2026/10/19 推廣第二批（`claude/ui-settings-promo2-box`，v3.0-1019-2305）：
  - `/accountingSetting`：本頁原無頁級分頁、三區直疊（收入科目／支出科目／收付方式），比照第一批 Parameter 新增純呈現分類選單＋右分段標題＋`max-w-6xl`；三區以 `hidden` 保留掛載不卸載，全域「儲存」鈕仍一次存三區，`handleSave` 與各欄位 handler／存值一字未動。原收入／支出桌機並排改為選單切換分區呈現。
  - `/helper-point-setting-create` 與 `/helper-point-setting-edit/:id`：兩頁皆單一表單、無真分頁，不造假選單；原單卡依既有三區塊（設定名稱／點數使用成本／點數獲得）切成三張分段卡片直疊，容器維持 `max-w-3xl`；欄位、`ToggleGroup` 切換、增刪列與建立／儲存 handler 全原樣，Create／Edit 孿生差異保留不互相照抄。
  - `/authority` **本批跳過**：角色權限管理為單一清單卡＋`min-w-[700px]` 寬表，無表單分區；套左選單只剩單一項目屬假選單且會擠壓寬表，故維持原清單版面（compact），日後如改版走清單／表格規範另案，不在本樣板批硬套。


## 13. 【已作廢】PrimeStay 版式語言

> 本章已作廢：#151 PrimeStay 全站地基已於 2026/10/19 依 Jason 指示退回（v3.0-1019-2344），全站回到 Jason 發 PrimeStay 參考圖之前、即 #150 合併後（v3.0-1019-2301 當時）的外觀。不得再依本章的淺灰底、白卡大圓角、側欄白 pill、`shadow-card` 等規格做任何頁面；現行規格一律回到 §2／§6。#152 Radio、#153 Tooltip、#154 設定頁推廣（§12）不受影響、保留不動。
