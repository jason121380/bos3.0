# BOS 3.0 設計規範（STYLE.md）

> 方向：現代、簡約、清楚。參考 OpenAI 產品介面的克制感——大量留白、中性色、黑白為主、單一強調色、極少陰影。
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
| `--background` | `#FFFFFF` | `#0D0D0D` | 頁面底色 |
| `--surface` | `#F9F9F9` | `#171717` | 側欄、次要區塊、表頭 |
| `--surface-hover` | `#F3F3F3` | `#212121` | 列 hover、選單 hover |
| `--border` | `#E5E5E5` | `#2E2E2E` | 所有邊框、分隔線 |
| `--text` | `#0D0D0D` | `#ECECEC` | 主要文字 |
| `--text-secondary` | `#5D5D5D` | `#B4B4B4` | 說明、標籤、欄位名 |
| `--text-tertiary` | `#8F8F8F` | `#8F8F8F` | placeholder、停用 |
| `--primary` | `#0D0D0D` | `#ECECEC` | 主要按鈕、選取狀態 |
| `--primary-foreground` | `#FFFFFF` | `#0D0D0D` | 主要按鈕文字 |
| `--accent` | `#10A37F` | `#10A37F` | 唯一強調色：連結、焦點框、進度 |
| `--success` | `#10A37F` | `#19C37D` | 成功、已付款 |
| `--warning` | `#B7791F` | `#F0B429` | 待處理、即將到期 |
| `--danger` | `#D92D20` | `#F97066` | 錯誤、刪除、退款 |

規則：
- 狀態色只用在 **Badge、圖示、細邊框**，不做大面積底色；底色一律用該色 8% 透明度（`bg-success/8`）。
- 一個畫面最多一個 `primary` 實心按鈕。

## 3. 字型

- 字體：`Inter`（英數）＋ `"Noto Sans TC"`（中文），後備 `system-ui, -apple-system, "PingFang TC", sans-serif`。
- 數字一律加 `font-variant-numeric: tabular-nums`（Tailwind `tabular-nums`）。

| 名稱 | 大小 / 行高 | 字重 | 用途 |
|---|---|---|---|
| `display` | 28 / 36 | 600 | 儀表板大數字 |
| `title` | 20 / 28 | 600 | 頁面標題（每頁一個） |
| `heading` | 16 / 24 | 600 | 區塊標題、卡片標題 |
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
| **Button** | 變體只有 `primary`（黑底白字、圓角 full）、`secondary`（白底、border）、`ghost`（無框）、`danger`；尺寸 `sm 32px / md 36px / lg 40px`。圖示 16px，與文字間距 6px。 |
| **Input / Select / DatePicker** | 高 36px、`rounded-md`、1px border；focus 為 2px `accent` 外框。錯誤時 border 變 `danger`，下方 caption 顯示訊息。 |
| **Form** | 標籤在上；必填以「*」標在標籤後；一列最多 2 欄（桌機）。底部固定動作列：右側「取消 / 儲存」。 |
| **Table** | 表頭 `surface` 底、`label` 字級；列高 44px；hover `surface-hover`；數字欄右對齊；空狀態置中顯示說明＋主要動作。分頁固定在表格下方右側。 |
| **Badge** | 狀態專用；文字＋8% 底色；不加邊框陰影。 |
| **Card** | `rounded-lg`、1px border、內距 20px；標題用 `heading`。 |
| **Dialog** | 寬 480 / 640 / 800；標題、內容、底部動作三段；危險操作需二次確認並寫出後果。 |
| **Toast** | 右下角；成功 3 秒自動消失，錯誤需手動關閉。 |
| **Sidebar** | 240px；群組標題 `caption` + `text-tertiary`；項目高 36px、`rounded-md`；選取為 `surface-hover` + 字重 500。 |
| **Tabs** | 底線式；選取為 `text` + 2px 底線，未選 `text-secondary`。 |
| **Empty / Loading** | 一律用 `EmptyState`、`Skeleton` 元件，不得各頁自寫。 |

## 7. 文案

- 使用繁體中文、動詞開頭的按鈕：「新增帳單」「儲存」「匯出」。
- 金額：`NT$ 1,234`；日期：`2026/10/18`；時間：`14:05`。
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
