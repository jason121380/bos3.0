# B2：react-hooks/exhaustive-deps 分類與 R 類分析

> **歷史／已過時。** 這是基準 commit `ce9a6bb` 的分類，不是現在的全站警告總數。版號、測試總數、CI、健康分只看 [`docs/CURRENT.md`](../CURRENT.md)（程式 `v3.10241717`）。PR #301 沒有一次清掉這些警告。

範圍：`npx eslint --no-eslintrc -c scripts/redesign/eslint-check.json -f json src`，基準 commit `ce9a6bb`。

## 一、總覽

| 項目 | 數字 |
|---|---|
| exhaustive-deps 警告（修改前） | 771 處（319 檔） |
| 其中「缺少依賴」 | 760 處，缺少的名稱共 1200 個（同一警告可缺多個） |
| 其中「多餘依賴」 | 8 處，全部是 `xxxRef.current`（Mutable values）→ 依規則不動 |
| 其中「hook 內對外部變數賦值會遺失」 | 3 處 → 不屬 S1／S2，不動 |
| **S1（已修）** | **110 個名稱、91 個依賴陣列、66 檔** |
| **S2（已修）** | **0**（唯一的 8 處 unnecessary 全是 `.current`，依規則排除） |
| R（不改，列入本報告） | 1090 個名稱，分佈在 719 處警告 |
| exhaustive-deps 警告（修改後） | 730 處（309 檔）：41 處完全消除，50 處只減少名稱（同陣列仍缺 R） |

### S1 的來源（110）

| 來源 | 數量 | 判定依據 |
|---|---|---|
| billContext（打帳單／改帳單／草稿單／排隊單）的 setter 與 `onceRef` | 62 | 4 個 Provider（`OrderCreate.js`、`OrderEdit/index.js`、`QueueOrderEdit/index.js`、`DraftOrderEdit/index.js`）裡該 key 一律是 `useState` setter 或 `useRef`（沒提供的 Provider 是 undefined，也不變）；全站沒有其他 Provider（只有一支測試只傳 `{ bill }`） |
| 經 props 傳入的 setter（追到所有 JSX 呼叫端） | 30 | 每個呼叫端都傳 `useState` setter、上列穩定的 billContext setter，或不傳；沒有 spread、動態 import、非 JSX 引用；並確認該參數屬於該檔的 default export 元件 |
| react-router `useHistory()` | 9 | 同一個 history 物件 |
| react-redux `useDispatch()` | 3 | store.dispatch |
| `hooks/useToggle` 回傳的 `setOpen` | 6 | 原樣回傳 `useState` 的 setter（同檔的 `toggle` 每次重建，不算） |

未列入 S1 的「看起來像 setter」：`setMerchantAvatar`（來自 `useFetchSetMerchantAvatar`）、`setValue`（react-hook-form／`useStore`）、`setDefaultLineMenu`／`setUpdateUserOrderableList`／`setUserAvatar`（mutation 函式）、`handleBillChange`（Provider 內的箭頭函式，每次重建）→ 都歸 R。

### R 的子類（1090 個名稱）

| 子類 | 數量 | 說明 |
|---|---|---|
| 查詢結果 | 654 | 幾乎都是 `useEffect(() => { if (!q.loading) setX(q.data…) }, [q.loading])` 的寫法。全站查詢 410 個 hook 用 `cache-and-network`，變數改變與 refetch 時 `loading` 都會 true→false（`src/lib/__tests__/apollo-loading.test.js` 有測），所以這個寫法本身大多不會顯示舊資料；風險在「effect 讀了**另一個**查詢／設定，但只依自己的 loading」 |
| props（未能證明穩定者） | 130 | 多為父層查詢結果、設定值、`index`、`pagenationLabel` 等 |
| state 值 | 119 | |
| context 值（billContext 的 bill、bonusSetting…） | 72 | |
| 元件內函式 | 78 | 每次 render 重建的函式；大多只是「要呼叫最新版本」，加入會讓 effect 每次 render 都跑 |
| context 函式（handleBillChange） | 7 | |
| 其他 | 30 | 元件內計算值 21、`useLocation` 4、其他自訂 hook 5 |

