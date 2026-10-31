# 現況（以此檔為準）

更新：2026/10/30 晚間。這是版號、測試總數、CI、前端健康分、後端債的唯一現況。其他 markdown 若衝突，以本檔為準。

產品版號只看 `src/version.js`（`v3.MMDDHHmm`，台灣時間）。程式碼最新是 PR #322（全站 Prettier）squash-merge 的 commit `9b8a8c6`，版號 `v3.10302235`；本文件同步的 PR 版號為 `v3.10302327`（只改文件）。倉庫是公開的：https://github.com/jason121380/bos3.0。

**正式站版號已確認**：Jason 2026/10/31 確認正式站左上角為 `v3.10302327`（之後的版號以合併為準，不必再逐次詢問）。

前端可控制的健康分仍是 100（PR #301 的五項指標，見下方）。四面向程式稽核另有一把尺：2026/10/28 稽核 72 → 10/30 下午修正後估計約 83 → **10/30 晚間重新評分 86**，依據見 `docs/redesign/AUDIT_20261028.md` 第 9 節。兩者是不同量尺。

全套測試的現況數字見下方「CI 與測試」。

## 怎麼讀其他文件

| 文件 | 角色 |
|---|---|
| 本檔 | 現況 |
| `README.md` | 怎麼安裝、目錄、部署。裡面的舊 suite 數是歷史 |
| `CLAUDE.md` | 代理守則。測試總數不要抄本檔以外的句子 |
| `STYLE.md` | 畫面規範。不管 CI 與分數 |
| `docs/redesign/STATUS.md`、`TODO.md` | **歷史／已過時** 的進度與待辦。帶日期的 suite 數是該則當時的結果。開頭提到的 `v3.10241717` 是 PR #301 當時的健康分程式，不是正式站版號 |
| `AUDIT_20261028.md` | 2026/10/28 四面向稽核（bug／優化／一致性／UI/UX）、10/30 修正後狀態與 10/30 晚間重新評分 |
| `MEMORY.md`、`MIGRATION_GUIDE.md`、`VERIFY_REPORT.md`、`AUDIT_20261024.md`、`INVENTORY.md`、`PAGE_CHECKLIST.md`、`REPORT_COMPACT.md`、`DATE_PICKER.md`、`B2_EXHAUSTIVE_DEPS.md`、`APOLLO_V3_EXPERIMENT.md` | 專項或決策紀錄。開頭若寫歷史，不要拿來當基線 |

不要再用這些當現況基線：61／339、4,268、4,262、4,236、4,372、368／4,283、375／4,350、379／4,407、385／4,473、387／4,520、389／4,528、389／4,529、390／4,583、392／4,588、394／4,595、394／4,596、394／4,581（各批 commit 當時或中途的結果）。

## 產品現在是什麼

- 純前端 SPA：Vite 5、React 17、Apollo Client 3、Tailwind + `src/ui/`。單元測試仍是 react-scripts 的 Jest；畫面掃描是 Playwright（`e2e/`）。
- `main` 程式碼最新版號是 `v3.10302235`（PR #322）；文件同步 PR 為 `v3.10302327`。正式站已確認為 `v3.10302327`（Jason 2026/10/31）。
- 畫面習慣維持：提示在右下、約 3 秒；標籤在欄位上方。
- **下拉只有兩種**（2026/10/30，#319、#321）：固定選項用 `ui/native-select` 的 `NativeSelect`（內部是自家清單 `ui/index-select`，不是系統選單）；要打字搜尋或多選用 `ui/combobox`（選員工用 `StaffCombobox`，同時比對本名與暱稱）。`ui/select`（Radix）與 `ui/form-control` 的 `Select`／`MultipleSelect`／`MenuItem` 已刪除，`@radix-ui/react-select` 已移除；`ui/form-control` 只剩 `FormControl`／`InputLabel`／`FormHelperText`。
- 頁首一律用 `ui/page-header` 的 `PageHeader`。`AdminPageHeader`、`PageTitle` 已於 2026/10/28 刪除。
- 頁面主查詢失敗一律顯示 `QueryFailed`（「無法載入資料」＋「重新查詢」）。頁面程式載入中由各版面的 `PageLoadingFallback` 顯示。
- 程式碼格式交給 Prettier（`.prettierrc`，`embeddedLanguageFormatting: off` 讓 gql／css 樣板字串不變）。commit 前 `npm run format`；CI 跑 `npm run format:check`。`.prettierignore` 排除 md。

