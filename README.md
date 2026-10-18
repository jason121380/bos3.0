# 💄 BeautyOS (BOS v3.0) — 美業智慧管理系統

> **專案代號**：`beautyos_website`
> **版本**：v3.0 | **最後更新**：2026-10-18（UI 改版進行中，見 [改版進度](docs/redesign/STATUS.md)）
> **技術責任人**：名留集團技術團隊

BeautyOS 是一套專為**美髮 / 美容 / 美甲 / SPA 產業**設計的全方位管理系統（ERP / CRM），
涵蓋打帳結帳、預約管理、員工薪資、庫存商品、報表分析、客戶管理等完整業務流程。
本專案為**純前端 SPA**，透過 **GraphQL API** 連接後端微服務。

---

## 📑 目錄

- [快速開始](#-快速開始)
- [技術堆疊](#️-技術堆疊-tech-stack)
- [專案架構](#-專案架構)
- [目錄結構](#-目錄結構)
- [環境變數](#-環境變數)
- [API 與資料層](#-api-與資料層)
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
| Node.js | `v20.12.1` (建議，或 v22.x) |
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
| `npm start` | 啟動開發伺服器 (hot reload) |
| `npm run build` | 生產環境建置 (不含 source map) |
| `npm test` | 執行測試 (watch mode) |
| `npm run test:nowatch` | 執行測試 (單次) |
| `npm run test:coverage` | 執行覆蓋率測試 |
| `npm run cy:open` | 啟動 Cypress E2E 測試 |

---

## 🛠️ 技術堆疊 (Tech Stack)

### 核心框架

| 類別 | 技術 | 版本 |
|---|---|---|
| **UI 框架** | React | `17.0.2` |
| **UI 元件庫（新）** | Tailwind CSS 3.4 + `src/ui/`（shadcn/Radix 風格元件） | 規範見 `STYLE.md` |
| **UI 元件庫（舊，遷移中）** | Material-UI (MUI) | `5.15.7` |
| **路由** | React Router | `5.1.2` |
| **路由配置** | react-router-config | `5.0.1` |
| **建置工具** | Create React App (react-scripts) | `5.0.1` |

### 資料層

| 類別 | 技術 | 版本 |
|---|---|---|
| **API 通訊** | Apollo Client (GraphQL) | `3.4.17` |
| **即時通訊** | Socket.io Client | `4.6.0` |
| **狀態管理** | Redux Toolkit | `1.9.5` |
| **檔案上傳** | apollo-upload-client | `17.0.0` |

### 樣式系統

| 類別 | 技術 | 說明 |
|---|---|---|
| **Tailwind** | `tailwind.config.js`、`src/styles/tokens.css` | 新畫面的樣式方案；preflight 關閉，基礎樣式只作用在 `.ui-root` 之內 |
| **CSS-in-JS（舊）** | Emotion (`@emotion/react`) | 尚未改版的頁面仍用 `css()`；遷移完成後移除 |
| **MUI Theme** | `createTheme()` overrides | 33 個元件全局覆寫 |
| **SCSS** | Sass (`1.75.0`) | 全局初始化樣式 |

### 工具庫

| 套件 | 用途 |
|---|---|
| `date-fns` + `zh-TW` locale | 日期處理與中文化 |
| `idx` | 安全深層取值 (避免 `Cannot read property of undefined`) |
| `lodash` | 通用工具函數 |
| `immer` | 不可變狀態操作 |
| `react-csv` | CSV 報表匯出 |
| `recharts` | 圖表視覺化 |
| `qrcode` | QR Code 產生 |
| `react-beautiful-dnd` | 拖放排序 |
| `react-perfect-scrollbar` | 自定義捲軸 |
| `react-helmet` | 動態 `<title>` 管理 |
| `@sentry/react` | 前端錯誤追蹤 |

---

## 📐 專案架構

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                           │
├─────────────────────────────────────────────────────────────────┤
│  index.js                                                       │
│  └─ BrowserRouter + Redux Provider                              │
│     └─ App.js                                                   │
│        ├─ ApolloProvider (GraphQL Client)                        │
│        ├─ ThemeProvider (MUI Theme)                              │
│        ├─ LocalizationProvider (zh-TW)                           │
│        ├─ TeachingModeState (Context)                            │
│        └─ Router                                                │
│           ├─ AuthLayout (/auth/*)                                │
│           ├─ DashboardLayout (/*) ← 主要後台                     │
│           │   ├─ TopBar (通知、店家切換、WebSocket)                │
│           │   ├─ NavBar (側邊選單)                                │
│           │   └─ Content (lazy-loaded views)                     │
│           ├─ CustomerLayout (/customer/*)                        │
│           ├─ EHSLayout (/ehs2/*, /changelinemenu/*)              │
│           └─ ErrorLayout (/errors/*)                             │
├─────────────────────────────────────────────────────────────────┤
│                    GraphQL API (Apollo Client)                   │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ authLink    │→│ errorLink     │→│ httpLink (uploadLink)     │ │
│  │ (Token +    │  │ (Token 驗證、 │  │ (GraphQL Endpoint)       │ │
│  │  MerchantID)│  │  錯誤處理)    │  │                          │ │
│  └────────────┘  └──────────────┘  └──────────────────────────┘ │
│                                                                  │
│                    WebSocket (Socket.io)                         │
│  連線於 TopBar.js → 即時訂單/預約通知推播                         │
└─────────────────────────────────────────────────────────────────┘
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
├── cloudbuild.yaml             # GCP Cloud Build (正式環境)
├── cloudbuild_dev.yaml         # GCP Cloud Build (開發環境)
├── package.json                # 專案建置配置
│
└── src/
    ├── App.js                  # 根組件 (Provider 組裝)
    ├── index.js                # 入口點 (ReactDOM.render)
    ├── routes.js               # 路由定義 (170+ 條路由, 1028 行)
    ├── initialize.scss         # 全局 SCSS 初始化 (亮色)
    ├── initialize-dark.scss    # 全局 SCSS 初始化 (深色)
    │
    ├── layouts/                # 版面配置 (9 個子目錄)
    │   ├── Dashboard/          # 主要後台版面
    │   │   ├── index.js        # Dashboard 佈局容器
    │   │   ├── TopBar.js       # 頂部工具列 (1003 行)
    │   │   ├── NavBar.js       # 側邊導航選單 (854 行)
    │   │   ├── MerchantBar.js  # 店家切換 Dialog (搜尋+過濾)
    │   │   └── MerchantList.js # 店家/事業部樹狀結構
    │   ├── Auth/               # 登入/註冊版面
    │   ├── Customer/           # 客戶端版面
    │   ├── EHS/                # 外部嵌入版面
    │   ├── Empty/              # 空白版面
    │   ├── Seat/               # 座位管理版面
    │   └── Error.js            # 錯誤版面
    │
    ├── views/                  # 頁面模組 (171 個子目錄)
    │   ├── OrderCreate/        # 打帳單 (56 個檔案)
    │   ├── OrderEdit/          # 編輯帳單 (30 個檔案)
    │   ├── SalaryOverview/     # 薪資總覽
    │   ├── EmployeeSchedule/   # 排班表
    │   └── ...                 # (詳見「業務模組總覽」)
    │
    ├── components/             # 共用元件 (54 個)
    │   ├── AdminPageHeader.js  # 頁面頂部控制列
    │   ├── ManagementTable.js  # 通用管理表格
    │   ├── PageTitle.js        # 頁面標題 (含藍色垂直條)
    │   ├── TableEditBar.js     # 底部批量操作列
    │   ├── DateSelector/       # 日期選擇器 (本月/上月快捷)
    │   ├── SearchBar/          # 搜尋列元件
    │   ├── NavItem.js          # 側邊欄導航項目
    │   └── ...各種 AutoComplete # 客戶、商品、服務自動完成
    │
    ├── hooks/                  # 自定義 Hooks (595 個)
    │   ├── useFetchGet*.js     # GraphQL Query Hooks
    │   ├── useFetchSet*.js     # GraphQL Mutation Hooks
    │   ├── useFetchCreate*.js  # 新增操作 Hooks
    │   ├── useFetchUpdate*.js  # 更新操作 Hooks
    │   ├── useFetchDelete*.js  # 刪除操作 Hooks
    │   └── useToggle.js        # 通用開關 Hook
    │
    ├── lib/                    # 核心函式庫
    │   ├── init-apollo.js      # Apollo Client 初始化 (多環境)
    │   └── with-apollo-client.js # Apollo HOC wrapper
    │
    ├── store/                  # Redux Store (RTK)
    │   ├── index.js            # Store 配置 (5 個 Slices)
    │   ├── socket.js           # WebSocket 狀態
    │   ├── reservation.js      # 預約狀態
    │   ├── QRcodeClockIn.js    # QR Code 打卡狀態
    │   ├── pinnedTable.js      # 釘選表格狀態
    │   └── deductionDisplay.js # 扣項顯示狀態
    │
    ├── theme/                  # MUI 主題系統
    │   ├── index.js            # createTheme 入口
    │   ├── palette.js          # 調色盤定義
    │   ├── typography.js       # 字型層級定義
    │   └── overrides/          # 33 個 MUI 元件覆寫
    │
    ├── context/                # React Context
    │   ├── TeachingModeState.js # 教學模式狀態
    │   ├── designerContext.js  # 設計師上下文
    │   └── useReservationContext.js # 預約上下文
    │
    ├── helper/                 # 業務工具函數
    │   ├── pageData.js         # 全站頁面資料定義 (導航用)
    │   ├── formatMoney.js      # 金額格式化
    │   ├── pagenationLabel.js  # 分頁標籤中文化
    │   └── billVerify.js       # 帳單驗證
    │
    ├── elements/               # 全局 UI 元素
    │   ├── snackbars.js        # Snackbar 通知元件 (全局呼叫)
    │   └── label.js            # 標籤元件
    │
    ├── utils/                  # 通用工具
    │   ├── gradients.js        # 漸層色定義
    │   └── useRouter.js        # 路由工具 Hook
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

API 端點在 `src/lib/init-apollo.js` 中依以下優先順序決定：

```
1. 環境變數 REACT_APP_API_URL（最高優先）
2. URL 包含 'dev'       → https://crt-test-htlfg34mhq-de.a.run.app/graphql (測試)
3. URL 包含 'beautyos2'  → https://crt-test-htlfg34mhq-de.a.run.app/graphql (測試)
4. URL 包含 'localhost'  → https://crt-test-htlfg34mhq-de.a.run.app/graphql (測試)
5. 其他（正式環境）       → https://beautyos-api-prod-htlfg34mhq-de.a.run.app/graphql
```

> ⚠️ **重要**：在 Zeabur 等第三方平台部署時，**必須**設定 `REACT_APP_API_URL` 環境變數，否則會連到正式環境。

---

## 📡 API 與資料層

### GraphQL Client 架構

```
authLink → errorLink → httpLink (uploadLink)
```

| Link | 功能 |
|---|---|
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

- 連線建立於 `TopBar.js` 中的 `connectWebSocket()` 函數
- 根據環境自動選擇 WebSocket 伺服器地址
- 用於訂單提醒、預約通知等即時推播

---

## 🎨 主題系統與設計規範

> 2026-10 起全站改版為 **Tailwind + `src/ui/` 元件**。舊的 MUI 主題（`src/theme/`）只留給尚未改版的頁面，會隨遷移完成移除。

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

### 舊 MUI 主題（遷移期間仍有效）

調色盤與字型設定在 `src/theme/`；全域覆寫在 `src/theme/overrides/`。修改尚未改版的頁面前，先檢查對應的 override 檔案，避免重複定義造成衝突。

```
MuiAutocomplete, MuiButton, MuiCard, MuiCheckbox, MuiDialog, MuiTable*, MuiTabs, MuiToggleButton …（共 33 個）
```

---

## 🧩 共用元件規格

### `AdminPageHeader`

頁面頂部控制列，藍色淺底背景。

```jsx
<AdminPageHeader
  title="帳單列表"
  subTitle="管理作業"
  primaryAction={{ label: '新增帳單', to: '/order/create' }}
  secondaryActions={[{ label: '匯出', onClick: handleExport }]}
  showFilter={showFilter}
  onFilterClick={() => setShowFilter(!showFilter)}
>
  <DateSelector ... />
</AdminPageHeader>
```

| Prop | Type | 說明 |
|---|---|---|
| `title` | `string` (required) | 頁面標題 |
| `subTitle` | `string` | 副標題 |
| `primaryAction` | `{ label, to?, onClick? }` | 主要操作按鈕 |
| `secondaryActions` | `[{ label, onClick, disabled? }]` | 次要操作按鈕群組 |
| `showFilter` | `bool` | 篩選開關狀態 |
| `onFilterClick` | `func` | 篩選按鈕點擊事件 |
| `children` | `node` | 右側自定義內容 |

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

### `PageTitle`

帶藍色垂直指示線的標題元件。

```jsx
<PageTitle title="員工列表" subTitle="管理作業" />
```

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
| `useReservationContext` | 預約相關上下文 |

### LocalStorage Keys

| Key | 型別 | 說明 |
|---|---|---|
| `token` | `string` | API 存取令牌 |
| `user` | `JSON { id, ... }` | 使用者資訊 |
| `userMerchant` | `JSON { id, name }` | 當前選擇的店家 |

---

## 🚢 部署指南

### 方式一：Zeabur 部署

1. 連接 GitHub Repository
2. 設定環境變數：
   ```
   REACT_APP_API_URL=https://crt-test-htlfg34mhq-de.a.run.app/graphql  (測試環境)
   ```
3. 使用 Dockerfile 自動建置

### 方式二：GCP Cloud Build (正式/開發)

**正式環境** (`cloudbuild.yaml`)：
```bash
# 觸發流程：
# 1. yarn install (production)
# 2. yarn build
# 3. Docker build → push to asia-east1-docker.pkg.dev
# 4. kubectl set image → update deployment/mlg-beautyos-deployment
```

**開發環境** (`cloudbuild_dev.yaml`)：
```bash
# 同正式，但 image tag 與 deployment name 不同：
# - Image: beautyos-frontend-repo/dev:$SHORT_SHA
# - Deployment: mlg-beautyosdev-deployment
```

### 方式三：Docker 手動建置

```bash
# 建置映像檔 (Multi-stage)
docker build -t beautyos-frontend .

# 執行容器
docker run -p 3000:3000 beautyos-frontend
```

#### Dockerfile 架構 (Multi-Stage)

```dockerfile
# Stage 1: Builder (node:20.12.1-alpine)
# - npm config (fetch-retries: 5, timeout: 20s~120s)
# - npm install --legacy-peer-deps
# - npm run build

# Stage 2: Runtime (node:20.12.1-alpine)
# - 只複製 build/ 資料夾
# - serve -s build (port 3000)
```

### GCP 部署架構

| 環境 | Registry | Deployment | Cluster |
|---|---|---|---|
| **正式** | `beautyos-frontend-repo/prod` | `mlg-beautyos-deployment` | `cluster-1 (asia-east1-a)` |
| **開發** | `beautyos-frontend-repo/dev` | `mlg-beautyosdev-deployment` | `cluster-1 (asia-east1-a)` |

---

## 📝 開發規範與注意事項

### 1. 樣式撰寫規範

```jsx
// ✅ 正確：使用 Emotion css() 函數
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

const styles = {
  container: css({
    borderRadius: '16px',
    boxShadow: 'none',
  })
}

// ✅ 必須在檔案第一行加入 JSX pragma
/** @jsxImportSource @emotion/react */

// ❌ 錯誤：不要使用 inline style 或 makeStyles
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
| **Node 版本** | 建議使用 `v20.12.1`，高版本可能有相容性問題 |
| **Theme Override** | 修改 UI 前先確認 `src/theme/overrides/` 是否已有定義 |
| **WebSocket** | 全站即時更新依賴 TopBar.js 的 Socket 連線，勿隨意修改 |
| **薪資系統** | 薪資結算具備鎖定機制，鎖定後前端不可直接修改 |
| **Snackbar** | 使用 `openSnackbar({ message, variant })` 全局呼叫，支援 `success`/`error`/`warning`/`info` |
| **分頁標籤** | 使用 `pagenationLabel()` 工具函數進行中文化 |
| **CSV 匯出** | 使用 `react-csv` 的 `CSVLink` 元件，包裝在 ManagementTable 內 |

---

## 🔀 Git 工作流程

### 分支策略

| 分支 | 用途 |
|---|---|
| `main` | 主要開發分支；功能分支驗證通過（build 成功、測試無新增失敗）後以 PR 合併 |

### Commit Message 格式

```
feat: 新增功能
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

### Q6: 為什麼 `PageTitle` 有藍色垂直條，但 `ManagementTable` 的 `CardHeader` 沒有？
`PageTitle` 元件內建 `4×18px #1A73E8` 藍色垂直指示線；`ManagementTable` 的 `CardHeader` 在 BOS 3.4 標準中已移除此裝飾，保持簡潔。

---

## 📊 專案統計

| 項目 | 數量 |
|---|---|
| 路由數量 | **170+** |
| 頁面模組 | **171** 個目錄 |
| 自定義 Hooks | **595** 個 |
| 共用元件 | **54** 個 |
| MUI Override | **33** 個 |
| Redux Slices | **5** 個 |
| 總原始碼行數 | **~150,000+** 行 |

---

## 📜 授權

本專案為 **名留集團** 內部使用，未經授權不得對外分發。

```
© 2024-2026 名留集團 (ML Group). All rights reserved.
```
