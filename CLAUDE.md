# CLAUDE.md — BOS 3.0 前端工作守則

BOS 3.0 是美業 ERP 的純前端 SPA（Vite 5 + React 17 + Apollo GraphQL + Redux Toolkit；2026/10/20 由 CRA 改為 Vite，單元測試仍用 react-scripts 的 Jest）。畫面已從 MUI 改版為 **Tailwind + `src/ui/`（shadcn/Radix 風格）**；MUI 套件已於 2026/10/20 全數移除，尚未重新設計的舊頁面以 `src/ui/*-compat` 相容元件（輸出 MUI 同名 class）維持原樣。日期時間一律以**台灣時間**計算與顯示（見架構速記）。回覆一律使用專業、清楚的**繁體中文**。

## 文件地圖

| 文件 | 看什麼 |
|---|---|
| `STYLE.md` | 設計規範（色彩、字型、元件、文案、遷移規則）——所有新畫面的唯一依據 |
| `docs/redesign/TODO.md` | **待辦清單**（已完成／待實機／待 Jason 決定） |
| `docs/redesign/STATUS.md` | 改版進度與刻意不改的項目 |
| `docs/redesign/MEMORY.md` | 決策與教訓（為什麼這樣做、踩過的坑） |
| `docs/redesign/MIGRATION_GUIDE.md` | 把頁面的相容元件換成正式 `src/ui/` 元件 的步驟與鐵則 |
| `docs/redesign/VERIFY_REPORT.md` | 驗證方式與測試基準 |
| `docs/redesign/B2_EXHAUSTIVE_DEPS.md` | effect 依賴警告分類與疑似 bug 清單（改 effect 前先看） |
| `README.md` | 專案總覽、環境變數、API、時區、路由、部署 |

## 鐵則（違反就不要 commit）

1. **只改畫面（JSX 與樣式）**。不得更動 API 呼叫、GraphQL query／mutation、Redux、hooks、state、handler、欄位、驗證、權限、金額與日期運算。畫面以外的修正（bug、部署設定、套件、時區等）必須由 Jason 在當次對話中明確同意後才做，並在 PR 說明寫清楚。
2. **列印範本不動**：`#printMain`、`#printThermal`、會被 `innerHTML` 複製到列印視窗的區塊、`className` 含 `print` 的元素。
   - **項目 3 限定例外（Jason，2026/10/23）**：報表／收據移除相容層時可調整列印 CSS／`print:`，但每份報表都必須以 `scripts/redesign/compat-harness/e2e/print-compare.sh` 做修改前後比較；其他情境仍遵守原規則。
3. 保留所有 `data-testid`、`id`、`name`、`ref`、`key`、`aria-*`。
4. 後端 repo `beautyos_api`、`beautyos_merchant` **唯讀**，不要動。
5. **正式站僅可唯讀查看，禁止新增、修改、送出或列印真實資料；刪檔先經 Jason 同意。不要建立、送出或儲存真實帳單／資料，也不可以連到任何真實資料庫（正式與測試後端都不行，Jason 2026/10/22）**；測試用模擬後端（mock GraphQL）。單元測試由 `setupTests.js` 全域封鎖 `fetch`／`XMLHttpRequest`／`WebSocket`（`src/__tests__/networkGuard.test.js` 驗證），不要放寬；瀏覽器腳本除了 `page.route` 回假資料、非本機一律 abort，**還要**在 `chromium.launch` 加 `--host-resolver-rules=MAP *.run.app ~NOTFOUND, MAP *beautyos* ~NOTFOUND, MAP *crt-test* ~NOTFOUND`（`page.route` 攔不到 WebSocket，頂列的 socket.io 會直連後端）。請人員實機操作前，必須先確認有與正式資料完全隔離的測試後端。
6. 只在指定分支開發與推送；合併流程見下方「Git 與合併」。

## 常用指令

```bash
npm install --legacy-peer-deps       # 必須加 --legacy-peer-deps（CI／Docker 用 npm ci --legacy-peer-deps）
npm start                            # 開發（Vite，http://localhost:3000）
npm run build                        # 正式 build（Vite，輸出 build/；可用 BUILD_PATH 改輸出位置）
npm run lint                         # ESLint（實際 script：lint:build）
npm run test:nowatch                 # 全部單元測試（作者回報基準：4,268 項通過）
TZ=America/Los_Angeles CI=true npm run test:nowatch   # 時區相關修改要另在海外時區跑一次
CI=true npm run test:coverage        # 覆蓋率（A 級核心 helper／lib／store／OrderShared／DeductionSettingShared／*Requirements 要求 100%；共用層 hooks／ui／utils／context／mixins 100（分支 99）、components 99、elements 99、layouts 98；帳單四頁 99；其餘〔頁面〕為全域下限；Jason 2026/10/22 定全站 100% 為目標，分波推進）
npx eslint --no-eslintrc -c scripts/redesign/eslint-check.json <檔案…>
node scripts/redesign/verify-logic.js [--base <ref>] <檔案…>   # 純畫面驗證
```

