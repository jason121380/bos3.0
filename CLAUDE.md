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
npm run lint:build                   # 等同原 CRA build 內建的 ESLint（react-app/base＋react-hooks/rules-of-hooks 為 error，0 warning）
CI=true npm run test:nowatch         # 全部單元測試（基準：63 檔／341 測試全數通過）
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
- `src/lib/init-apollo.js`：Apollo client 單例；errorLink 統一提示 GraphQL／網路錯誤（`TKN_ERROR` 導回登入）；`inflightLink` 只計數進行中的查詢（給 `after-first-load` 用）。client 為 `@apollo/client` 3（2026/10/21 自 apollo-boost 換版、舊套件已移除，實驗報告 `docs/redesign/APOLLO_V3_EXPERIMENT.md`）；`createApolloClient` 不開 `notifyOnNetworkStatusChange`（refetch 的 loading 行為與 v2 相同，有測試）。
- `src/lib/business-timezone.js`＋`install-business-timezone.js`（在 `src/index.js` 最早載入）：裝置不在 UTC+8 時把全域 `Date` 與 `Intl.DateTimeFormat` 換成台灣時間；date-fns、日期選擇器與所有顯示因此自動以台灣時間運作，新程式照常用 date-fns 即可。
- `src/lib/theme-mode.js`：深淺色模式。依使用者記住主題、版面掛載時（繪製前）套用；舊版全域樣式 `initialize(-dark).scss` 以 `?inline` 字串放進同一個 `<style>`，切換時替換內容，不必重新整理。不要再用 `import('…scss')` 直接載入這兩檔。
- `src/lib/polyfills.js`：只補 Safari 14／Chrome 87 缺少、而程式實際用到的功能（目前只有 `structuredClone`）；不再載入整包 core-js。
- `src/lib/uuid.js`：列表 key／暫存 id 用的 v4 UUID（`import uuid from 'lib/uuid'`，用 `crypto.getRandomValues`；2026/10/21 取代 `uuid` 套件，有測試）。不要再安裝 `uuid` 套件；單元測試的 `crypto` 由 `setupTests.js` 補 Node webcrypto。
- `src/lib/immer-config.js`（`src/index.js` 最早載入）：immer 2026/10/21 自 7 升到 9（關掉 critical 漏洞、與 Redux Toolkit 共用同一份），但維持 immer 7 的凍結行為——開發／測試凍結 `produce` 結果、正式環境不凍結，升版不新增拋錯路徑（有測試）。
- `src/lib/after-first-load.js`：`useAfterFirstLoad()` 在首屏完成（load 後、沒有查詢在等回應、頁面程式不在下載中〔Dashboard 的 Suspense 佔位用 `useHoldFirstLoad()` 計入〕、瀏覽器空閒）才回傳 true；版面的系統公告、訂單佇列、釘選頁、切換店家清單以 `skip: !afterFirstLoad` 延後。版面要新增查詢時，先判斷是不是首屏必要（選單權限、選單設定是必要）。
- `src/elements/snackbars.js`：`openSnackbar` 全站提示（右下角 toast；錯誤需手動關閉；確認型 variant 畫成對話框）。錯誤／警告提示自動經 `src/lib/friendly-error.js` 把英文技術訊息（500、資料格式錯誤、程式例外）換成「原因＋下一步」的中文，中文業務訊息原樣；errorLink 的狀態碼文案也用同一份（`httpStatusMessage`）。頁面 catch 照常傳 `error.message` 即可。
- `src/components/ReservationCalendar/`：預約週曆共用。`weekCalendar.js`（`tidyWeekCalendar`／`buildWeekCalendar`：色塊、可預約人數、重疊並排、公休、跨日拆段，單週預約紀錄／個人頁／員工資料共用，有單元測試）、`DesignerWeekReservation/`（個人頁與員工資料的整頁週曆，同一份）、`HolidayEdit.js`（四個預約頁的公休彈窗）。單日預約紀錄的版面不同，只共用 `HolidayEdit`。
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
- `overflow-x:auto` 會連帶裁掉上下溢出內容（浮動標籤、外側焦點框），因此標籤統一放欄位上方；捲動容器內的元件焦點框用 `focus-visible:ring-inset`（`ui/tabs` 已內建，MEMORY #171）。
- MUI Autocomplete：沒有選項／載入中時 `aria-expanded=false` 但彈出層可見（MUI 行為）；選項標籤相同會造成重複 key，要自己給 `key`。
- 讀查詢結果前先防呆：API 失敗時 `data` 為 undefined，直接 `.filter`／`.map` 會讓整頁拋錯（版面層已加防呆與錯誤邊界，頁面層仍要注意）。
- `.then(fn, openSnackbar(...))` 的第二參數會在送出當下就執行；成功後才做的事一律寫在第一個 callback 內。GraphQL mutation 的 `.then` 沒接 `.catch` 不必補：`init-apollo` 的 errorLink 已對每個 GraphQL／網路錯誤跳提示，頁面再 catch 會重複提示；只有非 GraphQL 的 Promise（`fetch`、LIFF SDK）要自己接 catch。
- `parseInt` 一律帶 radix 10（2026/10/21 已全站補齊 182 處，`lint:build` 的 `radix` 規則未開，靠 review）。
- 時區：沒有時區的數字格式字串（`2026/10/21 10:00`、`2026-10-21T10:00`）照字面當台灣時間解讀；英文月份等其他格式仍先經裝置時區（日光節約切換時可能差一小時），不要用；只有日期的 ISO 字串（`2026-10-21`）依規格是 UTC 午夜；要表示台灣某一天的開始用 `new Date(年, 月-1, 日)` 或 date-fns，不要自己加減時差。改 `business-timezone.js` 要在有日光節約的時區（`TZ=America/Los_Angeles`、`America/Santiago`）跑測試（MEMORY #169）。
- Playwright 的 headless Chromium 畫不出捲軸，捲軸類修正只能看 CSS 規則，需在真實瀏覽器確認。驗證時區可用 `browser.newContext({ timezoneId })` 與 `page.clock.install({ time })`。
- 背景伺服器用 PID 關閉：命令列本身含相同字串時 `pgrep -f`／`pkill -f` 也會抓到自己的 shell；用 `ps -eo pid,args | awk '/pattern/ && !/awk/'` 取 PID。dev server 啟動前清 log，啟動後用 `curl` 確認。
- 新程式用到較新的瀏覽器功能（如 `structuredClone`、`Array.prototype.findLast`、`Object.hasOwn`、`crypto.randomUUID`）時，先確認 Safari 14 是否支援；不支援就在 `lib/polyfills.js` 補，或改寫法（2026/10/21 起不再載入整包 core-js）。
- 元件一律大寫開頭（不要 `const index = () =>`），自訂 hook 一律 `use` 開頭、不是 hook 的函式不要用 `use` 開頭：`react-hooks/rules-of-hooks` 靠名稱判斷，命名錯會誤報（10 個 `index` 元件曾被報成 67 個「條件式呼叫」）或漏報。2026/10/21 起 `lint:build` 已把 `react-hooks/rules-of-hooks` 設為 error（全站 0），新程式違反會擋 build；`exhaustive-deps` 仍只在 `eslint-check` 以 warning 顯示。
- `setupTests.js` 的 localStorage 假物件 `setItem` 會再 `JSON.stringify` 一次（與瀏覽器不同）；需要真實行為的測試在 `beforeEach` 以 `jest.spyOn` 改寫（CRA 的 `resetMocks` 會在每個測試前清掉 mock 實作，寫在 `beforeAll` 無效）。
- 刪檔前用「從 `src/index.js` 走訪 import 圖」找出到不了的檔案，並以完整檔名搜尋字串引用；scss／css 的 `@import`／`@use`／`url()` 也是引用（本地檔不見時 Vite 可能改抓同名 npm 套件，build 照樣成功，MEMORY #172⑦）；`public/` 的檔案可能被外部網址引用，刪前確認用途。
- lodash 一律逐方法引入（`import cloneDeep from 'lodash/cloneDeep'`），不要 `import _ from 'lodash'`／`import { x } from 'lodash'`：整包 71 KB 會進入口 chunk（2026/10/21 已全面改掉，目前只用 `cloneDeep`、`clone`、`findIndex`）。`idx(x, _ => _.data)` 的 `_` 是箭頭參數，不是 lodash。
- 效能要先量再改：首屏的瓶頸是 CPU（重新渲染、舊版 Apollo 快取），不是網路（後端在 Cloud Run，HTTP/2 並行）；量測工具與方法見 MEMORY #173。
- Apollo v3 在開發模式與單元測試會凍結查詢結果：**不要直接修改 `data`**（排序、push、改欄位），先複製（`cloneDeep(data)`、`[...list].sort()`）；`.slice()`／`.filter()`／`[...]` 只複製陣列，要改元素欄位得用 `cloneDeep` 或 `list.map(x => ({ ...x }))`；改成複製後，同檔其他讀原查詢結果的地方（匯出、另一個 effect）若靠原地修改才拿到加工後的資料，要一起改讀複製的那份；正式環境不凍結，所以只在 `npm start` 時才會看到「Cannot assign to read only property」。
- 截圖測試需 `NODE_PATH=/opt/node-tools/node_modules`，GraphQL 以 `page.route('**/graphql', …)` 回假資料、外部網域一律 abort。
