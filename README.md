# 💄 BeautyOS (BOS v3.0) — 美業智慧管理系統

> **專案代號**：`beautyos_website`
> **版本**：v3（版號來源 `src/version.js`，格式 `v3.MMDDHHmm`，台灣時間 UTC+8；正式站以左上角版號為準，文件不把尚未部署的版號寫成已上線）| **現況**：[`docs/CURRENT.md`](docs/CURRENT.md)（2026-10-24）。改版沿革見 [STATUS](docs/redesign/STATUS.md)，那裡的數字不是基線 |
> **技術責任人**：名留集團技術團隊

BeautyOS 是一套專為**美髮 / 美容 / 美甲 / SPA 產業**設計的全方位管理系統（ERP / CRM），
涵蓋打帳結帳、預約管理、員工薪資、庫存商品、報表分析、客戶管理等完整業務流程。
本專案為**純前端 SPA**，透過 **GraphQL API** 連接後端微服務。

---

## 📑 目錄

- [快速開始](#-快速開始)
- [交接說明](#交接說明)
- [技術堆疊](#️-技術堆疊-tech-stack)
- [專案架構](#-專案架構)
- [目錄結構](#-目錄結構)
- [環境變數](#-環境變數)
- [API 與資料層](#-api-與資料層)
- [時區（一律台灣時間）](#-時區一律台灣時間)
- [主題系統與設計規範](#-主題系統與設計規範-bos-34)
- [共用元件規格](#-共用元件規格)
- [業務模組總覽](#-業務模組總覽)
- [路由對照表](#-路由對照表)
- [狀態管理](#-狀態管理)
- [部署指南](#-部署指南)
- [開發規範與注意事項](#-開發規範與注意事項)
- [Git 工作流程](#-git-工作流程)
- [常見問題 FAQ](#-常見問題-faq)

---

## 🚀 快速開始

### 系統需求

| 項目 | 版本 |
|---|---|
| Node.js | `v24.22.1`（2026-10-21 安全更新；Node 20 已結束支援） |
| npm | `v10+` |
| 瀏覽器 | Chrome / Edge / Safari (最新版本) |

### 安裝與啟動

```bash
# 1. 克隆倉庫
git clone https://github.com/jason121380/bos3.0.git
cd bos3.0

# 2. 安裝依賴（必須加 --legacy-peer-deps 解決舊版相依性衝突）
npm install --legacy-peer-deps

# 3. 啟動開發伺服器（預設 http://localhost:3000）
npm start

# 4. 生產建置
npm run build
```

### 可用指令

| 指令 | 說明 |
|---|---|
| `npm start` | 啟動開發伺服器（Vite，hot reload） |
| `npm run build` | 生產環境建置（Vite，輸出 `build/`，不含 source map） |
| `npm run preview` | 以正式 build 啟動本機預覽 |
| `npm run lint`（別名：`npm run lint:build`） | ESLint 檢查。CI 見 [`docs/CURRENT.md`](docs/CURRENT.md) 的 `frontend-ci.yml`；合併前仍請本機執行 |
| `npm test` | 執行測試 (watch mode) |
| `npm run test:nowatch` | 執行測試 (單次；合併前本機執行) |
| `npm run test:coverage` | 覆蓋率測試（門檻：現況下限＋金額／API 模組逐檔門檻） |
| `TZ=America/Los_Angeles CI=true npm run test:nowatch` | 在海外時區跑全部測試（時區相關修改必跑） |
| `npm run cy:open` | 啟動 Cypress E2E 測試 |

## 交接說明

- **現況**：只看 [`docs/CURRENT.md`](docs/CURRENT.md)。那裡有前端健康分 Before 92 → After 100、CI（`.github/workflows/frontend-ci.yml`）、`QueryFailed`、收據欄位契約、匯出遮罩、怎麼驗證，以及未修的後端債。健康分程式版號是 `v3.10241717`。2026/10/28 四面向稽核與 10/30 修正見 [`docs/redesign/AUDIT_20261028.md`](docs/redesign/AUDIT_20261028.md)。本檔與 `docs/redesign/` 裡帶日期的 suite 數是 **歷史／已過時**，不要當基線。
- **Repo 結構**：`src/views/` 放業務頁面，`src/components/` 與 `src/ui/` 放共用元件，`src/lib/`、`src/helper/`、`src/store/` 放資料與狀態邏輯；主要守則在 `CLAUDE.md`、設計規則在 `STYLE.md`。
- **本機開發**：使用 Node.js 24、npm；執行 `npm install --legacy-peer-deps` 後以 `npm start` 啟動 Vite。API 連線設定依 `src/lib/api-base.js` 與本機既有環境設定，不要把憑證寫入文件。
- **部署**：合併／push 到 `main` 會由 Railway 自動部署至正式站 https://bos.lure.com.tw。GitHub 合併成功不代表已上線；確認正式站左上角版號為預期版本才算完成。`cloudbuild.yaml`、`cloudbuild_dev.yaml` 是未使用的 legacy 檔案。
- **改版文件**：`docs/redesign/STATUS.md` 記錄進度；`TODO.md` 集中待辦與待實機項目；根目錄 `STYLE.md` 是現行設計依據，`MEMORY.md` 記決策教訓；`MIGRATION_GUIDE.md` 說明相容元件收尾方式；`INVENTORY.md` 是元件盤點；`DATE_PICKER.md`、`REPORT_COMPACT.md` 各記日期選擇器與報表列印規格／歷史；`PAGE_CHECKLIST.md`、`VERIFY_REPORT.md` 是逐頁檢查與驗證紀錄；`APOLLO_V3_EXPERIMENT.md`、`B2_EXHAUSTIVE_DEPS.md` 為專項報告。
- **正式站安全**：正式站僅供唯讀查看；測試不可新增、修改、送出或列印真實資料。刪除檔案前須先取得 Jason 同意。

---

## 🛠️ 技術堆疊 (Tech Stack)

### 核心框架

| 類別 | 技術 | 版本 |
|---|---|---|
| **UI 框架** | React | `17.0.2` |
| **UI 元件庫（新）** | Tailwind CSS 3.4 + `src/ui/`（shadcn/Radix 風格元件） | 規範見 `STYLE.md` |
| **舊頁面相容層** | `src/ui/*-compat`（輸出 MUI 同名 class；MUI 套件已於 2026/10/20 移除） | — |
| **路由** | React Router | `5.1.2` |
| **路由配置** | react-router-config | `5.0.1` |
| **建置工具** | Vite（單元測試仍用 react-scripts 的 Jest） | `5.4.21` |

### 資料層

| 類別 | 技術 | 版本 |
|---|---|---|
| **API 通訊** | Apollo Client (GraphQL)：`@apollo/client`（2026/10/21 自 apollo-boost 換版，舊套件已移除） | `3.4.17` |
| **即時通訊** | Socket.io Client | `4.6.0` |
| **狀態管理** | Redux Toolkit | `1.9.5` |
| **檔案上傳** | apollo-upload-client | `17.0.0` |

### 樣式系統

| 類別 | 技術 | 說明 |
|---|---|---|
| **Tailwind** | `tailwind.config.js`、`src/styles/tokens.css` | 新畫面的樣式方案；preflight 關閉，基礎樣式只作用在 `.ui-root` 之內 |
| **舊主題資料** | `src/theme/`（palette、typography） | 僅供相容層比對與測試；MUI 與 emotion 已於 2026/10/20 全數移除 |
| **SCSS** | Sass (`1.75.0`) | 全局初始化樣式 |

### 工具庫

| 套件 | 用途 |
|---|---|
| `date-fns` + `zh-TW` locale | 日期處理與中文化（全域已固定以台灣時間運算，見〈時區〉） |
| `idx` | 安全深層取值 (避免 `Cannot read property of undefined`) |
| `lodash` | 深拷貝等工具（只用 `cloneDeep`、`clone`、`findIndex`；一律逐方法引入 `lodash/<方法>`） |
| `immer` | 不可變狀態操作 |
| `react-csv` | CSV 報表匯出 |
| `recharts` | 圖表視覺化 |
| `qrcode` | QR Code 產生 |
| `react-beautiful-dnd` | 拖放排序 |
| `react-perfect-scrollbar` | 自定義捲軸 |
| `@sentry/react` | 前端錯誤追蹤 |

---

## 📐 專案架構

```
Browser (SPA)
└─ index.js
   ├─ lib/install-business-timezone   ← 最先載入：日期一律以台灣時間計算與顯示
   └─ Redux Provider
      └─ App.js（Sentry 初始化：只在正式 build、environment 依實際連線的 API）
         ├─ ApolloProvider（lib/init-apollo 單例 client）
         ├─ TeachingModeState (Context)
         └─ Router
            ├─ AuthLayout (/auth/*)
            ├─ DashboardLayout (/*) ← 主要後台
            │   ├─ TopBar：Logo、版號、搜尋鈕、訂單佇列鈴鐺、WebSocket
            │   ├─ NavBar：側邊選單、底部（深淺色切換、切換店家、登出）
            │   └─ PageErrorBoundary → 內容區（lazy-loaded views）
            ├─ Customer／Line Layout（顧客端 LINE 頁面，lazy）
            ├─ EHSLayout (/ehs2/*, /changelinemenu/*)
            └─ ErrorLayout (/errors/*)

GraphQL：authLink（token、店家）→ errorLink（統一提示、TKN_ERROR 導回登入）→ uploadLink
WebSocket：TopBar 以 socket.io 連線（內建自動重連），位址與 GraphQL 同樣來自 lib/api-base
```

---

## 📂 目錄結構

```
bos3.0/
├── public/                     # 靜態資源 (index.html、favicon、manifest)
├── cypress/                    # E2E 測試
├── .github/                    # GitHub Issue/PR 模板、CI workflows
├── Dockerfile                  # Docker 多階段建置
├── .dockerignore               # Docker 忽略清單
├── cloudbuild.yaml             # legacy：舊 Cloud Build 設定，目前未使用
├── cloudbuild_dev.yaml         # legacy：舊 Cloud Build 設定，目前未使用
├── package.json                # 專案建置配置
│
└── src/
    ├── App.js                  # 根組件 (Provider 組裝)
    ├── index.js                # 入口點 (ReactDOM.render)
    ├── routes.js               # 路由定義（186 個 lazy 路由，1051 行）
    ├── initialize.scss         # 全局 SCSS 初始化 (亮色)
    ├── initialize-dark.scss    # 全局 SCSS 初始化 (深色)
    │
    ├── layouts/                # 版面配置 (6 個子目錄)
    │   ├── Dashboard/          # 主要後台版面
    │   │   ├── index.js        # Dashboard 佈局容器
    │   │   ├── TopBar.js       # 側欄頂列：Logo、版號、搜尋鈕插槽、訂單佇列、WebSocket
    │   │   ├── NavBar.js       # 側邊選單、搜尋框、底部使用者列（深淺色、切換店家、登出）
    │   │   ├── MerchantBar.js  # 店家切換 Dialog (搜尋+過濾)
    │   │   └── MerchantList.js # 店家/事業部樹狀結構
    │   ├── Auth/               # 登入/註冊版面
    │   ├── Customer/           # 客戶端版面
    │   ├── EHS/                # 外部嵌入版面
    │   └── Error.js            # 錯誤版面
    │
    ├── views/                  # 頁面模組（170 個子目錄）
    │   ├── OrderCreate/        # 打帳單 (56 個檔案)
    │   ├── OrderEdit/          # 編輯帳單 (30 個檔案)
    │   ├── SalaryOverview/     # 薪資總覽
    │   ├── EmployeeSchedule/   # 排班表
    │   └── ...                 # (詳見「業務模組總覽」)
    │
    ├── components/             # 共用元件（55 個）
    │   ├── ManagementTable.js  # 通用管理表格
    │   ├── QueryFailed.js      # 查詢失敗畫面（無法載入資料＋重新查詢）
    │   ├── PageLoadingFallback.js # 頁面程式載入中（超過 0.3 秒顯示轉圈）
    │   ├── ConfirmDeleteDialog.js # 刪除前確認（TableEditBar confirmDelete）
    │   ├── TableEditBar.js     # 底部批量操作列（confirmDelete 先確認再刪）
    │   ├── DateSelector/       # 日期選擇器 (本月/上月快捷)
    │   ├── SearchBar/          # 搜尋列元件
    │   ├── NavItem.js          # 側邊欄導航項目（依路由展開與高亮）
    │   ├── PageErrorBoundary.js # 內容區錯誤邊界（單頁出錯不白畫面）
    │   ├── SlotPortal.js       # 把按鈕畫進另一元件的插槽（TopBar／NavBar）
    │   ├── ReservationCalendar/ # 預約週曆共用（資料整理 weekCalendar、個人頁／員工資料週曆、公休彈窗）
    │   └── ...各種 AutoComplete # 客戶、商品、服務自動完成
    │
    ├── hooks/                  # 自定義 Hooks（596 個）
    │   ├── useFetchGet*.js     # GraphQL Query Hooks
    │   ├── useFetchSet*.js     # GraphQL Mutation Hooks
    │   ├── useFetchCreate*.js  # 新增操作 Hooks
    │   ├── useFetchUpdate*.js  # 更新操作 Hooks
    │   ├── useFetchDelete*.js  # 刪除操作 Hooks
    │   ├── useMediaQuery.js    # 依 media query 判斷（例如桌機 / 手機）
    │   └── useToggle.js        # 通用開關 Hook
    │
    ├── lib/                    # 核心函式庫
    │   ├── api-base.js         # 後端位址單一來源（GraphQL／WebSocket／REST／Sentry 環境）
    │   ├── init-apollo.js      # Apollo Client 單例、錯誤處理、進行中查詢計數
    │   ├── after-first-load.js # 首屏完成判斷（非必要查詢延後）
    │   ├── friendly-error.js   # 錯誤提示翻成「原因＋下一步」的中文
    │   ├── theme-mode.js       # 深淺色模式（記憶主題、切換免重整）
    │   ├── polyfills.js        # 只補 Safari 14 缺少且用到的功能
    │   ├── business-timezone.js # 日期一律台灣時間（install-business-timezone.js 由 index.js 最早載入）
    │   └── with-apollo-client.js # 取得共用 client（相容用）
    │
    ├── store/                  # Redux Store (RTK)
    │   ├── index.js            # Store 配置 (5 個 Slices)
    │   ├── socket.js           # WebSocket 狀態
    │   ├── reservation.js      # 預約狀態
    │   ├── QRcodeClockIn.js    # QR Code 打卡狀態
    │   ├── pinnedTable.js      # 釘選表格狀態
    │   └── deductionDisplay.js # 扣項顯示狀態
    │
    ├── theme/                  # 舊主題資料（palette、typography；僅供相容層比對與測試）
    │
    ├── context/                # React Context
    │   ├── TeachingModeState.js # 教學模式狀態
    │   ├── designerContext.js  # 設計師上下文
    │   └── ReservationContext.js # 預約上下文（2026/10/28 由 useReservationContext 改名：它是 context，不是 hook）
    │
    ├── helper/                 # 業務工具函數
    │   ├── pageData.js         # 全站頁面資料定義 (導航用)
    │   ├── formatMoney.js      # 金額格式化
    │   ├── paginationLabel.js  # 分頁標籤中文化
    │   ├── billVerify.js       # 帳單驗證（有測試）
    │   ├── truncateDecimal.js  # 卡券金額無條件捨去（修正浮點誤差）
    │   └── dailyUnlock.js      # 打帳單鎖定日期每日 23:59 解除
    │
    ├── elements/               # 全局 UI 元素
    │   └── snackbars.js        # openSnackbar 全站提示（右下角 toast；確認型為對話框）
    │
    ├── utils/                  # 通用工具
    │   ├── compose.js          # 函式組合
    │   └── getTransferListLabel.js # 穿梭清單標籤
    │
    ├── assets/                 # 靜態資源 (SCSS、圖片)
    ├── static/                 # 靜態檔案
    ├── mixins/                 # Mixin (prismjs、validate)
    └── types/                  # 型別定義
```

---

## 🔐 環境變數

| 變數名稱 | 說明 | 預設值 |
|---|---|---|
| `REACT_APP_API_URL` | GraphQL API 端點 | (自動偵測，見下方邏輯) |
| `CHOKIDAR_USEPOLLING` | 檔案監測輪詢模式 | `true` (Docker 用) |
| `FAST_REFRESH` | Fast Refresh 開關 | `false` |
| `GENERATE_SOURCEMAP` | 生產環境 Source Map | `false` (build 時自動關閉) |

### API 端點自動偵測邏輯

後端位址的單一來源是 `src/lib/api-base.js`（`getGraphqlUrl`／`getApiOrigin`）。GraphQL（`init-apollo.js`）、WebSocket（`TopBar.js`）與 REST（`outer_store`）都由它推得，三者一定連到同一個後端。依以下優先順序決定：

判斷只看 **hostname**（路徑、查詢、hash 裡的 `dev` 不算）。實作在 `src/lib/api-base.js`。

```
1. 環境變數 REACT_APP_API_URL（最高優先；有設就不看網址）
2. 核准的正式站網域（bos.lure.com.tw、www.bos.lure.com.tw、app.beautyos.co）
   → https://beautyos-api-prod-htlfg34mhq-de.a.run.app/graphql
3. localhost、*.localhost，或 hostname 含 dev／beautyos2
   → https://crt-test-htlfg34mhq-de.a.run.app/graphql
4. 其餘（127.0.0.1 等 IP、含 preview 的網域、*.up.railway.app／*.railway.app、認不得的網域、沒有 window）
   → 同一支測試 API，並在畫面上方顯示「未設定 REACT_APP_API_URL…不會連正式 API」
```

> ⚠️ **重要**：正式站以外的部署（測試、預覽、用 IP 開）**必須**設定 `REACT_APP_API_URL`。沒設定時不會再默默連正式 API，而是改連測試 API 並顯示提示。新的正式網域要加進 `PRODUCTION_HOSTS`，或在建置時設定這個變數。WebSocket 與 REST 使用同一台主機（取該 URL 的 origin）。

---

## 📡 API 與資料層

### GraphQL Client 架構

```
inflightLink → authLink → errorLink → httpLink (uploadLink)
```

| Link | 功能 |
|---|---|
| **inflightLink** | 只計數進行中的查詢，不改內容；首屏延後的查詢等計數歸零才發出（見〈首屏載入〉） |
| **authLink** | 從 `localStorage` 讀取 `token` 和 `userMerchant`，注入 `accesstoken` 和 `usermerchantid` Headers |
| **errorLink** | Token 過期 (`TKN_ERROR`) → 自動清除 localStorage 並導向登入頁；帳號凍結 (`TKN_IN_JAIL`) → 彈出 alert |
| **httpLink** | 使用 `apollo-upload-client` 建立 GraphQL 連線，支援檔案上傳 |

### Authentication (認證機制)

```
localStorage 儲存：
├── token          → API 存取令牌 (accesstoken header)
├── userMerchant   → { id, name } 當前選擇的店家 (usermerchantid header)
└── user           → 使用者資訊 (含 id)
```

### Hook 命名慣例 (595 個 Hooks)

| 前綴 | 操作類型 | 範例 |
|---|---|---|
| `useFetchGet*` | 查詢 (Query) | `useFetchGetOrderList` |
| `useFetchCreate*` | 新增 (Mutation) | `useFetchCreateOrder` |
| `useFetchUpdate*` | 更新 (Mutation) | `useFetchUpdateOrder` |
| `useFetchDelete*` | 刪除 (Mutation) | `useFetchDeleteOrder` |
| `useFetchSet*` | 設定/切換 (Mutation) | `useFetchSetBookingCheckin` |
| `useFetchSetting*` | 參數設定 (Mutation) | `useFetchSettingTheme` |
| `useFetch*` | 複合/其他 | `useFetchMerchant` |

### WebSocket 即時通訊

- 連線建立於 `TopBar.js` 的 useEffect，位址取自 `lib/api-base` 的 `getApiOrigin()`（與 GraphQL 同一個後端）
- 使用 socket.io 內建自動重連；每次（重新）連上都會重新送出 `roomKey` 加入店家房間；離開版面時移除監聽並斷線
- 用於訂單提醒、預約通知等即時推播

### 錯誤處理

- GraphQL 錯誤：`init-apollo.js` 的 errorLink 統一以 `openSnackbar` 顯示後端訊息（`TKN_ERROR` 導回登入、`TKN_IN_JAIL` 以 alert 告知）
- 網路錯誤：顯示「網路連線異常…」或依狀態碼說明下一步（401 重新登入、413 檔案太大、5xx 伺服器暫時無法處理…），5 秒內只提示一次
- `openSnackbar` 會去掉 Apollo 的 `GraphQL error:` 前綴；錯誤／警告提示再經 `src/lib/friendly-error.js`：英文技術訊息換成「原因＋下一步」的中文（無法分類的附原文給客服），後端中文業務訊息原樣；錯誤提示需手動關閉，其餘 3 秒自動消失

---

## 🕐 時區（一律台灣時間）

- 店家在台灣營業：「今天／本月」等查詢區間、畫面上的日期時間、打資料時選的日期，一律以**台灣時間（Asia/Taipei，UTC+8）**計算與顯示，與裝置設定的時區無關。
- 作法：`src/lib/business-timezone.js` 由 `src/index.js` 最早載入。裝置不在 UTC+8 時，把全域 `Date` 的本地欄位與 `Intl.DateTimeFormat` 的預設時區換成台灣時間，date-fns、日期選擇器與所有顯示自動生效；裝置本來就是 UTC+8（台灣、香港、新加坡等）時完全不替換。
- 送給後端的時間戳記（毫秒、ISO 字串）是同一個絕對時間，不受影響。
- 字串解讀：有 `Z`／`+08:00` 的字串與只有日期的 ISO 字串（`2026-10-21`，規格上為 UTC）照原生解析；沒有時區、且為數字「年[-/]月[-/]日（T 或空白 時:分[:秒]）」格式的字串（`2026/10/21 10:00`、`2026-10-21T10:00`）直接照字面當台灣時間，不受裝置日光節約影響；其他格式（如 `Oct 21, 2026 10:00`）仍先經裝置時區解析，在裝置日光節約切換的那一小時可能差一小時，新程式請用數字格式或時間戳記。
- 裝置不在台灣時區時，進入後台會提示一次「系統一律以台灣時間顯示與計算」。
- 開發：新程式照常使用 date-fns；不要以 `toLocaleString`／`Intl` 假設裝置時區。時區相關修改要另以 `TZ=America/Los_Angeles` 跑測試。

## 🌗 深淺色模式

- 主題存在後端使用者設定，另依使用者記在瀏覽器（`bosTheme:<userId>`），進入後台時在畫面繪製前就套用，深色使用者不會先看到淺色。
- 側欄底部的切換鈕按下立即生效、存檔在背景進行，不重新整理；存檔失敗自動還原。
- 實作：`src/lib/theme-mode.js`。新版介面靠 `<html class="dark">` 的 tokens；舊版全域樣式 `initialize(-dark).scss` 以字串載入同一個 `<style id="legacy-theme-style">`，切換時替換內容。

## 🧩 瀏覽器支援

- Vite 產出 ES module，最低需求 Safari 14／Chrome 87。不載入整包 core-js；程式用到、但 Safari 14 缺少的功能在 `src/lib/polyfills.js` 補（目前只有 `structuredClone`）。

## ⚡ 首屏載入

- 版面一開始只查畫面必要的資料（個人資料、選單權限、選單設定、頁面權限）；系統公告、訂單佇列鈴鐺、釘選頁、切換店家清單延到首屏完成後才查（`src/lib/after-first-load.js`）：load 事件後、沒有查詢在等回應、頁面程式不在下載中（登入後站內換頁時 load 早已完成）、瀏覽器空閒；Safari 改為網路安靜後 0.5 秒；最晚 10 秒一定發出。
- lodash 逐方法引入，入口 chunk 不含整包 lodash。
- 首屏的主要成本是 CPU（每支查詢回來都會讓版面重新渲染、舊版 Apollo 快取比對），不是網路：後端在 Cloud Run（HTTP/2），查詢本來就並行。

---

## 🎨 主題系統與設計規範

> 2026-10 起全站改版為 **Tailwind + `src/ui/` 元件**；MUI 與 emotion 已於 2026/10/20 移除，尚未重新設計的舊頁面以 `src/ui/*-compat` 相容元件維持原樣。

### 文件地圖

| 文件 | 內容 |
|---|---|
| [`STYLE.md`](STYLE.md) | **設計規範（唯一依據）**：色彩 tokens、字型、間距、元件規則、文案、無障礙、遷移規則 |
| [`CLAUDE.md`](CLAUDE.md) | AI 代理／新進工程師的工作守則：鐵則、指令、驗證方式、踩雷清單 |
| [`docs/redesign/STATUS.md`](docs/redesign/STATUS.md) | 改版進度、刻意不改的項目 |
| [`docs/redesign/TODO.md`](docs/redesign/TODO.md) | **待辦清單**：今天完成什麼、接下來做什麼 |
| [`docs/redesign/MEMORY.md`](docs/redesign/MEMORY.md) | 決策與教訓（為什麼這樣做、踩過哪些坑） |
| [`docs/redesign/MIGRATION_GUIDE.md`](docs/redesign/MIGRATION_GUIDE.md) | 頁面遷移指南（MUI → `src/ui/`） |
| [`docs/redesign/VERIFY_REPORT.md`](docs/redesign/VERIFY_REPORT.md) | 驗證報告（verify-logic、測試對照） |

### 新畫面怎麼寫

- 元件一律從 `ui/xxx` import（Button、Input／Field、Select、Table、Card、Dialog、Accordion…），不要新增 MUI import。
- 顏色只用 tokens（`text-text`、`bg-surface`、`border-border`…），不寫死 hex。
- 欄位：標籤在上＋佔位字；必填加 `required`（`*`）並在註解寫明依據；圖示按鈕一律要有 `title`／`aria-label`；金額一律 `NT$ 1,234`（`ui/format`）。
- `ui` 元件放在 MUI 彈出層（Dialog、Popper）內時，外層要有 `.ui-root`（見 `CLAUDE.md` 踩雷清單）。

### 舊頁面（相容層）

尚未重新設計的頁面使用 `src/ui/*-compat`（Dialog、Table、Grid、Snackbar…），輸出與 MUI 相同的 class 名稱，讓 `initialize(-dark).scss` 與列印樣式照常生效。改版這些頁面時依 `docs/redesign/MIGRATION_GUIDE.md` 換成 `src/ui/` 元件；相容層的 computed style 比對工具在 `scripts/redesign/compat-harness/`（歷史比對工具）。

---

## 🧩 共用元件規格

### `PageHeader`（`src/ui/page-header.js`）

頁首一律用它。`AdminPageHeader`、`PageTitle` 已於 2026/10/28 刪除。

```jsx
<PageHeader
  title="帳單列表"
  actions={
    <>
      <Button variant="secondary" onClick={handleExport}><Download />報表匯出</Button>
      <Button variant="primary" asChild><RouterLink to="/order/create">新增帳單</RouterLink></Button>
    </>
  }
/>
```

報表頁的日期與篩選放在同檔的 `ReportToolbar`（`date`／`filters`／`actions` 三個槽），規則見 `STYLE.md` §14。

### `ManagementTable`

通用資料表格，含分頁與 CSV 匯出。

```jsx
<ManagementTable
  title="員工列表"
  totalCount={data.length}
  tableHead={<><TableCell>姓名</TableCell><TableCell>職位</TableCell></>}
  excelData={csvData}
  excelFilename="員工列表.csv"
  pageLimit={limit}
  pageOffset={offset}
  onPageChange={handlePageChange}
  onRowsPerPageChange={handleRowsChange}
>
  <TableBody>{rows}</TableBody>
</ManagementTable>
```

| Prop | Type | 說明 |
|---|---|---|
| `title` | `string` (required) | 表格標題 |
| `totalCount` | `number` (required) | 資料總筆數 |
| `tableHead` | `node` (required) | 表頭欄位 |
| `children` | `node` (required) | 表格內容 (TableBody) |
| `excelData` | `array` | CSV 匯出資料 |
| `excelFilename` | `string` | 匯出檔名 |
| `pageLimit` | `number` (required) | 每頁筆數 |
| `pageOffset` | `number` (required) | 當前頁碼 (0-indexed) |
| `onPageChange` | `func` (required) | 頁碼變更事件 |
| `onRowsPerPageChange` | `func` (required) | 每頁筆數變更事件 |
| `minWidth` | `number` | 表格最小寬度 (預設 `1000`) |
| `headerAction` | `node` | 標題列右側自定義動作 |
| `hidePagination` | `bool` | 隱藏分頁 |
| `size` | `'small' \| 'medium'` | 表格密度 |

### `MerchantBar` (店家切換)

Dialog 模式的店家切換器，含搜尋過濾功能。

- **搜尋框**：支援即時過濾店家名稱、事業部名稱
- **樹狀結構**：事業部 > 子事業部 > 店家
- **自動展開**：搜尋時自動展開匹配的樹節點

---

## 📦 業務模組總覽

### 櫃檯作業

| 模組 | 路由 | 說明 |
|---|---|---|
| 打帳單 | `/order/create` | 建立新帳單 (56 個檔案) |
| 帳單列表 | `/management/orders` | 管理所有帳單 |
| 掛單列表 | `/management/draft-orders` | 草稿/暫存帳單 |
| 營業儀表板 | `/merchant-business-dashboard` | 即時營業數據 |
| 現金收支登錄 | `/general/accounting/records` | 一般收支紀錄 |
| 高階收支登錄 | `/accounting/records` | 進階會計紀錄 |
| 材料自購登錄 | `/employee/picking` | 員工自購記錄 |
| 每日結帳 | `/checkout/daily` | 日結作業 |
| 排班表 | `/employee-schedule` | 員工排班管理 |
| 現場電腦打卡 | `/employee-clock-in` | 店內打卡系統 |
| 掃碼打卡 | `/qrcode-clock-in` | QR Code 打卡 |

### 預約管理

| 模組 | 路由 | 說明 |
|---|---|---|
| 預約管理 | `/management/weborders` | 線上預約列表 |
| 單日預約紀錄 | `/management/reservation/calendar` | 日曆視圖 |
| 單週預約紀錄 | `/management/reservation/designers/calendar` | 設計師週曆 |

### 客戶管理

| 模組 | 路由 | 說明 |
|---|---|---|
| 客戶列表 | `/management/customers` | 客戶名冊 |
| 客資篩選匯出 | `/management/customer-filter-export` | 篩選匯出客資 |
| 卡券管理 | `/management/coupons` | 優惠券/票券管理 |
| 入金管理 | `/topup` | 儲值金管理 |
| 紅利點數紀錄 | `/customer-bonus-record` | 紅利管理 |

### 員工及薪資

| 模組 | 路由 | 說明 |
|---|---|---|
| 員工列表 | `/management/employee` | 在職員工名冊 |
| 員工離職列表 | `/employee-resignation-list` | 離職紀錄 |
| 全店打卡記錄 | `/attendance/records` | 出勤記錄 |
| 考勤排班總表 | `/attendance-employee-schedule` | 考勤+排班 |
| 每月薪資維護 | `/salary/overview` | 薪資月結 |
| 薪資條 | `/employee-payslip` | 員工薪資條 |
| 薪資明細表 | `/designers-salary-detail` | 薪資明細 |
| 薪資轉帳明細 | `/merchant-bank-transfe-report` | 銀行轉帳 |

### 商品管理

| 模組 | 路由 | 說明 |
|---|---|---|
| 商品分類設定 | `/product/categories` | 分類 CRUD |
| 商品列表 | `/products` | 商品 CRUD |
| 商品進貨作業 | `/product/restock` | 進貨管理 |
| 廠商列表 | `/merchant-vendor` | 供應商管理 |
| 盤點作業 | `/inventory-work` | 庫存盤點 |

### 報表及分析 (40+ 報表)

| 分類 | 報表清單 |
|---|---|
| **營業報表** | 營業儀表板、店家區間累計表、店家日報表、營業統計分析表、營業項目月分析表 |
| **設計師報表** | 設計師業績表、日報表、月報表、抽成報表、業績分析表、排行榜 |
| **互助報表** | 互助日報表、月報表、排行榜、點數明細、業績報表 |
| **商品報表** | 銷售排行榜、消耗明細、進銷貨報表、庫存表、庫存盤點表 |
| **財務報表** | 每日非現金明細、收支明細、分類明細、匯款表、非現金對帳單、費用分析表、損益表 |
| **綜合報表** | 多店業績統計表、多店店販銷售排行、消費分析儀表板 |
| **客戶報表** | 入金餘額表、卡券餘額表、消費排行榜、入金排行榜 |

### 資料設定

| 模組 | 路由 | 說明 |
|---|---|---|
| 服務分類設定 | `/service/categories` | 服務分類 CRUD |
| 服務項目設定 | `/services` | 服務項目 CRUD |
| 預收卡設定 | `/coupons` | 預收卡/票券 CRUD |
| 系統參數設定 | `/parameter` | 全店參數 (55 個檔案) |
| 業績抽成參數 | `/performanceDeductionParameter` | 業績抽成規則 |
| 收支科目設定 | `/accountingSetting` | 會計科目 |
| 支付方式設定 | `/payments` | 付款方式 |
| 第三方卡券設定 | `/third-party-coupons` | 外部票券 |
| 角色權限管理 | `/authority` | RBAC 權限 |

### 行銷工具

| 模組 | 路由 | 說明 |
|---|---|---|
| 活動列表 | `/main-event-list` | 活動管理 |
| 活動店家參與列表 | `/merchant-participating-list` | 參與店家 |
| 活動發券明細 | `/event-coupon-issuance-details` | 發券記錄 |

### 會員卡管理

| 模組 | 路由 | 說明 |
|---|---|---|
| 會員卡分類設定 | `/member-card-categories` | 分類設定 |
| 會員卡列表 | `/member-card-record` | 會員卡管理 |

---

## 🗺️ 路由對照表

### 版面配置 (Layouts)

| 路徑前綴 | Layout | 說明 |
|---|---|---|
| `/auth/*` | `AuthLayout` | 登入、註冊、重設密碼 |
| `/customer/*` | `CustomerLayout` | 客戶端頁面 |
| `/ehs2/*` | `EHSLayout` | 外部嵌入頁面 |
| `/changelinemenu/*` | `EHSLayout` | LINE 選單設定 |
| `/errors/*` | `ErrorLayout` | 401/404/500 錯誤頁 |
| `/*` (其餘) | `DashboardLayout` | **主要後台** |

### 權限控制

所有 `DashboardLayout` 下的路由都會觸發 `useFetchCheckPageAuthority` 進行頁面權限檢查：
- 無權限 → 重導至 `/profile/general`
- 個人頁也無權限 → 顯示「權限異常！請洽詢各店主管」

---

## 🏪 狀態管理

### Redux Toolkit (5 Slices)

| Slice | 用途 | 主要 Action |
|---|---|---|
| `socket` | WebSocket 連線狀態 | 連線/斷線 |
| `reservation` | 預約管理狀態 | 預約資料同步 |
| `deductionDisplay` | 扣項顯示控制 | 切換顯示 |
| `QRcodeClockIn` | QR Code 打卡 | 打卡狀態 |
| `pinnedTable` | 釘選表格 | 個人化表格管理 |

### React Context (3 Contexts)

| Context | 用途 |
|---|---|
| `TeachingModeState` | 教學模式開關 (全站) |
| `designerContext` | 設計師相關上下文 |
| `ReservationContext` | 預約相關上下文 |

### LocalStorage Keys

| Key | 型別 | 說明 |
|---|---|---|
| `token` | `string` | API 存取令牌 |
| `user` | `JSON { id, ... }` | 使用者資訊 |
| `userMerchant` | `JSON { id, name }` | 當前選擇的店家 |

---

## 🚢 部署指南

### Railway（正式環境）

正式站 https://bos.lure.com.tw 部署在 Railway（workspace「Jason C's Projects」的 project「bos3.0」）。push 或合併到 `main` 會自動部署；合併本身不等於已上線，須查看 App 左上角版號確認部署完成。repo 內的版號以 `src/version.js` 為準。2026/10/23 曾核對正式站為 `v3.10230759`，之後以左上角為準。

`cloudbuild.yaml` 與 `cloudbuild_dev.yaml` 是舊的 Cloud Build 設定，目前未使用，不屬現行部署流程。

### Docker 本機手動建置

```bash
# 建置映像檔 (Multi-stage)
docker build -t beautyos-frontend .

# 執行容器
docker run -p 3000:3000 beautyos-frontend
```

#### Dockerfile 架構 (Multi-Stage)

```dockerfile
# Stage 1: Builder (node:24.22.1-alpine)
# - npm config (fetch-retries: 5, timeout: 20s~120s)
# - npm ci --legacy-peer-deps（依 package-lock.json，與 CI 相同）
# - npm run build

# Stage 2: Runtime (node:24.22.1-alpine)
# - 只複製 build/ 資料夾
# - serve@14 -s build (port 3000)
# - build/serve.json（來自 public/serve.json）：/assets/** 為 hash 檔名，Cache-Control 一年 immutable；*.html no-cache
```

---

## 📝 開發規範與注意事項

### 1. 樣式撰寫規範

```jsx
// ✅ 正確：Tailwind className＋tokens（規範見 STYLE.md）
<div className="rounded-lg bg-surface p-4 text-body text-text" />

// ✅ 共用元件合併外部 className 用 cn()
import { cn } from 'ui/utils'
<Button className={cn('w-full', disabled && 'opacity-60')} />

// ❌ 錯誤：寫死 hex、inline style、新增 MUI／emotion import
```

### 2. 安全取值

```jsx
// ✅ 使用 idx 處理深層巢狀資料
import idx from 'idx'
const value = idx(data, _ => _.user.merchant.name)

// ❌ 避免直接取值（可能造成白屏崩潰）
const value = data.user.merchant.name
```

### 3. GraphQL Hook 使用

```jsx
// Query Hook（自動執行）
const { loading, data, error } = useFetchGetOrderList(variables)

// Mutation Hook（手動觸發）
const [createOrder, { loading }] = useFetchCreateOrder()
const handleSubmit = () => createOrder({ variables: { input } })
```

### 4. 頁面建立標準流程

```
1. 在 src/views/ 建立模組目錄
2. 建立 index.js（頁面入口、狀態管理）
3. 建立 Results.js（資料展示、表格）
4. 在 src/routes.js 加入路由定義
5. 在 src/helper/pageData.js 加入頁面資訊（導航用）
6. 在 src/layouts/Dashboard/NavBar.js 加入側邊欄項目
```

### 5. 重要注意事項

| ⚠️ 項目 | 說明 |
|---|---|
| **依賴安裝** | 必須使用 `npm install --legacy-peer-deps`，否則會遇到 ERESOLVE 錯誤 |
| **Node 版本** | 使用 `v24.22.1`（2026/10/21 安全更新）。Node 20 已結束支援且受該次漏洞影響 |
| **時區** | 日期時間一律以台灣時間（全域已處理，見〈時區〉），不要自行以裝置時區換算 |
| **API 位址** | 一律從 `lib/api-base` 取，不要在頁面寫死網址 |
| **查詢結果防呆** | API 失敗時 `data` 為 undefined，讀陣列前先判斷，避免整頁拋錯 |
| **WebSocket** | 全站即時更新依賴 TopBar.js 的 Socket 連線（內建自動重連），勿隨意修改 |
| **薪資系統** | 薪資結算具備鎖定機制，鎖定後前端不可直接修改 |
| **Snackbar** | 使用 `openSnackbar({ message, variant })` 全局呼叫，支援 `success`/`error`/`warning`/`info`；畫在右下角，錯誤需手動關閉，確認型（離職、月結、掛單…）畫成對話框 |
| **分頁標籤** | 使用 `paginationLabel()` 工具函數進行中文化 |
| **CSV 匯出** | 使用 `react-csv` 的 `CSVLink` 元件，包裝在 ManagementTable 內 |

---

## 🔀 Git 工作流程

### 分支策略

| 分支 | 用途 |
|---|---|
| `main` | 主要分支；push／合併後 Railway 自動部署，須以正式站版號確認上線 |
| `claude/*` 等功能分支 | 驗證通過（lint、測試全過、build 成功）後以 PR 合併（merge commit）；合併前先把最新 `main` 合進來重跑驗證（可能有多個 session 同時開發） |

### Commit Message 格式

第一行以畫面版號開頭（`src/version.js`，格式 `v3.MMDDHHmm`，台灣時間 UTC+8），其後為 Angular 格式：

```
[v3.10210047] feat: 新增功能
fix: 修正錯誤
style: 樣式調整
refactor: 重構
docs: 文件更新
chore: 雜項（部署配置等）
```

### GitHub Templates

- **Issue Template**: `.github/ISSUE_TEMPLATE.md`
- **PR Template**: `.github/PULL_REQUEST_TEMPLATE.md`

---

## ❓ 常見問題 FAQ

### Q1: `npm install` 出現 ERESOLVE 錯誤？
```bash
npm install --legacy-peer-deps
```
專案使用 React 17，部分套件的 peerDependencies 不相容，需要 `--legacy-peer-deps` 跳過。

### Q2: Docker build 時出現 ECONNRESET？
Dockerfile 已內建 npm 網路重試配置（5 次重試、20s~120s 超時），若仍失敗請等待 10-15 分鐘後重試。

### Q3: 新部署後連到錯誤的 API？
確認已在部署平台設定 `REACT_APP_API_URL` 環境變數。此變數在 `npm run build` 時被注入，**執行時無法動態更改**。

### Q4: 頁面出現「權限異常」？
該帳號在當前店家缺少對應頁面的存取權限，需由管理員在「角色權限管理」(`/authority`) 中設定。

### Q5: 如何新增報表頁面？
1. 建立 `src/views/NewReport/` 目錄 (含 `index.js`)
2. 建立對應的 GraphQL Hook (`src/hooks/useFetchGetNewReport.js`)
3. 在 `src/routes.js` 加入路由
4. 在 `src/helper/pageData.js` 加入頁面資料
5. 在 `src/layouts/Dashboard/NavBar.js` 的報表選單中加入項目

### Q6: 人在國外（或裝置時區設錯）時，報表與帳單時間對嗎？
對。系統一律以台灣時間計算「今天／本月」與顯示時間，與裝置時區無關；裝置不在台灣時區時進入後台會提示一次。詳見〈時區〉。

---

## 📊 專案統計

| 項目 | 數量 |
|---|---|
| 路由數量 | **186**（全部 lazy） |
| 頁面模組 | **170** 個目錄 |
| 自定義 Hooks | **596** 個 |
| 共用元件 | **55** 個 |
| 單元測試 | 見 [`docs/CURRENT.md`](docs/CURRENT.md)（不要用本表以外的舊數字） |
| Redux Slices | **5** 個 |
| 總原始碼行數 | **~150,000+** 行 |

---

## 📜 授權

本專案為 **名留集團** 內部使用，未經授權不得對外分發。

```
© 2024-2026 名留集團 (ML Group). All rights reserved.
```