GitHub Actions 的 Node.js CI 已手動停用（disabled_manually）。合併前本機執行 `npm run lint`、`npm run test:nowatch`、`npm run build`；作者回報目前有 4,268 項測試通過。驗證標準：`verify-logic` 的 FAIL 必須逐項說明是純畫面差異；lint 通過且 build 成功；測試**必須全數通過**。動到 `package.json` 相依時，另在乾淨資料夾跑一次 `npm ci --legacy-peer-deps` 確認 lockfile 同步。

## Git 與合併

- 功能分支以當次 session 指定的為準（例如 `claude/pensive-fermi-v6ufcq`、`claude/upbeat-carson-pdc7rf`）；PR 範本在 `.github/PULL_REQUEST_TEMPLATE.md`（沿用其標題結構）。
- **Codex／代理只開 PR，不自行 merge**：由 CEO（Jason 的助理）逐行審查，並在本機跑 lint／測試／build 全部通過後才合併；或由 Jason 決定合併。驗證沒過就停下來回報。
- **可能有多個 session 同時開發**：合併前一定先 `git fetch origin main` 並 merge 進自己的分支，重跑 lint／測試／build 再合併；衝突逐一解，不覆蓋對方的內容。`MEMORY.md` 的教訓編號、`TODO.md` 的條目合併後要檢查重號，後到者順延編號並同步文件內的引用。
- PR 開啟後若有 Codex 自動 review：等它完成；有 finding 就驗證是否成立、修正或在討論串說明理由；合併仍依上方流程（CEO 審查後合併或由 Jason 決定）。GitHub Actions（`.github/workflows/node.js.yml`）目前在 GitHub 上不會執行，以本機驗證為準。
- PR 合併後，分支從最新 `main` 重置再繼續（`git fetch origin main && git checkout -B <branch> origin/main`），不在已合併的歷史上堆疊。
- 每個完整 commit 都要更新 `src/version.js` 的 `APP_VERSION`（格式 `v3.MMDDHHmm`，台灣時間 UTC+8，例如 `v3.10230759`），commit 訊息第一行以 `[版號]` 開頭；不自行升大版號。
- Commit 訊息遵守 Angular 格式；可以使用 `gh`（例如 `gh pr create`）開 PR，也可用 GitHub MCP 工具。
- 部署：正式站 https://bos.lure.com.tw 位於 Railway，push／合併到 `main` 會自動部署。合併不等於上線，須確認正式站左上角版號。`cloudbuild.yaml`、`cloudbuild_dev.yaml` 是舊的 legacy 設定，目前未使用。

## 架構速記

