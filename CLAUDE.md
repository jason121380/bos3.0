# CLAUDE.md — BOS 3.0 前端工作守則

BOS 3.0 是美業 ERP 的純前端 SPA（Vite 5 + React 17 + Apollo GraphQL + Redux Toolkit；2026/10/20 由 CRA 改為 Vite，單元測試仍用 react-scripts 的 Jest）。畫面已從 MUI 改版為 **Tailwind + `src/ui/`（shadcn/Radix 風格）**；MUI 套件已於 2026/10/20 全數移除，尚未重新設計的舊頁面以 `src/ui/*-compat` 相容元件（輸出 MUI 同名 class）維持原樣。日期時間一律以**台灣時間**計算與顯示（見架構速記）。回覆一律使用專業、清楚的**繁體中文**。

## 文件地圖

| 文件 | 看什麼 |
|---|---|
| `STYLE.md` | 設計規範（色彩、字型、元件、文案、遷移規則）——所有新畫面的唯一依據 |
| `docs/redesign/TODO.md` | **待辦清單**（已完成／待實機／待 Jason 決定） |
| `docs/redesign/STATUS.md` | 改版進度與刻意不改的項目 |
| `docs/redesign/MEMORY.md` | 決策與教訓（為什麼這樣做、踩過的坑） |
| `docs/redesign/MIGRATION_GUIDE.md` | 把頁面的 MUI 換成 `src/ui/` 的步驟與鐵則 |
| `docs/redesign/VERIFY_REPORT.md` | 驗證方式與測試基準 |
| `README.md` | 專案總覽、環境變數、API、時區、路由、部署 |

## 鐵則（違反就不要 commit）

1. **只改畫面（JSX 與樣式）**。不得更動 API 呼叫、GraphQL query／mutation、Redux、hooks、state、handler、欄位、驗證、權限、金額與日期運算。畫面以外的修正（bug、部署設定、套件、時區等）必須由 Jason 在當次對話中明確同意後才做，並在 PR 說明寫清楚。
2. **列印範本不動**：`#printMain`、`#printThermal`、會被 `innerHTML` 複製到列印視窗的區塊、`className` 含 `print` 的元素。
3. 保留所有 `data-testid`、`id`、`name`、`ref`、`key`、`aria-*`。
4. 後端 repo `beautyos_api`、`beautyos_merchant` **唯讀**，不要動。
5. **不要建立、送出或儲存真實帳單／資料**；測試用模擬後端（mock GraphQL），不連真實資料。
6. 只在指定分支開發與推送；合併流程見下方「Git 與合併」。

## 常用指令

```bash
npm install --legacy-peer-deps       # 必須加 --legacy-peer-deps（CI／Docker 用 npm ci --legacy-peer-deps）
npm start                            # 開發（Vite，http://localhost:3000）
npm run build                        # 正式 build（Vite，輸出 build/；可用 BUILD_PATH 改輸出位置）
npm run lint:build                   # 等同原 CRA build 內建的 ESLint（react-app/base，0 warning）
CI=true npm run test:nowatch         # 全部單元測試（基準：52 檔／277 測試全數通過）
TZ=America/Los_Angeles CI=true npm run test:nowatch   # 時區相關修改要另在海外時區跑一次
CI=true npm run test:coverage        # 覆蓋率（門檻為現況下限＋金額／API 模組逐檔門檻，見 package.json）
npx eslint --no-eslintrc -c scripts/redesign/eslint-check.json <檔案…>
node scripts/redesign/verify-logic.js [--base <ref>] <檔案…>   # 純畫面驗證
```

驗證標準：`verify-logic` 的 FAIL 必須逐項說明是純畫面差異；eslint 0 新增 error；`lint:build` 通過且 build 成功；測試**必須全數通過**。動到 `package.json` 相依時，另在乾淨資料夾跑一次 `npm ci --legacy-peer-deps` 確認 lockfile 同步。

## Git 與合併

- 功能分支以當次 session 指定的為準（例如 `claude/pensive-fermi-v6ufcq`、`claude/upbeat-carson-pdc7rf`）；PR 範本在 `.github/PULL_REQUEST_TEMPLATE.md`（沿用其標題結構）。
- **使用者已指示「always merge」**：一批工作做完且驗證通過（build 成功、測試全過），就開 PR 並 merge 進 `main`（merge commit），不必再問。驗證沒過就停下來回報，不硬 merge。
- **可能有多個 session 同時開發**：合併前一定先 `git fetch origin main` 並 merge 進自己的分支，重跑 lint／測試／build 再合併；衝突逐一解，不覆蓋對方的內容。`MEMORY.md` 的教訓編號、`TODO.md` 的條目合併後要檢查重號，後到者順延編號並同步文件內的引用。
- PR 開啟後 Codex 會自動 review：等它完成；有 finding 就驗證是否成立、修正或在討論串說明理由，再合併。GitHub Actions（`.github/workflows/node.js.yml`）目前在 GitHub 上不會執行，以本機驗證為準。
- PR 合併後，分支從最新 `main` 重置再繼續（`git fetch origin main && git checkout -B <branch> origin/main`），不在已合併的歷史上堆疊。
- 每個完整 commit 都要更新 `src/version.js` 的 `APP_VERSION`（格式 `v3.MMDDHHmm`，Asia/Taipei，例如 `v3.10210047`），commit 訊息第一行以 `[版號]` 開頭；不自行升大版號。
- Commit 訊息遵守 Angular 格式；沒有 `gh`，PR 用 GitHub MCP 工具。
- 部署：合併進 `main` 後由 Cloud Build 以 Dockerfile 建置（`npm ci` → `npm run build` → `serve@14`），不要在 cloudbuild 另加 yarn 步驟。

## 架構速記

