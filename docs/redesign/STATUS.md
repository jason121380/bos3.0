# BOS 3.0 改版進度

> 更新：2026/10/18　分支：`claude/upbeat-carson-pdc7rf`　規範：根目錄 `STYLE.md`

## 已完成

| 範圍 | 內容 |
|---|---|
| 基礎 | Tailwind（preflight 關閉）、tokens、`src/ui/` 元件（Button、Input、Select、Table、Dialog、Badge、Card、Tabs、Toast、EmptyState、Skeleton、Checkbox、Popover、DropdownMenu、Sidebar、PageHeader、Toolbar） |
| 骨架 | 側欄、頁首、登入／錯誤頁外框；全站 MUI 橋接主題（`src/ui/mui-theme.js`） |
| 完整改版（第二層） | 打帳單、帳單列表、報表目錄 |
| 共用元件 | DateSelector（精簡版）、TableEditBar（浮動操作列）、MerchantSearchBar、AdminPageHeader、PageTitle |
| 第一層外觀統一 | 後台全部頁面：樣式物件與 inline style 的舊色碼改為 tokens、移除藍色左條（工具：`scripts/redesign/`） |

## 兩個層次

- **第一層（外觀）**：已涵蓋全部後台頁。靠橋接主題＋色碼 token 化，畫面與新規範一致；程式結構不變（AST 驗證）。
- **第二層（元件）**：把頁面中的 MUI 換成 `src/ui/`，達成 STYLE.md §10「已遷移頁面不得 import @mui」。目前完成 3 頁，其餘逐頁進行。

## 尚未處理

1. 第二層元件替換：其餘約 155 頁（`src/views` 仍有 614 個檔案引用 `@mui`）。
2. 約 355 處寫死色碼刻意保留：列印範本（列印視窗讀不到 CSS 變數）、圖表與行事曆的資料色、LINE 品牌綠等。
3. 顧客端 11 頁（`layouts/Customer`）：獨立一批，需另做手機版設計。
4. 舊版 `elements/snackbars` 尚未換成 `ui/toast`。
5. 全部完成後：開啟 Tailwind preflight、移除 MUI／emotion／jss 與 `src/theme/`。

## 驗收方式

- 本機 `npm start`（`.env.development.local` 指向測試機 crt-test）。
- 每次第一層批次：`node scripts/redesign/verify-style-only.js <檔案>` 必須全部通過。