- `src/ui/`：新元件（Button、Input／Field、Select、NativeSelect、Table、Card、Dialog、Accordion、ToggleGroup、Switch、Checkbox、Badge、Avatar、Stat、Toast、Popover、DropdownMenu、Sidebar、PageHeader、EmptyState…）與 `icons`（lucide 轉接層）、`*-compat`（輸出 MUI 同名 class 的相容元件；目前頁面使用檔案 0 檔，共用元件及日期選擇器內部亦為 0，僅相容檔自身、單元測試與歷史 compat-harness 引用，刪除待 Jason 核准）、`format`（`formatNumber`／`formatMoney`）。
- `src/styles/tokens.css`：CSS 變數 tokens＋`.ui-root` 基礎層（preflight 關閉）；淺色文字與狀態色已調到 WCAG AA。
- `src/lib/api-base.js`：後端位址單一來源（GraphQL、WebSocket、REST outer_store、Sentry environment 都從這裡取）；不要在頁面寫死網址。
- `src/lib/init-apollo.js`：Apollo client 單例；errorLink 統一提示 GraphQL／網路錯誤（`TKN_ERROR` 導回登入）；`inflightLink` 只計數進行中的查詢（給 `after-first-load` 用）。client 為 `@apollo/client` 3（2026/10/21 自 apollo-boost 換版、舊套件已移除，實驗報告 `docs/redesign/APOLLO_V3_EXPERIMENT.md`）；`createApolloClient` 不開 `notifyOnNetworkStatusChange`（refetch 的 loading 行為與 v2 相同，有測試）。
- `src/lib/business-timezone.js`＋`install-business-timezone.js`（在 `src/index.js` 最早載入）：裝置不在 UTC+8 時把全域 `Date` 與 `Intl.DateTimeFormat` 換成台灣時間；date-fns、日期選擇器與所有顯示因此自動以台灣時間運作，新程式照常用 date-fns 即可。
- `src/lib/theme-mode.js`：深淺色模式。依使用者記住主題、版面掛載時（繪製前）套用；舊版全域樣式 `initialize(-dark).scss` 以 `?inline` 字串放進同一個 `<style>`，切換時替換內容，不必重新整理。不要再用 `import('…scss')` 直接載入這兩檔。
- `src/lib/polyfills.js`：只補 Safari 14／Chrome 87 缺少、而程式實際用到的功能（目前只有 `structuredClone`）；不再載入整包 core-js。
- `src/lib/uuid.js`：列表 key／暫存 id 用的 v4 UUID（`import uuid from 'lib/uuid'`，用 `crypto.getRandomValues`；2026/10/21 取代 `uuid` 套件，有測試）。不要再安裝 `uuid` 套件；單元測試的 `crypto` 由 `setupTests.js` 補 Node webcrypto。
- `src/lib/stored-user.js`：登入者資料存進 localStorage 前只留 `id`、`name`、`isAdmin`、`isNeedChangePassword`（`saveStoredUser`；手機號碼、uid、userCode、各店 solmateKey 不落地，2026/10/21）；`src/index.js` 啟動時 `sanitizeStoredUser()` 把舊版存的完整資料就地瘦身。新程式寫 `user` 一律用 `saveStoredUser`，需要其他欄位向 API（profile）查。
- `src/lib/immer-config.js`（`src/index.js` 最早載入）：immer 2026/10/21 自 7 升到 9（關掉 critical 漏洞、與 Redux Toolkit 共用同一份），但維持 immer 7 的凍結行為——開發／測試凍結 `produce` 結果、正式環境不凍結，升版不新增拋錯路徑（有測試）。
- `src/lib/settings-cache.js`：設定類查詢的快取（2026/10/21，Jason 同意）。103 個「很少變的設定」查詢以 `settingsQuery(gql`…`)` 登記、`fetchPolicy: SETTINGS_FETCH_POLICY`（cache-first）；任何 mutation 成功（`NON_SETTINGS_MUTATIONS` 白名單除外）或每 10 分鐘，`evictSettings()` 把它們移出快取（同時進行的多個 mutation 合併成全部結束後清一次），畫面上正在用的會自動重抓。**新增設定類查詢照這個寫法**；含日期／分析參數、權限、帳單與列印、依 id 讀單筆（編輯頁）、會輪替或即時變動的資料（QR 打卡碼、帳單佇列狀態）、操作密碼都不要用（仍是 cache-and-network）；根欄位是 `merchant`／`me`／`user` 這類底下還掛著權限與報表的共用欄位也不能用（清除以根欄位為單位，會連帶清掉它們；`settingsQuery` 遇到會直接拋錯，有測試）；根欄位若也被**帶參數的查詢**（依日期的分析報表等，例如 `productCategories`／`serviceCategories`）使用同樣不能用——`settings-cache.test.js` 會掃全站 gql 擋下（也擋依 `ID` 變數讀單筆的設定查詢）。換頁時會自動送出、不改設定的 mutation 要加進白名單，否則每次換頁都清快取（有測試）。
- `src/lib/after-first-load.js`：`useAfterFirstLoad()` 在首屏完成（load 後、沒有查詢在等回應、頁面程式不在下載中〔Dashboard 的 Suspense 佔位用 `useHoldFirstLoad()` 計入〕、瀏覽器空閒）才回傳 true；版面的系統公告、訂單佇列、釘選頁、切換店家清單以 `skip: !afterFirstLoad` 延後。版面要新增查詢時，先判斷是不是首屏必要（選單權限、選單設定是必要）。
- `src/elements/snackbars.js`：`openSnackbar` 全站提示（右下角 toast；錯誤需手動關閉；確認型 variant 畫成對話框）。錯誤／警告提示自動經 `src/lib/friendly-error.js` 把英文技術訊息（500、資料格式錯誤、程式例外）換成「原因＋下一步」的中文，中文業務訊息原樣；errorLink 的狀態碼文案也用同一份（`httpStatusMessage`）。頁面 catch 照常傳 `error.message` 即可。
- `src/components/ReservationCalendar/`：預約週曆共用。`weekCalendar.js`（`tidyWeekCalendar`／`buildWeekCalendar`：色塊、可預約人數、重疊並排、公休、跨日拆段，單週預約紀錄／個人頁／員工資料共用，有單元測試）、`DesignerWeekReservation/`（個人頁與員工資料的整頁週曆，同一份）、`HolidayEdit.js`（四個預約頁的公休彈窗）。單日預約紀錄的版面不同，只共用 `HolidayEdit`。
- `src/components/PageErrorBoundary.js`：Dashboard 內容區的錯誤邊界（單頁出錯只顯示錯誤畫面，側欄可用）；`SlotPortal.js`：TopBar／NavBar 互相把按鈕畫進對方插槽（切換店家、搜尋選單）。
- `src/layouts/Dashboard/`：側欄頂列（Logo、版號、搜尋鈕、訂單佇列鈴鐺、收合）、選單、底部（深淺色切換、切換店家、登出）。
- `src/views/OrderShared/`：帳單四兄弟（打帳單、帳單詳細、掛單詳細、重新開單）共用元件（2026/10/21 項目 4）：`ItemPickerModal`（選服務／商品／卡券／會員卡彈窗的畫面，`ui/dialog`、按 Esc／點背景不關）＋`pickerColumns.js`、`ProductsModal`、`MemberShipCardSellsModal`、`EditServicesModal`／`EditCouponSellModal`（三個編輯頁共用；打帳單的選取邏輯不同，留在 `OrderCreate`，只共用畫面）、`WalletDepositModal`、`PannelRemark`／`PannelPayment`；第二輪（2026/10/22）加入 `BillSummary`（金額彙總／底部固定列畫面，數值運算留在各頁；**四頁的預覽公式以打帳單為準**——業績合計含第三方卡券、現金應收＝`billPaymentSummary`，Jason 2026/10/22；這些數字只顯示、不送後端，實際業績由後端依品項明細計算）、`rowAlign.js`（項目列頂端對齊時無標籤元素〔圖示鈕、勾選框〕的位移 className）、`ReCheckoutPasswordDialog`、`useInvoiceDecorations`、`useItemPicker`、`bonusRules`、`useCouponUseRow`、`customerField`／`customerFormInput`、`BillSourceField`；`OrderCreate/OrderDetailModal` 拆出 `useOrderDetailItems`／`useOrderDetailCheckout`／`OrderDetailScreen`，`DraftOrderEdit/Footer` 拆出 `useDraftPrint`／`useDraftCheckout`（列印範本留在原檔）。各頁差異以明確 props 傳入（例如 `showEffectiveDays`、`titleByCategory`、`getRowKey`）；改帳單共用畫面先看這裡，不要再複製到四個目錄。
- `src/views/DeductionSettingShared/createRakeHandlers.js`：新增／編輯抽成設定、員工批量抽成彈窗、員工抽成設定（AboutPerformance）四處共用的 19 個抽成表單 handler（原本四份逐字相同，2026/10/22 拆大檔時抽出；`checkInputEmptyAsZero`／`checkInputRangeOnly` 保留各頁原本的空值處理）。改抽成輸入規則改這一份。
- `src/views/OrderCreate/`：打帳單。`orderRequirements.js` 與 `Header.js` 的 `valid` 同步（有測試比對）；`RowAction.js` 是項目列的圖示鈕與「新增項目」。
- `src/helper/`：`billPaymentSummary`（打帳單應付帳款／現金應收，明細彈窗、收據、金額彙總共用）、`exportCustomerMask`（列表匯出是否遮罩客資：只有查詢成功且設定為 false 才不遮罩）、`rolePageAuthority`（讀登入者角色某區塊的頁面權限：以角色 id 比對，缺區塊／找不到角色／格式壞掉一律視為沒有權限；新頁面讀角色權限一律用它）、`billVerify`、`helperDeduction`、`giveBonus`、`truncateDecimal`（卡券金額無條件捨去）、`dailyUnlock`（鎖定日期 23:59 解除）等，皆有單元測試。
- `src/__tests__/testkit.test.js`：頁面測試共用工具（依查詢名稱回應的模擬 link、沒寫到的欄位自動補齊、記錄送出的 variables、擋住 `fetch`、`settle()` 等所有查詢回來；`renderPage(…, { delays: { 查詢名稱: 毫秒 } })` 讓指定查詢晚回，測「設定比資料晚到」）。檔名帶 `.test` 是因為 CRA 把 `__tests__` 下每個檔都當測試；被 import 時只提供函式。新的整頁測試照四個帳單頁與 `views` 煙霧測試的寫法。**受控輸入框且 onChange 在 setState updater（如 `produce`）裡才讀 `event.target.value` 的，用 `typeLikeBrowser(input, value)` 輸入**：`fireEvent.change` 包在 `act` 裡，React 會先把受控值還原再跑 updater，讀到舊值（真實瀏覽器不會），2026/10/22 曾因此誤判「編輯顧客改名不生效」。
- `scripts/redesign/compat-harness/`：相容層的 computed style 比對頁（歷史工具；MUI 套件已移除）。
- `scripts/redesign/`：verify-logic／verify-style-only／verify-imports-only、tokenize-colors、swap-icons、page-checklist、portal-root-scan、inventory-scan（改版盤點數字，口徑見 `docs/redesign/TODO.md` §三）。

