# 現況（以此檔為準）

更新：2026/10/24。這是版號、測試總數、CI、前端健康分、後端債的唯一現況。其他 markdown 若衝突，以本檔為準。

產品版號只看 `src/version.js`（`v3.MMDDHHmm`，台灣時間）。正式站左上角才是已上線版號。健康分的程式 commit 是 `v3.10241717`（PR #301）。本文件整理與併入 `main` 的 commit 是 `v3.10241723`。其後再 commit 仍以 `src/version.js` 為準。這次沒有新的全套測試總數。

## 怎麼讀其他文件

| 文件 | 角色 |
|---|---|
| 本檔 | 現況 |
| `README.md` | 怎麼安裝、目錄、部署。裡面的舊 suite 數是歷史 |
| `CLAUDE.md` | 代理守則。測試總數不要抄本檔以外的句子 |
| `STYLE.md` | 畫面規範。不管 CI 與分數 |
| `docs/redesign/STATUS.md`、`TODO.md` | **歷史／已過時** 的進度與待辦。帶日期的 suite 數是該則當時的結果 |
| `MEMORY.md`、`MIGRATION_GUIDE.md`、`VERIFY_REPORT.md`、`AUDIT_20261024.md`、`INVENTORY.md`、`PAGE_CHECKLIST.md`、`REPORT_COMPACT.md`、`DATE_PICKER.md`、`B2_EXHAUSTIVE_DEPS.md`、`APOLLO_V3_EXPERIMENT.md` | 專項或決策紀錄。開頭若寫歷史，不要拿來當基線 |
| `.agent/workflows/bos-3-4-standard.md` | MUI 時代的舊版面規格。新畫面看 `STYLE.md` |

不要再用這些當現況基線：61／339、4,268、4,262、4,236、4,372。也不要把 **368 suites／4,283 tests** 當成 v3.10241447 之後的新總數。

## 產品現在是什麼

- 純前端 SPA：Vite 5、React 17、Apollo Client 3、Tailwind + `src/ui/`。單元測試仍是 react-scripts 的 Jest。
- 全套最後一次完整跑完：**368 suites／4,283 tests**（v3.10241447）。PR #301 與併入的 main #300 都沒有重跑全套。
- 畫面習慣維持：提示在右下、約 3 秒；下拉用自家 combobox，不用系統選單；標籤在欄位上方。

## 前端健康分：Before 92 → After 100

只動這個前端倉庫。沒有改 API、後端、資料庫、Railway 密鑰或伺服器產檔。

| 項 | 分數 | Before | After | 主要檔案 |
|---|---|---|---|---|
| CI | +3 | `.github/workflows/node.js.yml` 在 GitHub 被手動停用（`disabled_manually` 綁在該路徑）。沒有分支保護，token 無法重新啟用 | 新路徑 `.github/workflows/frontend-ci.yml`。PR 與 push 跑 lint、build、`npm run test:nowatch`。Node 24.22.1，`npm ci --legacy-peer-deps`。不需要 GitHub Pro | 刪除 `node.js.yml`，新增 `frontend-ci.yml` |
| 查詢失敗 | +2 | 部分長查詢頁在 API 失敗時停在骨架或轉圈。盤點作業、切換店家已經有錯誤狀態 | 失敗顯示「無法載入資料」與「重新查詢」 | `src/components/QueryFailed.js`。套到考勤、商品排行、業績分析、商品進銷、設計師業績分析、薪資總表、卡券管理、收支分類、收支匯款、全店業績、客資篩選匯出、顧客入金排行榜、顧客消費排行榜、個人頁與員工資料的分頁查詢 |
| 收據 | +1 | 四份收據沒有欄位契約，改畫面時印出的欄可能悄悄少掉 | 測試讀原始碼，鎖共用欄位。掛單兩份不得出現 `點數餘額：`。列印 HTML 沒有改寫 | `src/views/OrderShared/receiptFieldChecklist.js` 與同目錄測試。四份：`OrderCreate/OrderDetailModal.js`、`OrderManagementList/ResultsV2.js`、`DraftOrderEdit/Footer.js`、`DraftOrderManagementList/ResultsV2.js` |
| 匯出遮罩 | +1 | 店家關掉 `getCustomerDataMarkedDefault` 時，瀏覽器自組的 CSV 可以匯出未遮罩客資。只開伺服器檔案網址的按鈕沒有停用原因 | 前端 CSV 一律遮罩姓名與電話。設定明確為 `false` 時，伺服器檔案按鈕停用並說明。沒有新旗標，也沒有改伺服器檔 | `src/helper/exportCustomerMask.js`、`src/components/BackendExportNotice.js`。伺服器網址：客資篩選匯出、顧客入金排行榜、顧客消費排行榜。另三處 CSV 改遮姓名：店家銷售紀錄、店家分類銷售、會員卡銷售報表。畫面上的表格仍顯示原名 |
| 文件 | +1 | README、STATUS、TODO 的 suite 數與「CI 已停用」互相矛盾 | 本檔是唯一現況。其他檔標成歷史並指向這裡 | 本檔，以及上表「怎麼讀其他文件」 |

同一支 PR 已併入 `main` 的 #300（`v3.10241632`）：掛單結帳成功或逾時後不能再結一次。那是前端行為，不是這張健康分表的新項目。合併衝突只有 `src/version.js`。

## CI 與分支保護

- Workflow 名稱是 Frontend CI。兩個 job：Lint and build、Unit tests。
- `main` 分支保護仍是關的。自動化 token 讀寫分支保護會 403，沒有代為打開。不要為此關掉 Railway 對 `main` 的自動部署。
- 合併前仍可在本機跑 `npm run lint`、相關 Jest、`npm run build`。不要連正式或測試後端，不要寫真實資料。

## 怎麼驗證（不要發明新總數）

PR #301 實際跑過的是相關測試，不是全套 4,283。

- 健康分程式當時：`CI=true npx react-scripts test --watchAll=false --maxWorkers=50%`，14 個 suite、326 個測試通過。路徑含 `queryFailed.pages`、`receiptFieldChecklist`、`exportCustomerMask`、薪資總表、卡券管理、客資篩選匯出、個人頁、員工資料、帳單列表、`pages.smoke`。更早一輪還有入金餘額、卡券餘額、儲值、消費券、網路訂單、考勤、掛單頁面。變更過的 JS 以 `scripts/eslint-build.json --max-warnings=0` 通過。
- 併入 #300 之後又跑：`receiptFieldChecklist`、`draftCheckoutGuard`、`DraftOrderManagementList.features`，3 個 suite、44 個測試通過。沒有把它們加成新的全套總數。
- 沒有在這支 PR 重跑全套 `npm run test:nowatch`、全套 `lint:build` 或 `npm run build`。CI workflow 會在 GitHub 上跑。
- 沒有開瀏覽器連真實後端。

## 後端債（未修，不要寫成已完成）

- 卡券授權
- 跨店 userMerchantId
- 伺服器端匯出檔遮罩（前端只能停用按鈕或遮自己組的 CSV）
- 訂單 UUID isPending

這些要改 `beautyos_api` 或相關後端。這個倉庫沒有修。
