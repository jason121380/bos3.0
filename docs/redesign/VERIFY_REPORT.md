# 階段 2 驗證報告

> **現行基準（2026/10/21，v3.10211418）**：`CI=true npm run test:nowatch` 為 **62 檔／341 測試全數通過**，`TZ=America/Los_Angeles` 再跑一次結果相同；`npm run lint:build` 0 warning；`npm run build`（Vite）成功。GitHub Actions 目前不會執行，以本機結果為準。以下為 2026/10/19 階段 2 當時的紀錄，數字不再更新。

> 範圍：分支 `claude/upbeat-carson-pdc7rf`（commit `dc82823`）對改版前基準 `c41b604`。
> 未納入：第二輪第 4 批（表單頁）與第 6 批（其他 63 頁），它們的成果還在代理的工作區，沒有合併進分支。

## 1. verify-logic（整個分支 vs 改版前）

`node scripts/redesign/verify-logic.js --base c41b604 --head HEAD <634 個有修改的 src/*.js>`
完整輸出：`verify/verify-logic-c41b604..HEAD.log`

結果：**OK 592、FAIL 42**，文字警告 6 個。

42 個 FAIL 逐一檢查後分類（工具是比對「原文」，換寫法就會判 FAIL）：

| 類別 | 檔數 | 內容 | 結論 |
|---|---|---|---|
| A. 移除只用來替 MUI 按鈕上色的 `ThemeProvider` / `createTheme` | 14 | 顧客端 4 頁、Login／Register 表單、EmployeeClockIn/Results、Parameter/OuterLinkModal、InventoryWork 4 檔、預約兩個 HolidayEdit | 按鈕已換新元件，主題物件已無人使用；onClick、disabled 等原樣 |
| B. 移除英文裝飾副標（`subTitle`） | 4 | PageTitle、CouponEdit、ProductEdit、ServiceEdit | 中文標題的判斷式還在；PageTitle 改為只在副標含中文時顯示 |
| C. 傳給 `ManagementTable` 的分頁 props | 3 | AccountingRecordList、GeneralAccountingRecordList、WebOrderManagementList 的 Results.js | 三處舊版呼叫都帶 `hidePagination={true}`，這些 props 本來就不會生效（已逐頁用 `git show` 確認） |
| D. PerfectScrollbar `options` | 5 | DesignerPerformDetail 5 檔 | 改由表格外框橫向捲動，不影響資料 |
| E. 改寫成輔助函式或換元件，原文不同但行為相同 | 10 | TableEditBar、DateSelector、NavItem、NavBar、TopBar、OrderManagementList（index／Overview／ResultsV2）、ClearStorage、ManagementTable | 逐項核對：TableEditBar 每個按鈕的顯示條件、handler、`data-testid`、`disabled` 與文字都在 `item(...)` 呼叫裡；DateSelector 的 `attributes` 仍決定顯示哪些快選與起訖日欄位；NavItem 的「報表及分析」判斷仍在；NavBar 使用者資訊的運算式仍在；TopBar 舊版的深淺色切換 `handleMoodChange`、`MaterialUISwitch` 在舊版就沒有任何地方使用（死碼）；ResultsV2 展開判斷抽成 `isExtended`，條件相同；ClearStorage 只是把文字包進 `<p>` |
| F. **行為／常數有差異** | 2 | 見下 | 需要你知道 |
| G. 其他畫面差異 | 4 | MemberCard（`StyledForm` 樣式元件）、MemberCreate 與 Reservation/Basic（日期選擇器 `slotProps` 欄位樣式）、TopUpEdit（載入文字「loading...」改 Skeleton） | 純畫面 |

### F 類：真的有差異的 2 處

1. `src/layouts/Dashboard/index.js`：`handleToggleNavBar` 裡的判斷寬度從 `window.innerWidth >= 1280` 改成 `>= 1024`。
   - 原因：舊版 MUI 的 `lg` 是 1280，新版側欄用 Tailwind 的 `lg`（1024）決定「常駐」或「抽屜」。判斷值必須與 CSS 斷點一致，否則 1024～1279 之間按側欄按鈕會開錯東西。
   - 這是邏輯常數的修改，不是純樣式。
2. `src/views/Services/index.js`：舊版的篩選開關（`onClick={() => setShowFilter(!showFilter)}`）是傳給 `AdminPageHeader` 不存在的 `secondaryAction` prop，從未顯示過；現在同樣不顯示。工具判定缺少 onClick，實際使用者看到的行為相同。