## 踩雷清單

- **`ui` 元件放在 MUI Dialog／Popper（Portal）內要有 `.ui-root`**，否則沒有 box-sizing／邊框重置（8 個 `ui` 元件已自帶 `ui-root`，`portal-root-scan` 為 0；新增 `ui` 元件要記得自帶）。
- `ui/dialog`、相容層 Modal／Popper 與正式浮層共用 Radix 圖層；窗內可用 Autocomplete／Select／日期選擇器。新浮層須加入同一套 DismissableLayer／FocusScope 與 `layer-stack`，不可另掛 document Esc 或另造焦點鎖；保留無 onClose 的受控開啟＋hideClose（MEMORY #195）。跨層焦點仍須跑離線瀏覽器 harness。
- emotion 已於 2026/10/20 全面移除（MEMORY #163）：樣式一律用 Tailwind className；共用元件的 `className` 是字串直通（`cn` 合併）。`ui/icons` 預設尺寸在 `src/ui/icons.css`（同權重、排在 Tailwind 之後），頁面要覆蓋圖示尺寸需加 `!`。
- flex 子層沒有 `min-width:0`／`max-width:100%` 會被內容撐寬；欄位列要 `flex-wrap`。
- `overflow-x:auto` 會連帶裁掉上下溢出內容（浮動標籤、外側焦點框），因此標籤統一放欄位上方；捲動容器內的元件焦點框用 `focus-visible:ring-inset`（`ui/tabs` 已內建，MEMORY #171）。
- 打字搜尋下拉 Autocomplete 已於 PR #178–#181 改為自製元件；滑桿數值泡泡已於 PR #197 完成自製。
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
- **帳單查詢不會依 id 合併**：`init-apollo` 的快取是 `InMemoryCache({ addTypename: false })`，沒有 `__typename` 就不正規化；同一張帳單被不同查詢（`order(orderId)` 根欄位）讀取時，任一支重抓會整個覆蓋，其他查詢變成不完整而連鎖重抓。帳單頁「每次查詢完成就從原帳單帶入」的 effect 會因此把使用者的修改蓋回去（2026/10/22 掛單詳細、帳單詳細都曾發生）。新區塊不要自己再查同一張帳單，改用頁面已查好的資料；帶入原帳單的 effect 以「同一張帳單只帶入一次」保護（帳單詳細 `useOncePerOrder`）。不要為此改全站快取設定（影響所有頁面）。
- Apollo v3 在開發模式與單元測試會凍結查詢結果：**不要直接修改 `data`**（排序、push、改欄位），先複製（`cloneDeep(data)`、`[...list].sort()`）；`.slice()`／`.filter()`／`[...]` 只複製陣列，要改元素欄位得用 `cloneDeep` 或 `list.map(x => ({ ...x }))`；改成複製後，同檔其他讀原查詢結果的地方（匯出、另一個 effect）若靠原地修改才拿到加工後的資料，要一起改讀複製的那份；正式環境不凍結，所以只在 `npm start` 時才會看到「Cannot assign to read only property」。
- 截圖測試需 `NODE_PATH=/opt/node-tools/node_modules`，GraphQL 以 `page.route('**/graphql', …)` 回假資料、外部網域一律 abort。