**為什麼大多數 R 不是 bug**：effect 讀到的永遠是「觸發那次 render」的值；只有在「這個值之後改變、而畫面需要跟著重算」時才會顯示舊資料。很多是刻意只在某事件時跑（例如 `[reset]` 重置帳單、`[date]` 自動查詢、分頁變更時帶目前搜尋條件），加進依賴反而會多查詢或覆蓋使用者輸入。

## 二、最可能是真實 bug 的 20 處

信心標示：**確定**＝依 React effect 順序必然發生；**高**＝在明確的設定組合下必然發生；**待確認**＝取決於查詢回應先後或後端行為，需實機或看後端才能確定。

所有建議修法都會改變 effect 的執行時機，依鐵則需 Jason 同意後才做；涉及金額的（#6–#9）還要逐項確認。

### 1. ~~帳單列表匯出 Excel 的「活動券」欄落後一次（確定）~~ 已修（v3.10212046，補 `raffleDisplay` 依賴，有測試）
- `src/views/OrderManagementList/ResultsV2.js:196`（依賴 `[orders, membershipDisplay, bonusDisplay, pageRef.current, serialNumberUsing]`，缺 `raffleDisplay`）
- ```js
  !raffleDisplay && delete currentOrder['活動券']   // 196 的 Excel effect
  ...
  useEffect(() => { … setRaffleDisplay(orders.some(({ raffleCount }) => raffleCount > 0)) }, [orders])  // 361
  ```
- 情境：兩個 effect 都在 `orders` 變化時跑，Excel 那個排在前面，讀到的是**上一批**訂單算出的 `raffleDisplay`；之後 `raffleDisplay` 改了，Excel effect 也不會再跑。第一次載入有活動券的期間 → 表格有「活動券」欄、匯出的 CSV 沒有；之後切到沒有活動券的期間，CSV 仍保留該欄（`raffleDisplay` 在 `orders.length===0` 時不會更新）。
- 建議：依賴加 `raffleDisplay`（多算一次 Excel，無副作用）。風險低。

### 2. 每日結帳「金流明細」匯出缺「點數折抵金額(-)」欄（高）
- `src/views/CheckoutDaily/DailyMoneyFlowResults.js:54`（依賴 `[dailyMoneyFlowResult, isMemberShipCardActive, pageRef.current]`，缺 `bonusDisplay`）
- 父層 `CheckoutDaily/index.js:66` 在 `dailyMoneyFlowReport.loading` 變 false 時才 `setBonusDisplay(...)`；子元件同一次 commit 掛載，子層 effect 先跑（讀到初始 `false`），父層 effect 後跑。
- 情境：店家啟用紅利點數、但會員卡功能未啟用（`isMemberShipCardActive` 維持 false、依賴不變）→ 匯出的 CSV 少了「點數折抵金額(-)」欄，直到資料重新載入才會出現。會員卡狀態也一起改變時剛好會重跑，所以不是每家店都會遇到。
- 建議：依賴加 `bonusDisplay`。風險低（只重算匯出資料）。

### 3. ~~個人頁「訂單記錄」分頁可能整頁錯誤（待確認）~~ 已修（2026/10/22）
- `src/views/Profile/index.js:263`（依賴 `[getOrderListLazyData.loading, memberActiveLazyData.loading]`，缺 `customerBonusActiveData`）
- ```js
  setBonusDisplay(customerBonusActiveData.data.getIsCustomerBonusActive || bonusDecount !== 0)
  ```
