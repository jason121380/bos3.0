---
description: BOS 3.4 Compact Administrative Template Standards
---

# BOS 3.4 緊湊型管理介面標準 (Standard)

本文件定義了 BOS 3.4 版本中行政管理頁面的視覺與行為準則，請在開發或重構所有後台頁面時嚴格遵守。

## 1. 頁面標頭 (AdminPageHeader)
使用 `AdminPageHeader` 組件作為所有行政頁面的頂部導航列。

- **按鈕順序 (左側區域)**：
  1. `PageTitle` (標題)
  2. `primaryAction` (主要動作，如「開始盤點」、「新增」)
  3. `secondaryActions` (次要動作按鈕，如「報表匯出」、「列印」)
  4. `onFilterClick` (篩選圖示按鈕)
- **右側區域 (Children)**：
  - 常駐資訊或選擇器（如 `DateSelector`）。

### 樣式規範：
- 背景色：`#E8F0FE` (淡藍色)
- 圓角：`12px`
- 外距：`marginBottom: 12px` (或 `8px` 視版面而定)

## 2. 表格標準 (Compact Table)
管理頁面的表格應採用高密度佈局以容納更多資訊。

- **行高 (Row Height)**：固定為 `40px`。
- **單元格內距 (Cell Padding)**：`2px 16px`。
- **字體大小 (Font Size)**：主要文字 `14px`。
- **表頭 (TableHead)**：
  - 背景色：單純白色 `#FFFFFF`。
  - 文字：加粗 `bold`，顏色 `#212121`。
  - 邊框：底部為 `1px solid #f0f0f0`。
- **合計列 (Total Row)**：
  - 背景色：單純白色 `#FFFFFF`。
  - 文字：加粗 `bold`，顏色 `#212121`。
- **懸停效果**：行政管理頁面通常**移除** `TableRow` 的 hover 背景色變換，保持報表閱讀穩定性。

## 3. 卡片外觀 (Card Styling)
所有包含表格或內容的卡片 (`Card`) 需符合以下美學：

- **圓角**：`16px`。
- **邊框**：`1px solid #f0f0f0`。
- **陰影**：移除預設陰影 (`boxShadow: 'none'`)。
- **溢出處理**：`overflow: 'hidden'`。

## 4. 篩選面板 (Filter Panel)
- **結構**：使用 `Collapse` 元件包裹。
- **觸發**：連動 `AdminPageHeader` 的 `showFilter` 狀態。
- **樣式**：
  - 背景色：`#FFFFFF`。
  - 圓角：`12px`。
  - 內距：`16px`。
  - 邊框：`1px solid #f0f0f0`。
  - 底部外距：`12px`。

## 5. 常規容器規範
- **頁面背景**：統一使用純白色背景，避免使用灰色或彩色背景色。
- **外層 Container**：`paddingTop: theme.spacing(1.5)`。
- **按鈕樣式**：優先使用藥丸型 (`borderRadius: '20px'`) 或高圓角按鈕，按鈕內文字加粗。

---
// turbo-all
