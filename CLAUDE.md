# CLAUDE.md — BOS 3.0 前端工作守則

BOS 3.0 是美業 ERP 的純前端 SPA（CRA5 + React 17 + Apollo GraphQL + Redux Toolkit）。目前正在把畫面從 MUI 改版為 **Tailwind + `src/ui/`（shadcn/Radix 風格）**。回覆一律使用專業、清楚的**繁體中文**。

## 文件地圖

| 文件 | 看什麼 |
|---|---|
| `STYLE.md` | 設計規範（色彩、字型、元件、文案、遷移規則）——所有新畫面的唯一依據 |
| `docs/redesign/TODO.md` | **待辦清單**（已完成／接下來做什麼） |
| `docs/redesign/STATUS.md` | 改版進度與刻意不改的項目 |
| `docs/redesign/MEMORY.md` | 決策與教訓（為什麼這樣做、踩過的坑） |
| `docs/redesign/MIGRATION_GUIDE.md` | 把頁面的 MUI 換成 `src/ui/` 的步驟與鐵則 |
| `docs/redesign/VERIFY_REPORT.md` | 驗證方式與測試基準 |
| `README.md` | 專案總覽、環境變數、API、路由、部署 |

## 鐵則（違反就不要 commit）

1. **只改畫面（JSX 與樣式）**。不得更動 API 呼叫、GraphQL query／mutation、Redux、hooks、state、handler、欄位、驗證、權限、金額與日期運算。
2. **列印範本不動**：`#printMain`、`#printThermal`、會被 `innerHTML` 複製到列印視窗的區塊、`className` 含 `print` 的元素。
3. 保留所有 `data-testid`、`id`、`name`、`ref`、`key`、`aria-*`。
4. 後端 repo `beautyos_api`、`beautyos_merchant` **唯讀**，不要動。
5. **不要建立、送出或儲存真實帳單／資料**；測試用模擬後端（mock GraphQL），不連真實資料。
6. 只在指定分支開發與推送；合併流程見下方「Git 與合併」。

## 常用指令

```bash
npm install --legacy-peer-deps       # 必須加 --legacy-peer-deps
npm start                            # 開發（craco start）
CI=true npm run build                # 正式 build（警告視為錯誤，與 CI 相同）
CI=true npm run test:nowatch         # 全部單元測試（基準：32 檔／136 測試全數通過）
npx eslint --no-eslintrc -c scripts/redesign/eslint-check.json <檔案…>
node scripts/redesign/verify-logic.js [--base <ref>] <檔案…>   # 純畫面驗證
```

驗證標準：`verify-logic` 的 FAIL 必須逐項說明是純畫面差異；eslint 0 新增 error；build 成功；測試**必須全數通過**（原 13 個既有失敗已於 PR #5 與 2026/10/19 產品決策改寫後清零）。

## Git 與合併

- 功能分支 `claude/upbeat-carson-pdc7rf`；PR 範本在 `.github/PULL_REQUEST_TEMPLATE.md`（沿用其標題結構）。
- **使用者已指示「always merge」**：一批工作做完且驗證通過（build 成功、測試無新增失敗），就開 PR 並 merge 進 `main`（merge commit），不必再問。驗證沒過就停下來回報，不硬 merge。
- PR 合併後，分支從最新 `main` 重置再繼續（`git fetch origin main && git checkout -B <branch> origin/main`），不在已合併的歷史上堆疊。
- 每個完整 commit 都要更新 `src/version.js` 的 `APP_VERSION`（`v3.0-MMDD-HHmm`，Asia/Taipei），commit 訊息第一行以 `[版號]` 開頭；不自行升大版號。
- Commit 訊息遵守 Angular 格式；沒有 `gh`，PR 用 GitHub MCP 工具。
- CI：Node 20.12.1 + `npm ci --legacy-peer-deps`；Build 與 Unit tests 兩個獨立 job。

## 架構速記

- `src/ui/`：新元件（Button、Input／Field、Select、NativeSelect、Table、Card、Dialog、Accordion、ToggleGroup、Switch、Checkbox、Badge、Avatar、Stat、Toast、Popover、DropdownMenu、Sidebar、PageHeader…）與 `icons`（lucide 轉接層）、`mui-theme`（MUI 橋接主題）、`format`（`formatNumber`／`formatMoney`）。
- `src/styles/tokens.css`：CSS 變數 tokens＋`.ui-root` 基礎層（preflight 關閉）。
- `src/views/OrderCreate/`：打帳單。`orderRequirements.js` 與 `Header.js` 的 `valid` 同步（有測試比對）；`RowAction.js` 是項目列的圖示鈕與「新增項目」。
- `scripts/redesign/compat-harness/`：MUI 相容層的 computed style 比對頁（MUI 與相容層並排渲染、逐元素比對；用法見檔頭）。
- `scripts/redesign/`：verify-logic／verify-style-only／verify-imports-only、tokenize-colors、swap-icons、page-checklist、portal-root-scan、inventory-scan（改版盤點數字，口徑見 `docs/redesign/TODO.md` §三）。

## 踩雷清單

- **`ui` 元件放在 MUI Dialog／Popper（Portal）內要有 `.ui-root`**，否則沒有 box-sizing／邊框重置（8 個 `ui` 元件已自帶 `ui-root`，`portal-root-scan` 為 0；新增 `ui` 元件要記得自帶）。
- Radix Dialog 會把 body 設 `pointer-events:none`，與 MUI Dialog 的 focus trap 互搶；Dialog 內若有 MUI Autocomplete／Select／DatePicker 就保留 MUI Dialog。
- emotion `css` prop 與 Tailwind class 同權重，先後順序不可靠：要隱藏用 inline style；`css={…}` 傳給元件時要扣掉 margin 以免超出。
- flex 子層沒有 `min-width:0`／`max-width:100%` 會被內容撐寬；欄位列要 `flex-wrap`。
- `overflow-x:auto` 會裁掉上方溢出內容（浮動標籤），因此標籤統一放欄位上方。
- MUI Autocomplete：沒有選項／載入中時 `aria-expanded=false` 但彈出層可見（MUI 行為）；選項標籤相同會造成重複 key，要自己給 `key`。
- Playwright 的 headless Chromium 畫不出捲軸，捲軸類修正只能看 CSS 規則，需在真實瀏覽器確認。
- `pkill -f` 會殺到自己的 shell，用 `pgrep -f "[x]…"`；dev server 記得清 log 再啟動，並用 `curl` 確認真的起來。
- 截圖測試需 `NODE_PATH=/opt/node-tools/node_modules:<repo>/node_modules`，後端用 mock（`http://127.0.0.1:9/graphql`）。
