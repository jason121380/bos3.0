# 現況（以此檔為準）

更新：2026/10/25。這是版號、測試總數、CI、前端健康分、後端債的唯一現況。其他 markdown 若衝突，以本檔為準。

產品版號只看 `src/version.js`（`v3.MMDDHHmm`，台灣時間）。正式站左上角已上線版號是 `v3.10251208`。這個版號是 PR #302 squash-merge 進 `main` 的 commit `abe02de`。倉庫是公開的：https://github.com/jason121380/bos3.0。

前端可控制的健康分是 100。PR #301 把分數從 92 做到 100。PR #302 沒有改這個分數，合併後仍是 100。`v3.10241717` 是 PR #301 健康分程式當時的版號。`v3.10241723` 是那次文件併入 `main` 的 commit。這兩個版號不是現在的正式站版號。

全套測試的現況數字來自公開倉庫的 Frontend CI，見下方「CI」。不要把 368 suites／4,283 tests 當成 `v3.10251208` 的總數。那組數字是 v3.10241447 的本機全套。

## 怎麼讀其他文件

| 文件 | 角色 |
|---|---|
| 本檔 | 現況 |
| `README.md` | 怎麼安裝、目錄、部署。裡面的舊 suite 數是歷史 |
| `CLAUDE.md` | 代理守則。測試總數不要抄本檔以外的句子 |
| `STYLE.md` | 畫面規範。不管 CI 與分數 |
| `docs/redesign/STATUS.md`、`TODO.md` | **歷史／已過時** 的進度與待辦。帶日期的 suite 數是該則當時的結果。開頭提到的 `v3.10241717` 是 PR #301 當時的健康分程式，不是正式站版號 |
| `MEMORY.md`、`MIGRATION_GUIDE.md`、`VERIFY_REPORT.md`、`AUDIT_20261024.md`、`AUDIT_20261028.md`、`INVENTORY.md`、`PAGE_CHECKLIST.md`、`REPORT_COMPACT.md`、`DATE_PICKER.md`、`B2_EXHAUSTIVE_DEPS.md`、`APOLLO_V3_EXPERIMENT.md` | 專項或決策紀錄。開頭若寫歷史，不要拿來當基線 |

不要再用這些當現況基線：61／339、4,268、4,262、4,236、4,372、368／4,283。

## 產品現在是什麼

- 純前端 SPA：Vite 5、React 17、Apollo Client 3、Tailwind + `src/ui/`。單元測試仍是 react-scripts 的 Jest。
- 正式站版號是 `v3.10251208`。Railway 對這個版號的正式部署結果是 SUCCESS。
- 畫面習慣維持：提示在右下、約 3 秒；下拉用自家 combobox，不用系統選單；標籤在欄位上方。

## PR #302 已出貨的五項

Codex 在 #295、#300、#301 合併後留下五項 P2。PR #302 已 squash-merge 為 `abe02de`，版號 `v3.10251208`。只改這個前端倉庫。沒有改 API、後端、資料庫、Railway 密鑰或伺服器產檔。

| 項 | 已進主線的行為 |
|---|---|
| IndexSelect 鍵盤 | 清單打開後，方向鍵在可選項目間移動。Enter／空白鍵以選項索引呼叫 `onChange`。 |
| Dialog portal | 打開的清單掛到所在對話框。沒有對話框時掛到 `document.body`。對話框本體不再裁掉選項。 |
| 結帳雙日期 | 掛單結帳結果不確定時，同時核對原日期與編輯後的日期。任一天仍有這張掛單就視為未結帳。任一天查詢失敗時，不能當成已結帳。 |
| 確認中鎖 F9 | `draftGate === 'checking'` 時，F9 與結帳送出直接返回。已結帳、已封鎖使用同一把鎖。 |
| 進銷貨重查商品 | 商品進銷貨報表的商品清單查詢失敗時，「重新查詢」先重抓商品，再跑報表查詢。 |

這五項已在主線程式裡。正式站對這五項的實機煙測仍**待確認**。左上角版號與 Railway 部署成功，不代表這五項已在正式站逐項點過。

## 前端健康分：Before 92 → After 100

分數仍是 100。下表是 PR #301 的項目。PR #302 沒有在這張表加分。只動這個前端倉庫。沒有改 API、後端、資料庫、Railway 密鑰或伺服器產檔。