- 情境：`getOrderRecordsData()` 同時發出三個 lazy 查詢；若「紅利是否啟用」這個查詢比另外兩個晚回來，`customerBonusActiveData.data` 為 undefined → TypeError → 內容區顯示錯誤畫面；即使沒拋錯，之後它回來也不會重算 `bonusDisplay`。同樣的邏輯在 `EmployeeManagementDetail/index.js:211` 已寫對（有防呆，依賴也有 `customerBonusActiveData.loading`）。
- 建議：比照員工資料頁補防呆並加 `customerBonusActiveData.loading`。風險低。**已於 2026/10/22 照此寫入** `Profile/index.js`（`idx` 讀紅利設定，依賴含 `customerBonusActiveData.loading`）。本批不改該檔。

### 4. ~~全店業績分析：「隱藏虛實業績切換」設定可能失效（待確認）~~ 已修（PR #315，`v3.10282323`，補 `isMemberShipCardActiveData.loading` 依賴）
- `src/views/DesignerPerformOverview/index.js:38`（依賴 `[isDisplayTogglePerformanceButtonData.loading]`，條件卻也看 `isMemberShipCardActiveData.loading`）
- 情境：若「會員卡是否啟用」查詢比「是否顯示切換鈕」晚回來，第一次 effect 被條件擋掉，之後不會再跑 → `isDisplayTogglePerformanceButton` 停在預設 false → 店家設定隱藏的「業績依據」切換鈕仍顯示。
- 建議：依賴加 `isMemberShipCardActiveData.loading`（或拿掉條件裡不相干的判斷）。風險低。

### 5. ~~同上：店家每日業績報表（待確認）~~ 已修（PR #315，`v3.10282323`，同上）
- `src/views/MerchantDailyPerformanceReport/index.js:46`，與 #4 相同寫法、相同修法。

### 6. ~~排隊單轉帳單：回饋點數可能沒算（待確認，影響點數）~~ 已修
- `src/views/QueueOrderEdit/Footer.js:185`（缺 `bonusSetting.isUsing`、`bonusSetting.rule.*`）
- ```js
  if (bonusSetting.isUsing) { … bonusDeposit = giveBonus[bonusSetting.rule.mode](total, …); setBill(…bonusDeposit) }
  ```
- `bonusSetting` 是 Provider 的 state，初值 `isUsing:false`，等 `getBonusRewardRule` 查詢回來才更新。情境：若帳單資料與金額先算好、紅利規則較晚回來，effect 只在金額相關值變化時才跑 → `bonusDeposit` 停在原值（排隊單通常是 0），使用者不再動任何項目就結帳 → 這筆不給回饋點數。
- 建議：依賴加 `bonusSetting`（整個物件；它只在查詢回來時 set 一次）。**已修**：`QueueOrderEdit/Footer.js` 給點 effect 已加入 `bonusSetting`（與帳單詳細、掛單詳細相同；Jason 2026/10/22 給點規則晚到也要重算）。有測試：規則晚回時仍依應收給點。

### 7. ~~同上：改帳單（待確認）~~ 已修
- `src/views/OrderEdit/Footer.js` 給點 effect 已含 `bonusSetting`（Jason 2026/10/22：修改帳單時依現行給點規則重算，規則晚到也一致）。有測試。

### 8. ~~同上：草稿單（待確認）~~ 已修
- `src/views/DraftOrderEdit/useDraftCheckout.js` 給點 effect 已含 `bonusSetting`（註解：給點設定比帳單晚回來也要重算）。

### 9. ~~打帳單：勾「使用入金」後再改項目，入金扣款不會重算（待確認，影響金額）~~ 已修（只往下夾）
- `src/views/OrderCreate/PaymentCustomerWallet.js:180`（依賴 `[walletPayCheckBox]`，缺 `usableCustomerWallet`、`walletPayLimit`）
- ```js
  if (walletPayCheckBox) handleBillChange({ key: 'walletPay', value: Math.min(usableCustomerWallet, walletPayLimit) 的等價寫法 })
  ```
