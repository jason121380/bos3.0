# 現況（以此檔為準）

更新：2026/10/30。這是版號、測試總數、CI、前端健康分、後端債的唯一現況。其他 markdown 若衝突，以本檔為準。

產品版號只看 `src/version.js`（`v3.MMDDHHmm`，台灣時間）。`main` 最新是 PR #315 squash-merge 的 commit `63c3680`，版號 `v3.10282323`（2026/10/28）。本批分支 `claude/amazing-keller-sxroaz` 的版號是 `v3.10301527`，PR 是 `PR #316`。倉庫是公開的：https://github.com/jason121380/bos3.0。

**正式站版號尚未確認。** 合併 #315 的工作環境連不到 `bos.lure.com.tw`。請看正式站左上角版號是否為 `v3.10282323`（或本批合併後的 `v3.10301527`）。

前端可控制的健康分仍是 100（PR #301 的五項指標，見下方）。2026/10/28 另做了一次四面向程式稽核，分數與修正後狀態見 `docs/redesign/AUDIT_20261028.md`。兩者是不同量尺。

全套測試的現況數字見下方「CI 與測試」。

## 怎麼讀其他文件

| 文件 | 角色 |
|---|---|
| 本檔 | 現況 |
| `README.md` | 怎麼安裝、目錄、部署。裡面的舊 suite 數是歷史 |
| `CLAUDE.md` | 代理守則。測試總數不要抄本檔以外的句子 |
| `STYLE.md` | 畫面規範。不管 CI 與分數 |
| `docs/redesign/STATUS.md`、`TODO.md` | **歷史／已過時** 的進度與待辦。帶日期的 suite 數是該則當時的結果。開頭提到的 `v3.10241717` 是 PR #301 當時的健康分程式，不是正式站版號 |
| `AUDIT_20261028.md` | 2026/10/28 四面向稽核（bug／優化／一致性／UI/UX）與 10/30 修正後狀態 |
| `MEMORY.md`、`MIGRATION_GUIDE.md`、`VERIFY_REPORT.md`、`AUDIT_20261024.md`、`INVENTORY.md`、`PAGE_CHECKLIST.md`、`REPORT_COMPACT.md`、`DATE_PICKER.md`、`B2_EXHAUSTIVE_DEPS.md`、`APOLLO_V3_EXPERIMENT.md` | 專項或決策紀錄。開頭若寫歷史，不要拿來當基線 |

不要再用這些當現況基線：61／339、4,268、4,262、4,236、4,372、368／4,283、375／4,350、379／4,407、385／4,473、387／4,520、389／4,528（本批 commit 前的中途結果）。

## 產品現在是什麼

- 純前端 SPA：Vite 5、React 17、Apollo Client 3、Tailwind + `src/ui/`。單元測試仍是 react-scripts 的 Jest。
- `main` 最新版號是 `v3.10282323`（PR #315）。正式站是否已是這個版號待確認。
- 畫面習慣維持：提示在右下、約 3 秒；下拉用自家 combobox，不用系統選單；標籤在欄位上方。
- 頁首一律用 `ui/page-header` 的 `PageHeader`。`AdminPageHeader`、`PageTitle` 已於 2026/10/28 刪除。
- 頁面主查詢失敗一律顯示 `QueryFailed`（「無法載入資料」＋「重新查詢」）。頁面程式載入中由各版面的 `PageLoadingFallback` 顯示。

## 2026/10/28–30 稽核與修正

詳細見 `docs/redesign/AUDIT_20261028.md`。只改這個前端倉庫，沒有改 API、後端、資料庫或 GraphQL 查詢內容，也沒有連任何真實後端。

**PR #315（已合併，`v3.10282323`）**

- 查詢失敗不再整頁錯誤或白頁：帳單三頁與 QR 打卡防呆，約 120 個檔案補 `QueryFailed`。新增 `src/__tests__/loadingGuard.test.js`，擋「只看 loading 就讀 data」，baseline 已清空。
- 新增 `components/PageLoadingFallback`：載入超過 0.3 秒顯示轉圈與「載入中…」，所有版面共用。
- mutation `.catch` 內重複的錯誤提示移除 63 處。`testkit` 加上與正式相同的 errorLink。
- 新增 `components/ConfirmDeleteDialog`。`TableEditBar` 新 prop `confirmDelete`。角色、支付方式、第三方卡券、進貨單、領料單刪除前確認。
- 側欄 hover 細項可用鍵盤開合。深色寫死色改 token。考勤遲到早退加文字標示。
- 新增 `lib/stored-merchant.js`、`helper/averageOf.js`。
- 7 支設定查詢登記 `settingsQuery`，共 88 支。`socket.io-client` 改連線時才載入。
- 移除 `react-helmet`、`react-copy-to-clipboard`。`vite.config.mjs` 加 `experimentalMinChunkSize`。`Dockerfile` 設 `CYPRESS_INSTALL_BINARY=0`。字型去掉 900 權重。
- `AccountingSubjectModal`、`TotalPrice` 合併到 `views/AccountingShared/`。`CustomMockedProvider` 移到 `src/__tests__/CustomMockedProvider.test.js`。`context/useReservationContext.js` 改名 `context/ReservationContext.js`。
- 報表 `ReportToolbar` 全站統一。
- GitHub CI（Lint and build、Unit tests）通過，Codex review 無 finding。