## 2026/10/28–30 稽核與修正

詳細見 `docs/redesign/AUDIT_20261028.md`。只改這個前端倉庫，沒有改 API、後端、資料庫或 GraphQL 查詢內容（操作名稱也沒改），也沒有連任何真實後端。

| PR | 版號 | 狀態 | 內容 |
|---|---|---|---|
| #315 | `v3.10282323` | 已合併 | 查詢失敗不白頁（約 120 檔補 `QueryFailed`、`loadingGuard` 測試 baseline 清空）、`PageLoadingFallback`、刪除確認、側欄鍵盤、深色 token、效能（socket.io 延後、移除兩個套件、chunk 合併）、`ReportToolbar` 全站 |
| #316 | `v3.10301527` | 已合併 | 整頁重載改 refetch 11 處（保留 7 處）、6 個畫面未更新 bug、EventRule／Service／Coupon 建檔編輯共用、瀏覽器驗收修正、紅利換算率選 B |
| #317 | `v3.10301644` | 已合併 | `exhaustive-deps` 警告 687 → 0（3 處補依賴，其餘逐一加原因註解）；全站畫面掃描 `e2e/` 接進 CI（Visual scan）；掃描抓到的 9 個查詢失敗整頁錯誤；`tokens.css` 對比測試 |
| #318 | `v3.10301706` | 已合併 | 建檔／編輯頁抽共用 17 組（新增 `ThirdPartyCouponShared`、`PaymentShared`、`CustomerBonusRecordShared`、`MainEventShared`、`MerchantVendorShared`、`HelperPointSettingShared`、`InventoryWorkShared`、`ShortcutShared`、`ProductCategoryShared`，`CouponShared` 併入互助／扣項區塊）；10 組資料流不同不合併；停用按鈕補「尚缺：…」23 頁 |
| #319 | `v3.10301821` | 已合併 | 下拉收斂為 `NativeSelect` 與 `ui/combobox`；刪 `ui/select.js` 與 `@radix-ui/react-select`；顧客彈窗偏好設計師可搜尋；消費分析多選改 combobox |
| #320 | `v3.10302000` | 已合併 | 57 個錯字檔名改名（`Pannel`、`Perforamnce`、`Autocpmplete`…）；`/designer-perforamnce-analyze-report` 改 `/designer-performance-analyze-report`，舊網址 Redirect；會員卡類別晚到時開彈窗整頁錯誤（CI 偶發失敗的根因） |
| #321 | `v3.10302151` | 已合併 | 刪 `ui/form-control` 的 `Select`／`MultipleSelect`／`MenuItem`；線上預約頁服務設計師可搜尋（本名＋暱稱）；Codex 抓到的輸入法組字 Enter 與本名搜尋兩項已修 |
| #322 | `v3.10302235` | 已合併 `9b8a8c6` | 全站 Prettier（1,205 檔）、CI `format:check`；打包 395 檔中 385 檔逐字相同、其餘為不影響畫面的差異；15 份報表與 12 份收據列印前後逐位元相同 |

**Jason 2026/10/30 的決定**

1. 後端先不理：LINE 打卡寫死網址、GraphQL 操作名去重，兩項擱置（GraphQL 名稱 10/22 已決定不改）。
2. always merge：檢查全綠就直接合併，不必再等 Jason。規則見 `CLAUDE.md`「Git 與合併」。
3. 紅利換算率選 B：換算率比帳單晚到時不重算，舊帳單維持結帳當時的紅利折抵金額。見 `B2_EXHAUSTIVE_DEPS.md`「決策紀錄」。
4. 下拉未選顯示「請選擇…」，原有空值選項仍可選回空值；顧客彈窗的偏好設計師改為可打字搜尋（#319）。
5. 刪除 `ui/form-control` 的舊下拉（#321）。