- `src/ui/`：新元件（Button、Input／Field、Select、NativeSelect、Table、Card、Dialog、Accordion、ToggleGroup、Switch、Checkbox、Badge、Avatar、Stat、Toast、Popover、DropdownMenu、Sidebar、PageHeader、EmptyState…）與 `icons`（lucide 轉接層）、`*-compat`（舊頁面用、輸出 MUI 同名 class 的相容元件，MUI 套件已移除）、`format`（`formatNumber`／`formatMoney`）。
- `src/styles/tokens.css`：CSS 變數 tokens＋`.ui-root` 基礎層（preflight 關閉）；淺色文字與狀態色已調到 WCAG AA。
- `src/lib/api-base.js`：後端位址單一來源（GraphQL、WebSocket、REST outer_store、Sentry environment 都從這裡取）；不要在頁面寫死網址。
- `src/lib/init-apollo.js`：Apollo client 單例；errorLink 統一提示 GraphQL／網路錯誤（`TKN_ERROR` 導回登入）。
- `src/lib/business-timezone.js`＋`install-business-timezone.js`（在 `src/index.js` 最早載入）：裝置不在 UTC+8 時把全域 `Date` 與 `Intl.DateTimeFormat` 換成台灣時間；date-fns、日期選擇器與所有顯示因此自動以台灣時間運作，新程式照常用 date-fns 即可。
- `src/elements/snackbars.js`：`openSnackbar` 全站提示（右下角 toast；錯誤需手動關閉；確認型 variant 畫成對話框）。
- `src/components/PageErrorBoundary.js`：Dashboard 內容區的錯誤邊界（單頁出錯只顯示錯誤畫面，側欄可用）；`SlotPortal.js`：TopBar／NavBar 互相把按鈕畫進對方插槽（切換店家、搜尋選單）。
- `src/layouts/Dashboard/`：側欄頂列（Logo、版號、搜尋鈕、訂單佇列鈴鐺、收合）、選單、底部（深淺色切換、切換店家、登出）。
- `src/views/OrderCreate/`：打帳單。`orderRequirements.js` 與 `Header.js` 的 `valid` 同步（有測試比對）；`RowAction.js` 是項目列的圖示鈕與「新增項目」。
- `src/helper/`：`billVerify`、`helperDeduction`、`giveBonus`、`truncateDecimal`（卡券金額無條件捨去）、`dailyUnlock`（鎖定日期 23:59 解除）等，皆有單元測試。
- `scripts/redesign/compat-harness/`：MUI 相容層的 computed style 比對頁（MUI 需臨時 `npm i --no-save` 安裝，用法見 `build.js` 檔頭）。
- `scripts/redesign/`：verify-logic／verify-style-only／verify-imports-only、tokenize-colors、swap-icons、page-checklist、portal-root-scan、inventory-scan（改版盤點數字，口徑見 `docs/redesign/TODO.md` §三）。

## 踩雷清單

- **`ui` 元件放在 MUI Dialog／Popper（Portal）內要有 `.ui-root`**，否則沒有 box-sizing／邊框重置（8 個 `ui` 元件已自帶 `ui-root`，`portal-root-scan` 為 0；新增 `ui` 元件要記得自帶）。
- Radix Dialog 會把 body 設 `pointer-events:none`，與相容層 Dialog（`ui/modal-compat`）的焦點鎖互搶；Dialog 內有 Autocomplete／Select／日期選擇器時用 `ui/modal-compat` 的 Dialog。
- emotion 已於 2026/10/20 全面移除（MEMORY #163）：樣式一律用 Tailwind className；共用元件的 `className` 是字串直通（`cn` 合併）。`ui/icons` 預設尺寸在 `src/ui/icons.css`（同權重、排在 Tailwind 之後），頁面要覆蓋圖示尺寸需加 `!`。
- flex 子層沒有 `min-width:0`／`max-width:100%` 會被內容撐寬；欄位列要 `flex-wrap`。
- `overflow-x:auto` 會裁掉上方溢出內容（浮動標籤），因此標籤統一放欄位上方。
- MUI Autocomplete：沒有選項／載入中時 `aria-expanded=false` 但彈出層可見（MUI 行為）；選項標籤相同會造成重複 key，要自己給 `key`。
- 讀查詢結果前先防呆：API 失敗時 `data` 為 undefined，直接 `.filter`／`.map` 會讓整頁拋錯（版面層已加防呆與錯誤邊界，頁面層仍要注意）。
- `.then(fn, openSnackbar(...))` 的第二參數會在送出當下就執行；成功後才做的事一律寫在第一個 callback 內。
- 時區：沒有時區的日期時間字串一律照字面當台灣時間解讀，只有日期的 ISO 字串（`2026-10-21`）依規格是 UTC 午夜；要表示台灣某一天的開始用 `new Date(年, 月-1, 日)` 或 date-fns，不要自己加減時差。改 `business-timezone.js` 要在有日光節約的時區（`TZ=America/Los_Angeles`、`America/Santiago`）跑測試（MEMORY #169）。
- Playwright 的 headless Chromium 畫不出捲軸，捲軸類修正只能看 CSS 規則，需在真實瀏覽器確認。驗證時區可用 `browser.newContext({ timezoneId })` 與 `page.clock.install({ time })`。
- 背景伺服器用 PID 關閉：命令列本身含相同字串時 `pgrep -f`／`pkill -f` 也會抓到自己的 shell；用 `ps -eo pid,args | awk '/pattern/ && !/awk/'` 取 PID。dev server 啟動前清 log，啟動後用 `curl` 確認。
- 截圖測試需 `NODE_PATH=/opt/node-tools/node_modules`，GraphQL 以 `page.route('**/graphql', …)` 回假資料、外部網域一律 abort。