- 情境：先加項目 → 勾選使用入金（walletPay＝應付金額）→ 再刪項目、改價或加其他付款方式，`walletPayLimit` 變小但 `walletPay` 不變 → 入金扣款大於應付金額，「營業現金應收」可能變負數。需確認後端是否擋、或結帳前驗證（`billVerify`）是否攔。
- 建議：另寫一個 effect，在 `walletPayLimit` 小於 `bill.walletPay` 時夾回上限（不要直接把兩個值加進勾選 effect 的依賴，否則會覆蓋使用者手動輸入的金額）。**已修**：`OrderCreate/PaymentCustomerWallet.js` 另有一個 effect，只在扣入金大於新上限時夾下來；金額變大時不把已扣的入金調高。改服務售價會換掉 `serviceOrders`，`OrderCreate.js` 既有 effect 會把扣入金歸 0，所以測試改走點數換算折抵（不換品項陣列）。上限已是 0 且扣入金已是 0 時不再寫入，避免空轉 setState。

### 10. ~~帳單列表匯出可能未遮罩客戶姓名／電話（待確認，個資）~~ 已修（v3.10212046，補 `isCustomerDataMarked` 依賴，有測試：遮罩設定晚到時重現）
- `src/views/OrderManagementList/ResultsV2.js:196`（缺 `isCustomerDataMarked`）
- 父層 `isCustomerDataMarked` 初值 false，等設定查詢回來才更新。情境：若訂單列表比遮罩設定先出來，CSV 會是完整姓名與手機號碼，直到訂單重新載入；畫面上的表格則會正確遮罩。實際上訂單列表要等兩個查詢（列表＋明細），多半比設定慢，所以機率不高，但後果是個資外流。
- 建議：依賴加 `isCustomerDataMarked`。風險低。

### 11. ~~同上：草稿單列表（待確認，個資）~~ 已修（v3.10212046，同上，有測試）
- `src/views/DraftOrderManagementList/ResultsV2.js:107`，相同修法。

### 12. ~~每日收支明細：會員卡列可能被隱藏（待確認）~~ 已修（2026/10/30，`v3.10301527`，有測試：會員卡設定晚到時重現）
- `src/views/MoneyFlowDailyReport/Results.js:11`（依賴 `[moneyFlowDailyReport]`，缺 `isMemberShipCardActive`）
- 父層在兩個查詢都完成時才掛載 `Results`，但 `isMemberShipCardActive` state 由父層 effect 在**之後**才 set；若會員卡設定查詢比報表晚回來，子層用初值 false 計算 → 店家有啟用會員卡、但期間內會員卡消費全為 0 時，「會員卡消費」列與匯出都被拿掉。
- 建議：依賴加 `isMemberShipCardActive`。風險低。

### 13. ~~每日結帳「待日結」全選勾選框狀態可能錯（待確認，顯示）~~ 已修（2026/10/30，`v3.10301527`，有測試：全選後不再顯示半選）
- `src/views/CheckoutDaily/WaitCloseOrderResults.js:36`（依賴 `[loading, pageRef.current]`，缺 `checkoutStatus`、`waitCloseOrderResults`）
- `checkoutStatus`（有掛單不可日結）由父層 effect 設定；若它與列表同一次 commit 完成，子層先以舊值算 `canCheckoutOrder` → 全選後勾選框顯示半選。全選本身用的是最新 `checkoutStatus`，只影響勾選框顯示。
- 建議：依賴加 `checkoutStatus`、`waitCloseOrderResults`。風險低。

### 14. ~~薪資總覽：鎖定薪資後「全選」名單沒更新（待確認）~~ 已修（2026/10/30，`v3.10301527`，全選名單補依賴 `isSalaryItemsLock`；原本被解鎖後的整頁重載掩蓋，有測試）
- `src/views/SalaryOverview/Results.js:72`（依賴 `[usersSalary]`，缺 `isSalaryItemsLock`）
- 情境：在對話框按「鎖定薪資」後只 refetch 鎖定狀態（解鎖則 `window.location.reload()`），`isSalaryItemsLock` 變了但 `userId`（全選時選哪些人）仍依鎖定前的規則；切換月份時若鎖定查詢比人員列表晚回來也一樣。
- 建議：依賴加 `isSalaryItemsLock`。風險低（只重算可選名單）。需確認鎖定後是否另有重新整理。