**決定不做**：Sentry 延後初始化（lazy-load）——會漏掉首屏前的錯誤，首屏約 52 KB gzip 的成本保留。

**已修（Jason 2026/10/31 同意）**

- 線上預約頁從網址帶入設計師、顧客沒有重選時，傳回 LINE 的「設計師:」原本是空的（改版前既有）。`v3.10311136` 起設計師清單載入後依帶入的 id 補上名稱，有測試。

**效能修正 A、B（Jason 2026/10/31 同意，`v3.10311624`）**

- 帳單列表：列元件 memo、匯出 CSV 改為按下才產生（`components/LazyCSVLink`，內容與原 CSVLink 逐字相同），開頁元件重畫 21,713→10,533 次。
- 打帳單：下拉篩選 useMemo、下拉與 handler 固定身分（`hooks/useStableCallback`），加 5 個服務時下拉重畫 441→162 次。
- 未做：C（Apollo 快取合併，Jason 決定不做）；打帳單每打一字整頁重畫、帳單列表剩 3 輪，根因在資料流，要改 state 結構。
- 顧客搜尋欄（`CustomerAutoComplete`）未選未打字時列出查詢結果：Jason 2026/10/31 決定維持現狀，不是 bug。

**無障礙（Jason 2026/10/31 選 B，`v3.10311917`）**

- 只做一般使用者也受益的兩項，不加 axe 自動掃描、不加套件：
  - 對比：新增 token `--accent-text`（淺色 #1967D2），用在品牌藍文字放在淡藍底／surface 上的地方；五個報表 `text-[red]` 改 `text-danger`。
  - 標籤：`ui/input` 的 Field 標籤以 `htmlFor`／`aria-labelledby` 綁定子欄位，點標籤文字游標跳進欄位（Input、Textarea、Switch、NativeSelect、Combobox）。下拉只聚焦不展開；Switch 點標籤切換一次。子欄位既有 id 不改，原本沒有 id 的才補 `field-control-N`。
- 既有 aria 值一律沒有改寫。

**清理警告與錯字（第 6 項，`v3.10312016`）**

- eslint-check：69 → 16。剩下 16 則都是 4 個收據列印範本（#printMain／#printThermal）`<img>` 的 `jsx-a11y/alt-text`，依鐵則 2 未動，待 Jason 決定。
- 程式內部名稱錯字：96 個名稱、608 處、111 檔（Pannel→Panel、Comfirm→Confirm、Detial→Detail…）。GraphQL 名稱與欄位、後端列舉值、CSS class、key／id 字串、網址、與檔名綁定的元件名刻意保留。
- 刪除死碼：MerchantListAutocomplete 三個元件與 ProductListTreeView 中永遠不會被呼叫的 `isOptionEqualToValue`／`renderOption`。
- 清理時發現、會改變行為所以未修（待 Jason 決定）：RuleForm 5 處 `attributions.langth === 0` 恆為 false（載入中提示從不顯示）；`profitSharing.designationUsag` 讀不存在的欄位（2 檔）；EHS2Page 的 `vlaue=` 拼錯，輸入框實際是非受控。

**待辦（未做）**

- 後端：LINE 打卡寫死網址、GraphQL 操作名去重（擱置）；下方「後端債」四項。
- 錯字只改了檔名與網址；識別字（變數、元件名）仍約 107 處（粗略 grep `Pannel`、`Perforamnce` 等）、GraphQL 名稱與欄位刻意不動。
- 建檔／編輯頁 10 組資料流不同沒有合併（ServiceCategory、MemberCard、MemberCardCategory、TopUp、ProductRestock、EmployeePicking、Product 等）；表單狀態三套（手寫／react-hook-form／validate.js）並存。
- `react-color`（116 KB）換自製色票、`react-beautiful-dnd`（deprecated）替換、表格列 memo（需先量 Profiler 基線）。
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