| 項 | 分數 | Before | After | 主要檔案 |
|---|---|---|---|---|
| CI | +3 | `.github/workflows/node.js.yml` 在 GitHub 被手動停用（`disabled_manually` 綁在該路徑）。沒有分支保護，token 無法重新啟用 | 新路徑 `.github/workflows/frontend-ci.yml`。PR 與 push 跑 lint、build、`npm run test:nowatch`。Node 24.22.1，`npm ci --legacy-peer-deps`。不需要 GitHub Pro | 刪除 `node.js.yml`，新增 `frontend-ci.yml` |
| 查詢失敗 | +2 | 部分長查詢頁在 API 失敗時停在骨架或轉圈。盤點作業、切換店家已經有錯誤狀態 | 失敗顯示「無法載入資料」與「重新查詢」 | `src/components/QueryFailed.js`。套到考勤、商品排行、業績分析、商品進銷、設計師業績分析、薪資總表、卡券管理、收支分類、收支匯款、全店業績、客資篩選匯出、顧客入金排行榜、顧客消費排行榜、個人頁與員工資料的分頁查詢 |
| 收據 | +1 | 四份收據沒有欄位契約，改畫面時印出的欄可能悄悄少掉 | 測試讀原始碼，鎖共用欄位。掛單兩份不得出現 `點數餘額：`。列印 HTML 沒有改寫 | `src/views/OrderShared/receiptFieldChecklist.js` 與同目錄測試。四份：`OrderCreate/OrderDetailModal.js`、`OrderManagementList/ResultsV2.js`、`DraftOrderEdit/Footer.js`、`DraftOrderManagementList/ResultsV2.js` |
| 匯出遮罩 | +1 | 店家關掉 `getCustomerDataMarkedDefault` 時，瀏覽器自組的 CSV 可以匯出未遮罩客資。只開伺服器檔案網址的按鈕沒有停用原因 | 前端 CSV 一律遮罩姓名與電話。設定明確為 `false` 時，伺服器檔案按鈕停用並說明。沒有新旗標，也沒有改伺服器檔 | `src/helper/exportCustomerMask.js`、`src/components/BackendExportNotice.js`。伺服器網址：客資篩選匯出、顧客入金排行榜、顧客消費排行榜。另三處 CSV 改遮姓名：店家銷售紀錄、店家分類銷售、會員卡銷售報表。畫面上的表格仍顯示原名 |
| 文件 | +1 | README、STATUS、TODO 的 suite 數與「CI 已停用」互相矛盾 | 本檔是唯一現況。其他檔標成歷史並指向這裡 | 本檔，以及上表「怎麼讀其他文件」 |

同一支已併入 `main` 的 #300（`v3.10241632`）：掛單結帳成功或逾時後不能再結一次。那是前端行為，不是這張健康分表的新項目。合併衝突只有 `src/version.js`。

## CI 與分支保護

- Workflow 名稱是 Frontend CI。檔案是 `.github/workflows/frontend-ci.yml`。兩個 job：Lint and build、Unit tests。
- 公開倉庫上，PR #302 的 Frontend CI 已成功。pull_request run [40160834156](https://github.com/jason121380/bos3.0/actions/runs/40160834156) 的 Unit tests 是 375 suites、4,350 tests，全部通過。
- squash-merge 推上 `main` 的 run 是 [40161775374](https://github.com/jason121380/bos3.0/actions/runs/40161775374)（commit `abe02de`，2026-10-25）。Lint and build 成功。Unit tests 成功：375 suites、4,350 tests，全部通過。現況全套總數用這一次。
- 4,350 涵蓋 `v3.10241447` 之後、直到 `abe02de` 的測試。它不是「4,283 加上 PR #302 新增的測試」。中間的 commit 先前沒有各自公布全套總數。
- `v3.10241723` 推上 `main` 的 run [40081933043](https://github.com/jason121380/bos3.0/actions/runs/40081933043) 沒有開始跑。GitHub 註記是帳務付款失敗或 spending limit。那不是測試失敗，也不要把它算進 4,350。
- `main` 分支保護仍是關的。自動化 token 讀寫分支保護會 403，沒有代為打開。不要為此關掉 Railway 對 `main` 的自動部署。
- 合併前仍可在本機跑 `npm run lint`、相關 Jest、`npm run build`。不要連正式或測試後端，不要寫真實資料。

## 怎麼驗證（不要發明新總數）

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