**本批（`PR #316`，`v3.10301527`）**

- 整頁重新整理改重抓資料 11 處：解除日結、薪資解鎖與刪除月結紀錄、上傳大頭照、會員卡紀錄 2 處與分類刪除、重新開單失敗、打帳單掛單後留在本頁、領料單，並刪掉 GeneralSettings 的死碼註解。
- 保留 7 處：`elements/snackbars`（3）、`PageErrorBoundary`、`NavBar`（2）、`MerchantList`。切換店家要重置全部快取與權限，錯誤復原要整頁重來。
- effect 依賴：692 個 `exhaustive-deps` 警告分類後有 7 個真 bug，修了 6 個。員工日報表四捨五入時換日期，列印印到前一天；B2 #12、#13、#14、#17。剩下 1 個是紅利換算率，Jason 選 B，見下方。
- 建檔／編輯頁抽共用：`views/EventRuleShared/`、`views/ServiceShared/`、`views/CouponShared/`，淨減約 1,950 行。卡券的互助、扣項區塊兩頁畫面不同，沒有合併。
- 新增服務：協助人員人數下拉綁定目前人數。停用的「新增」鈕旁顯示「尚缺：名稱、服務類別」。
- 瀏覽器驗收（Playwright＋假 GraphQL，沒有連任何後端）：沒有白頁或整頁錯誤。帳單列表、掛單列表手機寬度的卡片標題被擠壓，已修。個人頁 `pinnedSettings` 為 null 時整頁錯誤，已修。營業區間報表因假資料不足沒有驗。

**Jason 2026/10/30 的決定**

1. 後端先不理：LINE 打卡寫死網址、GraphQL 操作名去重，兩項擱置。
2. always merge：檢查全綠就直接合併，不必再等 Jason。規則見 `CLAUDE.md`「Git 與合併」。
3. 紅利換算率選 B：換算率比帳單晚到時不重算，舊帳單維持結帳當時的紅利折抵金額。見 `B2_EXHAUSTIVE_DEPS.md`「決策紀錄」。

**待辦（未做）**

- LINE 打卡寫死網址、GraphQL 操作名去重（後端擱置）。
- 全站 Prettier。
- 52 個檔名錯字改名。
- Sentry 延後初始化。
- 卡券互助／扣項區塊合併。
- 4 套下拉元件並存。
- 營業區間報表的瀏覽器驗收。
- `window.location.reload()` 剩 7 處，都是刻意保留，不算待辦。

## PR #302 已出貨的五項（歷史）

Codex 在 #295、#300、#301 合併後留下五項 P2。PR #302 已 squash-merge 為 `abe02de`，版號 `v3.10251208`。只改這個前端倉庫。沒有改 API、後端、資料庫、Railway 密鑰或伺服器產檔。

| 項 | 已進主線的行為 |
|---|---|
| IndexSelect 鍵盤 | 清單打開後，方向鍵在可選項目間移動。Enter／空白鍵以選項索引呼叫 `onChange`。 |
| Dialog portal | 打開的清單掛到所在對話框。沒有對話框時掛到 `document.body`。對話框本體不再裁掉選項。 |
| 結帳雙日期 | 掛單結帳結果不確定時，同時核對原日期與編輯後的日期。任一天仍有這張掛單就視為未結帳。任一天查詢失敗時，不能當成已結帳。 |
| 確認中鎖 F9 | `draftGate === 'checking'` 時，F9 與結帳送出直接返回。已結帳、已封鎖使用同一把鎖。 |
| 進銷貨重查商品 | 商品進銷貨報表的商品清單查詢失敗時，「重新查詢」先重抓商品，再跑報表查詢。 |

這五項已在主線程式裡。正式站對這五項的實機煙測仍**待確認**。左上角版號與 Railway 部署成功，不代表這五項已在正式站逐項點過。

## 前端健康分：Before 92 → After 100（PR #301 指標）

分數仍是 100。下表是 PR #301 的項目。PR #302 沒有在這張表加分。只動這個前端倉庫。沒有改 API、後端、資料庫、Railway 密鑰或伺服器產檔。

