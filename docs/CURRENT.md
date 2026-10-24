# 現況（以此檔為準）

更新：2026/10/24，本批版號 `v3.10241717`。之後的產品版號仍只看 `src/version.js`（`v3.MMDDHHmm`，台灣時間）。正式站左上角才是已上線版號。

`docs/redesign/STATUS.md`、`docs/redesign/TODO.md`、`README.md` 裡帶日期的 suite／test 數字都是**當時**的紀錄，不要拿來當現在的基線。

## 現在

- 前端 SPA：Vite 5、React 17、Apollo Client 3、Tailwind + `src/ui/`。單元測試仍是 react-scripts 的 Jest。
- 全套數字最後一次完整跑完是 **368 suites／4,283 tests**（v3.10241447）。其後的 PR 只跑相關測試，沒有新的全套總數。不要再用 61／339、4,268、4,262、4,236、4,372。
- CI：`.github/workflows/frontend-ci.yml`（lint、build、`npm run test:nowatch`）。舊的 `node.js.yml` 在 GitHub 被手動停用，停用綁在那個路徑，已移除。這個新檔不需要 GitHub Pro 或分支保護。`main` 分支保護仍是關的；自動化 token 讀寫分支保護會 403，沒有代為打開。
- 合併前仍可在本機跑 `npm run lint`、相關 Jest、`npm run build`。不要連正式或測試後端，不要寫真實資料。

## 這次前端健康分（After 92 → 100）做了什麼

1. CI：新 workflow，PR 與 push 都會跑。
2. 查詢失敗：長時間查詢頁不再停在骨架，改顯示「無法載入資料」與重新查詢。
3. 四份收據（打帳單、帳單列表、掛單詳細、掛單列表）有欄位契約測試。掛單收據不印點數餘額。
4. 瀏覽器自己組的 CSV 一律遮罩客戶姓名與電話，即使店家關掉「報表匯出客資遮碼」。只開啟伺服器檔案網址的按鈕，在該設定明確關閉時停用並說明原因。沒有改 API 或伺服器產檔。
5. 本檔是數字與 CI 狀態的唯一現況。

## 後端債（本倉庫沒修）

卡券授權、跨店 userMerchantId、伺服器端匯出檔遮罩、訂單 UUID isPending。這些不是前端 PR 能關的。