### 15. ~~店家業績排行匯出可能缺「服務業績月平均」欄（待確認）~~ 已修（PR #315，`v3.10282323`，補 `monthlyAverageDisplayForMerchantLeaderBoard` 依賴）
- `src/views/MerchantLeaderBoard/index.js:88`（缺 `monthlyAverageDisplayForMerchantLeaderBoard`）
- 該設定由另一個查詢 set；若排行資料先回來，Excel 依舊值（false）產生，之後設定回來不會重算。`performReference` 也缺，但它在查詢變數裡、變更時 loading 會重跑，不是問題。
- 建議：依賴加 `monthlyAverageDisplayForMerchantLeaderBoard`。風險低。

### 16. 服務項目第三方卡券鎖定（UNSET 時跟店家設定）可能用到預設值（待確認，低）
- `src/views/OrderCreate/Services.js:283`（同款：`OrderEdit/Services.js:249`、`QueueOrderEdit/Services.js:240`、`DraftOrderEdit/Services.js:243`），依賴 `[service]`，缺 `bindedThirdPart.service`。
- 情境：服務列在店家設定回來前就存在（例如改帳單／排隊單載入舊項目），`isBindedThirdPartTicketLocked==='UNSET'` 的項目會用 `bindedThirdPart` 初值決定是否鎖定第三方卡券，設定回來後不會重算。打帳單新增項目時設定通常已回來。
- 建議：依賴加 `bindedThirdPart.service`。風險低。

### 17. ~~預約週曆的備註跑馬燈樣式不會隨「是否顯示備註」設定更新（待確認，樣式）~~ 已修（2026/10/30，`v3.10301527`，三份 OrderTable 補依賴，有測試）
- `src/components/ReservationCalendar/DesignerWeekReservation/OrderTable.js:78`、`src/views/ManagementDesignersReservationRecord/OrderTable.js:92`、`src/views/ManagementReservationRecord/OrderTable.js:68`（依賴 `[ndsRef, calendarData]`，缺 `remarkDisplay`、`cusRemarkDisplay`）
- 兩個設定由父層查詢 set；若週曆資料先出來，雙備註都過長時的跑馬燈不會套用，直到週曆重算。
- 建議：依賴加這兩個值。風險低（只改 DOM 樣式）。

### 18. 薪資編輯：同頁切換員工時索引可能不更新（待確認）
- `src/views/SalaryEdit/index.js:147`（依賴兩個 loading，缺 `match.params.id`）
- 若「上一位／下一位」是改網址、元件沒有重新掛載，`userIndex` 不會跟著新 id 更新。需確認切換方式（若是直接 `setUserIndex` 就不是問題）。

### 19. 員工薪資單：加扣項名稱清單用直接修改 state 的方式補（待確認）
- `src/views/EmployeePayslip/index.js:71`、`:89`（依賴 `[merchantSalaryIncreaseItems.loading, userSalary]`；`merchantSalaryIncreaseItems` 是 state **陣列**，`.loading` 恆為 undefined）
- effect 用 `push` 直接改 state 陣列，不會觸發重新 render；加扣項設定比 `userSalary` 晚回來時，額外補上的項目名稱可能不會顯示。寫法本身就有問題，修正需要改成 `setState`，不只是補依賴。

### 20. 盤點建立：「重新取得庫存」讀的是初始查詢（低，目前靠快取碰巧正確）
- `src/views/InventoryWorkCreate/index.js:43`（依賴 `[productInventoryData.loading]`，讀的卻是 `products`）
- lazy 查詢與初始查詢是同一個 GraphQL query、沒有變數，結果寫進同一筆快取，`products` 會被一起更新，所以目前結果正確；之後若 lazy 版本加了變數或改 fetchPolicy 就會顯示舊庫存。
- 建議：改讀 `productInventoryData.data`。風險低。