| 項 | 分數 | Before | After | 主要檔案 |
|---|---|---|---|---|
| CI | +3 | `.github/workflows/node.js.yml` 在 GitHub 被手動停用（`disabled_manually` 綁在該路徑）。沒有分支保護，token 無法重新啟用 | 新路徑 `.github/workflows/frontend-ci.yml`。PR 與 push 跑 lint、build、`npm run test:nowatch`。Node 24.22.1，`npm ci --legacy-peer-deps`。不需要 GitHub Pro | 刪除 `node.js.yml`，新增 `frontend-ci.yml` |
| 查詢失敗 | +2 | 部分長查詢頁在 API 失敗時停在骨架或轉圈。盤點作業、切換店家已經有錯誤狀態 | 失敗顯示「無法載入資料」與「重新查詢」 | `src/components/QueryFailed.js`。套到考勤、商品排行、業績分析、商品進銷、設計師業績分析、薪資總表、卡券管理、收支分類、收支匯款、全店業績、客資篩選匯出、顧客入金排行榜、顧客消費排行榜、個人頁與員工資料的分頁查詢 |
| 收據 | +1 | 四份收據沒有欄位契約，改畫面時印出的欄可能悄悄少掉 | 測試讀原始碼，鎖共用欄位。掛單兩份不得出現 `點數餘額：`。列印 HTML 沒有改寫 | `src/views/OrderShared/receiptFieldChecklist.js` 與同目錄測試。四份：`OrderCreate/OrderDetailModal.js`、`OrderManagementList/ResultsV2.js`、`DraftOrderEdit/Footer.js`、`DraftOrderManagementList/ResultsV2.js` |
| 匯出遮罩 | +1 | 店家關掉 `getCustomerDataMarkedDefault` 時，瀏覽器自組的 CSV 可以匯出未遮罩客資。只開伺服器檔案網址的按鈕沒有停用原因 | 前端 CSV 一律遮罩姓名與電話。設定明確為 `false` 時，伺服器檔案按鈕停用並說明。沒有新旗標，也沒有改伺服器檔 | `src/helper/exportCustomerMask.js`、`src/components/BackendExportNotice.js`。伺服器網址：客資篩選匯出、顧客入金排行榜、顧客消費排行榜。另三處 CSV 改遮姓名：店家銷售紀錄、店家分類銷售、會員卡銷售報表。畫面上的表格仍顯示原名 |
| 文件 | +1 | README、STATUS、TODO 的 suite 數與「CI 已停用」互相矛盾 | 本檔是唯一現況。其他檔標成歷史並指向這裡 | 本檔，以及上表「怎麼讀其他文件」 |

同一支已併入 `main` 的 #300（`v3.10241632`）：掛單結帳成功或逾時後不能再結一次。那是前端行為，不是這張健康分表的新項目。合併衝突只有 `src/version.js`。

## CI 與測試

- Workflow 名稱是 Frontend CI。檔案是 `.github/workflows/frontend-ci.yml`。兩個 job：Lint and build、Unit tests。
- 全套測試現況：**389 suites／4,529 tests 全數通過**。這是本批在本機跑 `CI=true npx react-scripts test --watchAll=false` 的結果。GitHub CI 的結果以 PR 頁為準。
- PR #315 合併前，本機全套是 387 suites／4,520 tests 通過，GitHub CI 兩個 job 都通過。
- `main` 分支保護仍是關的。自動化 token 讀寫分支保護會 403，沒有代為打開。不要為此關掉 Railway 對 `main` 的自動部署。
- 合併前在本機跑 `npm run lint`、全套 Jest、`npm run build`。不要連正式或測試後端，不要寫真實資料。

### 歷史紀錄（不要當現況）

- PR #302 的 pull_request run [40160834156](https://github.com/jason121380/bos3.0/actions/runs/40160834156) 與 squash-merge 推上 `main` 的 run [40161775374](https://github.com/jason121380/bos3.0/actions/runs/40161775374)（commit `abe02de`，2026-10-25）是 375 suites、4,350 tests。
- `v3.10241723` 推上 `main` 的 run [40081933043](https://github.com/jason121380/bos3.0/actions/runs/40081933043) 沒有開始跑。GitHub 註記是帳務付款失敗或 spending limit。

## 怎麼驗證（不要發明新總數；以下是 PR #301／#302 當時的歷史紀錄）

PR #301 實際跑過的是相關測試，不是全套 4,350。

- 健康分程式當時：`CI=true npx react-scripts test --watchAll=false --maxWorkers=50%`，14 個 suite、326 個測試通過。路徑含 `queryFailed.pages`、`receiptFieldChecklist`、`exportCustomerMask`、薪資總表、卡券管理、客資篩選匯出、個人頁、員工資料、帳單列表、`pages.smoke`。更早一輪還有入金餘額、卡券餘額、儲值、消費券、網路訂單、考勤、掛單頁面。變更過的 JS 以 `scripts/eslint-build.json --max-warnings=0` 通過。
- 併入 #300 之後又跑：`receiptFieldChecklist`、`draftCheckoutGuard`、`DraftOrderManagementList.features`，3 個 suite、44 個測試通過。沒有把它們加成新的全套總數。
- 沒有在 #301 的本機重跑全套 `npm run test:nowatch`、全套 `lint:build` 或 `npm run build`。
- 寫 #301 這段時，沒有開瀏覽器連真實後端。

PR #302 的全套數字只採用上面兩個 GitHub Actions run。本文件這次沒有再跑測試，也沒有開瀏覽器連正式站。五項 P2 的正式站實機煙測仍待確認。

## 後端債（未修，不要寫成已完成）

- 卡券授權
- 跨店 userMerchantId
- 伺服器端匯出檔遮罩（前端只能停用按鈕或遮自己組的 CSV）
- 訂單 UUID isPending

這些要改 `beautyos_api` 或相關後端。這個倉庫沒有修。PR #302 也沒有修。