- Workflow 名稱是 Frontend CI。檔案是 `.github/workflows/frontend-ci.yml`。三個 job：
  - **Lint and build**：`npm run format:check`（Prettier，#322 起）→ `npm run lint:build` → `npm run build`。
  - **Unit tests**：`npm run test:nowatch`。
  - **Visual scan**（#317 起）：build 後以 Playwright 跑 `npm run test:e2e`。靜態檔＋假 GraphQL（依 operationName 回應），外部連線一律 abort，不連任何後端。162 個後台路由 × 手機 390／桌機 1366，主要 8 頁另跑深色，每個路由再跑「所有查詢失敗」情境。檢查沒有錯誤邊界、沒有橫向捲動、沒有未捕捉的 console error。失敗時上傳截圖。
- 全套 Jest 現況：**394 suites／4,582 tests 全數通過**（#322 本機與 CI 結果）。
- 畫面掃描現況（2026/10/31）：`npm run test:e2e` 共 **660 則**＝畫面掃描 497 則＋資料晚到掃描 163 則（`e2e/late-arrival.spec.js`：每個路由的開頁查詢輪流晚回 800ms，檢查不進錯誤邊界、不新增 console error；只涵蓋開頁時自動送出的查詢，點了才開的彈窗不在內）。`e2e/known-issues.js` 已清空（原 52 頁假資料不足，改由 `e2e/fake-operations.js` 依操作名稱補形狀）。CI 的 Visual scan job 一併跑兩者，時限 45 分鐘。
- `npm run lint:build`：0 錯誤、0 警告（`--max-warnings=0`）。warning 級 `scripts/redesign/eslint-check.json` 剩 69 則（`import/first` 19、`jsx-a11y/alt-text` 16、`import/no-anonymous-default-export` 14、`no-useless-concat` 13 等），`react-hooks/exhaustive-deps` 0 則——其中約 684 處是逐一判斷後加原因註解的 `eslint-disable-next-line`，不是補依賴。
- **覆蓋率已達門檻**（`v3.10311600`，2026/10/31）：新增 26 個測試檔、補強 5 個，`npm run test:coverage` exit 0。CI 的 Unit tests job 改跑 `test:coverage`（同一次跑完全部測試並檢查門檻，時限 60 分鐘），門檻未達即擋。ui（分支 99.13／門檻 99）與 components（98.05／98）餘裕很小，新程式要一起補測試。10 個檔有逐處註明理由的 `istanbul ignore`（走不到的防禦碼）。補測試時發現的產品問題：教學模式 `TeachingModeState` 寫死關閉（Jason 2026/10/31 決定移除，`v3.10311752` 已刪除 3 個 context 檔、14 個帳單畫面的教學提示與 `.teachingMode` 樣式，畫面不變）；`CustomerAutoComplete` 未選未打字時仍列出查詢結果；掛單結帳卸載時序的極短時間窗；`MerchantsListModal` 群組缺 `groups` 欄位會拋錯；店家選單有兩個不會被呼叫的函式。
- GitHub CI 的結果以 PR 頁為準。#315–#321 合併前三個 job（#317 之前是兩個）都通過，Codex review 無待處理 finding。
- `main` 分支保護仍是關的。自動化 token 讀寫分支保護會 403，沒有代為打開。不要為此關掉 Railway 對 `main` 的自動部署。
- 合併前在本機跑 `npm run format:check`、`npm run lint`、全套 Jest、`npm run build`（動到畫面再跑 `npm run test:e2e`）。不要連正式或測試後端，不要寫真實資料。

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

這些要改 `beautyos_api` 或相關後端。這個倉庫沒有修。PR #302、#315–#322 也沒有修。

另有兩項後端相關擱置（Jason 2026/10/30「後端先不理」）：LINE 打卡寫死網址（`src/views/Line/map.js`，不經 `lib/api-base`）、GraphQL 操作名稱重複（10/22 已決定名稱不改）。