## 三、看起來像 bug、檢查後不是（不要「補依賴」修）

- `OrderCreate/OrderDetailModal.js:212/278/350` 的 `useCallback` 缺 `stayInCreateOrder`：確認明細對話框是 `{openOrderDetail && <OrderDetailModal …>}`，每次開啟都重新掛載；對話框開著時也點不到「連續打單」勾選框 → 不會用到舊值。
- `OrderCreate/OrderCreate.js:478`（`[reset]`）、`DesignerPerformBasic/index.js:258` 與 `MerchantLeaderBoard/index.js:245`（`[date]`）、`ManagementCoupons/index.js:85`（分頁）、`OverallPerformanceAnalysisReport/index.js:58`、`SingleServiceSearchingReport/index.js:78`：刻意只在某事件時執行、讀當下的值；補依賴會變成改任何欄位就自動查詢或重置帳單。
- `Parameter/AboutSettingFunction.js:73`、`AboutOrderDetail.js:47`、`Profile/General/ProfileDetails.js:53`（裁切的 `useCallback` 缺 `imageSrc`、`rotation`）：react-easy-crop 4.7.5 在 rotation 改變時會 `recomputeCropPosition → emitCropData → onCropComplete`，`croppedAreaPixels` 是新物件，callback 會跟著更新。
- `Parameter/AboutEmployeeSchedule.js:159`（`[colorData]`）：開啟取色器時會先把 `colorData` 設成該列目前顏色，選不同顏色一定會觸發。
- `HelperLeaderBoard/index.js:48` 缺 `inputValue.reference`、`MerchantLeaderBoard` 缺 `performReference`：兩者都在查詢變數內，變更時 loading 會 true→false 讓 effect 重跑。
- `PaymentReport/Results.js:16` 缺 `paymentsName`：父層與 `report` 同一個 effect 一起 set。
- `ReservationCalendar/HolidayEdit.js:18`：Radix Dialog 關閉即卸載，每次開啟重新掛載。
- 654 個「查詢結果」：`cache-and-network` 下 `[q.loading]` 寫法在變數改變與 refetch 時都會重跑（有測試）；只有 4 個 hook 用預設 cache-first（`useFetchProducts`、`useFetchMerchantDesigners`、`useFetchMerchantPayWays`、`useFetchProductCategory`），用到它們的 effect 依賴已含 `.data` 或變數固定，未見問題。

## 四、方法

- 分類腳本以 @babel/parser＋@babel/traverse 依 eslint 回報的行列找到依賴陣列，追每個名稱的 binding：`useState`／`useReducer` 第二個元素、`useRef`、`useDispatch`（限 react-redux）、`useHistory`（限 react-router）、`useToggle().setOpen`、billContext 的 key（逐一比對 4 個 Provider）、props（追全站 JSX 呼叫端）。
- 修改：只在陣列最後一個元素後插入 `, name`（空陣列則直接填入）；斷言插入前名稱不存在、插入後重新 parse 的元素＝原元素＋新增名稱；宣告位置必須在 hook 呼叫之前（避免 TDZ）。
- 驗證：修改後重跑 eslint，逐筆比對 771 處：加入的名稱全數從訊息中消失，其餘名稱不變，無新增警告；其他規則數量不變。

## 決策紀錄

- **紅利點數換算率晚到不重算（Jason 2026/10/30 選 B）**：`OrderCreate/Bonus.js`、`OrderEdit/Bonus.js`、`DraftOrderEdit/Bonus.js` 計算 `bonusDecount` 的 effect 依賴只有 `[bill.bonusUsed, setBill]`，刻意不放換算率。換算率比帳單晚到時不重算，舊帳單一律維持結帳當時存的紅利折抵金額；若補依賴，設定到時會把已存金額改成重算值（金額行為變更）。三處程式已加註解，不要當成漏依賴修掉。