### 文字警告 6 個
- TableEditBar 4 個（編輯商品類別／編輯設計師抽成／刪除客人／編輯會員卡類別）：文字還在，是 `item(...)` 呼叫的參數，工具沒掃到。
- DateSelector 的「至」：起訖日中間改為「–」符號。
- MemberCreate 的「上一筆訂單:#」：該段文字改了寫法。

## 2. verify-style-only 與 verify-imports-only

這兩個工具比對的是「工作目錄 vs git HEAD」，設計給「剛改完、還沒 commit」使用；在乾淨的分支上直接跑會空轉（永遠通過）。所以我對第一層的每一個提交，建立「父提交為 HEAD、該提交的檔案放在工作目錄」的狀態再執行，等同當時的原始用法。

| 工具 | 提交數 | 檔案數 | 結果 |
|---|---|---|---|
| verify-style-only（色碼 tokens；含 inline style） | 25 | 200 | 全部通過：只有樣式字串變動 |
| verify-imports-only（MUI 圖示 → lucide） | 13 | 199 | 全部通過：只有 import 變動 |

## 3. 測試

指令：`CI=true npm run test:nowatch`（與 CI 相同）。改版前基準在 `c41b604` 的獨立工作區執行。

| | 測試檔 | 測試數 | 失敗 |
|---|---|---|---|
| 改版前（2 次） | 14 | 25 | 7 檔、13 個（兩次完全相同） |
| 改版後（本機完整 3 次，修正前） | 16 | 44 | 7 檔、13 個（三次完全相同） |
| 改版後（GitHub CI 第 3 次，修正後） | 16 | 44 | 7 檔、13 個，與改版前名稱相同 |

改版後多出的 19 個測試都是這次新增且通過：`src/ui/__test__/ui.test.js`（12）、`src/components/__test__/SkeletonBehavior.test.js`（7）。**沒有修改任何既有測試檔**（`git diff --name-status c41b604 HEAD` 只有這兩個新增）。

### 原本就失敗的 13 個測試（改版前後完全相同）

| 測試檔 | 失敗的測試 |
|---|---|
| ProductCreate | should submit successful／should shows correct errors |
| ServiceCategoryEdit | Should update service category successful／should shows correct error |
| AccountingSubjectsAutocomplete | select an option／should render options correctly／should render selectd value option text on Input |
| LoginForm | shoud shows cellphone limit error／should login successful |
| ServiceCategoryCreate | Should display no, name, attribution is required／Should create new service successful |
| Products/Results | should shows products correctly／should calls delete API |
| AccountingRecordCreate/Header | 整個測試檔無法執行（第 7 個失敗的檔案，沒有個別測試名稱） |

### RegisterForm › should signup successful：改版後才出現的不穩定，已修

- 現象：GitHub CI 前 2 次都失敗（8 檔、14 個）；本機冷快取完整測試 3 次中 1 次失敗；改版前冷快取完整測試 3/3 通過。
- 原因：測試只用真實時間等 2 毫秒（`setTimeout(..., 2)`）就檢查 `history.push` 是否被呼叫，但從按送出到導頁實際約 60 毫秒。舊版畫面渲染較重，把事件迴圈占住，2 毫秒的計時器常常延後才觸發，剛好蒙混通過；改版後頁面變輕，計時器準時觸發，偶爾就搶在導頁之前檢查。
- 這是測試本身的競態，不是註冊功能壞掉；但它是改版後才暴露的，所以依「新增失敗要修」處理。
- 修法（commit `eaf6994`）：改用 RTL 的 `wait` 等到 `history.push` 被呼叫為止（最久 4.5 秒）。斷言沒有放寬；導頁若沒發生，測試仍會失敗。只改這一個測試。
- 驗證：本機冷快取完整測試 5/5 通過；GitHub CI 第 3 次（run 39135698666）回到改版前相同的 7 檔、13 個失敗，此測試通過（61 ms）。
- 同一個檔案的另一個測試（should shows cellphone error）也用 `setTimeout(..., 0)` 固定等待，目前沒有出現失敗，未改動。

## 4. 結論

- 兩個 verify 工具：第一層（色碼、圖示）全數通過；verify-logic 的 42 個 FAIL 已逐一分類，其中 **2 處是實際差異**（斷點常數 1280→1024、Services 的篩選開關）。
- 測試：失敗的 13 個測試與改版前完全相同（名稱見上）；改版後新出現的 RegisterForm 競態已修，GitHub CI 已確認回到相同的 13 個。
