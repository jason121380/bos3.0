# Apollo client v2 → v3 統一：實驗報告（2026/10/21）

> 給：Jason（決策用）　依據：「do 1 2 3」第 3 項——先開分支量測再決定　狀態：**草稿，未合併**
> 實驗環境：本機模擬後端（測試站被沙箱網路擋住，且規則不連真實資料），正式 build＋Chromium、CPU 降速 4 倍（約中階手機）

## 一、結論（先講答案）

**可以換，但要先處理「開發模式會崩潰」的頁面；不急。** 換版的實際收益比原本估的小，風險也比原本估的小：

| 項目 | 原本的估計 | 實測 |
|---|---|---|
| 首屏 CPU | 舊版快取約 0.3 秒，換版可省下 | 兩版 Apollo 的 CPU 幾乎一樣（v2 約 270–320 ms、v3 約 250–300 ms），**只省約 20 ms** |
| 開頁速度 | — | 預約表格出現 3.25 → 3.15 秒（中位數，7 次交替），約快 0.1 秒、在誤差邊緣 |
| 程式大小 | 約 80–100 KB | vendor-apollo 276 → **184 KB**；首屏 JS（gzip）320 → **296 KB** |
| 最大風險 | refetch 後 loading 不再變化，約 430 個 effect 靜默失效（MEMORY #168④） | **不成立**：與現行行為完全相同（見二），已有測試鎖住 |
| 正式環境 | — | 186 條路由全掃：**v3 沒有新增任何錯誤** |
| 開發模式 | — | **29 頁崩潰**：v3 在開發模式凍結查詢結果，這些頁面直接修改了查詢結果 |
| 安全 | — | 舊版 Apollo 套件沒有任何 npm audit 提醒，換版無安全收益 |

## 二、最大的疑慮被推翻：refetch 時 loading 的變化

全站約 536 個 effect 依 `loading` 的變化取資料、50 處呼叫 `refetch`。實驗以同一個元件分別接 v2 client、v3 client，記錄 refetch 前後的 loading：

| fetchPolicy | v2（現行） | v3（預設） | v3＋notifyOnNetworkStatusChange |
|---|---|---|---|
| `cache-and-network`（全站 411 處） | true→false→**true→false** | 相同 | 相同 |
| 預設／cache-first／network-only／no-cache | true→false（refetch 不變） | 相同 | ⚠ 多出 true→false |

原因：頁面的 hook 本來就是 v3 的 `useQuery`，loading 由 hook 這一層決定，與 client 版本無關。
**結論：換 v3 時不要開 `notifyOnNetworkStatusChange`**（原本以為需要，反而會改變行為）。已加測試 `src/lib/__tests__/apollo-loading.test.js` 鎖住這個行為（加上該選項時 4 項會失敗）。

## 三、真正的風險：開發模式凍結查詢結果

v3 在開發模式（`npm start`、單元測試）會把查詢結果凍結（`Object.freeze`），正式環境不會。程式裡有直接修改查詢結果的寫法（例如預約週曆把跨日預約拆段、把 RH／SH 改成 HOLIDAY；報表把陣列原地排序），在開發模式會丟出「Cannot assign to read only property」，整頁顯示錯誤畫面。

開發模式掃 186 條路由（排除模擬資料本身造成的錯誤），**29 頁只在 v3 出錯**：

- 櫃台：打帳單 `/order/create`、帳單 `/order/:id`、掛單 `/draft-order/:id`、排隊單 `/queue-order-edit/:id`、入金 `/topup`
- 預約：單日、單週預約紀錄（另外個人頁、員工資料的預約表分頁也會崩潰，不在 29 頁內；它們與單週共用 `components/ReservationCalendar/weekCalendar`，修一處即可）
- 客戶：客戶列表、客資篩選匯出、卡券管理、紅利點數紀錄（新增／編輯）、清除暫存
- 報表：消費分析儀表板、顧客消費／入金排行榜、顧客入金餘額、卡券餘額、會員卡銷售、互助點數明細、設計師業績分析、設計師業績明細（`/designer/perform/detail`）、店販（分類）抽成明細、商品消耗明細、服務扣項明細
- 資料設定：組合設定（新增／編輯）

另有只在操作時才會執行的修改（例如按鈕裡排序結果），掃描抓不到，要靠開發時逐頁操作發現。

**影響範圍**：只影響開發與單元測試，**正式環境不會崩潰**。但開發時頁面打不開會讓之後的改版與除錯很難做，所以換版前必須先修。
**修法**：修改前先複製（`cloneDeep(data)` 或 `[...array].sort()`）。每處改動小，但屬於畫面以外的程式，需要逐頁回歸。這些「直接改查詢結果」在 v2 也是潛在問題（同一份快取被改過，換頁回來或重新篩選時可能看到被改過的資料），修好本身就有價值。

## 四、建議做法

1. **第一步（建議先做）**：修掉 29 頁直接修改查詢結果的寫法（改成先複製）。不換版也能做，降低 v2 的潛在資料錯亂。
2. **第二步**：合併本草稿（client 換 v3、5 處舊版 import 改新版），在測試站實際操作主要流程（打帳單、結帳、預約、報表）一週。
3. **第三步**：移除 `apollo-boost`、`apollo-link*` 套件（lockfile 同步、乾淨 `npm ci` 驗證）。

如果你覺得 0.1 秒、24 KB 不值得這些工，**也可以不換**：現行組合在正式環境運作正常，loading 行為已確認與 v3 相同，不會因為「兩套並存」本身出錯。

## 五、本草稿內容

- `src/lib/init-apollo.js`：client、cache、link 改由 `@apollo/client`（含 `link/context`、`link/error`）；新增 `createApolloClient(link)`（測試用同一份設定），不開 `notifyOnNetworkStatusChange`
- 4 個 hook 的 `gql` 由 `apollo-boost` 改為 `@apollo/client`；`CustomMockedProvider`（測試用）改新版 link
- `src/lib/__tests__/apollo-loading.test.js`：5 項，鎖住 refetch 的 loading 行為
- 套件尚未移除（未 import 的套件不會打包，大小量測已反映移除後的結果）

## 附錄：量測方式

- 大小：正式 build 的 `assets/*.js`；首屏＝`index.html` 直接載入的 4 個檔案，gzip 後計算。
- 速度：Playwright＋Chromium，4G 網路、CPU 降速 4 倍，假後端每支查詢 250 ms；v2、v3 交替各 7 次取「預約表格出現」中位數。
- CPU：CDP 取樣，以 sourcemap 對回套件，統計側欄出現到表格出現之間的葉節點時間，各 3 次。
- 錯誤掃描：186 條路由，開發模式與正式 build 各掃一次，v2、v3 同一個基準 commit，只計 v3 才有的錯誤；v2 本身約 82 頁因自動模擬資料不完整而出錯，屬雜訊。
- 開發模式掃描中有 4 頁出現 `Invalid hook call`，經正式 build 重測正常，判定為實驗環境（兩個開發伺服器共用 `.vite` 快取）造成，不列入。
