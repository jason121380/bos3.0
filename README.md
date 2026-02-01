# 💄 BeautyOS (BOS v3.0) 專案開發規格文檔

Welcome to **BeautyOS (BOS v3.0)**。本專案是一個專為美業設計的管理系統（ERP/CRM），結合了高效的排班、薪資結算與預約管理功能。

---

## 🚀 快速開始
1. **安裝依賴**: `npm install`
2. **啟動開發伺服器**: `npm start` (預設啟動於 [http://localhost:3000](http://localhost:3000))
3. **生產打包**: `npm run build`

---

## 🛠️ 技術棧 (Tech Stack)
*   **Core**: React 17.0.2 (使用 `react-router-config` 管理路由)
*   **UI Framework**: Material-UI (MUI) v5.15.7
*   **Styling**: 
    *   **Emotion**: 動態樣式處理 (`@emotion/react`)
    *   **MUI Theme Overrides**: 全局 UI 組件外觀定義
    *   **SCSS**: 全局樣式初始化
*   **Data Flow**: 
    *   **API**: GraphQL (Apollo Client) & Socket.io (實時推播)
    *   **State**: Redux Toolkit (RTK)
*   **Utilities**: `idx` (安全取值), `date-fns` (日期處理), `immer` (不可變狀態管理)

---

## 🎨 UI/UX 設計規範
本系統風格融合了 **Apple iPadOS** 的簡潔感與 **Professional Administrative** 的實用性。

### 1. 核心色調
*   **Primary Blue**: `#1A73E8` (Google Blue) - 用於動作按鈕與主要高亮。
*   **Background**: `#F2F2F7` - 全局灰色底色。
*   **Pure White**: `#FFFFFF` - 用於內容卡片與數據容器，無 Shadow 渲染。

### 2. 層級架構 (Two-Level Pattern)
*   **Level 1 (控制層)**: 淺藍色背景 (`#E8F0FE`) 的控制卡片，包含標題、`showFilter` 開關與 `DateSelector`。
*   **Level 2 (數據層)**: 白色 `Card`。`CardHeader` 標題前必須帶有 `4x16px` 的藍色垂直條 decoration。

### 3. 組件標準
*   **Input**: 統一高度 `42px`，文字垂直居中修正，圓角 `8px`。
*   **Button**: 圓角 `20px` (Pill style)，`containedPrimary` 代表核心動作。
*   **Table**: 無 Hover 變色渲染，維持數據閱讀的穩定性。

---

## 📂 目錄結構說明
*   `src/layouts`: 定義頂層佈局 (Dashboard, Auth, Customer, Error)。
*   `src/views`: 頁面功能模塊 (例如：`SalaryOverview`, `WebOrderManagementList`)。
*   `src/theme`: 包含 `palette.js` (色彩), `typography.js` (字體) 與 `overrides/` (全站組件覆寫)。
*   `src/hooks`: 封裝了所有與後端通訊的邏輯 (GraphQL Hooks)。
*   `src/components`: 全局通用組件 (如 `DateSelector`, `PageTitle`)。

---

## ⚠️ 開發注意事項與維持
1.  **安全取值**: 強烈建議使用 `idx(object, _ => _.property)` 處理深度巢狀數據以防崩潰。
2.  **樣式一致性**: 修改 UI 前務必先檢查 `src/theme/overrides/` 是否已有定義，避免重複撰寫樣式。
3.  **WebSocket**: 全站實時更新依賴 `TopBar.js` 中建立的 Socket 連線，請遵守事件訂閱規範。
4.  **薪資鎖定**: 薪資結算頁面具備鎖定機制，鎖定後的數據不可直接透過前端修改。

---

## 📜 原 README (CRA Default)
(以下保留 React 原始文檔以供參考)
[View Original CRA Documentation Below]
...
